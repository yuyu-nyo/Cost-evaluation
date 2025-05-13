<template>
    <div class="report-generation">
      <h1>{{ title }}</h1>
  
      <!-- 搜索区 -->
      <div class="search-container">
        <input v-model="searchQuery" type="text" placeholder="请输入报告名称进行搜索" />
        <button @click="searchReports">搜索</button>
      </div>
  
      <!-- 报告生成表格 -->
      <table v-if="reports.length > 0" class="data-table">
        <thead>
          <tr>
            <th>报告名称</th>
            <th>描述</th>
            <th>生成时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="report in reports" :key="report.id">
            <td>{{ report.name }}</td>
            <td>{{ report.description }}</td>
            <td>{{ formatDate(report.generatedAt) }}</td>
            <td>{{ report.status }}</td>
            <td>
              <button @click="viewReportDetails(report.id)">查看</button>
              <button @click="downloadReport(report.id)">下载</button>
              <button @click="deleteReport(report.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- 空数据提示 -->
      <div v-else class="no-data">
        <p>没有找到相关数据。</p>
      </div>
  
      <!-- 弹窗：生成报告 -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h2>{{ modalTitle }}</h2>
          <form @submit.prevent="generateReport">
            <label for="name">报告名称</label>
            <input v-model="currentReport.name" type="text" id="name" placeholder="请输入报告名称" required />
  
            <label for="description">描述</label>
            <textarea v-model="currentReport.description" id="description" placeholder="请输入报告描述" required></textarea>
  
            <label for="status">状态</label>
            <select v-model="currentReport.status" id="status" required>
              <option value="生成中">生成中</option>
              <option value="已完成">已完成</option>
              <option value="已取消">已取消</option>
            </select>
  
            <button type="submit">生成报告</button>
            <button type="button" @click="closeModal">取消</button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { ref } from 'vue';
  
  interface Report {
    id: number;
    name: string;
    description: string;
    generatedAt: string;
    status: string;
  }
  
  export default {
    name: 'ReportGeneration',
    setup() {
      const title = ref('报告生成');
      const searchQuery = ref('');
      const reports = ref<Report[]>([]);
      const showModal = ref(false);
      const modalTitle = ref('生成报告');
      const currentReport = ref<Report>({
        id: 0,
        name: '',
        description: '',
        generatedAt: '',
        status: '生成中',
      });
  
      // 模拟报告数据
      reports.value = [
        {
          id: 1,
          name: '报告A',
          description: '这是报告A的描述',
          generatedAt: '2024-01-01',
          status: '已完成',
        },
        {
          id: 2,
          name: '报告B',
          description: '这是报告B的描述',
          generatedAt: '2024-03-01',
          status: '生成中',
        },
      ];
  
      // 搜索报告
      const searchReports = () => {
        // 搜索逻辑，根据查询条件过滤数据
        reports.value = reports.value.filter((report) =>
          report.name.includes(searchQuery.value)
        );
      };
  
      // 查看报告详情
      const viewReportDetails = (id: number) => {
        // 展示报告详情的逻辑
        console.log('查看报告', id);
      };
  
      // 下载报告
      const downloadReport = (id: number) => {
        // 下载报告的逻辑
        console.log('下载报告', id);
      };
  
      // 删除报告
      const deleteReport = (id: number) => {
        reports.value = reports.value.filter((report) => report.id !== id);
      };
  
      // 生成报告
      const generateReport = () => {
        if (currentReport.value.id === 0) {
          // 新生成报告
          currentReport.value.id = Date.now(); // 使用当前时间模拟ID
          currentReport.value.generatedAt = new Date().toLocaleDateString();
          reports.value.push({ ...currentReport.value });
        } else {
          // 更新报告信息
          const index = reports.value.findIndex(
            (report) => report.id === currentReport.value.id
          );
          if (index !== -1) {
            reports.value[index] = { ...currentReport.value };
          }
        }
        closeModal();
      };
  
      // 关闭弹窗
      const closeModal = () => {
        showModal.value = false;
        currentReport.value = {
          id: 0,
          name: '',
          description: '',
          generatedAt: '',
          status: '生成中',
        };
      };
  
      // 格式化日期
      const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
      };
  
      return {
        title,
        searchQuery,
        reports,
        showModal,
        modalTitle,
        currentReport,
        searchReports,
        viewReportDetails,
        downloadReport,
        deleteReport,
        generateReport,
        closeModal,
        formatDate,
      };
    },
  };
  </script>
  
  <style scoped>
  .report-generation {
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
  textarea,
  select {
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
  