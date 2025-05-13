<template>
    <el-dialog v-model="localVisible" width="600">
        <div class="project-detail-container">
            <el-card class="detail-card">
                <h2>项目详情</h2>
                <el-form>
                    <el-form-item label="项目ID">
                        <!-- <el-text>{{projectDetail.projectId}}</el-text> -->
                        <el-input v-model="projectDetail.projectId"  placeholder="无" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="项目名称">
                        <!-- <el-text>{{projectDetail.projectName}}</el-text> -->
                        <el-input v-model="projectDetail.projectName"  placeholder="无" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="租户ID">
                        <!-- <el-text>{{projectDetail.projectTenantId}}</el-text> -->
                        <el-input v-model="projectDetail.projectTenantId" placeholder="无" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="需求文件">
                        <!-- <el-text>{{projectDetail.projectRequirementFile}}</el-text> -->
                        <el-input v-model="projectDetail.projectRequirementFile" placeholder="无" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="UFP">
                        <!-- <el-text>{{projectDetail.projectUFP}}</el-text> -->
                        <el-input v-model="projectDetail.projectUFP" placeholder="无" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="DFP">
                        <!-- <el-text>{{projectDetail.projectDFP}}</el-text> -->
                        <el-input v-model="projectDetail.projectDFP" placeholder="无" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="ESDC">
                        <!-- <el-text>{{projectDetail.projectESDC}}</el-text> -->
                        <el-input v-model="projectDetail.projectESDC" placeholder="无" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="历史版本数">
                        <!-- <el-text>{{projectDetail.projectHistoryNum}}</el-text> -->
                        <el-input v-model="projectDetail.projectHistoryNum" placeholder="无" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="开始日期">
                        <!-- <el-text>{{projectDetail.projectStartDate}}</el-text> -->
                        <el-input v-model="projectDetail.projectStartDate" placeholder="无" disabled></el-input>
                    </el-form-item>
                </el-form>
                <div class="button-container">
                    <el-button type="primary" @click="goBack">返回</el-button>
                </div>
            </el-card>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default defineComponent({
    name: 'ProjectDetailDialog',
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        projectData: {
            type: Object,
            required: true,
        }
    },
    emits: ['update:visible', 'projectEdited'],
    setup(props, { emit }) {
        const projectDetail = ref(props.projectData);
        const localVisible = ref(props.visible);

        const updateDetail = () => {
            projectDetail.value = props.projectData;
        }

        watch(() => props.visible, (newVal) => {
            localVisible.value = newVal;
            if (newVal) {
                updateDetail();
            }
        });

        watch(() => props.projectData, updateDetail);

        watch(localVisible, (newVal) => {
            emit('update:visible', newVal);
        });

        const fetchProjectDetail = async () => {
            // loading.value = true;
            // try {
            //     console.log('Fetching projects with params:', { page: currentPage.value, size: pageSize.value, ...searchParams });
            //     searchParam.value = searchParams;
            //     const response = await axios.get(`/api/project/list`, {
            //         params: {
            //             page: currentPage.value,
            //             size: pageSize.value,
            //             ...searchParams,
            //         },
            //     });
            //     projects.value = response.data.projects;
            //     totalProjects.value = response.data.total;
            //     console.log('Response:', response.data);
            // } catch (error) {
            //     console.error('Error fetching projects:', error);
            //     ElMessage.error('获取项目列表失败');
            // } finally {
            //     loading.value = false;
            // }
        };

        const goBack = () => {
            localVisible.value = false;
        };

        // onMounted(() => {
        //     fetchProjectDetail(); // 组件挂载时获取项目详情
        // });

        return {
            projectDetail,
            localVisible,
            updateDetail,
            fetchProjectDetail,
            goBack,
        };
    }
});
</script>

<style scoped>
.project-detail-container {
    padding: 20px;
}

.detail-card {
    padding: 20px;
}

.button-container {
    margin-top: 20px;
}
</style>