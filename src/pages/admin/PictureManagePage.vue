<template>
  <div class="picture-manage-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-decoration"></div>
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">图片管理</h1>
          <p class="page-subtitle">管理和审核平台图片资源</p>
        </div>
        <div class="header-actions">
          <a-button
            type="primary"
            href="/add_picture"
            target="_blank"
            class="action-btn primary-btn"
          >
            创建图片
          </a-button>
          <a-button type="primary" ghost href="/add_picture/batch" class="action-btn ghost-btn">
            批量创建
          </a-button>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="section-header">
        <h3 class="section-title">搜索筛选</h3>
      </div>
      <div class="search-container">
        <a-form layout="inline" :model="searchParams" @finish="doSearch" class="search-form">
          <a-form-item label="关键词" class="search-item">
            <a-input
              v-model:value="searchParams.searchText"
              placeholder="从名称和简介搜索"
              allow-clear
              class="search-input"
            />
          </a-form-item>
          <a-form-item label="类型" class="search-item">
            <a-input
              v-model:value="searchParams.category"
              placeholder="请输入类型"
              allow-clear
              class="search-input"
            />
          </a-form-item>
          <a-form-item label="标签" name="tags" class="search-item">
            <a-select
              v-model:value="searchParams.tags"
              mode="tags"
              placeholder="请输入标签"
              allow-clear
              class="search-select"
            />
          </a-form-item>
          <a-form-item name="reviewStatus" label="审核状态" class="search-item">
            <a-select
              v-model:value="searchParams.reviewStatus"
              :options="PIC_REVIEW_STATUS_OPTIONS"
              placeholder="选择审核状态"
              allow-clear
              class="search-select"
            />
          </a-form-item>
          <a-form-item class="search-buttons">
            <a-button type="primary" html-type="submit" class="search-btn">搜索</a-button>
            <a-button @click="handleReset" class="reset-btn">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-section">
      <div class="section-header">
        <h3 class="section-title">图片列表</h3>
        <div class="table-info">总共 {{ total }} 条记录</div>
      </div>
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
          :scroll="{ x: 1440 }"
          @change="doTableChange"
          :row-key="(record) => record.id"
          class="picture-table"
          :loading="loading"
        >
          <template #bodyCell="{ column, record }">
            <!--图片展示-->
            <template v-if="column.dataIndex === 'url'">
              <a-image :src="record.url" alt="" class="picture-preview" />
            </template>

            <!--标签展示-->
            <template v-if="column.dataIndex === 'tags'">
              <a-space wrap>
                <a-tag
                  v-for="tag in JSON.parse(record.tags || '[]')"
                  :key="tag"
                  class="picture-tag"
                >
                  {{ tag }}
                </a-tag>
              </a-space>
            </template>

            <!--图片信息列-->
            <template v-if="column.dataIndex === 'picInfo'">
              <div class="pic-info">
                <div class="info-item">格式：{{ record.picFormat }}</div>
                <div class="info-item">宽度：{{ record.picWidth }}</div>
                <div class="info-item">高度：{{ record.picHeight }}</div>
                <div class="info-item">宽高比：{{ record.picScale }}</div>
                <div class="info-item">大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
              </div>
            </template>

            <template v-else-if="column.dataIndex === 'pictureRole'">
              <div v-if="record.pictureRole === 'admin'">
                <a-tag color="green" class="role-tag">管理员</a-tag>
              </div>
              <div v-else>
                <a-tag color="blue" class="role-tag">用户</a-tag>
              </div>
            </template>

            <!--审核信息列-->
            <template v-if="column.dataIndex === 'reviewMessage'">
              <div class="review-info">
                <div class="info-item">
                  审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}
                </div>
                <div class="info-item">审核信息：{{ record.reviewMessage }}</div>
                <div class="info-item">审核人：{{ record.reviewerId }}</div>
                <div v-if="record.reviewTime" class="info-item">
                  审核时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
                </div>
              </div>
            </template>

            <template v-else-if="column.dataIndex === 'createTime'">
              <span class="time-text">{{
                dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
              }}</span>
            </template>

            <template v-else-if="column.dataIndex === 'editTime'">
              <span class="time-text">{{
                dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss')
              }}</span>
            </template>

            <template v-else-if="column.key === 'action'">
              <div class="action-buttons">
                <a-popconfirm
                  title="你确定需要删除该图片吗？"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="doDelete(record.id)"
                >
                  <a-button danger class="action-btn delete-btn">删除</a-button>
                </a-popconfirm>

                <a-button
                  type="link"
                  :href="`/add_picture?id=${record.id}`"
                  target="_blank"
                  class="action-btn edit-btn"
                >
                  编辑
                </a-button>

                <a-button
                  v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                  type="primary"
                  @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
                  class="action-btn approve-btn"
                >
                  通过
                </a-button>

                <a-popconfirm
                  title="你确定需要拒绝该图片吗？"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
                >
                  <a-button
                    v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                    danger
                    class="action-btn reject-btn"
                  >
                    拒绝
                  </a-button>
                </a-popconfirm>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '../../constants/picture'

