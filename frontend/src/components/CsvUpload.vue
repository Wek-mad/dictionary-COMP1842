<template>
  <div class="p-4 bg-white shadow-md rounded-lg">
    <form @submit.prevent="uploadFile">
      <input type="file" @change="handleFileUpload" class="mb-4" />
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
        Upload CSV
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import BackendAPI from '../services/BackendAPI';

const emit = defineEmits(['csv-uploaded']);
const file = ref(null);

const handleFileUpload = (event) => {
  file.value = event.target.files[0];
};

const uploadFile = async () => {
  if (!file.value) return;

  const formData = new FormData();
  formData.append('file', file.value);

  try {
    await BackendAPI.uploadCSV(formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    file.value = null;
    emit('csv-uploaded');
  } catch (error) {
    console.error('Error uploading CSV:', error);
  }
};
</script>
