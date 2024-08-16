<template>
  <div class="p-4">
    <h1 class="text-4xl font-bold mb-6 text-center text-gray-800">Word Detail</h1>
    <div v-if="word" class="bg-white shadow-md rounded-lg p-6">
      <p><strong>English:</strong> {{ word.word }}</p>
      <p><strong>French:</strong> {{ word.word2 }}</p>
      <p><strong>Vietnamese:</strong> {{ word.word3 }}</p>
      <div v-for="(translation, lang) in word.translations" :key="lang">
        <strong>{{ languageMap[lang] }}:</strong> {{ translation }}
      </div>
      <button @click="$router.go(-1)"  class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">Back to Home</button> 
      <router-link :to="`/word/${word._id}/edit`"
          class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition duration-300">Edit</router-link>
      <button @click="handleDeleteWord(word._id)" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300">Delete</button>
    </div>
    <div v-else class="text-center">
      <p>Loading...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import languageMap from './languageMap';

const route = useRoute();
const router = useRouter();
const word = ref(null);

const fetchWord = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/words/${route.params.id}`);
    word.value = response.data;
  } catch (error) {
    console.error('Error fetching word details:', error);
  }
};

const editWord = async (word) => {
  const newWord = prompt('Enter the new English word:', word.word);
  const newWord2 = prompt('Enter the new French word:', word.word2);
  const newWord3 = prompt('Enter the new Vietnamese word:', word.word3);

  let newTranslations = { ...word.translations };
  for (const lang in newTranslations) {
    const newTranslation = prompt(`Enter the new translation for ${languageMap[lang]}:`, newTranslations[lang]);
    if (newTranslation !== null) {
      newTranslations[lang] = newTranslation;
    }
  }

  if (newWord !== null && newWord2 !== null && newWord3 !== null) {
    try {
      const updatedWord = {
        ...word,
        word: newWord,
        word2: newWord2,
        word3: newWord3,
        translations: newTranslations,
      };

      await axios.put(`http://localhost:3000/words/${word._id}`, updatedWord);

      console.log("Word updated successfully");
    } catch (error) {
      console.error("Error updating word:", error);
    }
  }
};

const handleEditWord = async (word) => {
  try {
    await editWord(word);
    fetchWord(); // Refresh word details after editing
  } catch (error) {
    console.error('Error editing word:', error);
  }
};

const handleDeleteWord = async (id) => {
  try {
    await axios.delete(`http://localhost:3000/words/${id}`);
    router.push('/'); // Navigate back to the home page after deletion
  } catch (error) {
    console.error('Error deleting word:', error);
  }
};

onMounted(fetchWord);
</script>
