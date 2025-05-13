<template>
  <div class="search-bar">
    <!-- 搜索输入区域 -->
    <div class="inputs-row">
      <!-- 租户ID -->
      <div class="input-group">
        <label for="tenantId">租户ID:</label>
        <el-input
          id="tenantId"
          v-model="tenantId"
          placeholder="请输入租户ID"
          class="input-item"
        />
      </div>

      <!-- 租户名称 -->
      <div class="input-group">
        <label for="tenantName">租户名称:</label>
        <el-input
          id="tenantName"
          v-model="tenantName"
          placeholder="请输入租户名称"
          class="input-item"
        />
      </div>
    </div>

    <!-- 按钮操作区域 -->
    <div class="buttons-row">
      <el-button
        type="primary"
        @click="handleSearch"
        class="button-item"
      >
        搜索
      </el-button>
      <el-button
        @click="handleReset"
        class="button-item"
      >
        重置
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TenantSearchBar', // 修改名称以更符合组件功能
  emits: ['search'], // 允许父组件监听搜索事件
  setup(props, { emit }) {
    // 搜索字段
    const tenantId = ref(''); // 租户ID
    const tenantName = ref(''); // 租户名称

    // 执行搜索操作
    const handleSearch = () => {
      // 发出搜索事件，传递用户输入的租户信息
      emit('search', {
        tenantId: tenantId.value,
        tenantName: tenantName.value,
      });
    };




    // 重置搜索字段
    const handleReset = () => {
      // 清空输入框的内容
      tenantId.value = '';
      tenantName.value = '';
      // 触发搜索事件，传递空条件（显示全部租户）
      emit('search', {});
    };

    // 返回绑定字段和方法
    return {
      tenantId,
      tenantName,
      handleSearch,
      handleReset,
    };
  },
});
</script>


<style scoped>
/* 搜索栏外层容器 */
.search-bar {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  margin-bottom: 10px; /* 增加与下方内容的间距 */
}

/* 输入区域布局 */
.inputs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px; /* 增大输入区域与按钮的间距 */
}

/* 按钮区域布局 */
.buttons-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* 输入框与按钮的公共样式 */
.input-item,
.button-item {
  margin-right: 10px;
}

/* 每组输入框 */
.input-group {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

/* 标签样式 */
.input-group > label {
  margin-right: 8px;
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

/* 输入框宽度 */
.input-item {
  width: 180px;
}
</style>
