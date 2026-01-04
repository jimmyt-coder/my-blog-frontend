<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import axios from 'axios'
    import { ElMessage } from 'element-plus'

    // --- 1. 路由与基础状态 ---
    const route = useRoute()
    const router = useRouter()
    const currentUserId = Number(localStorage.getItem('userId'))
    const newComment = ref('') // 评论输入框

    const post = ref({
      title: '',
      content: '',
      images: [],
      comments: [],
      user_id: null
    })

    // --- 2. 权限判断 ---
    const isAuthor = computed(() => {
      return post.value && Number(post.value.user_id) === currentUserId
    })

    // --- 3. 工具函数 (图片处理与时间格式化) ---
    // 处理通用图片 URL
    const getImageUrl = (url) => {
      if (!url) return ''
      if (url.startsWith('http')) return url
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'
      return `${baseUrl}${url}`
    }

    // 处理详情页大封面图 (保持独立写法)
    const getCoverImage = () => {
      if (!post.value || !post.value.image_url) return 'https://via.placeholder.com/800x400?text=No+Image'
      if (post.value.image_url.startsWith('http')) return post.value.image_url
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'
      return `${baseUrl}${post.value.image_url}`
    }

    // 统一的时间格式化：显示 年-月-日 时:分
    const formatDateTime = (dateStr) => {
      if (!dateStr) return 'Recently'
      const date = new Date(dateStr)
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // --- 4. 数据请求逻辑 ---
    const fetchPostDetail = async () => {
      try {
        const res = await axios.get(`/api/posts/${route.params.id}`)
        post.value = res.data
      } catch (error) {
        ElMessage.error('Post not found')
        router.push('/')
      }
    }

    // --- 5. 博文操作 (编辑/删除) ---
    const handleEdit = () => {
      router.push(`/edit/${post.value.id}`)
    }

    const confirmDelete = async () => {
      if(!confirm('Delete this post?')) return
      try {
        await axios.delete(`/api/posts/${post.value.id}`, {
          params: { user_id: currentUserId }
        })
        ElMessage.success('Deleted successfully')
        router.push('/')
      } catch (error) {
        ElMessage.error('Delete failed')
      }
    }

    // --- 6. 评论操作 (提交/删除) ---
    const submitComment = async () => {
      if (!newComment.value.trim()) return
      try {
        await axios.post(`/api/posts/${post.value.id}/comments`, {
          text: newComment.value,
          user_id: currentUserId
        })
        ElMessage.success('Comment posted')
        newComment.value = ''
        fetchPostDetail() // 重新拉取详情以显示新评论
      } catch (error) {
        ElMessage.error('Failed to post comment')
      }
    }

    const deleteComment = async (commentId) => {
      if (!confirm('Delete this comment?')) return
      try {
        await axios.delete(`/api/comments/${commentId}`, {
          params: { user_id: currentUserId }
        })
        ElMessage.success('Comment deleted')
        fetchPostDetail() // 重新拉取以更新评论列表
      } catch (error) {
        ElMessage.error('Failed to delete')
      }
    }

    // --- 7. 生命周期 ---
    onMounted(fetchPostDetail)
</script>

<template>
  <div class="page-background" v-if="post">
    <div class="post-detail-wrapper">
      
      <div class="action-bar">
        <el-button @click="$router.push('/')" plain>← Back to Home</el-button>
        <div v-if="isAuthor" class="author-actions">
          <el-button type="primary" @click="handleEdit">Edit Post</el-button>
          <el-button type="danger" @click="confirmDelete">Delete</el-button>
        </div>
      </div>

      <div class="post-content-card">
        <div class="post-header">
          <span class="author-info">Published by {{ post.author }}</span>
          <h1>{{ post.title }}</h1>
          <div class="time-meta">
            <span>🗓️ Posted: {{ formatDateTime(post.created_at) }}</span>
            <span v-if="post.updated_at && post.updated_at !== post.created_at" class="updated-tag">
              (Edited: {{ formatDateTime(post.updated_at) }})
            </span>
          </div>
        </div>

        <img :src="getCoverImage()" class="main-image" v-if="post.image_url" />

        <div class="content-body">
          {{ post.content }}
        </div>

        <div v-if="post.images && post.images.length > 0" class="image-gallery" style="margin-top: 30px;">
            <h3 style="margin-bottom: 15px;">Travel Gallery</h3>
            <el-row :gutter="10">
                <el-col :span="12" v-for="img in post.images" :key="img.id" style="margin-bottom: 20px;">
                
                <el-image 
                    :src="getImageUrl(img.url)" 
                    :preview-src-list="post.images.map(i => getImageUrl(i.url))"
                    :initial-index="post.images.indexOf(img)"
                    fit="cover"
                    style="width: 100%; height: 400px; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
                    preview-teleported
                />
                
                </el-col>
            </el-row>
        </div>

        <el-divider />

        <div class="comment-section">
          <h3>Comments ({{ post.comments?.length || 0 }})</h3>
          
          <div v-if="currentUserId" class="comment-input-area">
            <el-input
              v-model="newComment"
              type="textarea"
              placeholder="What are your thoughts on this journey?"
              :rows="3"
            />
            <el-button type="primary" @click="submitComment" style="margin-top: 15px">
              Submit Comment
            </el-button>
          </div>

          <div class="comment-list" v-if="post.comments && post.comments.length > 0">
            <div v-for="c in post.comments" :key="c.id" class="comment-item">
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ c.author }}</span>
                  <span class="comment-time">{{ formatDateTime(c.created_at) }}</span>
                </div>
                <p class="comment-body-text">{{ c.text }}</p>
              </div>
              <div class="comment-actions" v-if="currentUserId === c.user_id || currentUserId === post.user_id">
                <el-button type="danger" size="small" @click="deleteComment(c.id)">Delete</el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="No comments yet. Share your thoughts!" />
        </div>
      </div> </div> </div> 
</template>

<style scoped>
    /* --- 1. 页面大框架 --- */
    .page-background {
      background-color: #fffaf0; /* 暖色调背景 */
      min-height: 100vh;
      padding: 30px 0;
    }

    .post-detail-wrapper { 
      max-width: 900px; 
      margin: 0 auto; 
    }

     /* --- 2. 博文主体卡片 --- */
    .post-content-card {
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }

    .action-bar { 
      display: flex; 
      justify-content: space-between; 
      margin-bottom: 20px; 
    }

    .main-image { 
      width: 100%; 
      height: 450px; 
      object-fit: cover; 
      border-radius: 12px; 
      margin: 20px 0; 
    }

    .content-body { 
      line-height: 1.8; 
      font-size: 18px; 
      white-space: pre-wrap; /* 保持后台输入的换行格式 */
      margin-bottom: 40px; 
    }

    /* --- 3. 评论系统 --- */
    .comment-item {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 15px; 
      margin-bottom: 10px; 
      background: #f9f9f9; 
      border-radius: 8px;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }

    .comment-author { 
      font-weight: bold; 
      color: #409eff; 
    }

    /* --- 4. 元数据与时间状态 --- */
    .time-meta {
      font-size: 13px;
      color: #888;
      margin: 10px 0;
      display: flex;
      gap: 15px;
    }

    .comment-time {
      font-size: 12px;
      color: #bbb;
    }

    .updated-tag {
      font-style: italic;
      color: #999;
    }
</style>