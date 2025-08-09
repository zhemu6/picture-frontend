<template>
  <div id="userLoginPage">
    <div class="login-container">
      <!-- 背景装饰 -->
      <div class="background-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card">
        <!-- 头部区域 -->
        <div class="login-header">
          <div class="logo-section">
            <div class="logo-icon">
              <img src="/favicon.ico" alt="云摄Logo" class="logo-image" />
            </div>
            <h1 class="brand-title">云摄</h1>
          </div>
          <h2 class="login-title">用户登录</h2>
          <p class="login-subtitle">开源摄影作品分享网站</p>
        </div>

        <!-- 表单区域 -->
        <div class="login-form-wrapper">
          <a-form :model="formState" name="loginForm" @finish="handleSubmit" layout="vertical">
            <a-form-item
              label="账号"
              name="userAccount"
              :rules="[
                { required: true, message: '请输入账号!' },
                { min: 4, message: '账号长度不能小于4位' },
              ]"
            >
              <a-input
                v-model:value="formState.userAccount"
                placeholder="请输入您的账号"
                size="large"
                class="login-input"
              >
                <template #prefix>
                  <UserOutlined class="input-icon" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item
              label="密码"
              name="userPassword"
              :rules="[
                { required: true, message: '请输入密码!' },
                { min: 8, message: '密码长度不能小于8位' },
              ]"
            >
              <a-input-password
                v-model:value="formState.userPassword"
                placeholder="请输入您的密码"
                size="large"
                class="login-input"
              >
                <template #prefix>
                  <LockOutlined class="input-icon" />
                </template>
              </a-input-password>
            </a-form-item>

            <!-- 注册提示 -->
            <div class="register-tips">
              <span class="tips-text">还没有账号？</span>
              <RouterLink to="/user/register" class="register-link"> 立即注册 → </RouterLink>
            </div>

            <!-- 登录按钮 -->
            <a-form-item class="login-button-item">
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                :loading="isLoading"
                class="login-button"
              >
                <template #icon v-if="!isLoading">
                  <LoginOutlined />
                </template>
                {{ isLoading ? '登录中...' : '立即登录' }}
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- 底部装饰 -->
        <div class="login-footer">
          <div class="footer-decoration">
            <span class="decoration-dot"></span>
            <span class="decoration-line"></span>
            <span class="decoration-dot"></span>
          </div>
          <p class="footer-text">安全登录，保护您的隐私</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { userLoginUsingPost } from '@/api/userController'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons-vue'
import router from '@/router'

// 用户登录状态
const loginUserStore = useLoginUserStore()
const isLoading = ref(false)

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

/**
 * 表单提交
 * @param values 输入的值
 */
const handleSubmit = async (values: any) => {
  try {
    isLoading.value = true
    const res = await userLoginUsingPost(values)

    // 用户登录成功 保存登录态 跳转到首页
    if (res.data.code === 0 && res.data.data) {
      await loginUserStore.fetchLoginUser()
      message.success('登录成功！欢迎回来 🎉')
      router.push({
        path: '/',
        replace: true,
      })
    } else {
      message.error('登录失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error(`登录失败：${e.message}`)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
#userLoginPage {
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
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
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

/* 登录容器 */
.login-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

/* 登录卡片 */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: cardSlideIn 0.8s ease-out;
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头部区域 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* 表单区域 */
.login-form-wrapper {
  margin-bottom: 24px;
}

.login-form-wrapper :deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.login-input {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.login-input:hover {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.login-input:focus,
.login-input:focus-within {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  background: #ffffff;
}

.input-icon {
  color: #9ca3af;
  font-size: 16px;
}

/* 注册提示 */
.register-tips {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.tips-text {
  font-size: 14px;
  color: #6b7280;
}

.register-link {
  font-size: 14px;
  font-weight: 600;
  color: #8b5cf6;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.register-link:hover {
  color: #7c3aed;
  background: rgba(139, 92, 246, 0.1);
  transform: translateX(2px);
}

/* 登录按钮 */
.login-button-item {
  margin-bottom: 0;
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.login-button:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 底部装饰 */
.login-footer {
  text-align: center;
  margin-top: 24px;
}

.footer-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.decoration-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  animation: dotPulse 2s ease-in-out infinite;
}

.decoration-dot:nth-child(2) {
  animation-delay: 0.5s;
}

.decoration-dot:nth-child(3) {
  animation-delay: 1s;
}

@keyframes dotPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.decoration-line {
  width: 40px;
  height: 2px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border-radius: 1px;
  opacity: 0.3;
}

.footer-text {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
  font-weight: 400;
}

/* 响应式设计 */
@media (max-width: 480px) {
  #userLoginPage {
    padding: 16px;
  }

  .login-card {
    padding: 32px 24px;
  }

  .brand-title {
    font-size: 24px;
  }

  .login-title {
    font-size: 20px;
  }
}
</style>
