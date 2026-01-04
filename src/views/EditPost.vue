<script setup>
    import { ref, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import axios from 'axios'
    import { ElMessage } from 'element-plus'
    import { Plus, CircleCloseFilled } from '@element-plus/icons-vue'

    // --- 1. 路由与基础状态 ---
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)

    // 表单核心数据（标题、正文、旧图片）
    const postForm = ref({
    title: '',
    content: '',
    image_url: '',
    images: []
    })

    // --- 2. 封面图相关状态与逻辑 ---
    const newCoverFile = ref(null)      // 新选的封面文件
    const newCoverPreview = ref(null)   // 新封面的预览地址
    const coverDeleted = ref(false)     // 标记是否删除了旧封面

    const handleCoverChange = (file) => {
    newCoverFile.value = file.raw
    newCoverPreview.value = URL.createObjectURL(file.raw)
    }

    const removeCover = () => {
    postForm.value.image_url = null
    coverDeleted.value = true
    newCoverFile.value = null
    newCoverPreview.value = null
    }

    // --- 3. 画廊照片相关状态与逻辑 ---
    const uploadFiles = ref([])         // 存新选的画廊文件列表
    const deletedImageIds = ref([])     // 存被标记删除的旧画廊图片 ID

    const handleGalleryChange = (file, fileList) => {
    uploadFiles.value = fileList
    }

    const handleRemoveNew = (file, fileList) => {
    uploadFiles.value = fileList
    }

    const removeExistingImage = (id) => {
    // 记录 ID，告诉后端要删哪张
    deletedImageIds.value.push(id)
    // 前端立即隐藏
    postForm.value.images = postForm.value.images.filter(img => img.id !== id)
    }

    // --- 4. 后端交互逻辑 ---

    // 初始化：加载旧数据
    const loadPost = async () => {
    try {
        const res = await axios.get(`/api/posts/${route.params.id}`)
        postForm.value = res.data
    } catch (error) {
        ElMessage.error('Failed to load post data')
    }
    }

    // 提交更新
    const handleUpdate = async () => {
    loading.value = true
    try {
        const formData = new FormData()
        formData.append('title', postForm.value.title)
        formData.append('content', postForm.value.content)
        formData.append('user_id', localStorage.getItem('userId'))

        // A. 处理封面：是删了、还是换了
        if (coverDeleted.value) formData.append('delete_cover', 'true')
        if (newCoverFile.value) formData.append('image', newCoverFile.value)

        // B. 处理旧画廊：发送需要删除的 ID 数组
        formData.append('delete_image_ids', JSON.stringify(deletedImageIds.value))

        // C. 处理新画廊：发送新选的文件
        uploadFiles.value.forEach(file => {
        if (file.raw) formData.append('images', file.raw)
        })

        await axios.put(`/api/posts/${route.params.id}`, formData)
        
        ElMessage.success('Updated successfully!')
        router.push(`/post/${route.params.id}`)
    } catch (error) {
        console.error(error)
        ElMessage.error('Update failed')
    } finally {
        loading.value = false
    }
    }

    // --- 5. 生命周期 ---
    onMounted(loadPost)
</script>

<template>
    <div class="edit-container">
        <h2>Edit Your Journey</h2>
        <el-form label-position="top" v-if="postForm.title !== undefined">
        
                <el-form-item label="Title">
                    <el-input v-model="postForm.title" />
                </el-form-item>

                <el-form-item label="Post Cover (封面图)">
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
                    
                    <el-button v-if="newCoverPreview || postForm.image_url" 
                                type="danger" link @click="removeCover" style="margin-top: 10px">
                        Remove Cover
                    </el-button>
                </el-form-item>

                <el-form-item label="Content">
                    <el-input v-model="postForm.content" type="textarea" :rows="8" />
                </el-form-item>    
                
                <el-form-item label="Gallery Management">
                    <div class="existing-photos" v-if="postForm.images && postForm.images.length > 0">
                        <p style="font-size: 12px; color: #999; margin-bottom: 10px;">Click (X) to mark for deletion:</p>
                        <div class="thumb-list">
                            <div v-for="img in postForm.images" :key="img.id" class="image-preview-wrapper">
                                <img :src="img.url" class="thumb-img">
                                <el-icon class="delete-icon" @click="removeExistingImage(img.id)">
                                    <CircleCloseFilled />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <p style="font-size: 12px; color: #999; margin-bottom: 10px;">Upload new photos (Gallery):</p>
                        <el-upload
                            class="gallery-uploader"
                            action="#"
                            :auto-upload="false"
                            multiple
                            :file-list="uploadFiles"
                            :on-change="handleGalleryChange"
                            :on-remove="handleRemoveNew"
                            >
                            <el-button type="primary">Select Gallery Photos</el-button>
                            <template #tip>
                                <div class="el-upload__tip">You can select multiple photos</div>
                            </template>
                        </el-upload>
                    </div>
                </el-form-item>

                <div class="form-actions">
                    <el-button type="primary" @click="handleUpdate">Save Changes</el-button>
                    <el-button @click="$router.back()">Cancel</el-button>
                </div>
        </el-form>
    </div>
</template>

<style scoped>

/* 1. 页面大容器（整体骨架） */
.edit-container { 
    max-width: 700px; 
    margin: 40px auto; 
    padding: 20px; 
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 2px 10px rgba(0,0,0,0.05); 
}

/* 2. 布局工具（控制图片怎么排） */
.thumb-list { 
    display: flex; 
    flex-wrap: wrap; 
    margin-bottom: 15px; 
}

.form-actions { 
    margin-top: 30px; 
    display: flex; 
    justify-content: flex-end; 
    gap: 10px; 
}

/* 3. 图片包装器与删除图标（核心组件） */
.image-preview-wrapper { 
    position: relative; 
    display: inline-block; 
    margin: 0 10px 10px 0; 
}

/* 通用图片预览样式 */
.thumb-img { 
    width: 100px; 
    height: 100px; 
    object-fit: cover; 
    border-radius: 6px; 
    border: 1px solid #ddd; 
}

/* 右上角红色叉叉 */
.delete-icon {
    position: absolute;
    top: -5px;
    right: -5px;
    color: #f56c6c;
    font-size: 20px;
    cursor: pointer;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    z-index: 10; /* 确保在图片上方 */
    transition: transform 0.2s; /* 动画平滑一点 */
}

.delete-icon:hover { 
    color: #ff0000; 
    transform: scale(1.1); 
}

/* 4. 封面图特有的定制化样式（特殊覆盖） */
.cover-preview {
    border: 2px dashed #409eff; /* 封面特有的蓝色虚线框 */
    padding: 5px;
    border-radius: 10px;
}

.cover-img {
    width: 200px !important; /* 强制覆盖通用的 100px */
    height: 120px !important;
}

.cover-tag {
    position: absolute;
    bottom: 5px;
    left: 5px;
    background: rgba(64, 158, 255, 0.8);
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    pointer-events: none; /* 防止遮挡鼠标点击图片 */
}
</style>