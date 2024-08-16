import { ref } from 'vue';
import BackendAPI from '../services/BackendAPI';

const searchQuery = ref('');
const words = ref([]);
const total = ref(0);
const totalPages = ref(0);
const currentPage = ref(1);
const word = ref(null);

const fetchWords = async () => {
  try {
    const response = await BackendAPI.searchWords(searchQuery.value, currentPage.value);
    words.value = response.data.words;
    total.value = response.data.total;
    totalPages.value = response.data.totalPages;
    currentPage.value = response.data.currentPage;
  } catch (error) {
    console.error('Error fetching words:', error);
  }
};

const fetchWord = async (id) => {
  try {
    const response = await BackendAPI.getWord(id);
    word.value = response.data;
  } catch (error) {
    console.error('Error fetching word details:', error);
  }
};

const addWord = async (newWord) => {
  try {
    await BackendAPI.addWord(newWord);
    fetchWords();
  } catch (error) {
    console.error('Error adding word:', error.response.data);
  }
};

const updateWord = async (id, updatedWord) => {
  try {
    await BackendAPI.updateWord(id, updatedWord);
    fetchWords();
  } catch (error) {
    console.error('Error updating word:', error.response.data);
  }
};

const deleteWord = async (id) => {
  try {
    await BackendAPI.deleteWord(id);
    fetchWords();
  } catch (error) {
    console.error('Error deleting word:', error.response.data);
  }
};




export {
  searchQuery,
  words,
  total,
  totalPages,
  currentPage,
  word,
  fetchWords,
  fetchWord,
  addWord,
  updateWord,
  deleteWord,
  editWord,
};
