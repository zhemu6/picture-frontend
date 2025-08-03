<template>
  <div id="pictureDetailPage">
    <a-row :gutter="[24, 24]">
      <!--左侧-图片预览-->
      <a-col :sm="12" :md="14" :xl="16">
        <a-card :bordered="false" class="preview-card">
          <template #title>
            <div class="preview-title">
              <span class="title-icon">🖼️</span>
              <span>图片预览</span>
            </div>
          </template>
          <div class="image-container">
            <a-image :src="picture.url" class="main-image" :preview="{ mask: '点击放大预览' }" />
            <div class="image-overlay">
              <div class="image-info-quick">
                <span class="resolution-badge">
                  {{ picture.picWidth }}×{{ picture.picHeight }}
                </span>
                <span class="format-badge">
                  {{ picture.picFormat?.toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧分为三个部分 -->
      <a-col :sm="12" :md="10" :xl="8">
        <!-- 作者信息块 -->
        <a-card :bordered="false" class="info-block author-block">
          <div class="author-content">
            <div class="author-avatar-wrapper">
              <a-avatar :size="40" :src="picture.user?.userAvatar">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <div class="avatar-ring"></div>
            </div>
            <div class="author-info">
              <div class="author-name">{{ picture.user?.userName || '匿名用户' }}</div>
              <div class="author-meta">{{ picture.user?.userProfile || '作品创作者' }}</div>
            </div>
          </div>
        </a-card>

        <!-- 图片详情块 -->
        <a-card :bordered="false" class="info-block detail-card">
          <template #title>
            <div class="card-title">
              <span class="title-icon">📋</span>
              <span>图片信息</span>
            </div>
          </template>

          <div class="picture-title">
            <h2>{{ picture.name || '未命名作品' }}</h2>
            <p class="picture-intro">{{ picture.introduction || '暂无简介' }}</p>
          </div>

          <a-divider />

          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">分类</span>
              <a-tag color="blue" class="category-tag">
                {{ picture.category || '默认' }}
              </a-tag>
            </div>

            <div class="info-row" v-if="picture.tags && picture.tags.length">
              <span class="info-label">标签</span>
              <div class="tags-wrapper">
                <a-tag v-for="tag in picture.tags" :key="tag" color="geekblue" class="tag-item">
                  {{ tag }}
                </a-tag>
              </div>
            </div>

            <div class="info-row">
              <span class="info-label">文件大小</span>
              <span class="info-value size-value">{{ formatSize(picture.picSize) }}</span>
            </div>

            <!-- <div class="info-row">
              <span class="info-label">宽高比</span>
              <span class="info-value">{{ picture.picScale || '-' }}</span>
            </div> -->
          </div>

          <!-- 拍摄参数 -->
          <div v-if="hasPhotoParams" class="photo-params">
            <a-divider>
              <span class="divider-text">📷 拍摄参数</span>
            </a-divider>
            <div class="params-grid">
              <div class="param-item" v-if="picture.cameraModel">
                <div class="param-icon">📱</div>
                <div class="param-content">
                  <div class="param-label">设备</div>
                  <div class="param-value">{{ picture.cameraModel }}</div>
                </div>
              </div>
              <div class="param-item" v-if="picture.fnumber">
                <div class="param-icon">🔍</div>
                <div class="param-content">
                  <div class="param-label">光圈</div>
                  <div class="param-value">{{ picture.fnumber }}</div>
                </div>
              </div>
              <div class="param-item" v-if="picture.iso">
                <div class="param-icon">🌟</div>
                <div class="param-content">
                  <div class="param-label">ISO</div>
                  <div class="param-value">{{ picture.iso }}</div>
                </div>
              </div>
              <div class="param-item" v-if="picture.exposureTime">
                <div class="param-icon">⚡</div>
                <div class="param-content">
                  <div class="param-label">快门</div>
                  <div class="param-value">{{ picture.exposureTime }}</div>
                </div>
              </div>
              <div class="param-item" v-if="picture.focalLength">
                <div class="param-icon">🎯</div>
                <div class="param-content">
                  <div class="param-label">焦距</div>
                  <div class="param-value">{{ picture.focalLength }}</div>
                </div>
              </div>
            </div>
          </div>
        </a-card>

        <!-- 互动数据块 -->
        <a-card :bordered="false" class="info-block stats-card">
          <template #title>
            <div class="card-title">
              <span class="title-icon">📊</span>
              <span>互动数据</span>
            </div>
          </template>

          <div class="stats-grid">
            <div
              class="stat-item like-item"
              @click="doLike"
              :class="{ liked: isLiked, liking: isLiking }"
            >
              <div class="stat-icon like-icon">{{ isLiked ? '❤️' : '🤍' }}</div>
              <div class="stat-content">
                <div class="stat-number">{{ picture.likeCount || 0 }}</div>
                <div class="stat-label">{{ isLiking ? '处理中...' : '点赞' }}</div>
              </div>
            </div>
            <div
              class="stat-item favorite-item"
              @click="doFavorite"
              :class="{ favorited: isFavorited, favoriting: isFavoriting }"
            >
              <div class="stat-icon favorite-icon">{{ isFavorited ? '⭐' : '☆' }}</div>
              <div class="stat-content">
                <div class="stat-number">{{ picture.favoriteCount || 0 }}</div>
                <div class="stat-label">{{ isFavoriting ? '处理中...' : '收藏' }}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon comment-icon">💬</div>
              <div class="stat-content">
                <div class="stat-number">0</div>
                <div class="stat-label">评论</div>
              </div>
            </div>
          </div>

          <a-divider />

          <div class="action-buttons">
            <a-button type="primary" size="large" block @click="doDownload" class="download-btn">
              <template #icon><DownloadOutlined /></template>
              免费下载
            </a-button>
            <div class="admin-actions" v-if="canEdit">
              <a-button size="large" @click="doEdit" class="edit-btn">
                <template #icon><EditOutlined /></template>
                编辑
              </a-button>
              <a-button danger size="large" @click="doDelete" class="delete-btn">
                <template #icon><DeleteOutlined /></template>
                删除
              </a-button>
            </div>
          </div>
        </a-card>

        <!-- 评论区占位 -->
        <a-card :bordered="false" class="info-block comment-card">
          <template #title>
            <div class="card-title">
              <span class="title-icon">💭</span>
              <span>评论区</span>
              <a-badge count="开发中" color="#f50" style="margin-left: 8px" />
            </div>
          </template>
          <a-empty description="该模块正在开发中，敬请期待..." />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController'
import { likePictureUsingPost } from '@/api/pictureLikeController'
import { favoritePictureUsingPost } from '@/api/pictureFavoriteController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { formatSize, downloadImage } from '@/utils'
import dayjs from 'dayjs'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { EditOutlined, DownloadOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons-vue'
import router from '@/router'

interface Props {
  id: string | number
}
const props = defineProps<Props>()

const picture = ref<API.PictureVO>({})
const isLiking = ref(false)
const isFavoriting = ref(false)

// 根据后端返回的状态来判断是否已点赞/收藏
const isLiked = computed(() => picture.value.hasLiked || false)
const isFavorited = computed(() => picture.value.hasFavorite || false)

// 计算是否有拍摄参数
const hasPhotoParams = computed(() => {
  return (
    picture.value.cameraModel ||
    picture.value.fnumber ||
    picture.value.iso ||
    picture.value.exposureTime ||
    picture.value.focalLength
  )
})

// 点赞功能
const doLike = async () => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser.id) {
    message.warning('请先登录后再点赞')
    return
  }

  if (isLiking.value) {
    return
  }

  try {
    isLiking.value = true
    const res = await likePictureUsingPost({
      pictureId: picture.value.id,
    })

    if (res.data.code === 0) {
      // 根据当前状态切换
      const wasLiked = picture.value.hasLiked
      picture.value.hasLiked = !wasLiked

      // 更新点赞数量
      if (picture.value.hasLiked) {
        picture.value.likeCount = (picture.value.likeCount || 0) + 1
        message.success('点赞成功 ❤️')
      } else {
        picture.value.likeCount = Math.max((picture.value.likeCount || 0) - 1, 0)
        message.success('取消点赞')
      }
    } else {
      message.error('操作失败：' + res.data.message)
    }
  } catch (error: any) {
    message.error('操作失败：' + error.message)
  } finally {
    isLiking.value = false
  }
}

// 收藏功能
const doFavorite = async () => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser.id) {
    message.warning('请先登录后再收藏')
    return
  }

  if (isFavoriting.value) {
    return
  }

  try {
    isFavoriting.value = true
    const res = await favoritePictureUsingPost({
      pictureId: picture.value.id,
    })

    if (res.data.code === 0) {
      // 根据当前状态切换
      const wasFavorited = picture.value.hasFavorite
      picture.value.hasFavorite = !wasFavorited

      // 更新收藏数量
      if (picture.value.hasFavorite) {
        picture.value.favoriteCount = (picture.value.favoriteCount || 0) + 1
        message.success('收藏成功 ⭐')
      } else {
        picture.value.favoriteCount = Math.max((picture.value.favoriteCount || 0) - 1, 0)
        message.success('取消收藏')
      }
    } else {
      message.error('操作失败：' + res.data.message)
    }
  } catch (error: any) {
    message.error('操作失败：' + error.message)
  } finally {
    isFavoriting.value = false
  }
}

