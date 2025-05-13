<template>
    <div style="border: 1px solid #ccc">
      <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" />
      <Editor style="height: 300px; overflow-y: hidden;" v-model="valueHtml" :defaultConfig="editorConfig" @onCreated="handleCreated" @update:content="setValue()"/>
    </div>
  </template>
  
  <script setup lang="ts">
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
  
  // 编辑器实例，必须用 shallowRef
  const editorRef = shallowRef()
  
  const toolbarConfig = {}
  const editorConfig = {
    placeholder: '请输入内容',
    MENU_CONF: {
      uploadImage: {
        server: "http://localhost:9001/conference/saveTextImg",
      }
    }
  }
  
  // 组件销毁时，也及时销毁编辑器
  onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
  })
  
  const handleCreated = (editor: any) => {
    editorRef.value = editor // 记录 editor 实例，重要！
  }
  
  // 将富文本交给对话框组件
  const props = defineProps({
    modelValue: String // 这里的 modelValue 就是父组件传入的 v-model 绑定的值
  });
  const emit = defineEmits(['update:modelValue']);
  // 内容 HTML
  const valueHtml = ref(props.modelValue);
  watch(() => props.modelValue, (newValue) => {
    valueHtml.value = newValue; // 更新 valueHtml 的值
  });
  const setValue = () => {
    return (html: string) => {
      valueHtml.value = html;
    };
  };
  onMounted(() => {
    valueHtml.value = props.modelValue;
  });
  watch(valueHtml, (newValue) => {
    emit('update:modelValue', newValue);
  });
  
  </script>
  