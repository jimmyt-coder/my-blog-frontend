<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ArrowLeft, Picture, UserFilled, Collection } from '@element-plus/icons-vue'

const router = useRouter()
const posts = ref([])
const loading = ref(false)

const userId = localStorage.getItem('userId')
const username = localStorage.getItem('username')

const fetchMyPosts = async () => {
  if (!userId) return router.push('/login')
  loading.value = true
  try {
    const res = await axios.get(`/api/users/${userId}/posts`)
    posts.value = res.data
  } catch (error) {
    console.error("Failed to fetch posts:", error)
  } finally {
    loading.value = false
  }
}

const formatImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'
  return `${baseUrl}${url}`
}

const getAssetImage = (index) => {
  const imageNumber = String((index % 20) + 1).padStart(3, '0')
  return new URL(`../assets/${imageNumber}.jpg`, import.meta.url).href
}

const goToDetail = (id) => router.push(`/post/${id}`)

onMounted(fetchMyPosts)
</script>

<template>
  <div class="profile-wrapper" v-loading="loading">

    <div class="back-nav">
        <el-button @click="router.push('/')" :icon="ArrowLeft" link class="back-btn">
            Back to Home
        </el-button>
    </div>

    <div class="user-hero">
      <div class="hero-content">
        <el-avatar :size="110" :icon="UserFilled" class="user-avatar" />
        <h1 class="username">{{ username }}</h1>
        <div class="user-stats">
          <span class="stat-item">
            <strong>{{ posts.length }}</strong> Posts
          </span>
        </div>
      </div>
    </div>    

    <div class="content-container">
      <div class="section-header">
        <h2 class="section-title">My Journeys</h2>
        <span class="post-count">Total {{ posts.length }} items</span>
      </div>
      
      <el-divider />

      <el-empty 
        v-if="posts.length === 0 && !loading" 
        description="No stories shared yet. Start your first journey!" 
      />

      <div class="blog-grid" v-else>
        <div v-for="(post, index) in posts" :key="post.id" class="blog-card" @click="goToDetail(post.id)">
          <div class="card-image-outer">
            <el-image 
              :src="formatImageUrl(post.image_url) || getAssetImage(index)" 
              fit="cover"
              class="card-image"
              lazy
            />
          </div>
          <div class="card-content">
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ post.content.substring(0, 80) }}...</p>
            <div class="card-footer">
              <span class="date">{{ new Date(post.created_at).toLocaleDateString('en-GB') }}</span>
              <span class="status-tag">Published</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 1. 全局页面容器留白 */
.profile-wrapper {
  min-height: 100vh;
  background-color: #f9fafb;
  padding-bottom: 60px; /* 底部留白 */
}

/* 2. 头部美化 */
.user-hero {
  /* 调整 padding：上下从 80px 减小到 40px */
  padding: 40px 20px; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.user-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 15px;
}

.username {
  font-size: 2.2rem;
  margin: 10px 0;
  letter-spacing: 1px;
}

.back-nav {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 40px;
  position: absolute; /* 让它浮在紫色背景上方 */
  z-index: 10;
}

.back-btn {
  color: white !important; /* 在紫色背景上显示白色文字 */
  font-size: 1.1rem;
}

.back-btn:hover {
  opacity: 0.8;
}

/* 去掉丑陋的 Tag，改用简洁的文字统计 */
.stat-item {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
}
.stat-item strong {
  font-size: 1.4rem;
  font-weight: 600;
}

/* 3. 内容区布局 */
.content-container {
  max-width: 86%;
  /* 修改 margin：将 -40px 改为 20px，让它与 Header 保持距离 */
  margin: 20px auto 0; 
  padding: 40px;
  background: white;
  border-radius: 12px;
  /* 增加边框或阴影让层次更清晰 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); 
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.section-title {
  font-size: 1.6rem;
  color: #2d3748;
}

.post-count {
  color: #a0aec0;
  font-size: 0.9rem;
}

/* 4. 网格与卡片优化 */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px; /* 网格间距 */
  margin-top: 20px;
}

.blog-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #edf2f7;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* 修复图片拉伸：保持固定比例，隐藏溢出 */
.card-image-outer {
  width: 100%;
  height: 200px; /* 固定高度 */
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.blog-card:hover .card-image {
  transform: scale(1.1); /* 悬停缩放效果 */
}

.card-content {
  padding: 20px;
}

.post-title {
  margin: 0 0 10px 0;
  font-size: 1.25rem;
  color: #1a202c;
}

.post-excerpt {
  color: #718096;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f7fafc;
  padding-top: 15px;
}

.date {
  color: #a0aec0;
  font-size: 0.85rem;
}

.status-tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #48bb78;
  font-weight: bold;
  letter-spacing: 0.5px;
}
</style>