<template>
  <div id="spaceDetailPage">
    <!-- 美化后的顶部区域 -->
    <div class="page-header">
      <a-card class="header-card" :bordered="false">
        <!-- 标题和基本信息 -->
        <div class="header-main">
          <div class="title-section">
            <div class="space-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div class="title-content">
              <h1 class="space-title">{{ space.spaceName }}</h1>
              <p class="space-type">{{ SPACE_TYPE_MAP[space.spaceType] }}</p>
            </div>
          </div>

          <!-- 操作按钮组 -->
          <div class="action-buttons">
            <a-button
              v-if="canUploadPicture"
              type="primary"
              size="large"
              class="primary-btn"
              :href="`/add_picture?spaceId=${id}`"
              target="_blank"
            >
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </template>
              创建图片
            </a-button>

            <a-dropdown v-if="canManageSpaceUser || canEditPicture">
              <a-button size="large" class="more-btn">
                <template #icon>
                  <EditOutlined />
                </template>
                管理
                <template #suffix>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </template>
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="canManageSpaceUser" key="1">
                    <a :href="`/spaceUserManage/${id}`" target="_blank">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="16"
                        height="16"
                        style="margin-right: 8px"
                      >
                        <path
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      团队成员管理
                    </a>
                  </a-menu-item>
                  <a-menu-item v-if="canManageSpaceUser" key="2">
                    <a :href="`/space_analyze?spaceId=${id}`" target="_blank">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="16"
                        height="16"
                        style="margin-right: 8px"
                      >
                        <path
                          d="M3 3v18h18v-2H5V3H3zm4 14h2v-6H7v6zm4 0h2V9h-2v8zm4 0h2v-4h-2v4z"
                        />
                      </svg>
                      空间分析
                    </a>
                  </a-menu-item>
                  <a-menu-item v-if="canEditPicture" key="3" @click="doBatchEdit">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="16"
                      height="16"
                      style="margin-right: 8px"
                    >
                      <path
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                      />
                    </svg>
                    批量编辑
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>

        <!-- 统计信息卡片 -->
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <h3 class="stat-title">存储使用</h3>
                <p class="stat-desc">
                  {{ formatSize(space.totalSize) }} / {{ formatSize(space.maxSize) }}
                </p>
              </div>
              <div class="stat-visual">
                <a-progress
                  type="circle"
                  :percent="Number(((space.totalSize * 100) / space.maxSize).toFixed(1))"
                  :size="40"
                  :stroke-width="4"
                  :stroke-color="{
                    '0%': '#87d068',
                    '50%': '#ffe58f',
                    '100%': '#ffccc7',
                  }"
                />
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <h3 class="stat-title">图片数量</h3>
                <p class="stat-desc">{{ space.totalCount }} / {{ space.maxCount }}</p>
              </div>
              <div class="stat-visual">
                <a-progress
                  type="circle"
                  :percent="Number(((space.totalCount * 100) / space.maxCount).toFixed(1))"
                  :size="40"
                  :stroke-width="4"
                  :stroke-color="{
                    '0%': '#108ee9',
                    '50%': '#87d068',
                    '100%': '#ffccc7',
                  }"
                />
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <h3 class="stat-title">总览</h3>
                <p class="stat-desc">{{ dataList.length }} 张图片</p>
              </div>
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                  <path
                    d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </a-card>
    </div>
    <!-- 搜索表单 -->
    <picture-search-form :on-search="onSearch" />

    <!-- 按颜色搜索 -->
    <a-form-item label="按颜色搜索" style="margin-top: 16px">
      <color-picker format="hex" @pureColorChange="onColorChange" :loading="loading" />
    </a-form-item>

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
        :canEdit="canEditPicture"
        :canDelete="canDeletePicture"
        :on-reload="fetchData"
      />
    </div>

    <!-- 返回顶部按钮 -->
    <div v-show="showBackTop" class="back-to-top" @click="scrollToTop" title="返回顶部">
      <div class="back-to-top-icon">↑</div>
    </div>

    <BatchEditPictureModal
      ref="batchEditPictureModalRef"
      :spaceId="id"
      :pictureList="dataList"
      :onSuccess="onBatchEditPictureSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import {
  reactive,
  ref,
  onMounted,
  onUnmounted,
  nextTick,
  h,
  watchEffect,
  watch,
  computed,
} from 'vue'
import { formatSize } from '@/utils'
import {
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import PictureList from '@/components/PictureList.vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { EditOutlined } from '@ant-design/icons-vue'
import { SPACE_PERMISSION_ENUM, SPACE_TYPE_MAP } from '../constants/space'

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

// 定义权限检查
// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// 组件引用
const waterfallDisplayRef = ref()
const space = ref<API.SpaceVO>({})
// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
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

// 搜索函数
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
  }
  searchParams.value.current = 1
  hasMore.value = true
  fetchData(false)
}

// 当颜色改变时触发的函数
const onColorChange = async (color: string) => {
  loading.value = true
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id,
  })
  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data ?? []
    dataList.value = data
    total.value = data.length
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

const batchEditPictureModalRef = ref()
const onBatchEditPictureSuccess = () => {
  fetchData()
}
const doBatchEdit = () => {
  console.log('点击了弹窗' + batchEditPictureModalRef.value)
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal()
  }
}
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
    ...searchParams.value,
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
  searchParams.value.current = (searchParams.value.current || 1) + 1
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

// 空间id 改变时 必须重新获取数据
watch(
  () => props.id,
  () => {
    fetchData()
    fetchSpaceDetail()
  },
)

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

/* 美化后的页面头部样式 */
.page-header {
  margin-bottom: 24px;
}

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header-card :deep(.ant-card-body) {
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* 主要头部区域 */
.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.space-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.title-content {
  flex: 1;
}

.space-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 2px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.space-type {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.action-buttons .ant-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.more-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 500;
  border: 2px solid #e2e8f0;
  background: white;
  transition: all 0.3s ease;
}

.more-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

/* 统计信息区域 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 4px 0;
}

.stat-desc {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.stat-visual {
  margin-left: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-left: 12px;
}

/* 下拉菜单样式 */
:deep(.ant-dropdown-menu) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #f1f5f9;
  padding: 8px;
}

:deep(.ant-dropdown-menu-item) {
  border-radius: 8px;
  margin: 2px 0;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

:deep(.ant-dropdown-menu-item:hover) {
  background: #f8fafc;
}

:deep(.ant-dropdown-menu-item a) {
  display: flex;
  align-items: center;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
}

/* 进度条自定义样式 */
:deep(.ant-progress-circle .ant-progress-text) {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-main {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }

  .action-buttons {
    width: 100%;
    justify-content: center;
  }

  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  #spaceDetailPage {
    padding: 16px;
  }

  .header-card :deep(.ant-card-body) {
    padding: 20px;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .space-icon {
    width: 48px;
    height: 48px;
  }

  .space-title {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .primary-btn,
  .more-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .stat-visual,
  .stat-icon {
    margin: 0;
  }
}
</style>
