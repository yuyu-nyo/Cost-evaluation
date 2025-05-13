<template>
  <el-container>
    <el-header>修改用户信息</el-header>
    <el-main>
      <el-form :model="editUserForm" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editUserForm.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="userPhone">
          <el-input v-model="editUserForm.userPhone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="用户头像" prop="userImage">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="handleBeforeAvatarUpload"
          >
            <img
              v-if="imagePreview"
              :src="imagePreview"
              class="avatar"
              style="width: 100px; height: 100px; object-fit: cover;"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon">+</i>
          </el-upload>
          <div class="file-requirements">
            <span>
              请上传大小不超过 <span style="color: red;">5MB</span> 格式为
              <span style="color: red;">png/jpg/jpeg</span> 的文件
            </span>
          </div>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="editUserForm.newPassword"
            type="password"
            placeholder="请输入新密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="editUserForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
          ></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="handleSaveUser">保存修改</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'EditUserPage',
  setup() {
    const editUserForm = ref({
      userId: '',
      userName: '',
      userPhone: '',
      userImage: '',
      newPassword: '',
      confirmPassword: '',
    });

    const imagePreview = ref<string | null>(null); // 用于图片预览
    const selectedFile = ref<File | null>(null); // 存储选中的文件
    const uploadUrl = 'http://localhost:9001/user/upload'; // 上传接口

    // 验证规则
    const rules = ref({
      userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      userPhone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
      confirmPassword: [
        {
          validator: (rule: any, value: string, callback: any) => {
            if (value !== editUserForm.value.newPassword) {
              callback(new Error('两次输入的密码不一致'));
            } else {
              callback();
            }
          },
          trigger: 'blur',
        },
      ],
    });

    // 加载用户信息
    const loadUserInfo = async () => {
      const token = localStorage.getItem('jwtToken');
      try {
        const response = await axios.get('/api/user/getUser', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.isOk) {
          const userData = response.data.user;
          Object.assign(editUserForm.value, userData);
          console.log(userData);
          imagePreview.value = userData.userImage;

          editUserForm.value.newPassword = userData.userPwd || '';
          editUserForm.value.confirmPassword = userData.userPwd || '';

        } else {
          ElMessage.error('加载用户信息失败');
        }
      } catch (error) {
        ElMessage.error('加载用户信息失败');
      }
    };

    // 图片预览和选择
    const handleBeforeAvatarUpload = (file: File) => {
      const isImage = file.type.startsWith('image/');
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isImage) {
        ElMessage.error('请上传图片文件');
        return false;
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB');
        return false;
      }

      selectedFile.value = file; // 存储选择的文件
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target?.result as string; // 显示 Base64 预览
      };
      reader.readAsDataURL(file);

      return false; // 阻止默认上传行为
    };

    // 上传头像
    const uploadAvatar = async (): Promise<string | null> => {
      if (!selectedFile.value) {
        return null;
      }

      const formData = new FormData();
      formData.append('file', selectedFile.value);

      try {
        const response = await axios.post(uploadUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          const cleanedUrl = response.data.url.split('?')[0]; // 清理 URL
          ElMessage.success('头像上传成功');
          return cleanedUrl;
        } else {
          ElMessage.error(response.data.message || '头像上传失败');
        }
      } catch (error) {
        ElMessage.error('头像上传失败');
      }
      return null;
    };

    // 保存用户信息
    const handleSaveUser = async () => {
      const { userId, userName, userPhone, newPassword, confirmPassword } = editUserForm.value;

      if (!userId) {
        ElMessage.error('用户ID丢失');
        return;
      }

      if (newPassword && newPassword !== confirmPassword) {
        ElMessage.error('两次输入的密码不一致');
        return;
      }

      let avatarUrl: string | null = editUserForm.value.userImage;

      if (selectedFile.value) {
        avatarUrl = await uploadAvatar();
        if (!avatarUrl) {
          return; // 如果头像上传失败，则终止保存操作
        }
      }

      try {
        const response = await axios.put(`http://localhost:9001/user/update/${userId}`, {
          userName,
          userPhone,
          userImage: avatarUrl,
          newPassword,
        });

        if (response.data.isOk) {
          ElMessage.success('用户信息修改成功');
        } else {
          ElMessage.error(response.data.msg || '用户信息修改失败');
        }
      } catch (error) {
        ElMessage.error('修改用户信息失败');
      }
    };

    // 重置表单
    const resetForm = () => {
      loadUserInfo();
      selectedFile.value = null; // 清空选择的文件
    };

    onMounted(() => {
      loadUserInfo();
    });

    return {
      editUserForm,
      imagePreview,
      uploadUrl,
      rules,
      handleBeforeAvatarUpload,
      uploadAvatar,
      handleSaveUser,
      resetForm,
    };
  },
});
</script>
