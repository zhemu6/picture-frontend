<template>
  <div class="search-container">
    <!-- 简洁的搜索卡片 -->
    <a-card class="search-card" :bordered="false">
      <!-- 主搜索区域 -->
      <div class="main-search-area">
        <a-input-search
          v-model:value="searchParams.searchText"
          placeholder="搜索图片名称、简介、标签..."
          enter-button="搜索"
          size="large"
          @search="doSearch"
          allow-clear
        />

        <!-- 快速筛选标签 -->
        <div class="quick-filters" v-if="!showAdvanced">
          <a-space wrap>
            <a-tag
              v-for="category in categoryOptions.slice(0, 6)"
              :key="category.value"
              :color="searchParams.category === category.value ? 'blue' : 'default'"
              class="filter-tag"
              @click="handleQuickFilter('category', category.value)"
            >
              {{ category.label }}
            </a-tag>
            <a-button
              type="text"
              size="small"
              class="more-filters-btn"
              @click="showAdvanced = !showAdvanced"
            >
              <FilterOutlined />
              {{ showAdvanced ? '收起筛选' : '更多筛选' }}
            </a-button>
          </a-space>
        </div>
      </div>

      <!-- 高级搜索区域 -->
      <div v-if="showAdvanced" class="advanced-area">
        <a-divider orientation="left">
          <span class="divider-text">高级搜索</span>
        </a-divider>

        <a-form :model="searchParams" @finish="doSearch" class="advanced-form">
          <a-row :gutter="[16, 16]">
            <a-col :xs="24" :sm="12" :lg="8">
              <a-form-item label="分类">
                <a-auto-complete
                  v-model:value="searchParams.category"
                  :options="categoryOptions"
                  placeholder="选择分类"
                  allow-clear
                />
              </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="12" :lg="8">
              <a-form-item label="标签">
                <a-select
                  v-model:value="searchParams.tags"
                  :options="tagOptions"
                  mode="tags"
                  placeholder="选择标签"
                />
              </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="12" :lg="8">
              <a-form-item label="格式">
                <a-select v-model:value="searchParams.picFormat" placeholder="图片格式" allow-clear>
                  <a-select-option value="jpg">JPG</a-select-option>
                  <a-select-option value="png">PNG</a-select-option>
                  <a-select-option value="gif">GIF</a-select-option>
                  <a-select-option value="webp">WebP</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="12" :lg="8">
              <a-form-item label="宽度">
                <a-input-number
                  v-model:value="searchParams.picWidth"
                  placeholder="像素"
                  style="width: 100%"
                  :min="1"
                />
              </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="12" :lg="8">
              <a-form-item label="高度">
                <a-input-number
                  v-model:value="searchParams.picHeight"
                  placeholder="像素"
                  style="width: 100%"
                  :min="1"
                />
              </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="24" :lg="8">
              <a-form-item label="日期">
                <a-range-picker
                  v-model:value="dateRange"
                  format="YYYY/MM/DD"
                  :placeholder="['开始', '结束']"
                  @change="onRangeChange"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <a-space>
              <a-button type="primary" html-type="submit">
                <SearchOutlined />
                搜索
              </a-button>
              <a-button @click="doClear">
                <ReloadOutlined />
                重置
              </a-button>
              <a-button type="text" @click="showAdvanced = false">
                <UpOutlined />
                收起
              </a-button>
            </a-space>
          </div>
        </a-form>
      </div>
    </a-card>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { SearchOutlined, FilterOutlined, ReloadOutlined, UpOutlined } from '@ant-design/icons-vue'
import { PIC_REVIEW_STATUS_OPTIONS } from '../constants/picture'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { ColorPicker } from 'vue3-colorpicker'

interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()

// 显示高级搜索
const showAdvanced = ref(false)

// todo 实现动态排序 根据点击列来给sortField和sortOrder赋值
const searchParams = reactive<API.PictureQueryRequest>({})

const doSearch = () => {
  props.onSearch?.(searchParams)
}

// 快速筛选处理
const handleQuickFilter = (type: string, value: string) => {
  if (type === 'category') {
    searchParams.category = searchParams.category === value ? undefined : value
    doSearch()
  }
}

const dateRange = ref<[]>([])

