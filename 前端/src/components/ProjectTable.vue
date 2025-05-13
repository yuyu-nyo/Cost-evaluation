<template>
  <div>
    <!-- 租户列表表格 -->
    <el-table v-loading="loading" :data="paginatedProjects" style="width: 100%"
      @selection-change="handleSelectionChange"
      @row-dblclick="goToDetail">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="projectId" label="项目ID"></el-table-column>
      <el-table-column prop="projectName" label="项目名称"></el-table-column>
      <el-table-column label="租户">{{ currentTenantName }}</el-table-column>
      <el-table-column prop="projectStartDate" label="开始日期"></el-table-column>

      <el-table-column label="操作">
        <template #default="scope">
          <div class="action-buttons">
            <el-button circle style="color: green;" @click="goToParticipantManagement(scope.row)">
              <el-icon><User /></el-icon>
            </el-button>
            <el-button circle style="color: green;" @click="goToDetail(scope.row)">
              <el-icon><More /></el-icon>
            </el-button>
            <el-button circle style="color: green;" @click="confirmEdit(scope.row)">
              <el-icon><EditPen /></el-icon>
            </el-button>
            <el-button circle style="color: red;" @click="confirmDelete(scope.row)">
              <el-icon><Delete /></el-icon>
            </el-button>
            <!-- 添加上传文件按钮 -->
            <el-button circle style="color: blue;" @click="confirmFileUpload(scope.row)">
              <el-icon><Upload /></el-icon>
            </el-button>
            <!-- 隐藏的文件上传input -->
            <input type="file" ref="fileInput" style="display: none;" @change="handleFileChange" />
          </div>
        </template>
      </el-table-column>

    </el-table>

    <div style="margin-top: 20px; text-align: right;">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 40]"
        :total="totalProjects" :background="background" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <EditProjectDialog v-model:visible="editProjectDialogVisible" :projectData="selectedProject"
      @projectEdited="fetchProjects" />
    <ProjectDetailDialog v-model:visible="projectDetailDialogVisible" :projectData="selectedProject"
      @projectEdited="fetchProjects" />
    <ProjectParticipantsManagementDialog v-model:visible="projectParticipantDialogVisible"
      :projectData="selectedProject" @projectEdited="fetchProjects" />
  </div>
</template>

<script lang="ts">
import { Delete, EditPen, More, Upload, User } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, defineComponent, ref } from 'vue';
import EditProjectDialog from './EditProjectDialog.vue';
import ProjectDetailDialog from './ProjectDetailDialog.vue';
import ProjectParticipantsManagementDialog from './ProjectParticipantsManagementDialog.vue';

