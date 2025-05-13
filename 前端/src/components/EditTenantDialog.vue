<template>
  <el-dialog v-model="localVisible" :title="dialogTitle" width="600px" top="10vh">
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
    </el-form>
    <template #footer>
      <el-button type="primary" @click="handleSaveTenant">{{ buttonText }}</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'EditTenantDialog',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    tenant: {
      type: Object,
      default: () => ({
        tenantName: '',
        tenantId: '',  // 添加 tenantId 默认值
        tenantImage: ''
      })
    }
  },
  emits: ['update:visible', 'tenantUpdated'],
  setup(props, { emit }) {
    const localVisible = ref(props.visible);
    const imageUrl = ref<string | null>(props.tenant?.tenantImage || null);
    const uploadUrl = 'http://localhost:9001/tenant/upload'; 
    const addTenantForm = ref({
      tenantName: props.tenant?.tenantName || '',
      tenantId: props.tenant?.tenantId || '',  // 添加 tenantId 属性
      tenantImage: props.tenant?.tenantImage || ''
    });

    const dialogTitle = ref(props.tenant?.tenantName ? '修改租户信息' : '添加租户');
    const buttonText = ref(props.tenant?.tenantName ? '保存修改' : '确定');

    // 监听 visible 属性来更新 localVisible
    watch(() => props.visible, (newVal) => {
      localVisible.value = newVal;
      if (newVal && props.tenant?.tenantImage) {
        imageUrl.value = props.tenant.tenantImage;
      }
    });



watch(localVisible, (newVal) => {
  emit('update:visible', newVal);
  if (!newVal) {
    addTenantForm.value = { tenantName: '', tenantId: '', tenantImage: '' }; // 清空表单
    imageUrl.value = null; // 清空图片预览
  }
});


    // 在 EditTenantDialog 组件的 setup 中，打印 tenant 数据
    watch(() => props.tenant, (newTenant) => {
      console.log('Received tenant in dialog:', newTenant); // 确保 tenantId 在此处已经更新
      addTenantForm.value = {
        tenantName: newTenant?.tenantName || '',
        tenantId: newTenant?.tenantId || '',  // 保持 tenantId 更新
        tenantImage: newTenant?.tenantImage || ''
      };
    });

    // 上传图片之前的处理（检查文件类型和大小）
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

    // 处理上传成功后的图片 URL
    const handleAvatarSuccess = (response: any) => {
      if (response.success) {
        let url = response.url;
        imageUrl.value = cleanImageUrl(url);  // 清理图片 URL
      } else {
        ElMessage.error(response.message || '上传失败');
      }
    };

    // 处理上传失败的回调
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

    const handleSaveTenant = async () => {
  const tenantId = props.tenant?.tenantId; // 获取 tenantId
  if (!tenantId) {
    ElMessage.error('租户ID丢失');
    return;
  }

  const tenantName = addTenantForm.value.tenantName;
  const url = imageUrl.value;

  try {
  let response;

  console.log("请求的数据:", { tenantName, imageUrl: url });

  if (tenantId) { // 如果 tenantId 存在，则进行更新操作
    console.log(`开始发送 PUT 请求，URL: http://localhost:9001/tenant/update/${tenantId}`);
    response = await axios.put(`http://localhost:9001/tenant/update/${tenantId}`, {
      tenantName,
      tenantImage: url  // 确保字段名与后端一致
    });
  } else { // 否则进行添加操作
    console.log("开始发送 POST 请求，URL: http://localhost:9001/tenant/add");
    response = await axios.post('http://localhost:9001/tenant/add', {
      tenantName,
      tenantImage: url
    });
  }

  console.log("服务器响应:", response.data);

  if (response.data.isOk) {
    ElMessage.success('租户信息保存成功');
   
    emit('tenantUpdated', response.data.tenant); // 通知父组件更新
    localVisible.value = false; // 关闭对话框
  } else {
    ElMessage.error(response.data.msg || '保存失败');
  }
} catch (error) {
  console.error('保存租户时发生错误:', error);
  ElMessage.error('保存租户失败');
}

};

    

    // 处理取消事件，关闭弹窗
    const handleCancel = () => {
      localVisible.value = false;
    };

    return {
      localVisible,
      addTenantForm,
      imageUrl,
      uploadUrl,
      dialogTitle,
      buttonText,
      beforeAvatarUpload,
      handleAvatarSuccess,
      handleUploadError,
      handleSaveTenant,
      handleCancel
    };
  }
});
</script>
