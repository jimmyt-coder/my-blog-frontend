<script setup>
        import { ref, onMounted, computed } from 'vue'
        import { useRouter } from 'vue-router'
        import axios from 'axios'
        import { Plus, Picture } from '@element-plus/icons-vue' // 合并图标导入
        import { Search } from '@element-plus/icons-vue'

        // --- 1. 基础配置与状态 ---
        const router = useRouter()
        const posts = ref([])
        const loading = ref(false)
        const currentUserId = localStorage.getItem('userId')

        // --- 2. 用户状态计算属性 ---
        const currentUser = computed(() => localStorage.getItem('username') || 'Guest')
        const isLoggedIn = computed(() => localStorage.getItem('userId') !== null)

        // --- 3. 数据获取逻辑 ---
        const fetchPosts = async () => {
        loading.value = true // 开启加载动画
        try {
            const res = await axios.get('/api/posts') // 已经在 main.js 配置过 baseURL，此处可简写
            posts.value = res.data
            
            // 调试：检查用户 ID 匹配情况
            console.log("当前用户ID:", currentUserId)
        } catch (error) {
            console.error("获取帖子失败:", error)
        } finally {
            loading.value = false // 关闭加载
        }
        }

        // --- 4. 图片处理工具函数 ---
        // 处理上传图片的 URL 拼接
        const formatImageUrl = (url) => {
        if (!url) return null
        if (url.startsWith('http')) return url
        // 获取环境变量，没有则用本地保底
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'
        return `${baseUrl}${url}`
        }

        // 当博文无封面时，返回 assets 目录下的备用随机图
        const getAssetImage = (index) => {
        const imageNumber = String((index % 20) + 1).padStart(3, '0')
        return new URL(`../assets/${imageNumber}.jpg`, import.meta.url).href
        }

        // --- 5. 交互与跳转逻辑 ---
        const handleNewPost = () => router.push('/create')
        const goToDetail = (id) => router.push(`/post/${id}`)
        const handleLogout = () => {
        localStorage.clear()
        router.push('/login')
        }
        
        // --- 6. 显示发帖时间 ---
        const formatDateTime = (dateStr) => {
          if (!dateStr) return 'Recently';
          const date = new Date(dateStr);
          return date.toLocaleString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        };
        
        //--- 7. 搜索功能 ---
        const searchQuery = ref('') //
        const handleSearch = async () => {
            loading.value = true; // 开启加载遮罩
            try {
              const res = await axios.get('/api/posts', {
                params: { q: searchQuery.value }
              });
              posts.value = res.data;
            } catch (error) {
              console.error('搜索出错:', error);
              // 可选：添加 Element Plus 的消息提示
              // ElMessage.error('搜索失败，请重试')
            } finally {
              loading.value = false; // 关闭加载遮罩
            }
          }

        // --- 8. 生命周期钩子 ---
        onMounted(fetchPosts)
</script>

