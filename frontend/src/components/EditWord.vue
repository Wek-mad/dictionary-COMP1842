<template>
  <div v-if="word" class="bg-white shadow-md rounded-lg p-6">
    <div>
      <label for="word">English:</label>
      <input v-model="form.word" id="word" class="border rounded p-2" />
    </div>
    <div>
      <label for="word2">French:</label>
      <input v-model="form.word2" id="word2" class="border rounded p-2" />
    </div>
    <div>
      <label for="word3">Vietnamese:</label>
      <input v-model="form.word3" id="word3" class="border rounded p-2" />
    </div>

    <div v-for="(translation, lang) in form.translations" :key="lang" class="flex items-center">
      <label :for="lang" class="mr-2">{{ languageMap[lang] }}:</label>
      <input v-model="form.translations[lang]" :id="lang" class="border rounded p-2 flex-1 mr-2" />
      <button @click="deleteTranslation(lang, 'form')" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300">Delete</button>
    </div>

    <div v-for="(value, key) in additionalTranslations" :key="key" class="flex items-center">
      <label :for="key" class="mr-2">{{ languageMap[key] }}:</label>
      <input v-model="additionalTranslations[key]" :id="key" class="border rounded p-2 flex-1 mr-2" />
      <button @click="deleteTranslation(key, 'additional')" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300">Delete</button>
    </div>

    <div class="mt-4">
      <label for="newLang">Add Language:</label>
      <select v-model="newLang" id="newLang" class="border rounded p-2">
        <option v-for="(name, code) in languageMap" :key="code" :value="code" :disabled="isLanguageAdded(code)">
          {{ name }}
        </option>
      </select>
      <button type="button" @click="addLanguage"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">Add</button>
    </div>

    <button type="submit" @click="saveChanges"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 mt-4">
      Update Word
    </button>
  </div>
  <div v-else class="text-center">
    <p>Loading...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BackendAPI from '../services/BackendAPI';
import languageMap from './languageMap';
import "vue3-toastify/dist/index.css";
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const word = ref(null);

const form = ref({
  word: '',
  word2: '',
  word3: '',
  translations: {}
});

const additionalTranslations = ref({});
const newLang = ref('');

const isLanguageAdded = (lang) => {
  return (form.value.translations && form.value.translations.hasOwnProperty(lang)) || additionalTranslations.value.hasOwnProperty(lang);
};

const addLanguage = () => {
  if (newLang.value && !isLanguageAdded(newLang.value)) {
    additionalTranslations.value[newLang.value] = '';
  } else {
    toast.error('Language already exists or not selected');
  }
  newLang.value = '';
};

const deleteTranslation = (lang, type) => {
  if (type === 'form') {
    delete form.value.translations[lang];
  } else if (type === 'additional') {
    delete additionalTranslations.value[lang];
  }
};

const saveChanges = async () => {
  console.log('Saving changes...');
  try {
    const updatedWord = { ...form.value, translations: { ...form.value.translations, ...additionalTranslations.value } };
    const response = await BackendAPI.updateWord(updatedWord);

    if (response.data.duplicateTranslations) {
      toast.error(`Duplicate translations found: ${response.data.duplicateTranslations.join(', ')}`);
    } else {
      router.go(-1);
      setTimeout(() => toast.success('Word updated successfully'), 190);
      console.log('Word updated successfully');
    }
  } catch (error) {
    console.error('Error updating word:', error);
    toast.error('Error updating word');
  }
};

const fetchWord = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/words/${route.params.id}`);
    word.value = response.data;
    form.value = { ...word.value, translations: word.value.translations || {} };
    additionalTranslations.value = {};
    console.log('Word fetched:', word.value);
  } catch (error) {
    console.error('Error fetching word details:', error);
  }
};

onMounted(fetchWord);
</script>
