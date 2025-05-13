<template>
  <div>
    <el-table v-loading="loading" :data="paginatedUsers" style="width: 100%" @selection-change="handleSelectionChange" class="translucent-table">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="userId" label="用户编号" width="80"></el-table-column>
      <el-table-column prop="userName" label="用户名"></el-table-column>
      <el-table-column prop="userTenantId" label="用户租户"></el-table-column>
      <el-table-column prop="userPhone" label="手机号"></el-table-column>
      <!-- <el-table-column prop="userStatus" label="状态">
        <template #default="scope">
          <el-switch
            v-model="scope.row.userStatus"
            active-value="true"
            inactive-value="false"
            @change="updateUserStatus(scope.row)"
          ></el-switch>
        </template>
      </el-table-column> -->
      <el-table-column label="操作">
        <template #default="scope">
          <div class="action-buttons">
            <el-button circle style="color: green;" @click="confirmEdit(scope.row)">
              <el-icon><EditPen /></el-icon>
            </el-button>
            <el-button circle style="color: red;" @click="confirmDelete(scope.row)">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-dropdown>
              <el-link type="primary">
                更多&gt;&gt;
              </el-link>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>操作 1</el-dropdown-item>
                <el-dropdown-item>操作 2</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px; text-align: right;">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 40]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalUsers"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <EditUserDialog v-model:visible="editUserDialogVisible" :userData="selectedUser" @userEdited="fetchUsers" />
  </div>
</template>

<script lang="ts">
import EditUserDialog from '@/components/EditUserDialog.vue';
import { Delete, EditPen } from '@element-plus/icons-vue';
import axios from 'axios';
import dayjs from 'dayjs';
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu, ElIcon, ElLink, ElMessage, ElMessageBox, ElPagination, ElSwitch, ElTable, ElTableColumn } from 'element-plus';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'UserTable',
  components: {
    ElButton,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElIcon,
    ElLink,
    ElMessage,
    ElMessageBox,
    ElPagination,
    ElSwitch,
    ElTable,
    ElTableColumn,
    Delete,
    EditPen,
    EditUserDialog
  },
  setup() {
    const users = ref([]);
    const selectedUsers = ref([]);
    const totalUsers = ref(0);
    const pageSize = ref(10);
    const currentPage = ref(1);
    const loading = ref(false);
    const editUserDialogVisible = ref(false);
    const selectedUser = ref<Record<string, any>>({});
    const background = ref(false);

    const fetchUsers = async (searchParams = {}) => {
      loading.value = true;
      const token = localStorage.getItem('jwtToken');
      console.log(token);
      try {
        const response = await axios.get('http://localhost:9001/user/list', {
          headers: {
            Authorization: `Bearer ${token}`, // 在请求头中加入 Authorization
          },
          params: {
            // page: currentPage.value,
            // size: pageSize.value,
            ...searchParams
          }
        });
        if(response.data.isOk == false) {
          ElMessage.error(response.data.msg);
        }
        else{
          users.value = response.data.users;
          totalUsers.value = response.data.total;
        }
      } catch (error) {
        ElMessage.error('获取用户列表失败');
      } finally {
        loading.value = false;
      }
    };

    const handleSelectionChange = (selection: never[]) => {
      selectedUsers.value = selection;
    };

    const handleCurrentChange = (page: number) => {
      currentPage.value = page;
      fetchUsers();
    };

    const handleSizeChange = (size: number) => {
      pageSize.value = size;
      fetchUsers();
    };

    const confirmEdit = (row: any) => {
      ElMessageBox.confirm(
        `是否修改用户编号 ${row.userId}，用户名 ${row.userName}?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        selectedUser.value = { ...row };
        editUserDialogVisible.value = true;
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消修改',
        });
      });
    };

    const confirmDelete = (row: { userId: any; userName: any; }) => {
      ElMessageBox.confirm(
        `确认删除用户编号 ${row.userId}，用户名 ${row.userName} 吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          await axios.delete(`/api/user/delete/${row.userId}`);
          ElMessage.success('删除成功');
          fetchUsers();
        } catch (error: any) {
          ElMessage.error('删除失败');
        }
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消删除',
        });
      });
    };

    // const updateUserStatus = async (row: { userId: any; userStatus: boolean }) => {
    //   try {
    //     const response = await axios.post('/api/user/updateStatus', { userId: row.userId, userStatus: row.userStatus });
    //     if (response.data.isOk) {
    //       ElMessage.success('状态更新成功');
    //       fetchUsers();
    //     } else {
    //       ElMessage.error(`状态更新失败: ${response.data.msg}`);
    //     }
    //   } catch (error: any) {
    //     ElMessage.error(`状态更新失败: ${error.message}`);
    //   }
    // };

    const paginatedUsers = computed(() => users.value);

    const formatDate = (date: string) => {
      return dayjs(date).format('YYYY-MM-DD');
    };

    fetchUsers();

    return {
      users,
      paginatedUsers,
      selectedUsers,
      totalUsers,
      pageSize,
      currentPage,
      background,
      loading,
      handleSelectionChange,
      handleCurrentChange,
      handleSizeChange,
      confirmEdit,
      confirmDelete,
      fetchUsers,
      editUserDialogVisible,
      selectedUser,
      // updateUserStatus,
      formatDate
    };
  }
});
</script>

<style scoped>
.action-buttons {
  display: flex;
  align-items: center;
  gap: 5px;
}

.translucent-table .el-table,
.translucent-table .el-table th,
.translucent-table .el-table tr,
.translucent-table .el-table td,
.translucent-table .el-table_expanded-cell {
  background: rgba(255, 255, 255, 0.5) !important;
}
</style>
