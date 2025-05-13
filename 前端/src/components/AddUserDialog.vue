<template>
  <el-dialog v-model="localVisible" title="添加用户" width="1000px" top="10vh" :custom-class="'custom-dialog'">
    <el-form :model="addUserForm" :rules="rules" ref="formRef" label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户ID" prop="userId" class="form-item">
            <el-input v-model="addUserForm.userId" placeholder="请输入用户ID"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 用户头像 -->
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户名称" prop="userName" class="form-item">
            <el-input v-model="addUserForm.userName" placeholder="请输入用户名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
        
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户密码" prop="userPwd" class="form-item">
            <el-input v-model="addUserForm.userPwd" placeholder="请输入用户密码" type="password"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="userPhone" class="form-item">
            <el-input v-model="addUserForm.userPhone" placeholder="请输入手机号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户角色" prop="userRoles" class="form-item">
            <el-checkbox-group v-model="addUserRolesForm">
              <el-checkbox label="1">租户管理员</el-checkbox>
              <el-checkbox label="2">评估师</el-checkbox>
              <el-checkbox label="3">审核员</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="handleAddUser">确定</el-button>
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
  name: 'AddUserDialog',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:visible', 'userAdded'],
  setup(props, { emit }) {
    const addUserForm = ref({
      userId:'',
      userImage: '',
      userName: '',
      userPwd: '',
      userPhone: '',
      userTenantName: '',
    });
    const addUserRolesForm = ref<number[]>([]);

    const formRef = ref<FormInstance | null>(null);
    const localVisible = ref(props.visible);

    const fetchTenantName = async (searchParams = {}) => {
      const token = localStorage.getItem('jwtToken');
      console.log(token);
      try {
        const response = await axios.get('http://localhost:9001/user/tenant', {
          headers: {
            Authorization: `Bearer ${token}`, // 在请求头中加入 Authorization
          }
        });
        if(response.data.isOk == false) {
          ElMessage.error(response.data.msg);
        }
        else{
          addUserForm.value.userTenantName = response.data.tenantName;
        }
      } catch (error) {
        ElMessage.error('加载租户失败');
      }
    };

    watch(() => props.visible, (newVal) => {
      localVisible.value = newVal;
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

    const handleAddUser = () => {
      const form = formRef.value;
      if (form) {
        form.validate((valid: boolean) => {
          if (valid) {
            submitForm();
          } else {
            console.log('表单验证失败');
          }
        });
      }
    };

    const submitForm = async () => {
      try {
        const token = localStorage.getItem('jwtToken');

        const response = await axios.post('/api/user/add', {
          user: addUserForm.value,
          userRoles: addUserRolesForm.value,
          
        }, {
          headers: {
            Authorization: `Bearer ${token}`, // 在请求头中加入 Authorization
          },
        });
        if (response.data.isOk) {
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

    const handleCancel = () => {
      localVisible.value = false;
    };

    onMounted(() => {
      fetchTenantName();
    });

    return {
      addUserForm,
      addUserRolesForm,
      formRef,
      rules,
      handleAddUser,
      handleCancel,
      localVisible,
    };
  }
});
</script>

<style scoped>
.add-user-container {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}
.form-item {
  margin-bottom: 40px;
}
.el-form-item__label {
  width: 120px;
}
.form-buttons {
  text-align: center;
  margin-top: 20px;
}
.custom-dialog .el-dialog__body {
  height: 800px; /* 根据需要调整高度 */
  overflow-y: auto; /* 如果内容超出高度，添加滚动条 */
}
</style>
