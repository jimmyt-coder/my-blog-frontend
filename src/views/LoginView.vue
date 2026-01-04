
<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import axios from 'axios'
    import { ElMessage } from 'element-plus'

    const router = useRouter()
    const isLoginMode = ref(true)
    const form = ref({ username: '', password: '' })

    const handleSubmit = async () => {
    const url = isLoginMode.value 
        ? '/api/login' 
        : '/api/register'
    
    try {
        const res = await axios.post(url, form.value)
        if (isLoginMode.value) {
        // 登录成功逻辑
        localStorage.setItem('userId', res.data.user_id)
        localStorage.setItem('username', res.data.username)
        ElMessage.success('Welcome back!')
        router.push('/') // 登录后回主页
        } else {
        // 注册成功逻辑
        ElMessage.success('Registration successful! Please login.')
        isLoginMode.value = true // 自动切换到登录模式
        }
    } catch (error) {
        ElMessage.error(error.response?.data?.message || 'Action failed')
    }
    }
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h2>{{ isLoginMode ? 'Login to Travel Blog' : 'Create Account' }}</h2>
      
      <el-form :model="form" label-position="top">
        <el-form-item label="Username">
          <el-input v-model="form.username" placeholder="Enter username" />
        </el-form-item>
        
        <el-form-item label="Password">
          <el-input v-model="form.password" type="password" placeholder="Enter password" show-password />
        </el-form-item>

        <div class="actions">
          <el-button type="primary" @click="handleSubmit" style="width: 100%">
            {{ isLoginMode ? 'Login' : 'Register' }}
          </el-button>
          <p @click="isLoginMode = !isLoginMode" class="switch-text">
            {{ isLoginMode ? "Don't have an account? Register now" : "Already have an account? Login" }}
          </p>
        </div>
      </el-form>
      
      <el-button type="text" @click="$router.push('/')">← Back to Home</el-button>
    </div>
  </div>
</template>


<style scoped>
.login-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

h2 { 
    text-align: center; 
    color: #333; 
    margin-bottom: 30px; 
}

.switch-text {
  text-align: center;
  margin-top: 20px;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
}
</style>