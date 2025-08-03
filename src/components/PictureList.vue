<template>
  <div class="picture-list" ref="waterfallRef">
    <div
      v-masonry
      transition-duration="0.3s"
      item-selector=".waterfall-item"
      class="waterfall-container"
      :column-width="columnWidth"
      :gutter="20"
    >
      <div
        v-masonry-tile
        v-for="picture in pictureList"
        :key="picture.id"
        class="waterfall-item"
        @click="handlePictureClick(picture)"
      >
        <div class="picture-card">
          <div class="picture-cover">
            <img
              :src="picture.thumbnailUrl ?? picture.url"
              :alt="picture.name"
              class="picture-image"
              loading="lazy"
              @load="onImageLoad"
              @error="onImageError"
            />

            <div class="picture-overlay">
              <div class="overlay-content">
                <div class="overlay-actions">
                  <a-button type="primary" shape="circle" size="large" class="action-btn">
                    <template #icon>
                      <EyeOutlined />
                    </template>
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <div class="picture-info">
            <h3 class="picture-title">{{ picture.name }}</h3>
            <!-- 图片简介 -->
            <p class="picture-description" v-if="picture.introduction">
              {{
                picture.introduction && picture.introduction.length > 20
                  ? picture.introduction.substring(0, 35) + '...'
                  : picture.introduction
              }}
            </p>
            <!-- 图片信息 -->
            <div class="picture-meta">
              <div class="picture-tags">
                <a-tag
                  :color="getCategoryColor(picture.category)"
                  class="category-tag"
                  size="small"
                >
                  {{ picture.category ?? '默认' }}
                </a-tag>
                <a-tag
                  v-for="tag in picture.tags?.slice(0, 2)"
                  :key="tag"
                  class="content-tag"
                  size="small"
                >
                  {{ tag }}
                </a-tag>
                <span v-if="picture.tags && picture.tags.length > 2" class="more-tags">
                  +{{ picture.tags.length - 2 }}
                </span>
              </div>
            </div>
            <!-- 图片操作 -->
            <div v-if="showOp" class="picture-actions">
              <a-space @click.stop="doEdit(picture, $event)">
                <EditOutlined />
                编辑
              </a-space>
              <a-space @click.stop="doDelete(picture, $event)">
                <DeleteOutlined />
                删除
              </a-space>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
      <p class="loading-text">正在加载精彩内容...</p>
    </div>

    <!-- 没有更多数据提示 -->
    <div v-if="!hasMore && pictureList.length > 0 && !loading" class="no-more-container">
      <a-divider>
        <span class="no-more-text">您已到底，没有更多内容了 🎉</span>
      </a-divider>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && pictureList.length === 0" class="empty-container">
      <a-empty description="暂无图片内容">
        <template #image>
          <div class="empty-icon">📷</div>
        </template>
      </a-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { EyeOutlined,EditOutlined,DeleteOutlined } from '@ant-design/icons-vue'
import router from '@/router'
import { deletePictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import * as path from 'node:path'

// 定义 Props
interface Props {
  // 图片列表数据
  pictureList: API.PictureVO[]
  // 加载状态
  loading?: boolean
  // 是否展示操作
  showOp?:boolean
  // 是否还有更多数据
  hasMore?: boolean
  // 初始列宽
  initialColumnWidth?: number
  // 重新加载
  onReload?: () => void
}

// 定义 Emits
interface Emits {
  // 点击图片事件
  (event: 'picture-click', picture: API.PictureVO): void
  // 图片加载完成事件
  (event: 'image-loaded'): void
}

const props = withDefaults(defineProps<Props>(), {
  pictureList: () => [],
  loading: false,
  hasMore: true,
  showOp:false,
  initialColumnWidth: 280
})

const emit = defineEmits<Emits>()

// 响应式数据
const waterfallRef = ref<HTMLElement>()
const columnWidth = ref(props.initialColumnWidth)

// 点击图片处理
const handlePictureClick = (picture: API.PictureVO) => {
  emit('picture-click', picture)
}

// 图片加载完成
const onImageLoad = async () => {
  await nextTick()
  if ((window as any).$redrawVueMasonry) {
    ;(window as any).$redrawVueMasonry()
  }
  emit('image-loaded')
}


// 编辑事件
const doEdit = (picture:API.PictureVO,e:MouseEvent) => {
  // 阻止冒泡 冒泡指的是父组件上也绑定了事件 防止这两个冲突
  e.stopPropagation()
  router.push({
    path: "/add_picture",
    query: { id: picture.id ,
    spaceId: picture.spaceId}
  })
}

// 删除事件
const doDelete = async (picture:API.PictureVO,e:MouseEvent) => {
  // 阻止冒泡 冒泡指的是父组件上也绑定了事件 防止这两个冲突
  e.stopPropagation()
  const id = picture.id
  if (!id) return

  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    props.onReload?.()
    // todo 这里我们是在刷新后手动刷新一次页面 来确保瀑布流显示正常
    setTimeout(() => {
      window.location.reload()
    }, 200) // 延迟500ms后刷新，让用户看到删除成功提示
  } else {
    message.error('删除失败')
  }
}


