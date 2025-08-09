<template>
  <div class="user-manage-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-decoration"></div>
      <h1 class="page-title">用户管理</h1>
      <p class="page-subtitle">管理系统中的所有用户信息</p>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="section-header">
        <h3 class="section-title">搜索筛选</h3>
      </div>
      <div class="search-container">
        <a-form layout="inline" :model="searchParams" @finish="doSearch" class="search-form">
          <a-form-item label="用户账号" name="userAccount" class="search-item">
            <a-input
              v-model:value="searchParams.userAccount"
              placeholder="请输入用户账号"
              allow-clear
              class="search-input"
            />
          </a-form-item>
          <a-form-item label="用户昵称" name="userName" class="search-item">
            <a-input
              v-model:value="searchParams.userName"
              placeholder="请输入用户昵称"
              allow-clear
              class="search-input"
            />
          </a-form-item>
          <a-form-item class="search-buttons">
            <a-button type="primary" html-type="submit" class="search-btn"> 搜索 </a-button>
            <a-button @click="resetSearch" class="reset-btn"> 重置 </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-section">
      <div class="section-header">
        <h3 class="section-title">用户列表</h3>
        <div class="table-info">总共 {{ total }} 条记录</div>
      </div>
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
          @change="doTableChange"
          class="user-table"
          :loading="loading"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'userAvatar'">
              <a-avatar :src="record.userAvatar" class="user-avatar" :size="40">
                {{ record.userName?.charAt(0) }}
              </a-avatar>
            </template>
            <template v-else-if="column.dataIndex === 'createTime'">
              <span class="time-text">{{
                dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
              }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'userRole'">
              <a-tag v-if="record.userRole === 'admin'" color="red" class="role-tag">管理员</a-tag>
              <a-tag v-else color="blue" class="role-tag">普通用户</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <div class="action-buttons">
                <a-button
                  type="text"
                  danger
                  @click="doDelete(record.id)"
                  class="action-btn delete-btn"
                >
                  删除
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
import { deleteUserByIdUsingPost, listUserVoByPageUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

// 定义表格显示哪些列
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    align: 'center' as const,
  },
  {
    title: '用户账号',
    dataIndex: 'userAccount',
    width: 120,
  },
  {
    title: '用户昵称',
    dataIndex: 'userName',
    width: 120,
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    width: 80,
    align: 'center' as const,
  },
  {
    title: '用户简介',
    dataIndex: 'userProfile',
    ellipsis: true,
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
    width: 100,
    align: 'center' as const,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    align: 'center' as const,
  },
]

const dataList = ref<API.UserVO[]>([])
const total = ref<number>(0)
const loading = ref<boolean>(false)

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'desc',
  userAccount: '',
  userName: '',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listUserVoByPageUsingPost({ ...searchParams })
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

// 搜索功能
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchParams.current = 1
  searchParams.pageSize = 10
  searchParams.userAccount = ''
  searchParams.userName = ''
  fetchData()
}

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 分页配置
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
    const res = await deleteUserByIdUsingPost({ id })
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

// 页面加载时执行
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.user-manage-page {
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

.search-form .search-item {
  margin-bottom: 12px;
}

.search-input {
  width: 200px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.search-input:hover {
  border-color: rgba(102, 126, 234, 0.4);
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.search-buttons {
  margin-bottom: 12px;
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

.user-table :deep(.ant-table) {
  background: transparent;
}

.user-table :deep(.ant-table-thead > tr > th) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  font-weight: 600;
  color: #333;
}

.user-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid rgba(102, 126, 234, 0.05);
}

.user-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(102, 126, 234, 0.02);
}

.user-avatar {
  border: 2px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  border-color: #667eea;
  transform: scale(1.1);
}

.time-text {
  font-size: 12px;
  color: #8c8c8c;
}

.role-tag {
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .user-manage-page {
    padding: 12px;
  }

  .search-section,
  .table-section {
    padding: 12px;
  }

  .search-input {
    width: 160px;
  }

  .page-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .search-form {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .search-buttons {
    text-align: center;
  }
}
</style>