// 定义表格显示哪些列
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    fixed: 'left',
    sorter: true,
    align: 'center' as const,
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 80,
    align: 'center' as const,
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 150,
    ellipsis: true,
    sorter: true,
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    width: 120,
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
    width: 80,
    align: 'center' as const,
    sorter: true,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: 80,
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 120,
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    width: 80,
    align: 'center' as const,
    sorter: true,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    width: 200,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 90,
    align: 'center' as const,
    sorter: true,
    defaultSortOrder: 'descend',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    width: 90,
    align: 'center' as const,
    sorter: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 240,
    fixed: 'right',
    align: 'center' as const,
  },
]

const dataList = ref<API.PictureVO[]>([])
const total = ref<number>(0)
const loading = ref<boolean>(false)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listPictureByPageUsingPost({
      ...searchParams,
      nullSpaceId: true,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 重置搜索表单
const handleReset = () => {
  searchParams.current = 1
  searchParams.pageSize = 10
  searchParams.searchText = ''
  searchParams.category = ''
  searchParams.tags = []
  searchParams.reviewStatus = undefined
  fetchData()
}

const doTableChange = (pagination: any, filters: any, sorter: any) => {
  // 处理分页
  searchParams.current = pagination.current
  searchParams.pageSize = pagination.pageSize

  // 处理排序
  if (sorter && sorter.field) {
    searchParams.sortField = sorter.field
    searchParams.sortOrder = sorter.order === 'ascend' ? 'ascend' : 'descend'
  }

  fetchData()
}

const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `总共 ${total} 条`,
  }
})

// 删除数据
const doDelete = async (id: number) => {
  if (!id) {
    return
  }

  try {
    const res = await deletePictureUsingPost({ id })
    if (res.data.code === 0) {
      message.success('删除成功')
      // 刷新数据
      fetchData()
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    message.error('删除失败')
  }
}

// 审核图片功能实现
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员审核通过' : '管理员审核拒绝'

  try {
    const res = await doPictureReviewUsingPost({
      id: record.id,
      reviewStatus: reviewStatus,
      reviewMessage: reviewMessage,
    })
    if (res.data.code === 0) {
      message.success('审核操作成功')
      // 刷新数据
      fetchData()
    } else {
      message.error('审核操作失败，' + res.data.message)
    }
  } catch (error) {
    message.error('审核操作失败')
  }
}

// 页面加载时执行的
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.picture-manage-page {
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 13px;
  color: #8c8c8c;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  height: 36px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.ghost-btn {
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: #667eea;
}

.ghost-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

/* 通用区域样式 */
.search-section,
.table-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-section:hover,
.table-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.table-info {
  font-size: 13px;
  color: #8c8c8c;
}

/* 搜索区域样式 */
.search-container {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(102, 126, 234, 0.05);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.search-item {
  margin-bottom: 0;
}

.search-input {
  width: 200px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.search-select {
  width: 180px;
  height: 32px;
}

.search-select :deep(.ant-select-selector) {
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.search-input:hover,
.search-select :deep(.ant-select-selector):hover {
  border-color: rgba(102, 126, 234, 0.4);
}

.search-input:focus,
.search-select :deep(.ant-select-focused .ant-select-selector) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.search-buttons {
  margin-bottom: 0;
}

.search-btn {
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  margin-right: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.reset-btn {
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: #667eea;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

/* 表格区域样式 */
.table-container {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(102, 126, 234, 0.05);
}

.picture-table :deep(.ant-table) {
  background: transparent;
}

.picture-table :deep(.ant-table-thead > tr > th) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  font-weight: 600;
  color: #333;
}

.picture-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid rgba(102, 126, 234, 0.05);
}

.picture-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(102, 126, 234, 0.02);
}

/* 图片预览样式 */
.picture-preview {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.picture-preview:hover {
  border-color: #667eea;
  transform: scale(1.1);
}

/* 标签样式 */
.picture-tag,
.role-tag {
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 信息展示样式 */
.pic-info,
.review-info {
  font-size: 12px;
}

.info-item {
  margin-bottom: 2px;
  color: #666;
}

.time-text {
  font-size: 12px;
  color: #8c8c8c;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.action-btn {
  height: 28px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.delete-btn,
.reject-btn {
  border: 1px solid rgba(255, 77, 79, 0.2);
}

.delete-btn:hover,
.reject-btn:hover {
  background: rgba(255, 77, 79, 0.1);
}

.edit-btn {
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.edit-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.approve-btn {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
}

.approve-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .picture-manage-page {
    padding: 12px;
  }

  .search-section,
  .table-section {
    padding: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .form-row {
    flex-direction: column;
    gap: 8px;
  }

  .search-input,
  .search-select {
    width: 100%;
  }

  .page-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
