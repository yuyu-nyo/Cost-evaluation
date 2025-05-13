<template>
  <div class="form-container">
    <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="100px" class="transparent-form">
      <el-radio-group v-model="loginMethod" size="small">
        <el-radio-button label="password">账号密码登录</el-radio-button>
        <el-radio-button label="phone">手机号登录</el-radio-button>
      </el-radio-group>

      <!-- 账号密码登录 -->
      <el-form-item v-if="loginMethod === 'password'" label="账号" prop="account">
        <el-input v-model="loginForm.account" placeholder="请输入账号"></el-input>
      </el-form-item>
      <el-form-item v-if="loginMethod === 'password'" label="密码" prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>

      <!-- 手机号登录 -->
      <el-form-item v-if="loginMethod === 'phone'" label="手机号" prop="phone">
        <el-input v-model="loginForm.phone" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item v-if="loginMethod === 'phone'" label="验证码">
        <el-row>
          <el-col :span="16">
            <el-input v-model="loginForm.smsCode" placeholder="请输入验证码"></el-input>
          </el-col>
          <el-col :span="8">
            <el-button :disabled="countdown > 0" @click="sendSmsCode">
              {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { defineComponent, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';



export default defineComponent({
  name: 'Login',
  setup() {
    const loginFormRef = ref(null);
    const loginForm = reactive({
      account: '',
      password: '',
      phone: '',
      smsCode: ''
    });
    const loginMethod = ref('password');
    const countdown = ref(0);
    let timer: number | undefined;

    const router = useRouter(); // 获取router实例

    const rules = reactive({
      account: [
        { required: true, message: '请输入账号', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号必须为11位数字', trigger: 'blur' }
      ]
    });

    const sendSmsCode = async () => {
      if (!loginForm.phone) {
        ElMessage.error('请输入手机号');
        return;
      }
      try {
        const response = await axios.post('http://localhost:9001/user/sendSmsCode', { phone: loginForm.phone }, { withCredentials: true });
        ElMessage.success('验证码已发送');
        countdown.value = 60;
        timer = window.setInterval(() => {
          if (countdown.value > 0) {
            countdown.value--;
          } else {
            window.clearInterval(timer);
          }
        }, 1000);
      } catch (error) {
        ElMessage.error('发送验证码失败');
      }
    };

    const onSubmit = async () => {
      loginFormRef.value.validate(async (valid: boolean) => {
        if (!valid) {
          ElMessage.error('请检查输入内容');
          return;
        }

        if (loginMethod.value === 'password') {
          try {
            await handleUserLogin();
          } catch (error) {
            ElMessage.error('登录失败');
          }
        } else if (loginMethod.value === 'phone') {
          try {
            await handleUserSmsLogin();
          } catch (error) {
            ElMessage.error('登录失败');
          }
        }
      });
    };

    const handleUserLogin = async () => {
      try {
        const response = await axios.post('http://localhost:9001/user/login', {
          userId: loginForm.account,  // 账号作为 userId
          userPwd: loginForm.password  // 密码
        }, { withCredentials: true });

        if (response.data.isOk) {
          ElMessage.success('用户登录成功');
          console.log(response.data.token);
          localStorage.setItem('jwtToken', response.data.token); // 将JWT存储在localStorage

          // 直接获取菜单数据
          const token = localStorage.getItem('jwtToken');
          if (token) {
            const menuResponse = await axios.get('http://localhost:9001/menu/list', {
              headers: {
                Authorization: `Bearer ${token}`, // 在请求头中加入 Authorization
              },
              withCredentials: true, // 如果你需要携带跨域cookie，可以保留这个选项
            });
            console.log('菜单数据manman:', menuResponse.data);

            // 假设获取菜单成功，获取首个菜单项的 index 并跳转
            const firstMenuIndex = menuResponse.data[0]?.index;
            if (firstMenuIndex) {
              router.push(`${firstMenuIndex}`); // 根据菜单项的 index 跳转到对应的路由
            } else {
              ElMessage.error('菜单数据格式错误');
            }
          }
        } else {
          ElMessage.error(response.data.message);
        }
      } catch (error) {
        ElMessage.error('登录失败');
      }
    };

    // 短信登录
    const handleUserSmsLogin = async () => {
      try {
        const response = await axios.post('http://localhost:9001/user/smsLogin', {
          phone: loginForm.phone,
          smsCode: loginForm.smsCode
        });

        if (response.data.isOk) {
          ElMessage.success('用户登录成功');
          localStorage.setItem('jwtToken', response.data.token); // 将JWT存储在localStorage






          router.push('/home'); // 登录成功后跳转到主页
        } else {
          ElMessage.error(response.data.msg);
        }
      } catch (error) {
        ElMessage.error('登录失败');
      }
    };

    return {
      loginFormRef,
      loginForm,
      loginMethod,
      countdown,
      sendSmsCode,
      onSubmit
    };
  }
});
</script>
