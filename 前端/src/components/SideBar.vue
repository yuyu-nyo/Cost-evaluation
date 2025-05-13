<template>
 
  <el-menu
      class="el-menu-vertical-demo"
      
      router
      style="border: none"
      :default-active="$route.path"
      :default-openeds="['/home', '10']"
  >
    <el-menu-item index="/home" >
      <el-icon><icon-menu /></el-icon>
      <template #title>首页</template>
    </el-menu-item>
    <el-sub-menu style="background-color: #321010">
      <template #title>
        <el-icon style="color: #d1d9e6"><Avatar /></el-icon>
        <span style="color: #d1d9e6">用户管理</span>
      </template>
      <el-menu-item index="/user/userList">
        <el-icon><User /></el-icon>
        <template #title>用户管理</template>
      </el-menu-item>
      <el-menu-item index="/user/companyList">
        <el-icon><UserFilled /></el-icon>
        <template #title>租户管理</template>
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item index="/department">
      <el-icon><HelpFilled /></el-icon>
      <template #title>部门管理</template>
    </el-menu-item>
    <el-menu-item index="/resource">
      <el-icon><document /></el-icon>
      <template #title>资讯管理</template>
    </el-menu-item>
    <el-menu-item index="/course">
      <el-icon><setting /></el-icon>
      <template #title>课程管理</template>
    </el-menu-item>
    <el-menu-item index="/conference">
      <el-icon><icon-menu /></el-icon>
      <template #title>会议管理</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'SearchBar',
  emits: ['search'],
  setup(props, { emit }) {
    const username = ref('');
    const phone = ref('');
    const status = ref('');
    const createTime = ref<Date[]>([]);

    const handleSearch = () => {
      const [startDate, endDate] = createTime.value;
      const formattedStartDate = startDate ? dayjs(startDate).format('YYYY-MM-DD') : '';
      const formattedEndDate = endDate ? dayjs(endDate).format('YYYY-MM-DD') : '';
      emit('search', { 
        username: username.value, 
        phone: phone.value, 
        status: status.value, 
        createTime: formattedStartDate && formattedEndDate ? [formattedStartDate, formattedEndDate] : [] 
      });
    };

    const handleReset = () => {
      username.value = '';
      phone.value = '';
      status.value = '';
      createTime.value = [];
      emit('search', {});  // 触发搜索，参数为空，刷新显示所有用户
    };

    return {
      username,
      phone,
      status,
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
  font-size: 10px; /* 缩小字体 */
}
.input-item {
  width: 150px;
}
</style>
