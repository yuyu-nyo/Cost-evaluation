<template>
  <div class="search-bar">
    <div class="inputs-row">
      <div class="input-group">
        <label for="userId">用户ID:</label>
        <el-input id="userId" v-model="userId" placeholder="请输入用户ID" class="input-item"></el-input>
      </div>
      <div class="input-group">
        <label for="userName">用户名:</label>
        <el-input id="userName" v-model="userName" placeholder="请输入用户名" class="input-item"></el-input>
      </div>
      <div class="input-group">
        <label for="userPhone">手机号:</label>
        <el-input id="userPhone" v-model="userPhone" placeholder="请输入手机号" class="input-item"></el-input>
      </div>
      <!-- <div class="input-group">
        <label for="status">状态:</label>
        <el-select id="status" v-model="status" placeholder="用户状态" class="input-item">
          <el-option label="全部" value=""></el-option>
          <el-option label="正常" value="true"></el-option>
          <el-option label="停用" value="false"></el-option>
        </el-select>
      </div> -->
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
    const userId = ref('');
    const userName = ref('');
    const userTenantId = ref('');
    const userPhone = ref('');

    const handleSearch = () => {
      emit('search', { 
        userId: userId.value,
        userName: userName.value,
        userTenantId: userTenantId.value,
        userPhone: userPhone.value,
      });
    };

    const handleReset = () => {
      userId.value = '';
      userName.value = '';
      userTenantId.value = '';
      userPhone.value = '';
      emit('search', {});  // 触发搜索，参数为空，刷新显示所有用户
    };

    return {
      userId,
      userName,
      userTenantId,
      userPhone,
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
  font-size: 10px; /* 缩小字体 */
}
.input-item {
  width: 150px;
}
</style>
