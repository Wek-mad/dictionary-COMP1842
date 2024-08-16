<template>
  <div class="container mx-auto p-6 bg-gray-100 min-h-screen">
    <h1 class="text-4xl font-bold mb-6 text-center text-gray-800">Homepage</h1>
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <WordForm @add-word="addWord" />
    </div>
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <Search @search-words="searchWords" />
    </div>
    <div class="bg-white shadow-md rounded-lg p-6">
      <WordList :words="words" @delete-word="deleteWord" @update-word="updateWord" @sort-words="sortWords" />
    </div>
    <div class="mt-4 flex justify-center items-center space-x-2">
      <button @click="prevPage" :disabled="currentPage === 1" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300">
        Previous
      </button>
      <button
      v-for="page in paginationRange"
      :key="page"
      @click="goToPage(page)"
      :disabled="currentPage === page"
      :class="[
        'text-white px-4 py-2 rounded transition duration-300',
        currentPage === page
          ? 'bg-blue-600 hover:bg-blue-700'
          : 'bg-gray-500 hover:bg-gray-600'
      ]"
    >
      {{ page }}
    </button>
    
      <button @click="nextPage" :disabled="currentPage === totalPages" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300">
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import WordForm from '../components/WordForm.vue';
import WordList from '../components/WordList.vue';
import Search from '../components/Search.vue';
import BackendAPI from '../services/BackendAPI';
import "vue3-toastify/dist/index.css";
import { toast, type ToastOptions } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const words = ref([]);
const currentPage = ref(Number(route.query.page) || 1);
const itemsPerPage = ref(Number(route.query.limit) || 10);
const totalPages = ref(1);
const maxVisiblePages = 5;

const sortKey = ref(route.query.sortKey || 'word');
const sortOrder = ref(route.query.sortOrder || 'asc');

console.log('Home currentPage:', currentPage.value); // Debugging
console.log('Home itemsPerPage:', itemsPerPage.value); // Debugging

const fetchWords = async (page = 1, limit = 10, sortKey = 'word', sortOrder = 'asc') => {
  try {
    const response = await BackendAPI.fetchWords(page, limit, sortKey, sortOrder);
    words.value = response.data.words;
    totalPages.value = response.data.totalPages;
    currentPage.value = response.data.currentPage;
    console.log('Fetched words:', response.data); // Debugging
  } catch (error) {
    console.error('Error fetching words:', error);
  }
};

const searchWords = async (keyword) => {
  if (keyword.trim() === '') {
    fetchWords(currentPage.value, itemsPerPage.value, sortKey.value, sortOrder.value);
    return;
  }
  try {
    const response = await BackendAPI.searchWords(keyword, currentPage.value, itemsPerPage.value);
    words.value = response.data.words;
    totalPages.value = response.data.totalPages;
    currentPage.value = response.data.currentPage;
    console.log('Searched words:', response.data); // Debugging
  } catch (error) {
    console.error('Error searching words:', error);
  }
};

const paginationRange = computed(() => {
  const range = [];
  const half = Math.floor(maxVisiblePages / 2);
  let start = currentPage.value - half;
  let end = currentPage.value + half;

  if (start < 1) {
    start = 1;
    end = Math.min(totalPages.value, maxVisiblePages);
  }

  if (end > totalPages.value) {
    end = totalPages.value;
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  return range;
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
};

const goToPage = (page) => {
  router.push({ path: '/', query: { page, limit: itemsPerPage.value, sortKey: sortKey.value, sortOrder: sortOrder.value } });
};

const addWord = async (word) => {
  try {
    await BackendAPI.addWord(word);
    fetchWords(currentPage.value, itemsPerPage.value, sortKey.value, sortOrder.value);
    toast.success("Word added", {
      autoClose: 1000,
    } as ToastOptions);
  } catch (error) {
    handleErrorResponse(error, "Error adding word");
  }
};

const deleteWord = async (id) => {
  try {
    console.log('Request to delete word with id:', id);
    await BackendAPI.deleteWord(id);
    fetchWords(currentPage.value, itemsPerPage.value, sortKey.value, sortOrder.value);
    toast.success("Word deleted", {
      autoClose: 1000,
    } as ToastOptions);  
  } catch (error) {
    handleErrorResponse(error, "Error deleting word");
  }
};

const updateWord = async (updatedWord) => {
  try {
    await BackendAPI.updateWord(updatedWord);
    fetchWords(currentPage.value, itemsPerPage.value, sortKey.value, sortOrder.value);
    toast.success("Word updated successfully", {
      autoClose: 1000,
    } as ToastOptions);
  } catch (error) {
    handleErrorResponse(error, "Error updating word");
  }
};

const sortWords = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  fetchWords(currentPage.value, itemsPerPage.value, sortKey.value, sortOrder.value);
};

const handleErrorResponse = (error, defaultMessage) => {
  if (error.response) {
    console.error(`${defaultMessage}:`, error.response.data);
    const errorMessage = error.response.data.message || defaultMessage;
    toast.error(errorMessage, {
      autoClose: 1000,
    } as ToastOptions);
  } else if (error.request) {
    console.error(`${defaultMessage}: No response received`, error.request);
    const errorMessage = "No response received from the server.";
    toast.error(errorMessage, {
      autoClose: 1000,
    } as ToastOptions);
  } else {
    console.error(`${defaultMessage}:`, error.message);
    const errorMessage = error.message || defaultMessage;
    toast.error(errorMessage, {
      autoClose: 1000,
    } as ToastOptions);
  }
};

onMounted(() => {
  fetchWords(currentPage.value, itemsPerPage.value, sortKey.value, sortOrder.value);
});

watch(route, () => {
  currentPage.value = Number(route.query.page) || 1;
  itemsPerPage.value = Number(route.query.limit) || 10;
  sortKey.value = route.query.sortKey || 'word';
  sortOrder.value = route.query.sortOrder || 'asc';
  fetchWords(currentPage.value, itemsPerPage.value, sortKey.value, sortOrder.value);
});
</script>
