<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>

    <div class="register-card">
      <!-- 品牌区域 -->
      <div class="brand-section">
        <div class="logo-icon">
          <img src="/favicon.ico" alt="云摄Logo" class="logo-image" />
        </div>
        <h1 class="brand-title">云摄</h1>
        <p class="brand-subtitle">开源摄影作品分享网站</p>
      </div>

      <!-- 注册表单 -->
      <div class="form-section">
        <h2 class="form-title">创建新账户</h2>
        <p class="form-subtitle">加入我们的摄影社区</p>

        <a-form :model="formState" name="register" @finish="handleSubmit" class="register-form">
          <a-form-item
            name="userAccount"
            :rules="[
              { required: true, message: '请输入账号!' },
              { min: 4, message: '账号长度不能小于4位' },
            ]"
          >
            <a-input
              v-model:value="formState.userAccount"
              placeholder="请输入账号"
              size="large"
              class="form-input"
            >
              <template #prefix>
                <span class="input-icon">👤</span>
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            name="userPassword"
            :rules="[
              { required: true, message: '请输入密码!' },
              { min: 8, message: '密码长度不能小于8位' },
            ]"
          >
            <a-input-password
              v-model:value="formState.userPassword"
              placeholder="请输入密码"
              size="large"
              class="form-input"
            >
              <template #prefix>
                <span class="input-icon">🔒</span>
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item
            name="checkPassword"
            :rules="[
              { required: true, message: '请再次输入密码!' },
              { min: 8, message: '密码长度不能小于8位' },
            ]"
          >
            <a-input-password
              v-model:value="formState.checkPassword"
              placeholder="请再次输入密码"
              size="large"
              class="form-input"
            >
              <template #prefix>
                <span class="input-icon">🔐</span>
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" class="register-button" block>
              立即注册
            </a-button>
          </a-form-item>
        </a-form>

        <!-- 登录链接 -->
        <div class="login-link">
          <span>已有账号？</span>
          <RouterLink to="/user/login" class="link">立刻登录</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { userRegisterUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import router from '@/router'

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

/**
 * 表单提交
 * @param values 输入的值
 */
const handleSubmit = async (values: any) => {
  // 校验两次输入密码是否一致
  if (values.userPassword !== values.checkPassword) {
    message.error('两次输入密码不一致！')
    return
  }
  try {
    const res = await userRegisterUsingPost(values)
    // 用户注册成功，跳转到登录页面
    if (res.data.code === 0 && res.data.data) {
      message.success('注册成功！')
      // 跳转到登录页面
      router.push({
        path: '/user/login',
        replace: true,
      })
    } else {
      message.error('注册失败 ' + res.data.message)
    }
  } catch (e: any) {
    message.error(`注册失败 ${e.message}`)
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 注册卡片 */
.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 品牌区域 */
.brand-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  animation: logoRotate 3s ease-in-out infinite;
  padding: 8px;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

@keyframes logoRotate {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(5deg) scale(1.05);
  }
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
}

.brand-subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

/* 表单区域 */
.form-section {
  text-align: center;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.form-subtitle {
  color: #666;
  font-size: 14px;
  margin: 0 0 32px 0;
}

.register-form {
  text-align: left;
}

/* 表单输入框样式 */
:deep(.form-input) {
  border-radius: 12px;
  border: 2px solid #e8e8e8;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

:deep(.form-input:hover) {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.9);
}

:deep(.form-input:focus-within) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 1);
}

:deep(.form-input .ant-input) {
  border: none;
  background: transparent;
  font-size: 16px;
  padding-left: 8px;
}

:deep(.form-input .ant-input:focus) {
  box-shadow: none;
}

.input-icon {
  font-size: 16px;
  margin-right: 8px;
}

/* 注册按钮 */
.register-button {
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.register-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a6fd8, #6a42a0);
}

:deep(.register-button:active) {
  transform: translateY(0);
}

/* 登录链接 */
.login-link {
  margin-top: 24px;
  color: #666;
  font-size: 14px;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.3s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-card {
    padding: 32px 24px;
    margin: 16px;
    border-radius: 20px;
  }

  .brand-title {
    font-size: 28px;
  }

  .form-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 24px 20px;
  }

  .brand-title {
    font-size: 24px;
  }

  .logo-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
