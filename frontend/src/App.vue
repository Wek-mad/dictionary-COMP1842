<script setup>
import Navbar from './components/Navbar.vue';
  </script>
<template>
    <div id="app">
        <Navbar>
        <router-link to="/">Home</router-link>
        <router-link to="/upload">Upload CSV</router-link>
        <router-link to="/profile">Profile</router-link>
        
        </Navbar>
      
      <router-view />
    </div>
  </template>
  
 