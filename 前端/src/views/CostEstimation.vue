<template>
    <div class="cost-estimation">
      <h1>{{ title }}</h1>
      <div class="form-container">
        <!-- 输入框区域 -->
        <label for="projectName">项目名称</label>
        <input v-model="formData.projectName" type="text" id="projectName" placeholder="请输入项目名称" />
  
        <label for="cost">估算金额</label>
        <input v-model="formData.cost" type="number" id="cost" placeholder="请输入估算金额" />
  
        <label for="estimatedTime">预计时间</label>
        <input v-model="formData.estimatedTime" type="date" id="estimatedTime" />
  
        <button @click="submitEstimation">提交估算</button>
      </div>
  
      <div v-if="submitted" class="submission-feedback">
        <h3>估算提交成功！</h3>
        <p>项目：{{ formData.projectName }}</p>
        <p>估算金额：{{ formData.cost }} 元</p>
        <p>预计完成时间：{{ formData.estimatedTime }}</p>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { ref } from 'vue';
  
  export default {
    name: 'CostEstimation',
    setup() {
      const title = ref('造价估算管理');
      const formData = ref({
        projectName: '',
        cost: 0,
        estimatedTime: '',
      });
      const submitted = ref(false);
  
      // 提交估算的处理函数
      const submitEstimation = () => {
        if (!formData.value.projectName || !formData.value.cost || !formData.value.estimatedTime) {
          alert('请填写所有字段！');
          return;
        }
        submitted.value = true;
      };
  
      return {
        title,
        formData,
        submitted,
        submitEstimation,
      };
    },
  };
  </script>
  
  <style scoped>
  .cost-estimation {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  h1 {
    text-align: center;
    font-size: 24px;
  }
  
  .form-container {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .submission-feedback {
    text-align: center;
    margin-top: 20px;
  }
  </style>
  