// 获取图片详情信息
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: props.id,
    })
    console.log(res)
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败，' + e.message)
  }
}

// 获得登录用户
const loginUserStore = useLoginUserStore()

// 权限校验
const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser.id) {
    return false
  }
  const user = picture.value.user || {}
  return loginUser.id === user.id || loginUser.userRole === 'admin'
})

// 编辑事件
const doEdit = () => {
  router.push({
    path: "/add_picture",
    query: { id: picture.value.id ,
      spaceId: picture.value.spaceId}
  })
}
// 删除事件
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }

  // 在删除之前先保存 spaceId
  const spaceId = picture.value.spaceId

  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')

    // 根据 spaceId 决定跳转路径
    if (spaceId) {
      // 如果有 spaceId，跳转到对应的 space 页面
      await router.push({ path: `/space/${spaceId}`, force: true })
    } else {
      // 如果没有 spaceId（公共删除），跳转到首页
      await router.push({ path: '/', force: true })
    }

  } else {
    message.error('删除失败')
  }
}

// 文件下载
const doDownload = () => {
  downloadImage(picture.value.url)
}

onMounted(() => {
  fetchPictureDetail()
})
</script>

<style scoped>
#pictureDetailPage {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}

/* 预览卡片样式 */
.preview-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.title-icon {
  font-size: 20px;
}

