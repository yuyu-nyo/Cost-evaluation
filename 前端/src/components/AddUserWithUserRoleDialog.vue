<template>
    <div>
        <el-dialog v-model="localVisible" width="400">
            <h2>添加用户</h2>
            <div>
                <el-form :model="newUser" ref="formref">
                    <el-form-item label="用户Id" prop="userId"
                        :rules="[{ required: true, message: '请输入用户Id', trigger: 'blur' }]">
                        <el-input v-model="newUser.userId"></el-input>
                    </el-form-item>
                    <el-form-item label="用户名" prop="userName"
                        :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
                        <el-input v-model="newUser.userName"></el-input>
                    </el-form-item>
                    <el-form-item label="所属租户Id" prop="userTenantId"
                        :rules="[{ required: true, message: '请输入所属租户Id', trigger: 'blur' }]">
                        <el-input v-model="newUser.userTenantId" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="用户密码" prop="userPwd"
                        :rules="[{ required: true, message: '请输入用户密码', trigger: 'blur' }]">
                        <el-input v-model="newUser.userPwd"></el-input>
                    </el-form-item>
                    <el-form-item label="手机号码" prop="userPhone"
                        :rules="[{ required: true, message: '请输入手机号码', trigger: 'blur' }]">
                        <el-input v-model="newUser.userPhone"></el-input>
                    </el-form-item>
                    <el-form-item label="用户角色">
                        <!-- <el-select v-model="newUser.userRoleId" placeholder="选择角色">
                            <el-option
                                v-for="role in userRoles"
                                :key="role.id"
                                :label="role.name"
                                :value="role.id">
                            </el-option>
                        </el-select> -->
                        <el-input v-model="newUser.userRoleId" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="项目Id" prop="projectId"
                        :rules="[{ required: true, message: '请输入项目Id', trigger: 'blur' }]">
                        <el-input v-model="newUser.projectId" disabled></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="Image" prop="userImage"
                        :rules="[{ required: true, message: '请输入Image', trigger: 'blur' }]">
                        <el-input v-model="newUser.userImage"></el-input>
                    </el-form-item> -->
                </el-form>
                <div style="margin-top: 20px; text-align: right;">
                    <el-button type="primary" @click="confirmAddUser">添加用户</el-button>
                    <el-button @click="goBack">取消</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import type { FormInstance } from 'element-plus';
import { pa } from 'element-plus/es/locales.mjs';

export default defineComponent({
    name: 'AddUserWithUserRoleDialog',
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        userRoleId: {
            type: Number,
            required: true,
        },
        projectData: {
            type: Object,
            required: true,
        },
        currentUserRole: {
            type: String,
            required: true,
        },
    },
    emits: ['update:visible', 'userAdded'],
    setup(props, { emit }) {
        const localVisible = ref(props.visible);
        const newUser = ref({
            userName: '',
            userPhone: '',
            userRoleId: props.userRoleId,
            userId: '',
            userTenantId: props.projectData.projectTenantId,
            userPwd: '',
            userImage: '',
            projectId: props.projectData.projectId
        });

        const formRef = ref<FormInstance | null>(null);

        watch(() => props.visible, (newVal) => {
            localVisible.value = newVal;
            resetForm();
        });

        // watch(() => props.visible, (newVal) => {
        //     localVisible.value = newVal;
        // });

        watch(localVisible, (newVal) => {
            emit('update:visible', newVal);
        });


        const confirmAddUser = async () => {
            // console.log('confirmAddUser');
            // const form = formRef.value;
            // if (form) {
            //     form.validate((valid: boolean) => {
            //         if (valid) {
            //             console.log('表单验证通过');
            //             submitForm();
            //         } else {
            //             console.log('表单验证失败');
            //             ElMessage.error('表单验证失败，请检查');
            //         }
            //     })
            // } else {
            //     console.log('表单验证失败');
            //     ElMessage.error('表单验证失败，请检查');
            // }
            if (newUser.value.userName === '' ||
                newUser.value.userPhone === '' ||
                newUser.value.userPwd === '' ||
                // newUser.value.userTenantId === '' ||
                // newUser.value.projectId === '' ||
                // newUser.value.userRoleId === '' ||
                newUser.value.userId === ''
                // newUser.value.userImage === ''
                                                ) {
                console.log('表单验证失败');
                ElMessage.error('表单验证失败，请检查');
            } else {
                console.log('表单验证通过');
                submitForm();
            }
        };

        // userName: '',
        // userPhone: '',
        // userRoleId: props.userRoleId,
        // userId: '',
        // userTenantId: props.currentTenantId,
        // userPwd: '',
        // userImage: '',
        // projectId: props.currentProjectId

        const submitForm = async () => {
            try {
                console.log('addUserWithUserRoleForm', newUser.value);
                const response = await axios.get('/api/project/adduserwithuserrole', {
                    params: {
                        userName: newUser.value.userName,
                        userPhone: newUser.value.userPhone,
                        userRoleId: newUser.value.userRoleId,
                        userId: newUser.value.userId,
                        userTenantId: newUser.value.userTenantId,
                        userPwd: newUser.value.userPwd,
                        userImage: newUser.value.userImage,
                        projectId: newUser.value.projectId,
                    }
                });
                if (response.data.isOK) {
                    ElMessage.success('用户添加成功');
                    emit('userAdded');
                    localVisible.value = false;
                } else {
                    ElMessage.error(`添加失败: ${response.data.msg}`);
                }
            } catch (error: any) {
                console.error('Error:', error); // 打印详细错误信息
                ElMessage.error(`添加失败: ${error.message}`);
            }
        };

        const resetForm = () => {
            newUser.value.userName = '';
            newUser.value.userPhone = '';
            newUser.value.userRoleId = props.userRoleId;
            newUser.value.userId = '';
            newUser.value.userTenantId = props.projectData.projectTenantId;
            newUser.value.userPwd = '';
            newUser.value.userImage = '';
            newUser.value.projectId = props.projectData.projectId;
        };

        const goBack = () => {
            localVisible.value = false;
        };

        resetForm();

        return {
            localVisible,
            newUser,
            formRef,
            submitForm,
            confirmAddUser,
            goBack,
        };
    }
});
</script>

<style scoped>
/* 可以添加自定义样式来美化组件 */
</style>