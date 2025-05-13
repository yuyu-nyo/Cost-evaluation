<template>
    <div class="report-review">
      <h1>{{ title }}</h1>
  
      <!-- 搜索区 -->
      <div class="search-container">
        <input v-model="searchQuery" type="text" placeholder="请输入报告名称进行搜索" />
        <button @click="searchReports">搜索</button>
      </div>
  
      <!-- 报告审核列表 -->
      <table v-if="reports.length > 0" class="data-table">
        <thead>
          <tr>
            <th>报告名称</th>
            <th>描述</th>
            <th>生成时间</th>
            <th>状态</th>
            <th>审核状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="report in reports" :key="report.id">
            <td>{{ report.name }}</td>
            <td>{{ report.description }}</td>
            <td>{{ formatDate(report.generatedAt) }}</td>
            <td>{{ report.status }}</td>
            <td>{{ report.reviewStatus }}</td>
            <td>
              <button @click="viewReportDetails(report.id)">查看</button>
              <button @click="approveReport(report.id)">通过</button>
              <button @click="rejectReport(report.id)">拒绝</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- 空数据提示 -->
      <div v-else class="no-data">
        <p>没有找到相关数据。</p>
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
    reviewStatus: string;
  }
  
  export default {
    name: 'ReportReview',
    setup() {
      const title = ref('报告审核');
      const searchQuery = ref('');
      const reports = ref<Report[]>([]);
      
      // 模拟报告数据
      reports.value = [
        {
          id: 1,
          name: '报告A',
          description: '这是报告A的描述',
          generatedAt: '2024-01-01',
          status: '已完成',
          reviewStatus: '待审核',
        },
        {
          id: 2,
          name: '报告B',
          description: '这是报告B的描述',
          generatedAt: '2024-03-01',
          status: '生成中',
          reviewStatus: '待审核',
        },
      ];
  
      // 搜索报告
      const searchReports = () => {
        reports.value = reports.value.filter((report) =>
          report.name.includes(searchQuery.value)
        );
      };
  
      // 查看报告详情
      const viewReportDetails = (id: number) => {
        console.log('查看报告', id);
      };
  
      // 审核通过报告
      const approveReport = (id: number) => {
        const report = reports.value.find((item) => item.id === id);
        if (report) {
          report.reviewStatus = '审核通过';
        }
      };
  
      // 拒绝报告
      const rejectReport = (id: number) => {
        const report = reports.value.find((item) => item.id === id);
        if (report) {
          report.reviewStatus = '审核拒绝';
        }
      };
  
      // 格式化日期
      const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
      };
  
      return {
        title,
        searchQuery,
        reports,
        searchReports,
        viewReportDetails,
        approveReport,
        rejectReport,
        formatDate,
      };
    },
  };
  </script>
  
  <style scoped>
  .report-review {
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
  
  button[type="button"] {
    background-color: #f44336;
    color: white;
    margin-left: 5px;
  }
  
  button[type="button"]:hover {
    background-color: #d32f2f;
  }
  </style>
  