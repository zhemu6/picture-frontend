<template>
  <div id="spaceManagePage">
    <a-flex justify="space-between">
      <h2>空间管理</h2>
      <a-space>
        <a-button type="primary" href="/add_space" target="_blank"> 创建空间 </a-button>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px" />
    <!--  搜索表单  -->
    <a-form style="margin-bottom: 16px" layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="空间名称">
        <a-input
          v-model:value="searchParams.spaceName"
          placeholder="请输入空间名称"
          allow-clear
        />
      </a-form-item>

      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          style="min-width: 180px"
          v-model:value="searchParams.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请选择空间级别"
          allow-clear
        />
      </a-form-item>

      <a-form-item label="用户id">
        <a-input v-model:value="searchParams.userId" placeholder="请输入用户id" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <!--表格-->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      :scroll="{ x: 1400 }"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">

        <!--空间级别展示-->
        <template v-if="column.dataIndex === 'spaceLevel'">
          <div>空间级别：{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</div>
        </template>
        <!--空间的使用情况-->
        <template v-if="column.dataIndex === 'spaceUseInfo'">
          <div>大小：{{formatSize(record.totalSize)}}/{{formatSize(record.maxSize) }}</div>
          <div>数量：{{record.totalCount}}/{{ record.maxCount }}</div>
        </template>

        <!--标签展示-->
        <template v-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>


        <template v-else-if="column.dataIndex === 'spaceRole'">
          <div v-if="record.spaceRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">用户</a-tag>
          </div>
        </template>



        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-popconfirm
              title="你确定需要删除该图片吗？"
              ok-text="是"
              cancel-text="否"
              @confirm="doDelete(record.id)"
            >
              <a-button danger>删除</a-button>
            </a-popconfirm>

            <a-button type="link" :href="`/add_space?id=${record.id}`" target="_blank">
              编辑
            </a-button>

          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deleteSpaceUsingPost,
  listSpaceByPageUsingPost,
} from '@/api/spaceController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { formatSize } from '@/utils'

import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '@/constants/space'


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
const total = ref(0)
// 搜索条件 todo 实现动态排序 根据点击列来给sortField和sortOrder赋值
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 获取数据
const fetchData = async () => {
  const res = await listSpaceByPageUsingPost({ ...searchParams })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共${total}条`,
  }
})

// 删除数据
const doDelete = async (id: number) => {
  //
  if (!id) {
    return
  }
  const res = await deleteSpaceUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败')
  }
}

// 页面加载时执行的
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#spaceManagePage {
  margin: 0 auto;
}
</style>
