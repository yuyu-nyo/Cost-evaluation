<template>
  <div class="tenant-management-container">
    <SearchBar @search="handleSearch" />


    <div class="tag-buttons">
      <el-tag type="primary" @click="openAddTenantDialog"><el-icon><Plus /></el-icon> 新增</el-tag>
    

    </div>

    <div class="table-container">
      <AddTenantDialog v-model:visible="addTenantDialogVisible" @tenantAdded="refreshTenantTable" />
      <TenantTable ref="tenantTable" @update:selectedTenants="updateSelectedTenants" />
      <EditTenantDialog v-model:visible="editTenantDialogVisible" :tenantData="selectedTenant" @tenantEdited="refreshTenantTable" />
    </div>
  </div>
</template>

<script lang="ts">
import AddTenantDialog from '@/components/AddTenantDialog.vue';
import EditTenantDialog from '@/components/EditTenantDialog.vue';
import SearchBar from '@/components/TenantSearchBar.vue';
import TenantTable from '@/components/TenantTable.vue';
import { Delete, Download, EditPen, Plus, Upload } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TenantManagement',
  components: {
    SearchBar,
    TenantTable,
    AddTenantDialog,
    EditTenantDialog,
    Plus,
    EditPen,
    Delete,
    Upload,
    Download
  },
  setup() {
    const tenantTable = ref();
    const addTenantDialogVisible = ref(false);
    const editTenantDialogVisible = ref(false);
    const selectedTenant = ref<Record<string, any>>({});
    const selectedTenants = ref<any[]>([]); // 用于存储选中的租户

    const handleSearch = (searchParams: any) => {
  console.log('搜索参数maomao', searchParams);
  tenantTable.value.fetchTenants(searchParams);
};

    const openAddTenantDialog = () => {
      addTenantDialogVisible.value = true;
    };

    const confirmEdit = () => {
      const selectedTenantsList = selectedTenants.value;
      if (selectedTenantsList.length !== 1) {
        ElMessage.error('请选择一个租户进行编辑');
        return;
      }

      const tenant = selectedTenantsList[0];
      ElMessageBox.confirm(
        `是否修改租户标识 ${tenant.tenantId}，租户名称 ${tenant.tenantName}？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        selectedTenant.value = { ...tenant };
        editTenantDialogVisible.value = true;
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消修改',
        });
      });
    };

    // 1. 处理选中状态变化
// 1. 处理选中状态变化
const handleSelectionChange = (val: any) => {
  // 将 val 转换为普通数组，防止 Vue 的 Proxy 封装问题
  console.log('man 选中的租户：', JSON.parse(JSON.stringify(val))); // 输出选中的租户，确保是普通对象
  selectedTenants.value = JSON.parse(JSON.stringify(val));  // 更新选中的租户为普通对象
};

   // 修改删除操作
const confirmDelete = () => {
  const selectedTenantsList = selectedTenants.value;
  console.log('man 删除操作 - 当前选中的租户:', JSON.parse(JSON.stringify(selectedTenantsList))); // 输出当前选中的租户列表
  
  if (selectedTenantsList.length === 0) {
    ElMessage.error('请选择至少一个租户进行删除');
    console.log('man 删除操作 - 选中租户数量为 0'); // 输出选中租户数量为 0
    return;
  }

  ElMessageBox.confirm(
    `确认删除选中的${selectedTenantsList.length}个租户吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    console.log('man 确认删除操作，租户 ID:', selectedTenantsList.map((tenant: any) => tenant.tenantId)); // 输出删除的租户 ID
    try {
      const tenantIds = selectedTenantsList.map((tenant: any) => tenant.tenantId);
      await axios.post('/api/tenant/batch-delete', { tenantIds });
      ElMessage.success('删除成功');
      
      console.log('man 删除成功，刷新租户列表');
    } catch (error) {
      console.error('man 删除失败：', error); // 输出删除失败的错误信息
      ElMessage.error('删除失败');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
    console.log('man 用户取消删除操作');
  });
};

    const handleDelete = async (tenantsToDelete: any[]) => {
      try {
        const deletePromises = tenantsToDelete.map(tenant => axios.delete(`/api/tenant/delete/${tenant.tenantId}`));
        await Promise.all(deletePromises);
        ElMessage.success('删除成功');
        refreshTenantTable();
      } catch (error) {
        console.error('Error deleting tenants:', error);
        ElMessage.error('删除失败');
      }
    };

    // 更新选中租户
    const updateSelectedTenants = (tenants: any[]) => {
      selectedTenants.value = tenants; // 更新选中的租户
    };

    const refreshTenantTable = () => {
      tenantTable.value.fetchTenants();
    };

    const importTenants = async () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.xlsx, .xls';
      fileInput.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files![0];
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await axios.post('/api/tenant/import', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          if (response.data.isOk) {
            ElMessage.success('导入成功');
            refreshTenantTable();
          } else {
            ElMessage.error('导入失败: ' + response.data.msg);
          }
        } catch (error) {
          console.error('Error importing tenants:', error);
          ElMessage.error('导入失败');
        }
      };
      fileInput.click();
    };

    const exportTenants = async () => {
      try {
        const response = await axios.get('/api/tenant/export', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tenants.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting tenants:', error);
        ElMessage.error('导出失败');
      }
    };

    return {
      tenantTable,
      addTenantDialogVisible,
      editTenantDialogVisible,
      selectedTenant,
      selectedTenants, // 将选中的租户暴露到模板中
      handleSearch,
      openAddTenantDialog,
      confirmEdit,
      confirmDelete,
      refreshTenantTable,
      importTenants,
      exportTenants,
      updateSelectedTenants
    };
  }
});
</script>

<style scoped>
.tenant-management-container {
  margin-left: 0; /* 移除所有间距 */
}
.tag-buttons {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  margin-bottom: 20px;
}
.table-container {
  flex: 3;
}
</style>
