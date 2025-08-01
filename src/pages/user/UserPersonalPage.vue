<template>
  <div id="userPersonalPage">
    <!-- 头部背景区域 -->
    <div class="profile-header">
      <div class="header-background"></div>
      <div class="profile-content">
        <a-row :gutter="[24, 24]" align="middle">
          <a-col :span="24" :lg="16">
            <div class="user-info-card">
              <a-avatar
                :src="user.userAvatar"
                :size="120"
                class="user-avatar"
              >
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <div class="user-details">
                <h1 class="user-name">{{ user.userName || '未设置昵称' }}</h1>
                <p class="user-account">@{{ user.userAccount || 'unknown' }}</p>
                <p class="user-profile">{{ user.userProfile || '这个人很懒，什么都没有留下...' }}</p>
                <div class="user-meta">
                  <span class="user-id">ID: {{ user.id || 'null' }}</span>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="24" :lg="8">
            <div class="action-panel">
              <a-space direction="vertical" size="middle" style="width: 100%">
                <a-button
                  v-if="canEdit"
                  size="large"
                  block
                  :icon="h(EditOutlined)"
                  @click="showEditModal"
                  class="edit-btn"
                >
                  编辑个人资料
                </a-button>
              </a-space>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 详细信息卡片 -->
    <div class="details-section">
      <a-row :gutter="[24, 24]">
        <a-col :span="24" :md="12">
          <a-card title="基本信息" class="info-card">
            <a-descriptions :column="1" size="middle">
              <a-descriptions-item>
                <template #label>
                  <UserOutlined style="margin-right: 8px" />
                  用户昵称
                </template>
                {{ user.userName || '未设置' }}
              </a-descriptions-item>
              <a-descriptions-item>
                <template #label>
                  <IdcardOutlined style="margin-right: 8px" />
                  用户账号
                </template>
                {{ user.userAccount || '未设置' }}
              </a-descriptions-item>
              <a-descriptions-item>
                <template #label>
                  <ProfileOutlined style="margin-right: 8px" />
                  个人简介
                </template>
                <div class="profile-text">
                  {{ user.userProfile || '暂无个人简介' }}
                </div>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
        <a-col :span="24" :md="12">
          <a-card title="统计信息" class="info-card">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ user.id || 0 }}</div>
                <div class="stat-label">用户ID</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">0</div>
                <div class="stat-label">上传图片</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">0</div>
                <div class="stat-label">下载次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">0</div>
                <div class="stat-label">获得点赞</div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 编辑模态框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑个人资料"
      width="600px"
      :confirm-loading="editLoading"
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="头像" name="userAvatar">
          <div class="avatar-upload">
            <a-avatar :src="editForm.userAvatar" :size="80">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <div class="upload-hint">
              <a-button size="small" @click="handleAvatarUpload">
                <UploadOutlined /> 更换头像
              </a-button>
              <p>支持 JPG、PNG 格式，建议尺寸 200x200</p>
            </div>
          </div>
        </a-form-item>

        <a-form-item label="昵称" name="userName">
          <a-input
            v-model:value="editForm.userName"
            placeholder="请输入昵称"
            :maxlength="20"
            show-count
          />
        </a-form-item>

        <a-form-item label="个人简介" name="userProfile">
          <a-textarea
            v-model:value="editForm.userProfile"
            placeholder="介绍一下自己吧..."
            :rows="4"
            :maxlength="200"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { formatSize, downloadImage } from '@/utils'
import dayjs from 'dayjs'

import { uploadPictureUsingPost } from '@/api/pictureController'; // 你的上传接口

