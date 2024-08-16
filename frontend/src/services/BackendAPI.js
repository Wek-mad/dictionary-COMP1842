import CsvUpload from "../components/CsvUpload.vue";
import API from "./API";
import { useRoute } from "vue-router";
const route = useRoute();


export default {
    getWords(page = 1, limit = 10) {
        return API().get(`/words?page=${page}&limit=${limit}`);
    },
    getWord(id) {
        return API().get(`/words/${id}`);
    },
    addWord(word) {
        return API().post("/words", word);
    },
    updateWord(updatedWord) {
        return API().put(`words/${updatedWord._id}`, updatedWord)
    },
    updateWordput(updatedWord) {
        return API().pat(`words/${updatedWord._id}`, updatedWord)
    },
    deleteWord(id) {
        return API().delete(`/words/${id}`);
    },
    searchWords(keyword, page = 1, limit = 10) {
        return API().get(`/search?keyword=${keyword}&page=${page}&limit=${limit}`);
      },
    fetchWords(page = 1, limit = 10, sortKey = 'word', sortOrder = 'asc') {
        return API().get(`/words?page=${page}&limit=${limit}&sortKey=${sortKey}&sortOrder=${sortOrder}`);
    },
    fetchWord(id) {
        return API().get(`/words/${id}`);
    },
    fetchWord(){
        return API().get(`/words/${route.params.id}`);
    },
    uploadCSV(formData) {
        return API().post("/upload-csv", formData);
    },
      
};

