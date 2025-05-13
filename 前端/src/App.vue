<template>
  <div id="app">
    <template v-if="!isAuthRoute">
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'" class="custom-aside">
          <el-menu
            class="el-menu-vertical-demo"
            :collapse="isCollapse"
            @open="handleOpen"
            @close="handleClose"
            router
            :default-active="$route.path"
          >
            <el-menu-item
              v-for="item in menuItems"
              :key="item.index"
              :index="item.index"
            >
              <el-icon>
                <component :is="getIconComponent(item.icon)" />
              </el-icon>
              <template #title>{{ item.title }}</template>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-container>
          <el-header class="top-header">
            <div style="display: flex; align-items: center;">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">软件造价评估系统</el-breadcrumb-item>
                <el-breadcrumb-item v-for="(breadcrumb, index) in breadcrumbs" :key="index" :to="breadcrumb.to">
                  {{ breadcrumb.text }}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div style="display: flex; align-items: center;">
              <el-icon style="margin-right: 20px;" @click="toggleFullScreen"><FullScreen /></el-icon>
              <el-dropdown>
                <span class="el-dropdown-link">
                  <el-avatar :src="managerAvatar" @click="navigateToProfile" style="cursor: pointer;" />
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleLogout">登出系统</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-header>

          <el-main class="main-content">
            <router-view />
          </el-main>
        </el-container>
      </el-container>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  Document,
  FullScreen,
  HelpFilled,
  Menu as IconMenu,
  Search,
  Setting,
  User
} from '@element-plus/icons-vue';
import axios from 'axios';
import {
  ElAside,
  ElAvatar,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElContainer,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElHeader,
  ElIcon,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElMessage,
  ElMessageBox,
} from 'element-plus';
import screenfull from 'screenfull';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const isCollapse = ref(false);
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

// 切换全屏功能
const toggleFullScreen = () => {
  if (screenfull.isEnabled) {
    screenfull.toggle();
  } else {
    alert('您的浏览器不支持全屏功能');
  }
};

const handleLogout = () => {
  ElMessageBox.confirm('确认退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 清除本地存储中的 token
    localStorage.removeItem('jwtToken');
    
    // 发送退出请求
    axios.get('http://localhost:9001/project/logout').then(() => {
      // 登出后跳转到登录页面
      router.push('/auth/login');
    }).catch(error => {
      // 退出请求失败的处理
      ElMessage.error('退出失败，请稍后再试');
    });
  }).catch(() => {
    // 用户取消登出
    console.log('用户取消登出');
  });
};

// 路由和鉴权
const route = useRoute();
const router = useRouter();
const isAuthRoute = computed(() => route.path.startsWith('/auth'));

// 头像URL
const managerAvatar = ref('');

// 动态菜单和面包屑数据
const menuItems = ref([]);
const breadcrumbs = ref([]);

// 获取菜单数据
const fetchMenuItems = async () => {
  try {
    // await(1000);
    console.log("sfklakaslf");
    const token = localStorage.getItem('jwtToken');
    if (token) {
      // 请求菜单数据
      const menuResponse = await axios.get('http://localhost:9001/menu/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      menuItems.value = menuResponse.data;

      console.log(menuItems.value)

      // 请求用户头像
      const userResponse = await axios.get('http://localhost:9001/user/getUser', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      managerAvatar.value = userResponse.data.avatar;
    }
  } catch (error) {
    ElMessage.error('加载菜单或用户数据失败');
  }
};

// 生成面包屑
const generateBreadcrumbs = () => {
  breadcrumbs.value = route.matched.map((route) => ({
    text: route.meta.breadcrumb || '默认',
    to: route.path,
  }));
};

// 页面加载时初始化数据
onMounted(async () => {
  await fetchMenuItems();
  generateBreadcrumbs();
});

// 监听路由变化，动态生成面包屑
watch(
  () => route.matched,
  () => {
    fetchMenuItems();
    generateBreadcrumbs();
  },
  { immediate: true }
);

// 图标组件映射
const iconComponents = {
  IconMenu,
  User,
  Setting,
  Document,
  Search,
  HelpFilled,
};

// 根据名称获取图标组件
const getIconComponent = (iconName: string) => iconComponents[iconName] || IconMenu;


const activeMenu = ref(''); // 当前激活的菜单项
// 获取当前用户信息
const navigateToProfile = async () => {
  try {
    const userResponse = await axios.get('/api/user/getUser', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    });
    if (userResponse.data.isOk) {
      router.push('/profile');
    } else {
      router.push('/auth/login');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    router.push('/auth/login');
  }
};

// await fetchMenuItems();

</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.el-menu-demo {
  line-height: 60px;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 100vh;
  transition: width 0.3s;
  overflow: hidden;
}

.el-menu-vertical-demo {
  background-color: #1D3A5F;
  color: white;
}

.el-menu-item, .el-sub-menu__title {
  color: white;
  font-size: 14px;
  transition: all 0.3s;
}

.el-menu-item:hover, .el-sub-menu__title:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.2);
}

.el-menu-item.is-active, .el-sub-menu__title.is-active {
  color: #ffffff;
  background-color: #2980b9;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
}

.el-header .el-breadcrumb-item {
  display: flex;
  align-items: center;
}

.el-header .el-breadcrumb-item .el-icon {
  margin-right: 10px;
}

.faded {
  color: #bfbfbf;
}

.el-aside {
  position: relative;
  overflow: hidden;
  transition: width 0.3s;
}

.el-aside::after {
  content: '';
  position: absolute;
  top: 0;
  right: -1px;
  width: 1px;
  height: 100%;
  background-color: #ebeef5;
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.1);
}

.main-content {
  transition: margin-left 0.3s;
  margin-left: 0;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
}
</style>