import { useLoginUserStore } from '@/stores/userLoginUserStore'
import {
  EditOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  UserOutlined,
  IdcardOutlined,
  ProfileOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import router from '@/router'
import { getUserVoByIdUsingGet, updateUserUsingPost, uploadAvatarUsingPost } from '@/api/userController'

interface Props {
  id: string | number
}

const props = defineProps<Props>()

const user = ref<API.UserVO>({})
const editModalVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref()

// 编辑表单数据
const editForm = reactive({
  userName: '',
  userProfile: '',
  userAvatar: ''
})

// 表单验证规则
const editRules = {
  userName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 判断是否可以编辑（这里需要根据你的业务逻辑来实现）
const canEdit = computed(() => {
  // 假设当前登录用户可以编辑自己的资料
  const loginUserStore = useLoginUserStore()
  return loginUserStore.loginUser?.id === user.value.id
})

// 获取用户详情信息
const fetchUserDetail = async () => {
  try {
    const res = await getUserVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      user.value = res.data.data
    } else {
      message.error('获取个人详情信息失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取个人详情信息失败，' + e.message)
  }
}

// 显示编辑模态框
const showEditModal = () => {
  // 初始化表单数据
  editForm.userName = user.value.userName || ''
  editForm.userProfile = user.value.userProfile || ''
  editForm.userAvatar = user.value.userAvatar || ''
  editModalVisible.value = true
}

// 处理编辑提交
const handleEditSubmit = async () => {
  try {
    await editFormRef.value.validateFields()
    editLoading.value = true

    // 调用更新用户信息的API
    const res = await updateUserUsingPost({
      id: user.value.id,
      userName: editForm.userName,
      userProfile: editForm.userProfile,
      userAvatar: editForm.userAvatar
    })

    if (res.data.code === 0) {
      message.success('个人资料更新成功')
      editModalVisible.value = false
      // 重新获取用户信息
      await fetchUserDetail()
      const loginUserStore = useLoginUserStore()
      loginUserStore.loginUser = {
        ...loginUserStore.loginUser,
        userAvatar: editForm.userAvatar,
        userName: editForm.userName,
        userProfile: editForm.userProfile,
      }
    } else {
      message.error('更新失败：' + res.data.message)
    }
  } catch (error) {
    console.error('更新个人资料失败:', error)
    message.error('更新失败，请稍后重试')
  } finally {
    editLoading.value = false
  }
}

// 取消编辑
const handleEditCancel = () => {
  editModalVisible.value = false
  editFormRef.value?.resetFields()
}


// 处理头像上传（这里需要根据你的上传逻辑来实现）
const handleAvatarUpload = async () => {
  // 创建一个文件选择框
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png, image/jpeg';
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    // 前端校验
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt20M = file.size / 1024 / 1024 < 20;

    if (!isJpgOrPng) {
      message.error('仅支持 JPG/PNG 格式图片');
      return;
    }
    if (!isLt20M) {
      message.error('图片大小不能超过 20MB');
      return;
    }

    try {
      editLoading.value = true;
      const res = await uploadAvatarUsingPost({}, file);
      if (res.data.code === 0 && res.data.data) {
        editForm.userAvatar = res.data.data;
        message.success('头像上传成功');
      } else {
        message.error('头像上传失败');
      }
    } catch (e) {
      message.error('头像上传失败');
    } finally {
      editLoading.value = false;
    }
  };
};


onMounted(() => {
  fetchUserDetail()
})
</script>

<style scoped>
#userPersonalPage {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 头部区域 */
.profile-header {
  position: relative;
  padding: 40px 24px 60px;
  color: white;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  backdrop-filter: blur(10px);
}

.profile-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.user-info-card {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar {
  flex-shrink: 0;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.user-details h1.user-name {
  margin: 0 0 8px 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.user-account {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  opacity: 0.8;
  color: #e0e7ff;
}

.user-profile {
  margin: 0 0 16px 0;
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
  color: #f1f5f9;
  max-width: 400px;
}

.user-meta {
  opacity: 0.7;
  font-size: 0.9rem;
}

.action-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.primary-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.edit-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  color: #6366f1;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.delete-btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: translateY(-2px);
}

/* 详情区域 */
.details-section {
  padding: 0 24px 40px;
  max-width: 1200px;
  margin: 0 auto;
  transform: translateY(-20px);
}

.info-card {
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
  background: white;
}

.info-card :deep(.ant-card-head) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.info-card :deep(.ant-card-head-title) {
  font-weight: 600;
  color: #1e293b;
}

.profile-text {
  line-height: 1.6;
  color: #64748b;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* 编辑模态框样式 */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload-hint p {
  margin: 8px 0 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-info-card {
    flex-direction: column;
    text-align: center;
  }

  .user-details h1.user-name {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .profile-header {
    padding: 24px 16px 40px;
  }

  .details-section {
    padding: 0 16px 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
