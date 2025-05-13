<template>
  <div>
    <QuillEditor ref="myQuillEditor"
      theme="snow"
      v-model:content="content"
      :options="editorOption"
      contentType="html"
      @update:content="setValue"
    />
  </div>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import axios from 'axios';
import { onMounted, reactive, ref, toRaw } from 'vue';

const props = defineProps(['value'])
const emit = defineEmits(['updateValue'])
const content = ref('')
const myQuillEditor = ref()

const setValue = () => {
  const text = toRaw(myQuillEditor.value).getHTML()
  emit('updateValue', text)
}

const imageHandler = () => {
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('accept', 'image/*')
  input.click()

  input.onchange = async () => {
    const file = input.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await axios.post('http://localhost:9001/tenant/uploadImage', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        if (response.data.isOk) {
          const url = response.data.url
          const quill = toRaw(myQuillEditor.value).getQuill()
          const range = quill.getSelection()
          quill.insertEmbed(range.index, 'image', url)
        } else {
          console.error('上传失败:', response.data.msg)
        }
      } catch (error) {
        console.error('上传失败:', error)
      }
    }
  }
}

const editorOption = reactive({
  modules: {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'header': 1 }, { 'header': 2 }],
        ['image'],
        [{ 'direction': 'rtl' }],
        [{ 'color': [] }, { 'background': [] }]
      ],
      handlers: {
        image: imageHandler
      }
    }
  },
  placeholder: '请输入内容...'
})

onMounted(() => {
  const quill = toRaw(myQuillEditor.value).getQuill()
  toRaw(myQuillEditor.value).setHTML(props.value)
})
</script>

<style scoped>
:deep(.ql-editor) {
  min-height: 180px;
}
:deep(.ql-formats) {
  height: 21px;
  line-height: 21px;
}
</style>
