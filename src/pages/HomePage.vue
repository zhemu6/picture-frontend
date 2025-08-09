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

    <!-- 瀑布流图片展示区域 - 使用组件 -->
    <div class="waterfall-section">
      <PictureList
        ref="waterfallDisplayRef"
        :picture-list="dataList"
        :loading="loading"
        :has-more="hasMore"
        :initial-column-width="280"
        :can-edit="false"
        :can-delete="false"
        @picture-click="doClickPicture"
        @image-loaded="onImageLoaded"
      />
    </div>

    <!-- 返回顶部按钮 -->
    <div v-show="showBackTop" class="back-to-top" @click="scrollToTop" title="返回顶部">
      <div class="back-to-top-icon">↑</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRouter, useRoute } from 'vue-router'
import PictureList from '@/components/PictureList.vue'

// 数据相关
const loading = ref(false)
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const hasMore = ref(true)
const showBackTop = ref(false)

// 组件引用
const waterfallDisplayRef = ref()

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 筛选相关
const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectCategory = ref<string>('all')
const selectTagList = ref<string[]>([])

const router = useRouter()

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

// 获取分类和标签选项
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

// 点击图片跳转到图片详情页面
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 图片加载完成回调
const onImageLoaded = () => {
  // 可以在这里处理图片加载完成后的逻辑
  console.log('图片加载完成')
}

// 手动触发瀑布流重新布局
const redrawWaterfall = () => {
  if (waterfallDisplayRef.value) {
    waterfallDisplayRef.value.redrawMasonry()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  fetchData()
  getCategoryAndTagOptions()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
#homePage {
  min-height: 100vh;
  background: #f8fafc;
}

/* 顶部横幅区域 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 0 50px;
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: white;
}

.hero-subtitle {
  font-size: 1.1rem;
  margin-bottom: 30px;
  opacity: 0.9;
  font-weight: 400;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-input :deep(.ant-input) {
  border-radius: 8px 0 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 20px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
}

.search-input :deep(.ant-input):focus {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.search-input :deep(.ant-btn) {
  border-radius: 0 8px 8px 0 !important;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #667eea;
  padding: 0 24px;
  height: 48px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.search-input :deep(.ant-btn):hover {
  background: rgba(255, 255, 255, 1);
  color: #5a67d8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-tabs :deep(.ant-tabs-tab) {
  border-radius: 6px;
  margin: 0 2px;
  transition: all 0.2s ease;
}

.category-tabs :deep(.ant-tabs-tab-active) {
  background: #667eea;
  color: white !important;
  font-weight: 500;
}

.category-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: white !important;
}

.category-tabs :deep(.ant-tabs-tab):hover {
  background: #f8f9ff;
  color: #667eea;
}

.tag-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.tag-label {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #667eea;
  font-size: 15px;
}

.tag-icon {
  margin-right: 8px;
  font-size: 16px;
}

.custom-tag {
  border-radius: 6px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  transition: all 0.2s ease;
  font-weight: 400;
  font-size: 13px;
  background: white;
}

.custom-tag:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f8f9ff;
}

.custom-tag.ant-tag-checkable-checked {
  background: #667eea;
  border-color: #667eea;
  color: white;
  font-weight: 500;
}

/* 瀑布流区域 */
.waterfall-section {
  max-width: 1550px;
  margin: auto;
  padding: 0 20px 60px;
  box-sizing: border-box;
}

/* 返回顶部按钮 */
.back-to-top {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.back-to-top:hover {
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
@media (max-width: 992px) {
  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
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
  .hero-section {
    padding: 40px 0 30px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .tag-container {
    padding: 16px;
  }
}
</style>
