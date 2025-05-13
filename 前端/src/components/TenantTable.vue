<template>

  <div>

    <!-- 租户列表表格 -->

    <el-table v-loading="loading" :data="paginatedTenants" style="width: 100%" @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="tenantId" label="租户标识" width="80"></el-table-column>

        <el-table-column prop="tenantName" label="租户名称"></el-table-column>

        

        <!-- 租户图像列 -->

        <el-table-column label="租户图标">

          <template #default="scope">

            <img 

              :src="scope.row.tenantImage" 

              alt="租户图像" 

              style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;" 

              @click="logRow(scope.row)"

            />

          </template>

        </el-table-column>


        <el-table-column prop="tenantStartDate" label="租户创建时间"></el-table-column>

        

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

                <el-link type="primary"></el-link>

                <el-dropdown-menu slot="dropdown">

                  <el-dropdown-item>操作 1</el-dropdown-item>

                  <el-dropdown-item>操作 2</el-dropdown-item>

                </el-dropdown-menu>

              </el-dropdown>

            </div>

          </template>

        </el-table-column>

    </el-table>


    <!-- 分页控件 -->

     <!-- 分页控件 -->
     <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 40]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalTenants"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />


    <!-- 批量删除按钮 -->

    <div style="margin-top: 20px;">

      <el-button type="danger" @click="confirmBatchDelete" :disabled="selectedTenants.length === 0">

        批量删除

      </el-button>

    </div>


    <!-- 编辑租户弹窗 -->

    <EditTenantDialog 

      v-model:visible="editTenantDialogVisible"

      :tenant="selectedTenant"

      @tenantUpdated="fetchTenants" 

    />

  </div>

</template>


<script lang="ts">

import EditTenantDialog from '@/components/EditTenantDialog.vue';

import { Delete, EditPen } from '@element-plus/icons-vue';

import axios from 'axios';

import { ElButton, ElMessage, ElMessageBox, ElPagination, ElTable, ElTableColumn } from 'element-plus';


import { computed, defineComponent, ref } from 'vue';


export default defineComponent({

  components: {

    ElButton,

    ElMessage,

    ElPagination,

    ElTable,

    ElTableColumn,

    EditTenantDialog,

    Delete,

    EditPen

  },

  setup() {

    const loading = ref(false);

    const editTenantDialogVisible = ref(false); // 控制编辑弹窗显示


    const currentPage = ref(1);

    const pageSize = ref(10);

    const tenants = ref([]);  // 租户列表

    const selectedTenants = ref([]);  // 用于存储选择的租户

    const selectedTenant = ref({});   // 当前选中的单个租户

    const totalTenants = ref(0);      // 总租户数


    const paginatedTenants = computed(() => {

      return tenants.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);

    });


    // 获取租户列表

    const fetchTenants = async (params = {}) => {
    loading.value = true;
  const defaultParams = {
    page: currentPage.value,
    size: pageSize.value,
  };
  const finalParams = { ...defaultParams, ...params };

  loading.value = true;
  try {
    console.log('Fetching tenants with params慢慢:', finalParams); // 添加日志以调试

    const response = await axios.get('/api/tenant/list', {
      params: finalParams,
    });
    tenants.value = response.data.tenants;
    console.log('hhhhhhh'+tenants.value);
    totalTenants.value = response.data.total;
  } catch (error) {
    ElMessage.error('获取租户列表失败');
  } finally {
    loading.value = false;
  }
};

// 选择变化
const handleSelectionChange = (val: any) => {
  console.log('选中的租户:', val);
  selectedTenants.value = val;
  // 此处可以在需要时触发父组件的更新事件
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchTenants({ page: currentPage.value, size });
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchTenants({ page, size: pageSize.value });
};




    const logRow = (row: any) => {

      console.log(row);

    };


    // 编辑操作

    const confirmEdit = (row: any) => {

      ElMessageBox.confirm(

        `是否修改租户 ${row.tenantName}?`,

        '提示',

        {

          confirmButtonText: '确定',

          cancelButtonText: '取消',

          type: 'warning',

        }

      ).then(() => {

        selectedTenant.value = { ...row };

        editTenantDialogVisible.value = true;

      }).catch(() => {

        ElMessage({

          type: 'info',

          message: '已取消修改',

        });

      });

    };


    // 删除操作（单个）

    const confirmDelete = (row: any) => {

      ElMessageBox.confirm(

        `确认删除租户 ${row.tenantName} 吗？`,

        '提示',

        {

          confirmButtonText: '确定',

          cancelButtonText: '取消',

          type: 'warning',

        }

      ).then(async () => {

        try {

          await axios.delete(`/api/tenant/delete/${row.tenantId}`);

          ElMessage.success('删除成功');

          fetchTenants();

        } catch (error) {

          ElMessage.error('删除失败');

        }

      }).catch(() => {

        ElMessage({

          type: 'info',

          message: '已取消删除',

        });

      });

    };


    // 批量删除操作

    const confirmBatchDelete = () => {

      if (selectedTenants.value.length === 0) {

        ElMessage.error('请选择至少一个租户进行删除');

        return;

      }


      ElMessageBox.confirm(

        `确认删除选中的${selectedTenants.value.length}个租户吗？`,

        '提示',

        {

          confirmButtonText: '确定',

          cancelButtonText: '取消',

          type: 'warning',

        }

      ).then(async () => {

        try {

          const tenantIds = selectedTenants.value.map((tenant: any) => tenant.tenantId);

          await axios.post(`http://localhost:9001/tenant/deleteBatch`, { tenantIds });

          ElMessage.success('删除成功');

          fetchTenants();

        } catch (error) {

          ElMessage.error('删除失败');

        }

      }).catch(() => {

        ElMessage({

          type: 'info',

          message: '已取消删除',

        });

      });

    };


    return {

      loading,

      currentPage,

      pageSize,

      tenants,

      totalTenants,

      selectedTenants,

      selectedTenant,

      paginatedTenants,

      editTenantDialogVisible,

      confirmEdit,

      confirmDelete,

      confirmBatchDelete,

      fetchTenants,

      handleSelectionChange,

      handleSizeChange,

      handleCurrentChange,

      logRow

    };

  },

  mounted() {

    this.fetchTenants();

  }

});

</script>


<style scoped>

.avatar-square {

  width: 100px;

  height: 100px;

  object-fit: cover;

  border-radius: 8px;

}

.avatar {

  width: 100px;

  height: 100px;

  object-fit: cover;

  border-radius: 50%;

}

</style>


