<template>
  <div class="search-bar">
    <div class="inputs-row">
      <div class="input-group">
        <label for="deptname">部门名称:</label>
        <el-input id="deptname" v-model="deptname" placeholder="请输入部门名称" class="input-item"></el-input>
      </div>

      <div class="input-group">
        <label for="deptstate">状态:</label>
        <el-select id="deptstate" v-model="state" placeholder="部门状态" class="input-item">
          <el-option label="全部" value=""></el-option>
          <el-option label="启用" value="true"></el-option>
          <el-option label="禁用" value="false"></el-option>
        </el-select>
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
  name: 'SearchBar',
  emits: ['search'],
  setup(props, { emit }) {
    const deptname = ref('');
    const deptid = ref('');
    const state = ref('');
    const createTime = ref('');

    const handleSearch = () => {
      emit('search', { deptName: deptname.value, deptState: state.value});
    };

    const handleReset = () => {
      deptname.value = '';
      deptid.value = '';
      state.value = '';
      createTime.value = '';
    };

    return {
      deptname,
      deptid,
      state,
      createTime,
      handleSearch,
      handleReset
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
  margin-bottom: 10px; /* 增加与标签按钮组的间距 */
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
  font-size: 12px; /* 缩小字体 */
}
.input-item {
  width: 200px;
}
</style>
