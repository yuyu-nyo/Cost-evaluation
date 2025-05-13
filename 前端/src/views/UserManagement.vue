<template>

  <div class="user-management-container">
    <SearchBar @search="handleSearch" />

<div class="tag-buttons">
  <el-tag type="primary" @click="openAddUserDialog"><el-icon><Plus /></el-icon> 新增</el-tag>
  <el-tag type="success" @click="confirmEdit"><el-icon><EditPen /></el-icon> 修改</el-tag>
  <el-tag type="danger" @click="confirmDelete"><el-icon><Delete /></el-icon> 删除</el-tag>
  <el-tag type="warning" @click="exportUsers"><el-icon><Download /></el-icon> 导出</el-tag>
</div>

<div class="content-container">
  <div class="table-container">
    <UserTable ref="userTable" />
  </div>
</div>

<AddUserDialog v-model:visible="addUserDialogVisible" @userAdded="refreshUserTable" />
<EditUserDialog v-model:visible="editUserDialogVisible" :userData="selectedUser" @userEdited="refreshUserTable" />
  </div>
</template>
<script lang="ts">
import AddUserDialog from '@/components/AddUserDialog.vue';
import EditUserDialog from '@/components/EditUserDialog.vue';
import SearchBar from '@/components/UserSearchBar.vue';
import UserTable from '@/components/UserTable.vue';
import { Delete, Download, EditPen, Plus, Upload } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'UserManagement',
  components: {
    SearchBar,
    UserTable,
    AddUserDialog,
    EditUserDialog,
    Plus,
    EditPen,
    Delete,
    Upload,
    Download
  },
  setup() {
    const userTable = ref();
    const addUserDialogVisible = ref(false);
    const editUserDialogVisible = ref(false);
    const selectedUser = ref<Record<string, any>>({});

     // 页面加载时刷新
 
    const handleSearch = (searchParams: any) => {
      console.log('搜索参数', searchParams);
      userTable.value.fetchUsers(searchParams);
    };

    const fetchUsers = (searchParams: any) => {
      console.log('Fetching users with params:', searchParams);
      userTable.value.fetchUsers(searchParams);
    };

    const openAddUserDialog = () => {
      addUserDialogVisible.value = true;
    };

    const confirmEdit = () => {
      const selectedUsers = userTable.value.selectedUsers;
      if (selectedUsers.length !== 1) {
        ElMessage.error('请选择一个用户进行编辑');
        return;
      }

      const user = selectedUsers[0];
      ElMessageBox.confirm(
        `是否修改用户编号 ${user.userId}，用户名 ${user.userName}？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        selectedUser.value = { ...user };
        editUserDialogVisible.value = true;
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消修改',
        });
      });
    };

    const confirmDelete = () => {
      const selectedUsers = userTable.value.selectedUsers;
      if (selectedUsers.length === 0) {
        ElMessage.error('请选择至少一个用户进行删除');
        return;
      }

      ElMessageBox.confirm(
        `确认删除选中的${selectedUsers.length}个用户吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        handleDelete(selectedUsers);
      }).catch(() => {
        ElMessage.info('已取消删除');
      });
    };

    const handleDelete = async (usersToDelete: any[]) => {
      try {
        const deletePromises = usersToDelete.map(user => axios.delete(`/api/user/delete/${user.userId}`));
        await Promise.all(deletePromises);
        ElMessage.success('删除成功');
        refreshUserTable();
      } catch (error) {
        console.error('Error deleting users:', error);
        ElMessage.error('删除失败');
      }
    };

    const refreshUserTable = () => {
      userTable.value.fetchUsers();
    };

    const exportUsers = async () => {
      try {
        const response = await axios.get('/api/user/export', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'users.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting users:', error);
        ElMessage.error('导出失败');
      }
    };

    return {
      userTable,
      addUserDialogVisible,
      editUserDialogVisible,
      selectedUser,
      handleSearch,
      openAddUserDialog,
      confirmEdit,
      confirmDelete,
      refreshUserTable,
      exportUsers,
      fetchUsers
    };
  }
});
</script>
<style scoped>
.user-management-container {
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
.content-container {
  display: flex;
  gap: 20px;
}
.tree-container {
  flex: 1;
  max-width: 200px;
}
.table-container {
  flex: 3;
}
</style>