<template>
  <div class="home-wrapper" v-loading="loading"> 
    <nav class="nav-bar">
          <div class="logo">TRAVEL BLOG</div>

          <div class="search-wrapper">
              <el-input
                v-model="searchQuery"
                placeholder="search posts..."
                clearable
                @keyup.enter="handleSearch"
                @clear="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
          </div>

          <div class="nav-right">
            <template v-if="isLoggedIn">
                <el-button type="primary" :icon="Plus" @click="handleNewPost" class="action-btn">
                    New Post
                </el-button>

                <el-button 
                    plain 
                    round 
                    @click="router.push('/profile')"
                    class="nav-profile-btn"
                >
                    <span class="truncate-username">{{ currentUser }}</span>
                </el-button>
                
                <el-button type="danger" plain @click="handleLogout" size="small">
                    Logout
                </el-button>
            </template>
            
            <template v-else>
              <span class="user-name">Guest Mode</span>
              <el-button type="primary" @click="$router.push('/login')">Login / Register</el-button>
            </template>
          </div>
    </nav>

    <div class="hero-section">
      <video autoplay muted loop playsinline class="bg-video">
        <source src="../assets/travel.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay">
        <h1>EXPLORE THE WORLD</h1>
        <p>Real stories from real travelers</p>
      </div>
    </div>   

    <div class="blog-container">
      <h2 class="section-title">Latest Journeys</h2>
      <el-empty v-if="posts.length === 0 && !loading" description="No posts yet." />
      
      <div class="blog-grid" v-else>
        <div v-for="(post, index) in posts" :key="post.id" class="blog-card" @click="goToDetail(post.id)">
          <div class="card-image-wrapper">
            <el-image 
                :src="formatImageUrl(post.image_url) || getAssetImage(index)" 
                lazy 
                fit="cover"
                style="width: 100%; height: 200px;"
                >
                <template #placeholder>
                    <div class="image-slot" style="background: #f5f7fa; display: flex; align-items: center; justify-content: center; height: 100%;">
                    Loading Image...
                    </div>
                </template>
                
                <template #error>
                    <div class="image-slot" style="background: #f5f7fa; display: flex; align-items: center; justify-content: center; height: 100%;">
                    <el-icon><Picture /></el-icon>
                    </div>
                </template>
            </el-image>
          </div>
          <div class="card-content">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="author-tag">By {{ post.author }}</span>
                <span class="publish-date" style="font-size: 12px; color: #999;">
                  {{ formatDateTime(post.created_at) }}
                </span>
              </div>
              <h3>{{ post.title }}</h3>
              <p>{{ post.content.substring(0, 100) }}...</p>
              <span class="read-more">Read More →</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>

/* --- 1. 基础布局容器 --- */
.home-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
}

/* --- 2. 导航栏 (顶部固定) --- */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 5%;
  background: white;
  position: relative;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.logo {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #333;
}

.search-wrapper {
  flex: 0 1 400px; /* 搜索框宽度，最大 400px */
  margin: 0 20px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-profile-btn {
    margin: 0 15px;
    padding: 0 20px; /* 增加左右内边距，让胶囊形状更好看 */
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center; /* 纯文字居中 */
    min-width: 100px;        /* 设定最小宽度，保证视觉统一 */
    max-width: 180px;    
    background-color: #1a91e0;
}

.truncate-username {
    display: block;
    width: 100%;
    text-align: center;
    font-size: 16px;
        
    color: #fffffe; 
    font-weight: 200;
    
    /* 溢出省略号 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 悬停效果 */
.nav-profile-btn:hover {
    background-color: #13e113; /* 悬停时背景变红 */    
}

.nav-profile-btn:hover .truncate-username {
    color: #090909; /* 悬停时文字变白 */
}

/* --- 3. Hero 视频展示区 --- */
.hero-section {
  position: relative;
  width: 100%;
  height: 100vh; /* 撑满全屏 */
  overflow: hidden;
  z-index: 1;
}

.bg-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 视频按比例撑满且不变形 */
  z-index: -1;
}

.hero-overlay {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  background: rgba(0, 0, 0, 0.2); /* 给视频加一层淡淡的遮罩让文字更清晰 */
  z-index: 2;
}

/* --- 4. 博客列表容器 --- */
.blog-container {
  position: relative;
  background: white;
  padding: 80px 5%;
  z-index: 2;
}

.section-title {
  margin-bottom: 40px;
  font-size: 28px;
  text-align: center;
  color: #333;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 默认 4 列 */
  gap: 30px;
}

/* --- 5. 博客卡片详情 --- */
.blog-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.card-image-wrapper {
  height: 200px;
  overflow: hidden;
}

.card-content {
  padding: 20px;
}

.author-tag {
  color: #409eff;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.read-more {
  display: inline-block;
  margin-top: 15px;
  color: #409eff;
  font-weight: bold;
}

/* --- 6. 响应式布局 (适配手机/平板) --- */
@media (max-width: 1200px) {
  .blog-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 900px) {
  .blog-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-section { height: 60vh; } /* 手机端减小视频高度 */
}

@media (max-width: 600px) {
  .blog-grid { grid-template-columns: 1fr; }
}
</style>