<template>
  <el-dialog v-model="localVisible" title="添加租户管理" width="600px" top="10vh">
    <el-form :model="addTenantForm" ref="formRef" label-width="120px">
      <el-form-item label="租户名称" prop="tenantName">
        <el-input v-model="addTenantForm.tenantName" placeholder="请输入租户名称"></el-input>
      </el-form-item>

      <el-form-item label="租户图标" prop="tenantImage">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :on-success="handleAvatarSuccess"
          :on-error="handleUploadError"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" style="width: 100px; height: 100px; object-fit: cover;" />
          <i v-else class="el-icon-plus avatar-uploader-icon">+</i>
        </el-upload>
        <div class="file-requirements">
          <span>请上传 大小不超过 <span style="color: red;">5MB</span> 格式为 <span style="color: red;">png/jpg/jpeg</span> 的文件</span>
        </div>
      </el-form-item>

      <!-- 新增用户信息表单项 -->
      <el-form-item label="管理员名称" prop="userName">
        <el-input v-model="addUserForm.userName" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="管理员密码" prop="userPwd">
        <el-input v-model="addUserForm.userPwd" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item label="管理员手机号" prop="userPhone">
        <el-input v-model="addUserForm.userPhone" placeholder="请输入手机号"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="handleAddTenant">确定</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'AddTenantDialog',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    tenant: {
      type: Object,
      default: () => ({
        tenantName: '',
        tenantIcon: ''
      })
    }
  },
  emits: ['update:visible', 'tenantAdded'],
  setup(props, { emit }) {
    const localVisible = ref(props.visible);

    const resetForm = () => {
  addTenantForm.value.tenantName = '';
  addTenantForm.value.tenantImage = '';
  addUserForm.value.userName = '';
  addUserForm.value.userPwd = '';
  addUserForm.value.userPhone = '';
  imageUrl.value = null;
};

    const imageUrl = ref<string | null>(props.tenant?.tenantIcon || null); // 初始化租户图标 URL
    const uploadUrl = 'http://localhost:9001/tenant/upload'; // 图片上传的后端接口
    const addTenantForm = ref({
      tenantName: props.tenant?.tenantName || '', // 初始化租户名称
      tenantImage: '' // 租户图标
    });

    // 新增用户信息表单
    const addUserForm = ref({
      userName: '',
      userPwd: '',
      userPhone: ''
    });

    // 监听 visible 属性来更新 localVisible
    watch(() => props.visible, (newVal) => {
      localVisible.value = newVal;
      // 弹窗打开时自动加载现有的图片 URL（如果有）
      if (newVal && props.tenant?.tenantIcon) {
        imageUrl.value = props.tenant.tenantIcon;
      }
    });

    watch(localVisible, (newVal) => {
      emit('update:visible', newVal);
    });

    // 上传图片之前的处理（可以进行文件类型、大小的校验等）
    const beforeAvatarUpload = (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        ElMessage.error('请上传图片文件');
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB');
      }
      return isImage && isLt5M; // 返回 false 会阻止上传
    };

    const handleAvatarSuccess = (response: any) => {
      if (response.success) {
        let url = response.url;
        imageUrl.value = cleanImageUrl(url); // 清理图片 URL
      } else {
        ElMessage.error(response.message || '上传失败');
      }
    };

    const handleUploadError = (error: any) => {
      ElMessage.error('文件上传失败');
    };

    // 清理图片 URL
    function cleanImageUrl(url: string): string {
      const queryStartIndex = url.indexOf("?");
      if (queryStartIndex !== -1) {
        url = url.substring(0, queryStartIndex);
      }

      const index = url.indexOf(".com/");
      if (index !== -1) {
        const suffix = url.substring(index + 5);
        if (!suffix.startsWith("jpg/")) {
          url = url.substring(0, index + 5) + "jpg/" + suffix;
        }
      }

      return url;
    }

    const handleAddTenant = async () => {
      const tenantName = addTenantForm.value.tenantName;
      const tenantIcon = imageUrl.value;
      const userName = addUserForm.value.userName;
      const userPwd = addUserForm.value.userPwd;
      const userPhone = addUserForm.value.userPhone;

      try {
        // 先提交租户数据
        console.log('正在请求添加租户，租户名称:', tenantName, '租户图标:', tenantIcon);
        const tenantResponse = await axios.post(`http://localhost:9001/tenant/add?tenantName=${tenantName}&imageUrl=${tenantIcon}`);
        console.log('租户添加响应:', tenantResponse.data);

        if (tenantResponse.data.success) {
          const tenant = tenantResponse.data.tenant;
          console.log('租户添加成功，租户信息:', tenant);

          // 使用租户信息和用户信息进行添加
          console.log('正在请求添加用户，用户名:', userName, '手机号:', userPhone);
          const userResponse = await axios.post('http://localhost:9001/tenant/adduser', null, {
            params: {
              userName,
              userPwd,
              userPhone,
              tenantName: tenant.tenantName // 使用租户的 tenantName
            }
          });

          console.log('用户添加响应:', userResponse.data);

          if (userResponse.data.success) {
            ElMessage.success('用户添加成功');
            emit('tenantAdded', userResponse.data.user); // 触发父组件的事件
            
        // 清空表单数据和图像 URL
        resetForm();
            localVisible.value = false;
          } else {
            ElMessage.error(userResponse.data.message || '添加用户失败');
          }
        } else {
          ElMessage.error(tenantResponse.data.message || '添加租户失败');
        }
      } catch (error) {
        console.error('操作失败:', error);
        ElMessage.error('添加租户和用户失败');
      }
    };

    // 处理取消事件，关闭弹窗
    const handleCancel = () => {
      localVisible.value = false;
    };

    return {
      localVisible,
      addTenantForm,
      addUserForm,
      imageUrl,
      uploadUrl,
      beforeAvatarUpload,
      handleAvatarSuccess,
      handleUploadError,
      handleAddTenant,
      handleCancel
    };
  }
});
</script>
