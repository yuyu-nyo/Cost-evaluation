<template>
  <el-dialog v-model="localVisible" title="新增项目" width="600px">
    <el-form :model="addProjectForm" :rules="rules" ref="formRef" label-width="120px">
      <!-- <el-form-item label="项目id" prop="projectId">
        <el-input v-model="addProjectForm.projectId" placeholder="请输入项目id"></el-input>
      </el-form-item> -->
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="addProjectForm.projectName" placeholder="请输入项目名称"></el-input>
      </el-form-item>
      <!-- <el-form-item label="租户ID" prop="projectTenantId">
        <el-input v-model="addProjectForm.projectTenantId" placeholder="请输入租户ID"></el-input>
      </el-form-item> -->
      
      <!-- <el-form-item label="UFP" prop="projectUFP">
        <el-input v-model="addProjectForm.projectUFP" placeholder="请输入项目UFP"></el-input>
      </el-form-item>
      <el-form-item label="DFP" prop="projectDFP">
        <el-input v-model="addProjectForm.projectDFP" placeholder="请输入项目DFP"></el-input>
      </el-form-item>
      <el-form-item label="ESDC" prop="projectESDC">
        <el-input v-model="addProjectForm.projectESDC" placeholder="请输入项目ESDC"></el-input>
      </el-form-item>
      <el-form-item label="历史版本数" prop="projectHistoryNum">
        <el-input v-model="addProjectForm.projectHistoryNum" placeholder="请输入历史版本数"></el-input>
      </el-form-item> -->
      <el-form-item label="开始日期" prop="projectStartDate">
        <el-date-picker v-model="addProjectForm.projectStartDate" format="YYYY/MM/DD" value-format="YYYY-MM-DD" type="date" placeholder="选择开始日期"></el-date-picker>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="handleAddProject">确定</el-button>
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
  name: 'AddProjectDialog',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:visible', 'projectAdded'],
  setup(props, { emit }) {
    const addProjectForm = ref({
      projectId: '',
      projectName: '',
      projectTenantId: '',
      projectRequirementFile: '',
      projectUFP: '',
      projectDFP: '',
      projectESDC: '',
      projectHistoryNum: 0,
      projectStartDate: '',
    });

    const formRef = ref<FormInstance | null>(null);
    const localVisible = ref(props.visible);

    watch(() => props.visible, (newVal) => {
      localVisible.value = newVal;
    });

    watch(localVisible, (newVal) => {
      emit('update:visible', newVal);
    });

    const rules = ref({
      projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
      // projectTenantId: [{ required: true, message: '请输入租户ID', trigger: 'blur' }],
      projectStartDate: [{ required: true, message: '请选择项目开始日期', trigger: 'change' }]
    });

    const handleAddProject = () => {
      const form = formRef.value;
      if (form) {
        form.validate((valid: boolean) => {
          if (valid) {
            console.log('表单验证通过');
            submitForm();
          } else {
            console.log('表单验证失败');
            ElMessage.error('表单验证失败，请检查');
          }
        });
      }
    };

    const submitForm = async () => {
      try {
        console.log('addProjectForm', addProjectForm.value);
        const response = await axios.post('/api/project/add', addProjectForm.value, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.data.isOK) {
          ElMessage.success('项目添加成功');
          emit('projectAdded');
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

    return {
      addProjectForm,
      rules,
      localVisible,
      formRef,
      handleAddProject,
      handleCancel,
      submitForm
    };
  }
});
</script>

<style scoped></style>