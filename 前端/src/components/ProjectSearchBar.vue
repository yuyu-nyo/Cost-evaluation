<template>
  <div class="search-bar">
    <div class="inputs-row">
      <div class="input-group">
        <label for="projectName">项目名称:</label>
        <el-input id="projectName" v-model="projectName" placeholder="请输入项目名称" class="input-item"></el-input>
      </div>
      <!-- <div class="input-group">
        <label for="projectTenantId">租户ID:</label>
        <el-input id="projectTenantId" v-model="projectTenantId" placeholder="请输入租户ID" class="input-item"></el-input>
      </div> -->
      <div class="input-group">
        <label for="projectStartDate">开始日期:</label>
        <el-date-picker id="projectStartDate" v-model="projectStartDate" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD" placeholder="选择开始日期" class="input-item"></el-date-picker>
      </div>
    </div>
    <div class="buttons-row">
      <el-button type="primary" @click="handleSearch" class="button-item">搜索</el-button>
      <el-button @click="handleReset" class="button-item">重置</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ProjectSearchBar',
  emits: ['search'],
  setup(props, { emit }) {
    const projectName = ref('');
    // const projectTenantId = ref('');
    const projectStartDate = ref('');

    const handleSearch = () => {
      // emit('search', { projectName: projectName.value, projectTenantId: projectTenantId.value, projectStartDate: projectStartDate.value });
      emit('search', { projectName: projectName.value, projectStartDate: projectStartDate.value });
    };

    const handleReset = () => {
      projectName.value = '';
      // projectTenantId.value = '';S
      projectStartDate.value = '';
      emit('search', {});
    };

    return {
      projectName,
      // projectTenantId,
      projectStartDate,
      handleSearch,
      handleReset,
    };
  }
});
</script>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  margin-bottom: 10px;
}
.inputs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.buttons-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.input-item, .button-item {
  margin-right: 10px;
}
.input-group {
  display: flex;
  align-items: center;
  margin-right: 20px;
}
.input-group > label {
  margin-right: 10px;
  font-weight: bold;
  color: #333;
  font-size: 12px;
}
</style>