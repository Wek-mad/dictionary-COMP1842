<template>
  <div class="p-4">
    <table class="min-w-full bg-white border border-gray-200">
      <thead class="bg-gray-200">
        <tr>
          <th @click="toggleSort('word')" class="py-2 align-middle border-r text-center cursor-pointer">
            <div class="flex justify-center items-center">
              <p class="mr-2">English</p>
              <img :src="sortKey === 'word' ? sortIcon : ''" class="w-4 h-4">
            </div>
          </th>
          <th @click="toggleSort('word2')" class="py-2 align-middle border-r text-center cursor-pointer">
            <div class="flex justify-center items-center">
              <p class="mr-2">French</p>
              <img :src="sortKey === 'word2' ? sortIcon : ''" class="w-4 h-4">
            </div>
          </th>
          <th @click="toggleSort('word3')" class="py-2 align-middle border-r text-center cursor-pointer">
            <div class="flex justify-center items-center">
              <p class="ml-2">Vietnamese</p>
              <img :src="sortKey === 'word3' ? sortIcon : ''" class="ml-2 w-4 h-4">
            </div>
          </th>
          <th class="py-2 px-4 align-middle border-r text-center">Extra</th>
          <th class="py-2 px-4 align-middle text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="word in words" :key="word._id" class="border-t">
          <td class="py-2 px-4 border-r align-middle text-center">{{ word.word }}</td>
          <td class="py-2 px-4 border-r align-middle text-center">{{ word.word2 }}</td>
          <td class="py-2 px-4 border-r align-middle text-center">{{ word.word3 }}</td>
          <td class="py-2 px-4 border-r align-middle text-center">
            <div v-for="(translation, lang) in word.translations" :key="lang">
              <strong>{{ languageMap[lang] }}:</strong> {{ translation }}
            </div>
          </td>
          <td class="py-2 px-4 flex justify-center space-x-2 align-middle">
            <router-link :to="`/word/${word._id}/edit`" class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition duration-300">Edit</router-link>
            <button @click="confirmDeleteWord(word._id)" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300">Delete</button>
            <router-link :to="`/word/${word._id}`" class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-300">Show</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import languageMap from './languageMap';
import BackendAPI from '../services/BackendAPI';

const props = defineProps(['words']);
const emit = defineEmits(['delete-word', 'update-words']);

const route = useRoute();
const router = useRouter();

const sortKey = ref(route.query.sortKey || 'word');
const sortOrder = ref(route.query.sortOrder || 'asc');

const sortIcon = computed(() => sortOrder.value === 'asc' ? ('/../assets/sort.png') : ('/../assets/sort.png'));

const fetchWords = async () => {
  try {
    const response = await BackendAPI.fetchWords(route.query.page, route.query.limit, sortKey.value, sortOrder.value);
    emit('update-words', response.data.words);
  } catch (error) {
    console.error('Error fetching words:', error);
  }
};

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  router.push({ query: { ...route.query, sortKey: sortKey.value, sortOrder: sortOrder.value } });
};

const confirmDeleteWord = (id) => {
  if (confirm('Are you sure you want to delete this word?')) {
    emit('delete-word', id);
  }
};



onMounted(fetchWords);
</script>