// 图片加载错误
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4='
}

// 获取分类颜色
const getCategoryColor = (category: string | undefined) => {
  const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan', 'magenta']
  if (!category) return 'default'
  const index = category.length % colors.length
  return colors[index]
}

// 响应式列宽调整
const updateColumnWidth = () => {
  const width = window.innerWidth
  if (width < 576) {
    columnWidth.value = width - 40 // 单列，留边距
  } else if (width < 768) {
    columnWidth.value = (width - 60) / 2 // 两列
  } else if (width < 992) {
    columnWidth.value = (width - 80) / 3 // 三列
  } else if (width < 1200) {
    columnWidth.value = (width - 100) / 4 // 四列
  } else if (width < 1600) {
    columnWidth.value = (width - 120) / 5 // 五列
  } else {
    columnWidth.value = props.initialColumnWidth // 使用传入的初始宽度
  }
}

// 重新布局瀑布流
const redrawMasonry = async () => {
  await nextTick()
  if ((window as any).$redrawVueMasonry) {
    ;(window as any).$redrawVueMasonry()
  }
}

// 监听数据变化，重新布局
watch(
  () => props.pictureList,
  async () => {
    await redrawMasonry()
  },
  { deep: true }
)

// 暴露方法给父组件
defineExpose({
  redrawMasonry,
  updateColumnWidth
})

onMounted(() => {
  updateColumnWidth()
  window.addEventListener('resize', updateColumnWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnWidth)
})
</script>

<style scoped>
.picture-list {
  width: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.waterfall-container {
  width: 100%;
  flex: 1;
}

.waterfall-item {
  width: 280px;
  margin-bottom: 20px;
  break-inside: avoid;
}

.picture-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.picture-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e1;
}

.picture-cover {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.picture-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.picture-card:hover .picture-image {
  transform: scale(1.05);
}

.picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.picture-card:hover .picture-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
}

.overlay-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #333;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: white;
  transform: scale(1.1);
}

.picture-info {
  padding: 16px;
}

.picture-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.picture-description {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 12px 0;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
  font-style: italic;
  transition: all 0.3s ease;
}

.picture-description:hover {
  background: #f1f5f9;
  color: #475569;
}

.picture-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.category-tag {
  border-radius: 8px;
  font-weight: 600;
}

.content-tag {
  border-radius: 8px;
  background: #f8f9fa;
  color: #6c757d;
  border: none;
}

.more-tags {
  color: #999;
  font-size: 11px;
  font-weight: 500;
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 40px 0;
}

.loading-text {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}

.no-more-container {
  padding: 40px 0;
}

.no-more-text {
  color: #999;
  font-size: 14px;
}

.empty-container {
  padding: 60px 0;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .waterfall-item {
    width: calc(20% - 16px);
  }
}

@media (max-width: 1200px) {
  .waterfall-item {
    width: calc(25% - 15px);
  }
}

@media (max-width: 992px) {
  .waterfall-item {
    width: calc(33.333% - 14px);
  }
}

@media (max-width: 768px) {
  .waterfall-item {
    width: calc(50% - 10px);
  }
}

@media (max-width: 576px) {
  .waterfall-item {
    width: 100%;
  }
}
</style>
