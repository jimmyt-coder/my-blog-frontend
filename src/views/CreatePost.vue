<script setup>
// 1. 外部依赖导入
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 2. 初始化路由
const router = useRouter()

// 3. 响应式状态变量
const loading = ref(false)
const postForm = ref({ title: '', content: '' })
const newCoverFile = ref(null) // 存封面二进制文件
const newCoverPreview = ref(null) // 存封面预览URL
const uploadFiles = ref([]) // 存画廊文件数组

// 4. 封面选择回调
const handleCoverChange = (file) => {
  newCoverFile.value = file.raw 
  newCoverPreview.value = URL.createObjectURL(file.raw)
}

// 5. 画廊选择回调
const handleGalleryChange = (file, fileList) => {
  uploadFiles.value = fileList
}

// 6. 图片大小校验
const beforeAvatarUpload = (rawFile) => {
  const isLt2M = rawFile.size / 1024 / 1024 < 2
  if (!isLt2M) ElMessage.error('Image size cannot exceed 2MB!')
  return isLt2M
}

// 7. 提交博客逻辑
const submitPost = async () => {
  if (!postForm.value.title || !postForm.value.content) {
    return ElMessage.warning('Please fill in all fields')
  }

  const userId = localStorage.getItem('userId')
  if (!userId) {
    ElMessage.error('User not logged in!')
    return router.push('/login')
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('title', postForm.value.title)
    formData.append('content', postForm.value.content)
    formData.append('user_id', userId)

    if (newCoverFile.value) formData.append('image', newCoverFile.value)
    
    uploadFiles.value.forEach(file => {    
    if (file.raw) formData.append('images', file.raw)
    })

    await axios.post('/api/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    ElMessage.success('Post published successfully!')
    router.push('/') 
  } catch (error) {
    console.error(error)
    ElMessage.error('Failed to publish post')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="create-post-container">
    <div class="header">
        <el-button @click="$router.back()">← Back</el-button>
        <h2>Create New Travel Post</h2>
    </div>

    <el-card class="form-card">
      <el-form label-position="top">
        <el-form-item label="Post Title">
          <el-input v-model="postForm.title" placeholder="Enter a catchy title..." />
        </el-form-item>

        <el-form-item label="Cover Image">
        <el-upload
            class="cover-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleCoverChange"
            >
            <img v-if="newCoverPreview" :src="newCoverPreview" class="preview-img" />            
            <img v-else-if="postForm.image_url" :src="postForm.image_url" class="preview-img" />            
            <div v-else class="upload-placeholder">
                <el-icon class="uploader-icon"><Plus /></el-icon>
                <span>Click to upload cover image</span>
            </div>
        </el-upload>
        </el-form-item>

        <el-form-item label="Content">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="10"
            placeholder="Share your story..."
            />
        </el-form-item>

        <el-form-item label="Gallery Photos (Optional)">
            <el-upload
                action="#"
                multiple
                :auto-upload="false"
                :file-list="uploadFiles"
                :on-change="handleGalleryChange"
                :on-remove="handleGalleryChange"
                list-type="picture-card"
            >
                <el-icon><Plus /></el-icon>
            </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitPost" :loading="loading" class="submit-btn">
            Publish Post
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.create-post-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.form-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 上传框样式 */
.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  color: #8c939d;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.uploader-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.submit-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

</style>