<template>
    <div>
      <h1>Upload CSV</h1>
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
  