export default defineComponent({
  name: 'ProjectTable',
  components: { Delete, EditPen, More, EditProjectDialog, ProjectDetailDialog, ProjectParticipantsManagementDialog, User, Upload },
  setup() {
    const currentTenantName = ref('');
    const projects = ref([]);
    const projectDetailDialogVisible = ref(false);
    const selectedProjects = ref([]);
    const totalProjects = ref(0);
    const pageSize = ref(10);
    const currentPage = ref(1);
    const loading = ref(false);
    const background = ref(false);
    const editProjectDialogVisible = ref(false);
    const projectParticipantDialogVisible = ref(false);
    const selectedProject = ref<Record<string, any>>({}); // 将初始值设为空对象
    const searchParam = ref({}); // 分页时参数 保证对搜索结果的分页

    const fetchProjects = async (searchParams = {}) => {
      loading.value = true;
      try {
        console.log('Fetching projects with params:', { page: currentPage.value, size: pageSize.value, ...searchParams });

        searchParam.value = searchParams;

        const token = localStorage.getItem('jwtToken');
        if (!token) {
          return;
        }

        const response = await axios.get(`/api/project/list`, {
          params: {
            page: currentPage.value,
            size: pageSize.value,
            ...searchParams,
          },
          headers: {
            Authorization: `Bearer ${token}`, // 在请求头中加入 Authorization
          },
          withCredentials: true, // 如果你需要携带跨域cookie，可以保留这个选项
        });

        projects.value = response.data.projects;
        totalProjects.value = response.data.total;
        currentTenantName.value = response.data.tenantName;
        console.log('Response:', response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        ElMessage.error('获取项目列表失败');
      } finally {
        loading.value = false;
      }
    };

    const handleSelectionChange = (selection: never[]) => {
      selectedProjects.value = selection;
    };

    const handleCurrentChange = (page: number) => {
      currentPage.value = page;
      fetchProjects(searchParam.value);
    };

    const handleSizeChange = (size: number) => {
      pageSize.value = size;
      fetchProjects(searchParam.value);
    };

    const confirmEdit = (row: any) => {
      ElMessageBox.confirm(
        `是否修改项目编号 ${row.projectId}，项目名 ${row.projectName}?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        selectedProject.value = { ...row };
        editProjectDialogVisible.value = true;
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消修改',
        });
      });
    };

    const confirmDelete = (row: any) => {
      ElMessageBox.confirm(
        `确认删除项目编号 ${row.projectId}，项目名 ${row.projectName} 吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          await axios.delete(`/api/project/delete/${row.projectId}`);
          ElMessage.success('删除成功');
          fetchProjects();
        } catch (error) {
          console.error('Error deleting project:', error);
          ElMessage.error('删除失败');
        }
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消删除',
        });
      });
    };

    const goToDetail = (row: any) => {
      selectedProject.value = { ...row };
      projectDetailDialogVisible.value = true;
      console.log("Selected Project for Detail:", selectedProject.value); // 调试
    };

    const goToParticipantManagement = (row: any) => {
      selectedProject.value = { ...row };
      projectParticipantDialogVisible.value = true;
    };

    const paginatedProjects = computed(() => projects.value);

    fetchProjects();

    // 触发文件选择
    const triggerFileUpload = () => {
      const fileInput = (document.querySelector('input[type="file"]') as HTMLInputElement);
      fileInput.click();
    };

    // 上传文件确认框
    const confirmFileUpload = (row: any) => {
      ElMessageBox.confirm(
        `确认上传文件到项目 ${row.projectName} 吗？`,
        '上传确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        selectedProject.value = { ...row };
        triggerFileUpload();
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消上传',
        });
      });
    };

    const handleFileChange = async (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files ? fileInput.files[0] : null;

  if (!file) return;

  // 打印文件信息
  console.log('文件名称:', file.name);
  console.log('文件大小:', file.size);
  console.log('文件类型:', file.type);  // 输出文件类型

  // 确保文件类型是 Word 文件
  if (file.type !== 'application/msword' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    ElMessage.error('请上传Word文件');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  // 获取当前项目的ID，确保 selectedProject 已经正确设置
  const projectId = selectedProject.value.projectId;
  if (!projectId) {
    console.log("Project ID is not defined!");
    ElMessage.error('项目ID未定义');
    return;
  }

  console.log("Selected Project ID:", projectId); // 输出项目ID用于调试

  try {
    const response = await axios.post(`http://localhost:9001/upload/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.isOk) {
      ElMessage.success('文件上传成功');
      console.log('Uploaded file URL:', response.data.data); // 这里是文件上传后的URL
    } else {
      ElMessage.error('文件上传失败');
    }
  } catch (error) {
    console.log('Error uploading file:', error);
    ElMessage.error('文件上传失败');
  }
};


    return {
      background,
      projects,
      projectDetailDialogVisible,
      paginatedProjects,
      selectedProjects,
      totalProjects,
      currentPage,
      pageSize,
      loading,
      editProjectDialogVisible,
      selectedProject,
      searchParam,
      projectParticipantDialogVisible,
      currentTenantName,
      goToParticipantManagement,
      handleSelectionChange,
      handleCurrentChange,
      handleSizeChange,
      confirmEdit,
      confirmDelete,
      fetchProjects,
      goToDetail,
      triggerFileUpload,
      confirmFileUpload,
      handleFileChange,
    };
  },
});
</script>

<style scoped>
.action-buttons {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
