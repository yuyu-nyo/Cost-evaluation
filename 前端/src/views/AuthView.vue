<template>
  <div class="auth-view-container">
    <video autoplay muted loop class="background-video">
      <source src="@/assets/star.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div class="auth-container">
      <h1 class="title">测盟汇管理系统</h1>
      <el-tabs v-model="activeTab" type="border-card" class="auth-tabs">
        <el-tab-pane label="登录" name="login">
          <Login />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import Login from '@/components/Login.vue';
// import Register from '@/components/Register.vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'AuthView',
  components: {
    Login,
    // Register
  },
  setup() {
    const activeTab = ref('login');
    return {
      activeTab
    };
  }
});
</script>

<style scoped>
.auth-view-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

.auth-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
}

.auth-tabs {
  width: 400px;
  background: rgba(255, 255, 255, 0.5); /* 设置透明度 */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 24px;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}
</style>