.image-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.main-image {
  max-width: 100%;
  max-height: 700px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.main-image:hover {
  transform: scale(1.02);
}

.image-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
}

.image-info-quick {
  display: flex;
  gap: 8px;
}

.resolution-badge,
.format-badge {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

/* 信息块通用样式 */
.info-block {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background: #ffffff;
  margin-bottom: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.info-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-title {
  display: flex;
  margin-top: -8px;
  margin-bottom: -8px;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

/* 作者信息块 */
.author-block {
  background: #ffffff;
  border-left: 4px solid #3b82f6;
}

.author-block {
  height: 64px !important;
  overflow: hidden !important;
}

.author-block .ant-card-body {
  padding: 12px 16px !important;
  height: 64px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  box-sizing: border-box !important;
}

.author-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 20px;
}

.author-avatar-wrapper {
  position: relative;
}

.avatar-ring {
  position: absolute;
  top: -2px;
  left: -2px;
  width: 44px;
  height: 44px;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  opacity: 0.3;
}

.author-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 40px;
  overflow: hidden;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.author-meta {
  font-size: 11px;
  color: #6b7280;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 详情卡片 */
.detail-card {
  background: #ffffff;
  border-left: 4px solid #10b981;
}

.detail-card .ant-card-body {
  padding: 8px 16px;
}

.detail-card .ant-divider {
  margin: 6px 0;
}

.picture-title h2 {
  margin-top: -15px;
  font-size: 14px;
  font-weight: bold;
  color: #1f2937;
}

.picture-intro {
  margin: 0;
  color: #6b7280;
  font-size: 11px;
  line-height: 1.3;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 0;
}

.info-label {
  font-weight: 500;
  color: #374151;
  min-width: 45px;
  font-size: 12px;
}

.info-value {
  font-weight: 500;
  color: #1f2937;
  font-size: 12px;
}

.size-value {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
}

.category-tag {
  border-radius: 12px;
  font-weight: 500;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-item {
  border-radius: 8px;
  transition: transform 0.2s ease;
  font-size: 11px;
  padding: 2px 8px;
}

.tag-item:hover {
  transform: scale(1.05);
}

.divider-text {
  margin-top: -15px;
  color: #6b7280;
  font-weight: 500;
}

/* 拍摄参数 */
.params-grid {
  margin-top: 0px;
  margin-bottom: -15px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  gap: 8px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.param-item:hover {
  background: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.param-icon {
  font-size: 14px;
}

.param-content {
  flex: 1;
}

.param-label {
  font-size: 10px;
  color: #6b7280;
  margin-bottom: 1px;
}

.param-value {
  font-size: 11px;
  font-weight: 600;
  color: #1f2937;
}

/* 统计卡片 */
.stats-card {
  background: #ffffff;
  border-left: 4px solid #f59e0b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 8px;
}

.stat-item {
  margin-top: -15px;
  margin-bottom: -15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 0px 10px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.like-item {
  cursor: pointer;
  user-select: none;
}

.like-item:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.like-item.liked {
  background: #fee2e2;
  border-color: #f87171;
}

.like-item.liked .like-icon {
  animation: heartBeat 0.6s ease-in-out;
}

.like-item.liking {
  opacity: 0.7;
  pointer-events: none;
}

.favorite-item {
  cursor: pointer;
  user-select: none;
}

.favorite-item:hover {
  background: #fffbeb;
  border-color: #fbbf24;
}

.favorite-item.favorited {
  background: #fef3c7;
  border-color: #f59e0b;
}

.favorite-item.favorited .favorite-icon {
  animation: starTwinkle 0.6s ease-in-out;
}

.favorite-item.favoriting {
  opacity: 0.7;
  pointer-events: none;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
}

@keyframes starTwinkle {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(5deg);
  }
  50% {
    transform: scale(1.3) rotate(-5deg);
  }
  75% {
    transform: scale(1.2) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.stat-icon {
  font-size: 18px;
  margin-bottom: 6px;
}

.stat-number {
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

/* 按钮样式 */
.action-buttons {
  margin-top: -15px;
  margin-bottom: -15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.download-btn {
  height: 30px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  background: #3b82f6;
  border: none;
  transition: all 0.3s ease;
}

.download-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.admin-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.edit-btn,
.delete-btn {
  height: 32px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 12px;
  transition: all 0.3s ease;
}

.edit-btn:hover,
.delete-btn:hover {
  transform: translateY(-1px);
}

/* 评论卡片 */
.comment-card {
  background: #ffffff;
  border-left: 4px solid #8b5cf6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #pictureDetailPage {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .params-grid {
    grid-template-columns: 1fr;
  }

  .admin-actions {
    grid-template-columns: 1fr;
  }
}
</style>
