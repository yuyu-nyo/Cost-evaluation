<template>
    <div class="main-container">
      <NavBar />
      <div class="content-container">
        <router-view />
      </div>
    </div>
  </template>
  
  <script lang="ts">
  //import NavBar from '@/components/NavBar.vue';
import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'MainLayout',
    components: {
      //NavBar
    }
  });
  </script>
  
  <style scoped>
  .main-container {
    display: flex;
  }
  .content-container {
    flex: 1;
    padding: 20px;
  }
  </style>
  