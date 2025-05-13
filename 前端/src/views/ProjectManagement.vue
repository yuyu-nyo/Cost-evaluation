<template>
  <div class="project-management-container">
    <ProjectSearchBar @search="handleSearch" />
    <div class="tag-buttons">
      <el-tag type="primary" @click="openAddProjectDialog"><el-icon>
          <Plus />
        </el-icon> 新增</el-tag>
      <el-tag type="success" @click="openEditProjectDialog"><el-icon>
          <EditPen />
        </el-icon> 修改</el-tag>
      <el-tag type="danger" @click="confirmDelete"><el-icon>
          <Delete />
        </el-icon> 删除</el-tag>
      <el-tag type="warning" @click="exportProjects"><el-icon>
          <Download />
        </el-icon> 导出</el-tag>
    </div>
    <div class="content-container">
      <div class="table-container">
        <ProjectTable ref="projectTable" />
      </div>
    </div>
    <AddProjectDialog v-model:visible="addProjectDialogVisible" @projectAdded="refreshProjectTable" />
    <EditProjectDialog v-model:visible="editProjectDialogVisible" :projectData="selectedProject"
      @projectEdited="refreshProjectTable" />
  </div>
</template>

<script lang="ts">
import AddProjectDialog from '@/components/AddProjectDialog.vue';
import EditProjectDialog from '@/components/EditProjectDialog.vue';
import ProjectSearchBar from '@/components/ProjectSearchBar.vue';
import ProjectTable from '@/components/ProjectTable.vue';
import axios from 'axios';
import { Delete, Download, EditPen, Plus, Upload } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ProjectManagement',
  components: {
    ProjectSearchBar,
    ProjectTable,
    AddProjectDialog,
    EditProjectDialog,
    Plus,
    EditPen,
    Delete,
    Upload,
    Download
  },
  setup() {
    const projectTable = ref();
    const addProjectDialogVisible = ref(false);
    const editProjectDialogVisible = ref(false);
    const selectedProject = ref<Record<string, any>>({});

    const handleSearch = (searchParams: any) => {
      console.log('搜索参数', searchParams);
      projectTable.value.fetchProjects(searchParams);
    };

    const openAddProjectDialog = () => {
      console.log('打开新增项目对话框');
      addProjectDialogVisible.value = true;
    };

    const openEditProjectDialog = () => {
      const selectedProjects = projectTable.value.selectedProjects;
      if (selectedProjects.length !== 1) {
        ElMessage.error('请选择一个项目进行编辑');
        return;
      }
      console.log(selectedProjects[0].projectStartDate);
      selectedProject.value = selectedProjects[0];
      editProjectDialogVisible.value = true;
    };

    const confirmDelete = () => {
      const selectedProjects = projectTable.value.selectedProjects;
      if (selectedProjects.length === 0) {
        ElMessage.error('请选择至少一个项目进行删除');
        return;
      }

      ElMessageBox.confirm(
        `确认删除选中的 ${selectedProjects.length} 个项目吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        handleDelete(selectedProjects);
      }).catch(() => {
        ElMessage.info('已取消删除');
      });
    };

    const handleDelete = async (projectsToDelete: any[]) => {
      try {
        const deletePromises = projectsToDelete.map(project => axios.delete(`/api/project/delete/${project.projectId}`));
        await Promise.all(deletePromises);
        ElMessage.success('删除成功');
        refreshProjectTable();
      } catch (error) {
        console.error('Error deleting projects:', error);
        ElMessage.error('删除失败');
      }
    };

    const refreshProjectTable = () => {
      projectTable.value.fetchProjects();
    };

    const exportProjects = async () => {
      console.log('导出项目');
      try {
        const response = await axios.get('/api/project/export', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'projects.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting projects:', error);
        ElMessage.error('导出失败');
      }
    };


    return {
      projectTable,
      addProjectDialogVisible,
      editProjectDialogVisible,
      selectedProject,
      handleSearch,
      openAddProjectDialog,
      openEditProjectDialog,
      confirmDelete,
      refreshProjectTable,
      exportProjects,
    };
  }
});
</script>

<style scoped>
.project-management-container {
  margin-left: 0;
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

.table-container {
  flex: 3;
}
</style>