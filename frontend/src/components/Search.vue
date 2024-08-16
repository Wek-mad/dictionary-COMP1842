<template>
  <div class="flex flex-col items-center mt-8">
    <input
      v-model="searchQuery"
      placeholder="Search for a word"
      @input="searchWords"
      class="px-4 py-2 w-72 border border-gray-300 rounded-md text-lg mb-4"
    />
    <div v-if="words.length" class="w-full max-w-xl">
      <ul class="list-none p-0">
        <li
          v-for="word in words"
          :key="word._id"
          class="px-4 py-2 border border-gray-200 rounded-md mb-2 bg-gray-100 hover:bg-gray-200"
        >
          <router-link :to="`/word/${word._id}`" class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-300">Show</router-link>
          <p><strong>English:</strong> {{ word.word }}</p>
          <p><strong>French:</strong> {{ word.word2 }}</p>
          <p><strong>Vietnamese:</strong> {{ word.word3 }}</p>
          <div v-for="(translation, lang) in word.translations" :key="lang">
            <p><strong>{{ languageMap[lang] }}:</strong> {{ translation }}</p>
            
          </div>
        </li>
      </ul>
      <div class="text-center mt-4">
        <p>Total: {{ total }}</p>
        <p>Page: {{ currentPage }} / {{ totalPages }}</p>
      </div>
    </div>
    <div v-else class="text-center text-gray-500">
      <p>No words found</p>
    </div>
  </div>
</template>

<script>
import BackendAPI from '../services/BackendAPI';
import languageMap from '../components/languageMap';

export default {
  data() {
    return {
      searchQuery: '',
      words: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  },
  methods: {
    async searchWords() {
      if (this.searchQuery.trim() === '') {
        this.words = [];
        this.total = 0;
        this.totalPages = 0;
        this.currentPage = 1;
        return;
      }
      try {
        const response = await BackendAPI.searchWords(this.searchQuery, this.currentPage);
        this.words = response.data.words;
        this.total = response.data.total;
        this.totalPages = response.data.totalPages;
        this.currentPage = response.data.currentPage;
      } catch (error) {
        console.error('Error searching words:', error);
      }
    },
  },
  computed: {
    languageMap() {
      return languageMap;
    }
  }
};
</script>

<style scoped>
</style>
