<template>
  <el-dialog v-model="localVisible" title="修改项目信息" width="600px">
    <el-form :model="editProjectForm" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="editProjectForm.projectName" placeholder="请输入项目名称"></el-input>
      </el-form-item>
      <el-form-item label="租户ID" prop="projectTenantId">
        <!-- <el-input v-model="editProjectForm.projectTenantId" placeholder="请输入租户ID"></el-input> -->
        <el-input v-model="editProjectForm.projectTenantId" disabled ></el-input>
      </el-form-item>
 
      <el-form-item label="UFP" prop="projectUFP">
        <el-input v-model="editProjectForm.projectUFP" placeholder="请输入项目UFP"></el-input>
      </el-form-item>
      <el-form-item label="DFP" prop="projectDFP">
        <el-input v-model="editProjectForm.projectDFP" placeholder="请输入项目DFP"></el-input>
      </el-form-item>
      <el-form-item label="ESDC" prop="projectESDC">
        <el-input v-model="editProjectForm.projectESDC" placeholder="请输入项目ESDC"></el-input>
      </el-form-item>
      <el-form-item label="历史版本数" prop="projectHistoryNum">
        <el-input v-model="editProjectForm.projectHistoryNum" placeholder="请输入历史版本数"></el-input>
      </el-form-item>
      <el-form-item label="开始日期" prop="projectStartDate">
        <el-date-picker v-model="editProjectForm.projectStartDate" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
          type="date" placeholder="选择开始日期"></el-date-picker>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="handleEditProject">保存</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import axios from 'axios';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'EditProjectDialog',
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
  emits: ['update:visible', 'projectEdited'],
  setup(props, { emit }) {
    const editProjectForm = ref({ ...props.projectData });
    const localVisible = ref(props.visible);
    const formRef = ref<FormInstance | null>(null);

    const updateForm = () => {
      editProjectForm.value = { ...props.projectData };
    }

    watch(() => props.visible, (newVal) => {
      localVisible.value = newVal;
      if (newVal) {
        updateForm();
      }
    });

    watch(() => props.projectData, updateForm);

    watch(localVisible, (newVal) => {
      emit('update:visible', newVal);
    });

    const rules = {
      projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
      projectTenantId: [{ required: true, message: '请输入租户ID', trigger: 'blur' }],
      projectStartDate: [{ required: true, message: '请选择项目开始日期', trigger: 'change' }],
    };

    const handleEditProject = async () => {
      const form = formRef.value;
      console.log(editProjectForm.value);
      console.log(form);
      if (form) {
        form.validate(async (valid: boolean) => {
          if (valid) {
            try {
              const response = await axios.post('/api/project/update', editProjectForm.value, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              if (response.data.isOK) {
                ElMessage.success('项目信息修改成功');
                emit('projectEdited');
                localVisible.value = false;
              } else {
                ElMessage.error(`修改失败: ${response.data.msg}`);
              }
            } catch (error: any) {
              console.error('Error:', error);
              ElMessage.error(`修改失败: ${error.message}`);
            }
          } else {
            console.log('表单验证失败');
          }
        }); 
      }
    };

    const handleCancel = () => {
      localVisible.value = false;
    };

    return {
      localVisible,
      editProjectForm,
      rules,
      formRef,
      handleEditProject,
      updateForm,
      handleCancel,
    };
  }
});
</script>

<style scoped></style>