<template>
  <div id="spaceDetailPage">
    <a-flex>
      <h2>{{ space.spaceName }}的私有空间</h2>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank">
          + 创建图片</a-button
        >
      </a-space>
      <a-tooltip :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`">
        <a-progress
          type="circle"
          :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
          :size="80"
        ></a-progress>
      </a-tooltip>

      <a-tooltip :title="`占用条数 ${space.totalCount} / ${space.maxCount}`">
        <a-progress
          type="circle"
          :percent="((space.totalCount * 100) / space.maxCount).toFixed(1)"
          :size="80"
        ></a-progress>
      </a-tooltip>

    </a-flex>

    <!-- 瀑布流图片展示区域 - 使用组件 -->
    <div class="waterfall-section">
      <PictureList
        ref="waterfallDisplayRef"
        :picture-list="dataList"
        :loading="loading"
        :has-more="hasMore"
        :initial-column-width="280"
        @picture-click="doClickPicture"
        @image-loaded="onImageLoaded"
        :show-op="true"
        :on-reload="fetchData"
      />
    </div>

    <!-- 返回顶部按钮 -->
    <div v-show="showBackTop" class="back-to-top" @click="scrollToTop" title="返回顶部">
      <div class="back-to-top-icon">↑</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { formatSize } from '@/utils'
import {
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import PictureList from '@/components/PictureList.vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'

// 数据相关
const loading = ref(false)
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const hasMore = ref(true)
const showBackTop = ref(false)

interface Props {
  id: string | number
}

const props = defineProps<Props>()
// 组件引用
const waterfallDisplayRef = ref()
const space = ref<API.SpaceVO>({})
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

// 获取空间详情信息
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    console.log(res)
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败，' + e.message)
  }
}

// 获取空间内的图片数据
const fetchData = async (isLoadMore = false) => {
  if (loading.value) return

  loading.value = true
  const params = {
    spaceId: props.id,
    ...searchParams,
  }
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
  fetchSpaceDetail()
  getCategoryAndTagOptions()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
#spaceDetailPage {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
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


/* 响应式设计 */
@media (max-width: 768px) {
  #spaceDetailPage {
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
