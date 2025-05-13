<template>
    <div>
        <el-dialog v-model="localVisible" width="800">
            <H2> 添加项目{{ currentUserRole }}</H2>
            <div class="tag-buttons">
                <el-tag type="success" @click="confirmMultiAdd"><el-icon>
                        <Plus />
                    </el-icon> 添加到项目</el-tag>
                <el-tag type="primary" @click="goToAddUserWithUserRoleDialog"><el-icon>
                        <Plus />
                    </el-icon> 新建用户</el-tag>
            </div>

            <el-table v-loading="loading" :data="paginatedRestUsers" style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="userId" label="用户ID"></el-table-column>
                <el-table-column prop="userName" label="用户名称"></el-table-column>
                <el-table-column prop="userPhone" label="用户手机"></el-table-column>
                <el-table-column prop="userTenantId" label="租户id"></el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <div class="action-buttons">
                            <el-button circle style="color: red;" @click="confirmAdd(scope.row)">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                            </el-button>
                        </div>
                    </template>
                </el-table-column>

            </el-table>
            <div style="margin-top: 20px; text-align: right;">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 30, 40]" :total="totalRestUsers" :background="background" 
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </el-dialog>
        <AddUserWithUserRoleDialog v-model:visible="addUserWithUserRoleDialogVisible" :projectData="currentProject"
        :userRoleId="currentUserRoleId" :currentUserRole="currentUserRole" @userAdded="updateDialog" />
    </div>
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { defineComponent, ref, computed, watch } from 'vue';
import axios from 'axios';
import { Delete, Download, EditPen, Plus, Upload } from '@element-plus/icons-vue';
import { pa } from 'element-plus/es/locales.mjs';
import AddUserWithUserRoleDialog from './AddUserWithUserRoleDialog.vue';

export default defineComponent({
    name: 'AddProjectRestUsersDialog',
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        projectData: {
            type: Object,
            required: true,
        },
        currentUserRoleId: {
            type: Number,
            required: true,
        },
        currentUserRole: {
            type: String,
            required: true,
        }
    },
    components: {
        Delete, Download, EditPen, Plus, Upload, AddUserWithUserRoleDialog
    },
    emits: ['update:visible', 'projectEdited'],
    setup(props, { emit }) {
        const currentProject = ref(props.projectData);
        const localVisible = ref(props.visible);
        const restUsers = ref([]);
        const newRestUser = ref('');

        const addUserWithUserRoleDialogVisible = ref(false);
        const selectedRestUsers = ref([]);
        const totalRestUsers = ref(0);
        const pageSize = ref(10);
        const currentPage = ref(1);
        const loading = ref(false);
        const background = ref(false);
        const selectedRestUser = ref<Record<string, any>>({});  // 将初始值设为空对象
        var searchParam = ref({});// 分页时参数 保证对搜索结果的分页

        const updateDialog = () => {
            currentProject.value = props.projectData;
            fetchRestUsers();
            emit("projectEdited");
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

        const fetchRestUsers = async (searchParams = {}) => {
            loading.value = true;
            try {
                console.log('Fetching restusers with params:', currentProject.value.projectId);
                const response = await axios.get(`/api/project/getrestusers`, {
                    params: {
                        page: currentPage.value,
                        size: pageSize.value,
                        // userTenantId: 1,
                        projectId: currentProject.value.projectId,
                        userRoleId: props.currentUserRoleId
                    },
                });
                restUsers.value = response.data.users;
                totalRestUsers.value = response.data.total;
                console.log('Response:', response.data);
            } catch (error) {
                console.error('Error fetching restusers:', error);
                ElMessage.error('获取用户列表失败');
            } finally {
                loading.value = false;
            }

        };

        const confirmAdd = (row: any) => {
            ElMessageBox.confirm(
                `确认添加用户编号 ${row.userId}，用户名 ${row.userName} 到项目 ${currentProject.value.projectName} 中吗？`,
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            ).then(async () => {
                try {
                    // await axios.delete(`/api/project/delete/${row.projectId}`);
                    console.log('add user project:', row.userId, ' ', currentProject.value.projectId);
                    await axios.get(`/api/project/adduserproject`, {
                        params: {
                            userId: row.userId,
                            projectId: currentProject.value.projectId,
                            userRoleId: props.currentUserRoleId
                        },
                    });
                    ElMessage.success('添加成功');
                    emit('projectEdited');
                    fetchRestUsers();
                } catch (error) {
                    console.error('Error adding project:', error);
                    ElMessage.error('添加失败');
                }
            }).catch(() => {
                ElMessage({
                    type: 'info',
                    message: '已取消添加',
                });
            });
        }

        const confirmMultiAdd = () => {
            if (selectedRestUsers.value.length === 0) {
                ElMessage.error('请选择至少一个用户进行添加');
                return;
            }

            ElMessageBox.confirm(
                `确认添加选中的 ${selectedRestUsers.value.length} 个用户到项目 ${currentProject.value.projectName} 中吗？`,
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            ).then(() => {
                handleMultiAdd(selectedRestUsers.value);
            }).catch(() => {
                ElMessage.info('已取消添加');
            });
        }

        const goToAddUserWithUserRoleDialog = () => {
            console.log('projectData:', props.projectData);
            addUserWithUserRoleDialogVisible.value = true;
        }

        const handleMultiAdd = async (restUsersToAdd: any[]) => {
            try {
                const addPromises = restUsersToAdd.map(restUser => axios.get(`/api/project/adduserproject`, {
                    params: {
                        userId: restUser.userId,
                        projectId: currentProject.value.projectId,
                        userRoleId: props.currentUserRoleId
                    },
                }));
                await Promise.all(addPromises);
                ElMessage.success('添加成功');
                emit('projectEdited');
                fetchRestUsers();
            } catch (error) {
                console.error('Error adding projects:', error);
                ElMessage.error('添加失败');
            }
        }

        const handleSelectionChange = (selection: never[]) => {
            selectedRestUsers.value = selection;
        };

        const handleCurrentChange = (page: number) => {
            currentPage.value = page;
            fetchRestUsers(searchParam.value);
        };

        const handleSizeChange = (size: number) => {
            pageSize.value = size;
            fetchRestUsers(searchParam.value);
        };

        const goBack = () => {
            localVisible.value = false;
        };

        const paginatedRestUsers = computed(() => restUsers.value);

        fetchRestUsers();

        return {
            searchParam,
            localVisible,
            loading,
            restUsers,
            newRestUser,
            updateDialog,
            currentProject,
            fetchRestUsers,
            handleSelectionChange,
            goBack,
            totalRestUsers,
            paginatedRestUsers,
            currentPage,
            pageSize,
            background,
            selectedRestUser,
            selectedRestUsers,
            handleSizeChange,
            handleCurrentChange,
            confirmAdd,
            confirmMultiAdd,
            handleMultiAdd,
            goToAddUserWithUserRoleDialog,
            addUserWithUserRoleDialogVisible
        };
    }
});
</script>

<style scoped>
.restusers-management-container {
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