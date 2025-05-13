<template>
  <div>
    <el-dialog v-model="localVisible" width="800">
      <h2>项目{{ currentUserRole }}管理</h2>
      <div>
        <!-- <el-tag type="primary" @click="fetchRole1"><el-icon>
            <Plus />
          </el-icon> 评估师</el-tag>
        <el-tag type="danger" @click="fetchRole2"><el-icon>
            <Delete />
          </el-icon> 审核员</el-tag> -->
        <el-radio-group  style="margin-bottom: 10px;" v-model="currentUserRoleId" @change="onChangeCommand()">
          <el-radio-button label="评估师" value=2 />
          <el-radio-button label="审核员" value=3 />
        </el-radio-group>

      </div>

      <div class="tag-buttons">
        <el-tag type="primary" @click="addParticipant"><el-icon>
            <Plus />
          </el-icon> 添加</el-tag>
        <el-tag type="danger" @click="confirmMultiDelete"><el-icon>
            <Delete />
          </el-icon> 删除</el-tag>
      </div>
      <el-table v-loading="loading" :data="paginatedParticipants" style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="userId" label="用户ID"></el-table-column>
        <el-table-column prop="userName" label="用户名称"></el-table-column>
        <el-table-column prop="userPhone" label="用户手机"></el-table-column>
        <el-table-column prop="userTenantId" label="租户id"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <div class="action-buttons">
              <el-button circle style="color: red;" @click="confirmDelete(scope.row)">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>

      </el-table>
      <div style="margin-top: 20px; text-align: right;">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 40]"
          :total="totalParticipants" :background="background" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-dialog>

    <AddProjectParticipantsDialog v-model:visible="addParticipantDialogVisible" :projectData="currentProject"
      :currentUserRoleId="currentUserRoleId" :currentUserRole="currentUserRole" @projectEdited="updateDialog" />
  </div>


</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { defineComponent, ref, computed, watch } from 'vue';
import axios from 'axios';
import { Delete, Download, EditPen, Plus, Upload } from '@element-plus/icons-vue';
import { pa } from 'element-plus/es/locales.mjs';
import AddProjectParticipantsDialog from './AddProjectParticipantsDialog.vue';
import { c } from 'naive-ui';

