<template>
  <div id="pictureDetailPage">
    <a-row :gutter="[16, 16]">
      <!--图片预览-->
      <a-col :sm="12" :md="16" :xl="18"></a-col>
      <a-card title="图片预览">
        <a-image :src="picture.url" style="max-height: 600px; object-fit: contain" />
      </a-card>
      <!-- 图片详情信息 -->
      <a-col :sm="12" :md="8" :xl="6">
        <a-card title="图片详情">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.user?.userAvatar" />
                <div>{{ picture.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ picture.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
            <a-descriptions-item label="相机型号">
              {{ picture.cameraModel ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="光圈值">
              {{ picture.fnumber ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="iso">
              {{ picture.iso ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="快门时间">
              {{ picture.exposureTime ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="焦距">
              {{ picture.focalLength ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="点赞数">
              {{ picture.likeCount ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="收藏数">
              {{ picture.favoriteCount ?? '-' }}
            </a-descriptions-item>
          </a-descriptions>
          <!-- 图片操作 -->
          <a-space wrap>
            <a-button :icon="h(CloudDownloadOutlined)" type="primary" @click="doDownload">
              免费下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>

            <a-button v-if="canEdit" :icon="h(EditOutlined)" type="default" @click="doEdit"> 编辑</a-button>
            <a-button v-if="canEdit" :icon="h(DeleteOutlined)" danger @click="doDelete"> 删除</a-button>


          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { formatSize,downloadImage } from '@/utils'
import dayjs from 'dayjs'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { EditOutlined,CloudDownloadOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import router from '@/router'

interface Props {
  id: string | number
}

const props = defineProps<Props>()

const picture = ref<API.PictureVO>({})

// 获取图片详情信息
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: props.id,
    })
    console.log(res)
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败，' + e.message)
  }
}
// 获得登录用户
const loginUserStore = useLoginUserStore()
// 权限校验
const canEdit = computed(() => {
  // 获取登录用户
  const loginUser = loginUserStore.loginUser
  // 如果没有登录
  if (!loginUser.id) {
    return false
  }
  // 获取图片的创建用户
  const user = picture.value.user || {}
  // 如果登录用户是图片的创建用户或者是管理员
  return loginUser.id === user.id || loginUser.userRole === 'admin'
})
// 编辑时间
const doEdit = () => {
    router.push('/add_picture?id=' + picture.value.id)
}
// 删除事件
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // await router.push('/')
    await router.push({ path: '/', force: true })

  } else {
    message.error('删除失败')
  }
}
// 文件下载
const doDownload = () =>{
  downloadImage(picture.value.url)
}


onMounted(() => {
  fetchPictureDetail()
})
</script>

<style scoped>
#pictureDetailPage {
  margin-bottom: 16px;
}
</style>
