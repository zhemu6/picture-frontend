<template>
  <div id="homePage">
    <!-- 顶部横幅区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">云摄</h1>
        <p class="hero-subtitle">发现美好，分享精彩</p>

        <!-- 搜索框 -->
        <div class="search-container">
          <a-input-search
            v-model:value="searchParams.searchText"
            placeholder="从海量图片中搜索你想要的内容..."
            enter-button="搜索"
            size="large"
            class="search-input"
            @search="doSearch"
          />
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <!-- 分类标签 -->
      <div class="category-container">
        <a-tabs
          v-model:activeKey="selectCategory"
          @change="doSearch"
          class="category-tabs"
          type="card"
        >
          <a-tab-pane key="all" tab="全部" />
          <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
        </a-tabs>
      </div>

      <!-- 标签筛选 -->
      <div class="tag-container">
        <div class="tag-label">
          <span class="tag-icon">🏷️</span>
          <span>标签筛选</span>
        </div>
        <a-space :size="[8, 8]" wrap class="tag-list">
          <a-checkable-tag
            v-for="(tag, index) in tagList"
            :key="tag"
            v-model:checked="selectTagList[index]"
            @change="doSearch"
            class="custom-tag"
          >
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
    </div>

    <!-- 瀑布流图片展示区域 -->
    <div class="waterfall-section" ref="waterfallRef">
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
          v-for="picture in dataList"
          :key="picture.id"
          class="waterfall-item"
          @click="doClickPicture(picture)"
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
      <div v-if="!hasMore && dataList.length > 0 && !loading" class="no-more-container">
        <a-divider>
          <span class="no-more-text">您已到底，没有更多内容了 🎉</span>
        </a-divider>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && dataList.length === 0" class="empty-container">
        <a-empty description="暂无图片内容">
          <template #image>
            <div class="empty-icon">📷</div>
          </template>
        </a-empty>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <div v-show="showBackTop" class="back-to-top" @click="scrollToTop" title="返回顶部">
      <div class="back-to-top-icon">↑</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, nextTick } from 'vue'
import { EyeOutlined, HeartOutlined } from '@ant-design/icons-vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const loading = ref(false)
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const hasMore = ref(true)
const waterfallRef = ref<HTMLElement>()
const showBackTop = ref(false)

// 瀑布流列宽
const columnWidth = ref(280)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async (isLoadMore = false) => {
  if (loading.value) return

  loading.value = true
  const params = {
    ...searchParams,
    tags: [] as string[],
  }

  if (selectCategory.value !== 'all') {
    params.category = selectCategory.value
  }

  selectTagList.value.forEach((useTag: string, index: number) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })

  try {
    const res = await listPictureVoByPageUsingPost({ ...params })
    if (res.data.code === 0 && res.data.data) {
      const newData = res.data.data.records ?? []

      if (isLoadMore) {
        dataList.value = [...dataList.value, ...newData]
      } else {
        dataList.value = newData
      }

      total.value = res.data.data.total ?? 0
      hasMore.value = dataList.value.length < total.value

      // 等待DOM更新后重新布局瀑布流
      await nextTick()
      if ((window as any).$redrawVueMasonry) {
        ;(window as any).$redrawVueMasonry()
      }
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('网络请求失败，请稍后重试')
  }

  loading.value = false
}

// 加载更多数据
const loadMore = async () => {
  if (!hasMore.value || loading.value) return

  searchParams.current = (searchParams.current || 1) + 1
  await fetchData(true)
}

// 搜索
const doSearch = () => {
  searchParams.current = 1
  hasMore.value = true
  fetchData(false)
}

// 滚动监听
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 显示/隐藏返回顶部按钮
  showBackTop.value = scrollTop > 300

  // 距离底部100px时开始加载
  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMore()
  }
}

// 返回顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

// 图片加载完成
const onImageLoad = async () => {
  await nextTick()
  if ((window as any).$redrawVueMasonry) {
    ;(window as any).$redrawVueMasonry()
  }
}

// 图片加载错误
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4='
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
    columnWidth.value = 280 // 固定宽度
  }
}

const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectCategory = ref<string>('all')
const selectTagList = ref<string[]>([])

const getCategoryAndTagOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      tagList.value = res.data.data.tagList ?? []
      categoryList.value = res.data.data.categoryList ?? []
    } else {
      message.error('加载选项失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('加载选项失败，' + e.message)
  }
}

const router = useRouter()

// 点击图片跳转到图片详情页面
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 获取分类颜色
const getCategoryColor = (category: string | undefined) => {
  const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan', 'magenta']
  if (!category) return 'default'
  const index = category.length % colors.length
  return colors[index]
}

onMounted(() => {
  updateColumnWidth()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', updateColumnWidth)

  fetchData()
  getCategoryAndTagOptions()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updateColumnWidth)
})
</script>

<style scoped>
#homePage {
  min-height: 100vh;
  background: #f8fafc;
}

/* 顶部横幅区域 */
.hero-section {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  padding: 60px 0 50px;
  text-align: center;
  color: #1e293b;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #e2e8f0;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.hero-subtitle {
  font-size: 1.1rem;
  margin-bottom: 30px;
  opacity: 0.9;
  font-weight: 300;
}

.search-container {
  max-width: 700px;
  margin: 0 auto;
}

.search-input {
  border-radius: 50px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.search-input :deep(.ant-input) {
  border-radius: 50px 0 0 50px;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
}

.search-input :deep(.ant-btn) {
  border-radius: 0 50px 50px 0 !important;
  background: #3b82f6;
  border: none;
  padding: 0 32px;
  height: 48px;
}

.search-input :deep(.ant-btn):hover {
  background: #2563eb;
}

/* 筛选区域 */
.filter-section {
  max-width: 1550px;
  margin: 0 auto 30px;
  padding: 0 20px;
}

.category-container {
  margin-bottom: 24px;
}

.category-tabs :deep(.ant-tabs-nav) {
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.category-tabs :deep(.ant-tabs-tab) {
  border-radius: 8px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

.category-tabs :deep(.ant-tabs-tab-active) {
  background: #3b82f6;
  color: white !important;
  font-weight: 600;
}

.category-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: white !important;
}

.tag-container {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.tag-label {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.tag-icon {
  margin-right: 8px;
  font-size: 16px;
}

.custom-tag {
  border-radius: 20px;
  padding: 4px 12px;
  border: 2px solid #e8e8e8;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 12px;
}

.custom-tag:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
}

.custom-tag.ant-tag-checkable-checked {
  background: #3b82f6;
  border-color: transparent;
  color: white;
  font-weight: 600;
}

/* 瀑布流区域 */
.waterfall-section {
  max-width: 1550px;
  margin: auto;
  padding: 0 20px 60px;
  box-sizing: border-box;
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

.like-btn:hover {
  color: #ff4757;
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

/* 返回顶部按钮 */
.back-to-top {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.back-to-top:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.back-to-top-icon {
  color: white;
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
  transition: all 0.3s ease;
}

.back-to-top:hover .back-to-top-icon {
  transform: translateY(-1px);
}

.back-to-top:active {
  transform: translateY(0) scale(0.95);
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

  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .waterfall-item {
    width: calc(50% - 10px);
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .filter-section {
    padding: 0 16px;
  }

  .waterfall-section {
    padding: 0 16px 60px;
  }
}

@media (max-width: 576px) {
  .waterfall-item {
    width: 100%;
  }

  .hero-section {
    padding: 40px 0 30px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .tag-container {
    padding: 16px;
  }

  .picture-info {
    padding: 12px;
  }
}
</style>
