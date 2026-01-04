import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import PostDetail from '../views/PostDetail.vue'
import CreatePost from '../views/CreatePost.vue'
import ProfileView from '../views/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',      // 根路径改为进入主页
      name: 'home',
      component: HomeView
    },
    {
      path: '/login', // 登录路径改为 /login
      name: 'login',
      component: LoginView
    },
    {
      path: '/post/:id',
      name: 'post',
      component: PostDetail
    },
    {
      path: '/create',
      name: 'create',
      component: CreatePost
    },

    // router/index.js
    {
      path: '/edit/:id',
      name: 'edit',
      component: () => import('../views/EditPost.vue') // 懒加载
    },
    
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    }

  ]
})

// 路由守卫：保护“发布页”
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('userId');
  
  // 只有去发帖，编辑页面才强制检查登录
  if (['create', 'edit', 'profile'].includes(to.name) && !isAuthenticated) {
    alert("Please login first to share your journey!");
    next({ name: 'login' });
  } else {
    next(); // 访问主页和详情页直接放行
  }
})

export default router