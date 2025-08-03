<template>
  <div id="addSpacePage">
    <h2 style="margin-bottom: 16px">{{ route.query?.id ? '修改空间' : '创建空间' }}</h2>

    <!--空间信息表单-->
    <a-form name="spaceForm" layout="vertical" :model="spaceForm" @finish="handleSubmit">
      <a-form-item name="name" label="空间名称">
        <a-input v-model:value="spaceForm.spaceName" placeholder="输入空间名称" allow-clear />
      </a-form-item>

      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请输入空间级别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <!-- 添加信息展示区域 用于展示级别 -->
      <a-card title="空间级别介绍">
        <a-typography-paragraph>
          * 目前仅支持开通普通版，如需升级空间，请联系
          <a href="https://github.com/zhemu6" target="_blank">管理员</a>。
        </a-typography-paragraph>
        <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
          {{ spaceLevel.text }}： 大小 {{ formatSize(spaceLevel.maxSize) }}， 数量
          {{ spaceLevel.maxCount }}
        </a-typography-paragraph>
      </a-card>

      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="loading" style="width: 100%"
          >{{ route.query?.id ? '修改' : '创建' }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { formatSize } from '@/utils'

import {
  addSpaceUsingPost,
  editSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost,
} from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS } from '@/constants/space'

const loading = ref(false)
const router = useRouter()


const uploadType = ref<'file' | 'url'>('file')

const space = ref<API.SpaceVO>()

const onSuccess = (newSpace: API.SpaceVO) => {
  space.value = newSpace
  spaceForm.spaceName = newSpace.spaceName
}

const spaceForm = reactive<API.SpaceAddRequest | API.SpaceEditRequest>({})
/**
 * 表单提交
 * @param values 输入的值
 */
const handleSubmit = async (values: any) => {
  // 现在提交的时候 我们有两个接口 一个是创建 一个是管理员修改
  // 如果spaceId存在
  loading.value = true
  const spaceId = space.value?.id
  let res
  try {
    // 如果spaceId存在 那么就是更新接口
    if (spaceId) {
      res = await updateSpaceUsingPost({ id: spaceId, ...spaceForm })
    } else {
      // 创建
      res = await addSpaceUsingPost({
        ...spaceForm,
      })
    }

    if (res.data.code === 0 && res.data.data) {
      message.success('操作成功！')
      // todo 这里在修改或者是保存后的 跳转到空间详情页的功能尚未开发 在里面通过看板展示我们的空间内部的照片 空间内的容量使用情况
      router.push({
        path: `/space/${res.data.data}`,
      })
    } else {
      message.error('操作 ' + res.data.message)
    }
  } catch (e: any) {
    message.error(`创建失败 ${e.message}`)
  }

  loading.value = false
}
// 获取空间级别信息 包含他的名称、大小
const spaceLevelList = ref<API.SpaceLevel[]>([])
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别失败，' + res.data.message)
  }
}

onMounted(() => {
  getOldSpaceInfo()
  fetchSpaceLevelList()
})

const route = useRoute()

// 获取旧的空间的信息
const getOldSpaceInfo = async () => {
  // 获取到id
  // const id = Number(route.query?.id)
  const id = route.query?.id as string // ✅ 保留为 string

  console.log(id)
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id: id,
    })
    console.log(res)
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      console.log(data)
      space.value = data
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }
  }
}
</script>
<style scoped>
#addSpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
