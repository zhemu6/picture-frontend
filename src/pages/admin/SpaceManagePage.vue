<template>
  <div class="space-manage-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-decoration"></div>
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">空间管理</h1>
          <p class="page-subtitle">管理和分析平台空间资源</p>
        </div>
        <div class="header-actions">
          <a-button type="primary" href="/add_space" target="_blank" class="action-btn primary-btn">
            创建空间
          </a-button>
          <a-button
            type="primary"
            ghost
            :href="`/space_analyze?queryPublic=1`"
            target="_blank"
            class="action-btn ghost-btn"
          >
            分析公共图库
          </a-button>
          <a-button
            type="primary"
            ghost
            :href="`/space_analyze?queryAll=1`"
            target="_blank"
            class="action-btn ghost-btn"
          >
            分析全部空间
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
          <a-form-item label="空间名称" class="search-item">
            <a-input
              v-model:value="searchParams.spaceName"
              placeholder="请输入空间名称"
              allow-clear
              class="search-input"
            />
          </a-form-item>
          <a-form-item name="spaceLevel" label="空间级别" class="search-item">
            <a-select
              v-model:value="searchParams.spaceLevel"
              :options="SPACE_LEVEL_OPTIONS"
              placeholder="请选择空间级别"
              allow-clear
              class="search-select"
            />
          </a-form-item>
          <a-form-item name="spaceType" label="空间类别" class="search-item">
            <a-select
              v-model:value="searchParams.spaceType"
              :options="SPACE_TYPE_OPTIONS"
              placeholder="请选择空间类别"
              allow-clear
              class="search-select"
            />
          </a-form-item>
          <a-form-item label="用户ID" class="search-item">
            <a-input
              v-model:value="searchParams.userId"
              placeholder="请输入用户ID"
              allow-clear
              class="search-input"
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
        <h3 class="section-title">空间列表</h3>
        <div class="table-info">总共 {{ total }} 条记录</div>
      </div>
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
          :scroll="{ x: 1400 }"
          @change="doTableChange"
          :row-key="(record) => record.id"
          class="space-table"
          :loading="loading"
        >
          <template #bodyCell="{ column, record }">
            <!-- 空间级别展示 -->
            <template v-if="column.dataIndex === 'spaceLevel'">
              <a-tag class="level-tag" :color="getLevelColor(record.spaceLevel)">
                {{ SPACE_LEVEL_MAP[record.spaceLevel] }}
              </a-tag>
            </template>

            <!-- 空间的使用情况 -->
            <template v-if="column.dataIndex === 'spaceUseInfo'">
              <div class="usage-info">
                <div class="info-item">
                  大小：{{ formatSize(record.totalSize) }}/{{ formatSize(record.maxSize) }}
                </div>
                <div class="info-item">数量：{{ record.totalCount }}/{{ record.maxCount }}</div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{
                      width: `${Math.min((record.totalSize / record.maxSize) * 100, 100)}%`,
                    }"
                  ></div>
                </div>
              </div>
            </template>

            <!-- 标签展示 -->
            <template v-if="column.dataIndex === 'tags'">
              <a-space wrap>
                <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag" class="space-tag">
                  {{ tag }}
                </a-tag>
              </a-space>
            </template>

            <template v-else-if="column.dataIndex === 'spaceRole'">
              <div v-if="record.spaceRole === 'admin'">
                <a-tag color="green" class="role-tag">管理员</a-tag>
              </div>
              <div v-else>
                <a-tag color="blue" class="role-tag">用户</a-tag>
              </div>
            </template>

            <template v-else-if="column.dataIndex === 'spaceType'">
              <a-tag class="type-tag" :color="getTypeColor(record.spaceType)">
                {{ SPACE_TYPE_MAP[record.spaceType] }}
              </a-tag>
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
                  title="你确定需要删除该空间吗？"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="doDelete(record.id)"
                >
                  <a-button danger class="action-btn delete-btn">删除</a-button>
                </a-popconfirm>

                <a-button
                  type="link"
                  :href="`/add_space?id=${record.id}`"
                  target="_blank"
                  class="action-btn edit-btn"
                >
                  编辑
                </a-button>
                <a-button
                  type="link"
                  :href="`/space_analyze?spaceId=${record.id}`"
                  target="_blank"
                  class="action-btn analyze-btn"
                >
                  分析
                </a-button>
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
import { deleteSpaceUsingPost, listSpaceByPageUsingPost } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { formatSize } from '@/utils'

import {
  SPACE_LEVEL_MAP,
  SPACE_LEVEL_OPTIONS,
  SPACE_TYPE_MAP,
  SPACE_TYPE_OPTIONS,
} from '@/constants/space'

// 定义表格显示哪些列
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '空间类别',
    dataIndex: 'spaceType',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

const dataList = ref<API.SpaceVO[]>([])
const total = ref<number>(0)
const loading = ref<boolean>(false)

// 搜索条件
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listSpaceByPageUsingPost({ ...searchParams })
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
  searchParams.spaceName = ''
  searchParams.spaceLevel = undefined
  searchParams.spaceType = undefined
  searchParams.userId = ''
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
    const res = await deleteSpaceUsingPost({ id })
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

// 获取级别颜色
const getLevelColor = (level: number) => {
  const colors = {
    0: 'blue',
    1: 'green',
    2: 'orange',
    3: 'red',
  }
  return colors[level] || 'default'
}

// 获取类型颜色
const getTypeColor = (type: number) => {
  const colors = {
    0: 'purple',
    1: 'cyan',
    2: 'geekblue',
  }
  return colors[type] || 'default'
}

// 页面加载时执行的
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.space-manage-page {
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

.space-table :deep(.ant-table) {
  background: transparent;
}

.space-table :deep(.ant-table-thead > tr > th) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  font-weight: 600;
  color: #333;
}

.space-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid rgba(102, 126, 234, 0.05);
}

.space-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(102, 126, 234, 0.02);
}

/* 标签样式 */
.level-tag,
.type-tag,
.space-tag,
.role-tag {
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 使用情况样式 */
.usage-info {
  font-size: 12px;
}

.info-item {
  margin-bottom: 4px;
  color: #666;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
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

.delete-btn {
  border: 1px solid rgba(255, 77, 79, 0.2);
}

.delete-btn:hover {
  background: rgba(255, 77, 79, 0.1);
}

.edit-btn {
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.edit-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.analyze-btn {
  border: 1px solid rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.analyze-btn:hover {
  background: rgba(82, 196, 26, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .space-manage-page {
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

  .search-form {
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