export default defineComponent({
  name: 'ProjectParticipantsManagementDialog',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    projectData: {
      type: Object,
      required: true,
    },
  },
  components: {
    Delete, Download, EditPen, Plus, Upload, AddProjectParticipantsDialog
  },
  emits: ['update:visible', 'projectEdited'],
  setup(props, { emit }) {
    const currentProject = ref(props.projectData);
    const localVisible = ref(props.visible);
    const participants = ref([]);
    const newParticipant = ref('');

    const currentUserRoleId = ref(2);
    const currentUserRole = ref('评估师');

    const addParticipantDialogVisible = ref(false);
    const selectedParticipants = ref([]);
    const totalParticipants = ref(0);
    const pageSize = ref(10);
    const currentPage = ref(1);
    const loading = ref(false);
    const background = ref(false);
    const selectedParticipant = ref<Record<string, any>>({});  // 将初始值设为空对象
    var searchParam = ref({});// 分页时参数 保证对搜索结果的分页

    const updateDialog = () => {
      currentProject.value = props.projectData;
      fetchParticipants({ userRoleId: currentUserRoleId.value });
    }

    watch(() => props.projectData, updateDialog);

    watch(() => props.visible, (newVal) => {
      localVisible.value = newVal;
      if (newVal) {
        updateDialog();
      }
    });

    watch(localVisible, (newVal) => {
      emit('update:visible', newVal);
    });

    const onChangeCommand = () => {
      console.log('currentUserRoleId:', currentUserRoleId.value);
      if (currentUserRoleId.value == 2) {
        currentUserRole.value = '评估师';
      }
      if (currentUserRoleId.value == 3) {
        currentUserRole.value = '审核员';
      }
      fetchParticipants({ userRoleId: currentUserRoleId.value });
    }

    // const fetchRole1 = () => {
    //   currentUserRoleId.value = 2;
    //   currentUserRole.value = '评估师';
    //   fetchParticipants({ userRoleId: currentUserRoleId.value });
    // }

    // const fetchRole2 = () => {
    //   currentUserRoleId.value = 3;
    //   currentUserRole.value = '审核员';
    //   fetchParticipants({ userRoleId: currentUserRoleId.value });
    // }

    const fetchParticipants = async (searchParams = {}) => {
      // loading.value = true;
      // try {
      //   console.log('Fetching projects with params:', { page: currentPage.value, size: pageSize.value, ...searchParams });
      //   searchParam.value = searchParams;
      // const response = await axios.get(`/api/project/list`, {
      //   params: {
      //     page: currentPage.value,
      //     size: pageSize.value,
      //     ...searchParams,
      //   },
      // });
      //   projects.value = response.data.projects;
      //   totalProjects.value = response.data.total;
      //   console.log('Response:', response.data);
      // } catch (error) {
      //   console.error('Error fetching projects:', error);
      //   ElMessage.error('获取项目列表失败');
      // } finally {
      //   loading.value = false;
      // }
      loading.value = true;
      try {
        console.log('currentProject:', currentProject.value.projectId);
        console.log('Fetching participants with params:', { page: currentPage.value, size: pageSize.value, currentUserRoleId });
        searchParam.value = searchParams;
        const response = await axios.get(`/api/project/getusersbyprojectidanduserroleid`, {
          params: {
            page: currentPage.value,
            size: pageSize.value,
            projectId: currentProject.value.projectId,
            userRoleId: currentUserRoleId.value,
          },
        });
        // const response = await axios.get(`/api/project/getrestusers`, {
        //   params: {
        //     page: currentPage.value,
        //     size: pageSize.value,
        //     userTenantId: 1,
        //     projectId: currentProject.value.projectId,
        //   },
        // });
        participants.value = response.data.users;
        totalParticipants.value = response.data.total;
        console.log('Response:', response.data);
      } catch (error) {
        console.error('Error fetching participants:', error);
        ElMessage.error('获取参与者列表失败');
      } finally {
        loading.value = false;
      }

    };

    const addParticipant = async () => {
      // if (!newParticipant.value) {
      //   ElMessage.error('请输入用户邮箱或ID');
      //   return;
      // }

      // try {
      //   const response = await axios.post(`/api/project/participants/add`, {
      //     projectId: props.projectId,
      //     participant: newParticipant.value,
      //   });

      //   if (response.data.isOK) {
      //     ElMessage.success('参与者添加成功');
      //     participants.value.push({ userId: response.data.userId, userName: response.data.userName, userEmail: newParticipant.value });
      //     newParticipant.value = '';
      //   } else {
      //     ElMessage.error('添加参与者失败');
      //   }
      // } catch (error) {
      //   console.error('Error adding participant:', error);
      //   ElMessage.error('添加参与者失败');
      // }
      console.log('projectData:', props.projectData);
      addParticipantDialogVisible.value = true;
    };

    const confirmDelete = (row: any) => {
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
          // await axios.delete(`/api/project/delete/${row.projectId}`);
          console.log('delete user project:', row.userId, ' ', currentProject.value.projectId);
          await axios.delete(`/api/project/deleteuserproject`, {
            params: {
              userId: row.userId,
              projectId: currentProject.value.projectId,
              userRoleId: currentUserRoleId.value,
            },
          });
          ElMessage.success('删除成功');
          fetchParticipants();
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

    const confirmMultiDelete = () => {
      if (selectedParticipants.value.length === 0) {
        ElMessage.error('请选择至少一个参与者进行删除');
        return;
      }

      ElMessageBox.confirm(
        `确认删除选中的 ${selectedParticipants.value.length} 个参与者吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        handleMultiDelete(selectedParticipants.value);
      }).catch(() => {
        ElMessage.info('已取消删除');
      });
    }

    const handleMultiDelete = async (participantsToDelete: any[]) => {
      try {
        const deletePromises = participantsToDelete.map(participant => axios.delete(`/api/project/deleteuserproject`, {
          params: {
            userId: participant.userId,
            projectId: currentProject.value.projectId,
            userRoleId: currentUserRoleId.value,
          },
        }));
        await Promise.all(deletePromises);
        ElMessage.success('删除成功');
        fetchParticipants();
      } catch (error) {
        console.error('Error deleting projects:', error);
        ElMessage.error('删除失败');
      }
    };

    const handleSelectionChange = (selection: never[]) => {
      selectedParticipants.value = selection;
    };

    const handleCurrentChange = (page: number) => {
      currentPage.value = page;
      fetchParticipants(searchParam.value);
    };

    const handleSizeChange = (size: number) => {
      pageSize.value = size;
      fetchParticipants(searchParam.value);
    };

    const goBack = () => {
      localVisible.value = false;
    };

    const paginatedParticipants = computed(() => participants.value);

    fetchParticipants({ userRoleId: currentUserRoleId.value });

    return {
      searchParam,
      localVisible,
      loading,
      participants,
      newParticipant,
      updateDialog,
      currentProject,
      currentUserRoleId,
      currentUserRole,
      fetchParticipants,
      addParticipant,
      handleSelectionChange,
      goBack,
      totalParticipants,
      paginatedParticipants,
      currentPage,
      pageSize,
      background,
      selectedParticipant,
      selectedParticipants,
      handleSizeChange,
      handleCurrentChange,
      confirmDelete,
      confirmMultiDelete,
      handleMultiDelete,
      addParticipantDialogVisible,
      // fetchRole1,
      // fetchRole2,
      onChangeCommand,
    };
  }
});
</script>

<style scoped>
.participants-management-container {
  padding: 20px;
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

.button-container {
  margin-top: 20px;
}
</style>