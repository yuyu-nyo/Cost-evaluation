<template>
  <el-dialog v-model="localVisible" title="修改用户信息" width="600px">
    <el-form :model="editUserForm" :rules="rules" ref="formRef" label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户ID" prop="userId" class="form-item">
            <el-input v-model="editUserForm.userId" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 用户头像 -->
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户名称" prop="userName" class="form-item">
            <el-input v-model="editUserForm.userName" placeholder="请输入用户名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
     
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户密码" prop="userPwd" class="form-item">
            <el-input v-model="editUserForm.userPwd" placeholder="请输入用户密码" type="password"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="userPhone" class="form-item">
            <el-input v-model="editUserForm.userPhone" placeholder="请输入手机号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户角色" prop="userRoles" class="form-item">
            <el-checkbox-group v-model="editUserRolesForm">
              <el-checkbox label="1">租户管理员</el-checkbox>
              <el-checkbox label="2">评估师</el-checkbox>
              <el-checkbox label="3">审核员</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="handleEditUser">保存</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import axios from 'axios';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { defineComponent, onMounted, ref, watch } from 'vue';

export default defineComponent({
  name: 'EditUserDialog',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    userData: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:visible', 'userEdited'],
  setup(props, { emit }) {
    const editUserForm = ref({ ...props.userData });
    const editUserRolesForm = ref<number[]>([]);
    const formRef = ref<FormInstance | null>(null);
    const localVisible = ref(props.visible);

    watch(() => props.visible, async (newVal) => {
      localVisible.value = newVal;
      const response = await axios.get('/api/user/userRoles', {
        params: {
          userId: editUserForm.value.userId,
        },
      });
      editUserRolesForm.value = response.data.userRoles || [];
    });

    watch(() => props.userData, async (newUserData) => {
      editUserForm.value = { ...newUserData };
      const response = await axios.get('/api/user/userRoles', {
        params: {
          userId: newUserData.userId,
        },
      });
      editUserRolesForm.value = response.data.userRoles || [];
    });

    watch(localVisible, (newVal) => {
      emit('update:visible', newVal);
    });

    const rules = ref({
      userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      userPhone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
      userPwd: [
        { required: true, message: '请输入用户密码', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, message: '密码必须是字母和数字组合且不少于6位', trigger: 'blur' }
      ]
    });

    const handleEditUser = () => {
      if (formRef.value) {
        formRef.value.validate(async (valid: boolean) => {
          if (valid) {
            try {
              const response = await axios.post('/api/user/update',{
                user: editUserForm.value,
                userRoles: editUserRolesForm.value,
              },{
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              if (response.data.isOK) {
                ElMessage.success('用户修改成功');
                emit('userEdited');
                localVisible.value = false;
              } else {
                ElMessage.error(`修改失败: ${response.data.msg}`);
              }
            } catch (error: any) {
              ElMessage.error(`修改失败: ${error.message}`);
            }
          } else {
            ElMessage.error('表单验证失败');
          }
        });
      }
    };

    const handleCancel = () => {
      localVisible.value = false;
    };

    onMounted(() => {
      
    });

    return {
      editUserForm,
      editUserRolesForm,
      formRef,
      rules,
      handleEditUser,
      handleCancel,
      localVisible,
    };
  }
});
</script>

<style scoped>
.el-dialog {
  width: 100%;
}
</style>
 