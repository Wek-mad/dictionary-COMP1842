<template>
    <div>
      <h1  class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Upload CSV</h1>
      <CsvUpload @csv-uploaded="csvUploaded" />
    </div>
  </template>
  
  <script setup>
  import CsvUpload from '../components/CsvUpload.vue';
  
  const csvUploaded = () => {
    // Handle CSV upload completion
    alert('CSV uploaded successfully');
  };
  </script>
  