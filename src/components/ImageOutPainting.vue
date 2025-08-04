<template>
  <a-modal
    class="image-out-painting"
    v-model:visible="visible"
    title="AI拓图"
    :footer="false"
    @cancel="closeModal"
  >
    <a-row gutter="16">
      <a-col span="12">
        <h4>原始图片</h4>
        <img :src="picture?.url" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
      <a-col>
        <h4>生成图片</h4>
        <img
          v-if="resultImageUrl"
          :src="resultImageUrl"
          :alt="picture?.name"
          style="max-width: 100%"
        />
      </a-col>
    </a-row>
    <a-flex justify="center" gap="16">
      <a-button @click="createTask" :loading="!!taskId" type="primary" ghost> 生成图片 </a-button>
      <a-button v-if="resultImageUrl" @click="handleUpload" :loading="upLoading" type="primary"> 应用图片 </a-button>
    </a-flex>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
  uploadPictureUsingPost,
} from '@/api/pictureController'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const taskId = ref<string>('')
const loading = ref<boolean>(false)
const upLoading = ref<boolean>(false)
// 编辑器组件的引用
const cropperRef = ref()

const resultImageUrl = ref<string>('')

/**
 * 创建任务
 */
const createTask = async () => {
  if (!props.picture.id) {
    return
  }
  loading.value = true
  try {
    const res = await createPictureOutPaintingTaskUsingPost({
      pictureId: props.picture.id,
      //根据需要设置作图参数
      parameters: {
        xScale: 2,
        yScale: 2,
      },
    })
    if (res.data.code === 0 && res.data.data) {
      message.success('创建任务成功，请耐心等待，不要退出界面')
      console.log(res.data.data.output.taskId)
      taskId.value = res.data.data.output.taskId
      // 开启轮询
      startPolling()
    } else {
      message.error('图片上传失败')
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    loading.value = false
  }
}
// 轮询定时器
let pollingTimer: NodeJS.Timeout = null

// 开始轮询
const startPolling = () => {
  if (!taskId.value) return

  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        if (taskResult.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务成功')
          resultImageUrl.value = taskResult.outputImageUrl
          clearPolling()
        } else if (taskResult.taskStatus === 'FAILED') {
          message.error('扩图任务失败')
          clearPolling()
        }
      }
    } catch (error) {
      console.error('轮询任务状态失败', error)
      message.error('检测任务状态失败，请稍后重试')
      clearPolling()
    }
  }, 3000) // 每隔 3 秒轮询一次
}

// 清理轮询定时器
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = null
  }
}

// 清理定时器，避免内存泄漏
onMounted(() => {
  clearPolling()
})

/**
 * 上传图片
 */
const handleUpload = async () => {
  upLoading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId,
    }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      // 关闭弹窗
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    upLoading.value = false
  }
}

// 添加有关
// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}

// 暴露函数给父组件使用
defineExpose({
  openModal,
})
</script>

<style scoped>
.image-out-painting {
  text-align: center;
}

.image-out-painting .vue-cropper {
  height: 400px;
}
</style>