type RangeValue = [Dayjs, Dayjs]
const onChange = (date: Dayjs) => {
  if (date) {
    console.log('Date: ', date)
  } else {
    console.log('Clear')
  }
}
const doClear = () => {
  // 取消所有对象的值
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  dateRange.value = []
  props.onSearch?.(searchParams)
}

const dataRange = ref<[]>([])
/**
 * 日期范围更改时触发
 * @param dates
 * @param dateStrings
 */
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates?.length >= 2) {
    searchParams.startEditTime = dates[0].toDate()
    searchParams.endEditTime = dates[1].toDate()
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}

// 时间范围预设
const rangePresets = ref([
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

const categoryOptions = ref<Array<{ value: string; label: string }>>([])
const tagOptions = ref<Array<{ value: string; label: string }>>([])

const getCategoryAndTagOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
        return {
          value: data,
          label: data,
        }
      })
      categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
        return {
          value: data,
          label: data,
        }
      })
    } else {
      message.error('加载选项失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('加载选项失败，' + e.message)
  }
}

onMounted(() => {
  getCategoryAndTagOptions()
})
</script>

<style scoped>
/* 美化后的搜索组件样式 - 与头部保持一致 */
.search-container {
  margin-bottom: 24px;
}

.search-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.search-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.search-card :deep(.ant-card-body) {
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
}

/* 主搜索区域 */
.main-search-area {
  margin-bottom: 16px;
}

/* 快速筛选标签 */
.quick-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.filter-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: 2px solid transparent;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.filter-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.filter-tag[color='blue'] {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
}

.more-filters-btn {
  color: #667eea;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 12px;
  height: auto;
  border-radius: 6px;
  background: white;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.more-filters-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-1px);
}

/* 高级搜索区域 */
.advanced-area {
  border-top: 2px solid rgba(102, 126, 234, 0.1);
  padding-top: 16px;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 16px;
}

.divider-text {
  color: #667eea;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.advanced-form {
  margin-top: 16px;
}

.advanced-form :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.advanced-form :deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 2px solid rgba(102, 126, 234, 0.1);
}

.action-buttons :deep(.ant-btn) {
  border-radius: 8px;
  font-weight: 600;
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.action-buttons :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.action-buttons :deep(.ant-btn-primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-buttons :deep(.ant-btn:not(.ant-btn-primary)) {
  background: white;
  border: 2px solid #e2e8f0;
  color: #374151;
}

.action-buttons :deep(.ant-btn:not(.ant-btn-primary):hover) {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.action-buttons :deep(.ant-btn-text) {
  color: #6b7280;
  border: none;
  background: transparent;
}

.action-buttons :deep(.ant-btn-text:hover) {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.action-buttons :deep(.ant-btn-primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.action-buttons :deep(.ant-btn:not(.ant-btn-primary)) {
  background: white;
  border: 2px solid #e2e8f0;
  color: #374151;
}

.action-buttons :deep(.ant-btn:not(.ant-btn-primary):hover) {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.action-buttons :deep(.ant-btn-text) {
  color: #6b7280;
  border: none;
  background: transparent;
}

.action-buttons :deep(.ant-btn-text:hover) {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-card :deep(.ant-card-body) {
    padding: 20px;
  }

  .advanced-area {
    padding: 16px;
  }

  .quick-filters {
    padding: 12px;
    gap: 8px;
  }

  .filter-tag {
    padding: 6px 12px;
    font-size: 13px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons :deep(.ant-btn) {
    width: 100%;
  }
}

/* 标签选择器美化 */
.advanced-form :deep(.ant-select-selection-item) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 8px;
}

.advanced-form :deep(.ant-select-selection-item-remove) {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.advanced-form :deep(.ant-select-selection-item-remove:hover) {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

/* 分割线美化 */
:deep(.ant-divider-horizontal.ant-divider-with-text-left::before) {
  border-top: 2px solid rgba(102, 126, 234, 0.2);
}

:deep(.ant-divider-horizontal.ant-divider-with-text-left::after) {
  border-top: 2px solid rgba(102, 126, 234, 0.2);
}

/* 自动完成下拉框美化 */
.advanced-form :deep(.ant-select-dropdown) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.advanced-form :deep(.ant-select-item-option-selected) {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 500;
}
</style>
