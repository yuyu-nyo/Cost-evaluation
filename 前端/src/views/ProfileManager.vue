<template>
  <el-container>
    <el-header>管理员个人中心</el-header>
    <el-main>
      <el-form :model="profileForm" :rules="rules" ref="formRef" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="管理员名称" prop="managerAccount">
              <el-input v-model="profileForm.managerAccount" placeholder="请输入管理员名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="managerPhone">
              <el-input v-model="profileForm.managerPhone" placeholder="请输入手机号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="头像" prop="managerImg">
              <el-upload
                action="/api/manager/upload"
                list-type="picture-card"
                :on-success="handleAvatarSuccess"
                :show-file-list="false"
              >
                <img v-if="profileForm.managerImg" :src="profileForm.managerImg" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="showChangePassword">
          <el-col :span="12">
            <el-form-item label="修改密码" prop="newPassword">
              <el-input v-model="profileForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="profileForm.confirmPassword" type="password" placeholder="请确认新密码"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="warning" @click="toggleChangePassword">{{ showChangePassword ? '取消修改密码' : '修改密码' }}</el-button>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import axios from 'axios';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'ProfileManager',
  setup() {
    const profileForm = ref({
      managerAccount: '',
      managerPhone: '',
      managerImg: '',
      newPassword: '',
      confirmPassword: ''
    });

    const formRef = ref<FormInstance | null>(null);
    const showChangePassword = ref(false);

    const validateConfirmPassword = (rule: any, value: string, callback: any) => {
      if (value !== profileForm.value.newPassword) {
        callback(new Error('确认密码与修改密码不一致'));
      } else {
        callback();
      }
    };

    const rules = ref({
      managerAccount: [{ required: true, message: '请输入管理员名称', trigger: 'blur' }],
      managerPhone: [{ required: false, message: '请输入手机号', trigger: 'blur' }],
      newPassword: [{ required: showChangePassword.value, message: '请输入新密码', trigger: 'blur' }],
      confirmPassword: [{ required: showChangePassword.value, message: '请确认新密码', trigger: 'blur' }, { validator: validateConfirmPassword, trigger: 'blur' }]
    });

    const loadManagerProfile = async () => {
      try {
        const response = await axios.get('/api/manager/current');
        if (response.data.isOk) {
          profileForm.value = response.data.manager;
        } else {
          ElMessage.error('加载管理员信息失败');
        }
      } catch (error) {
        ElMessage.error('加载管理员信息失败');
      }
    };

    const handleAvatarSuccess = (response: any) => {
      if (response.isOk) {
        profileForm.value.managerImg = response.url;
        ElMessage.success('头像上传成功');
      } else {
        ElMessage.error('头像上传失败');
      }
    };

    const handleSave = () => {
      if (formRef.value) {
        formRef.value.validate(async (valid: boolean) => {
          if (valid) {
            try {
              const response = await axios.post('/api/manager/updateProfile', profileForm.value, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              if (response.data.isOk) {
                ElMessage.success('管理员信息修改成功');
                location.reload(); // 刷新页面
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

    const toggleChangePassword = () => {
      showChangePassword.value = !showChangePassword.value;
      if (!showChangePassword.value) {
        profileForm.value.newPassword = '';
        profileForm.value.confirmPassword = '';
      }
    };

    onMounted(() => {
      loadManagerProfile();
    });

    return {
      profileForm,
      formRef,
      rules,
      handleAvatarSuccess,
      handleSave,
      showChangePassword,
      toggleChangePassword
    };
  }
});
</script>

<style scoped>
.el-container {
  padding: 20px;
}

.el-header {
  font-size: 24px;
  text-align: left;
  margin-bottom: 20px;
}

.el-main {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-button {
  margin-top: 20px;
  margin-right: 10px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>
