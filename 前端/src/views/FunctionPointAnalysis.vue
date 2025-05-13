<template>
    <div class="function-point-analysis">
      <h1>{{ title }}</h1>
  
      <!-- 搜索区 -->
      <div class="search-container">
        <input v-model="searchQuery" type="text" placeholder="请输入功能点名称进行搜索" />
        <button @click="searchFunctionPoints">搜索</button>
      </div>
  
      <!-- 功能点分析表格 -->
      <table v-if="functionPoints.length > 0" class="data-table">
        <thead>
          <tr>
            <th>功能点名称</th>
            <th>描述</th>
            <th>估算工作量</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in functionPoints" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.description }}</td>
            <td>{{ item.estimatedWorkload }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <button @click="viewDetails(item.id)">查看</button>
              <button @click="editFunctionPoint(item.id)">编辑</button>
              <button @click="deleteFunctionPoint(item.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- 空数据提示 -->
      <div v-else class="no-data">
        <p>没有找到相关数据。</p>
      </div>
  
      <!-- 弹窗：添加/编辑功能点 -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h2>{{ modalTitle }}</h2>
          <form @submit.prevent="submitFunctionPoint">
            <label for="name">功能点名称</label>
            <input v-model="currentFunctionPoint.name" type="text" id="name" placeholder="请输入功能点名称" required />
  
            <label for="description">描述</label>
            <textarea v-model="currentFunctionPoint.description" id="description" placeholder="请输入功能点描述" required></textarea>
  
            <label for="workload">估算工作量</label>
            <input v-model="currentFunctionPoint.estimatedWorkload" type="number" id="workload" placeholder="请输入估算工作量" required />
  
            <button type="submit">提交</button>
            <button type="button" @click="closeModal">取消</button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { ref } from 'vue';
  
  interface FunctionPoint {
    id: number;
    name: string;
    description: string;
    estimatedWorkload: number;
    createdAt: string;
  }
  
  export default {
    name: 'FunctionPointAnalysis',
    setup() {
      const title = ref('功能点分析管理');
      const searchQuery = ref('');
      const functionPoints = ref<FunctionPoint[]>([]);
      const showModal = ref(false);
      const modalTitle = ref('添加功能点');
      const currentFunctionPoint = ref<FunctionPoint>({
        id: 0,
        name: '',
        description: '',
        estimatedWorkload: 0,
        createdAt: '',
      });
  
      // 模拟数据
      functionPoints.value = [
        {
          id: 1,
          name: '功能点A',
          description: '这是功能点A的描述',
          estimatedWorkload: 20,
          createdAt: '2024-11-15',
        },
        {
          id: 2,
          name: '功能点B',
          description: '这是功能点B的描述',
          estimatedWorkload: 30,
          createdAt: '2024-11-14',
        },
      ];
  
      // 搜索功能点
      const searchFunctionPoints = () => {
        // 搜索逻辑，根据查询条件过滤数据
        functionPoints.value = functionPoints.value.filter(
          (item) => item.name.includes(searchQuery.value)
        );
      };
  
      // 查看功能点详情
      const viewDetails = (id: number) => {
        // 展示功能点详情的逻辑
        console.log('查看功能点', id);
      };
  
      // 编辑功能点
      const editFunctionPoint = (id: number) => {
        const point = functionPoints.value.find((item) => item.id === id);
        if (point) {
          currentFunctionPoint.value = { ...point };
          modalTitle.value = '编辑功能点';
          showModal.value = true;
        }
      };
  
      // 删除功能点
      const deleteFunctionPoint = (id: number) => {
        functionPoints.value = functionPoints.value.filter((item) => item.id !== id);
      };
  
      // 提交功能点（添加/编辑）
      const submitFunctionPoint = () => {
        if (currentFunctionPoint.value.id === 0) {
          // 添加新功能点
          currentFunctionPoint.value.id = Date.now(); // 用当前时间模拟ID
          functionPoints.value.push({ ...currentFunctionPoint.value });
        } else {
          // 编辑现有功能点
          const index = functionPoints.value.findIndex(
            (item) => item.id === currentFunctionPoint.value.id
          );
          if (index !== -1) {
            functionPoints.value[index] = { ...currentFunctionPoint.value };
          }
        }
        closeModal();
      };
  
      // 关闭弹窗
      const closeModal = () => {
        showModal.value = false;
        currentFunctionPoint.value = {
          id: 0,
          name: '',
          description: '',
          estimatedWorkload: 0,
          createdAt: '',
        };
      };
  
      // 格式化日期
      const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
      };
  
      return {
        title,
        searchQuery,
        functionPoints,
        showModal,
        modalTitle,
        currentFunctionPoint,
        searchFunctionPoints,
        viewDetails,
        editFunctionPoint,
        deleteFunctionPoint,
        submitFunctionPoint,
        closeModal,
        formatDate,
      };
    },
  };
  </script>
  
  <style scoped>
  .function-point-analysis {
    max-width: 900px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  h1 {
    text-align: center;
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .search-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  input[type="text"] {
    width: 75%;
    padding: 8px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
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
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  .data-table th,
  .data-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }
  
  .data-table th {
    background-color: #f4f4f4;
  }
  
  .no-data {
    text-align: center;
    color: #888;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
  }
  
  form {
    display: flex;
    flex-direction: column;
  }
  
  label {
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  input,
  textarea {
    padding: 8px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button[type="submit"] {
    background-color: #007bff;
  }
  
  button[type="button"] {
    background-color: #ccc;
    margin-left: 10px;
  }
  </style>
  