<template>
  <a-modal
    class="image-cropper"
    v-model:visible="visible"
    title="编辑图片"
    :footer="false"
    @cancel="closeModal"
  >
    <vue-cropper
      v-if="imageUrl"
      class="vue-cropper"
      ref="cropperRef"
      :img="imageUrl"
      :autoCrop="true"
      :fixedBox="false"
      :outputSize="1"
      :centerBox="true"
      :canMoveBox="true"
      :info="true"
      :infoTrue="true"
      :full="true"
      outputType="png"
      :high="true"
      :canScale="true"
      :original="true"
      :quality="1"
      @realTime="handleRealTime"
    />

    <div style="margin-bottom: 16px" />
    <!--预览效果图-->
    <div class="show-preview">
      <div :style="previews.div" class="preview">
        <img :src="previews.url" :style="previews.img" />
      </div>
    </div>
    <div style="margin-bottom: 16px" />
    <!-- 图片协同操作 -->
    <div class="image-edit-actions" v-if="isTeamSpace">
      <a-space>
        <a-button v-if="editingUser" disabled>{{ editingUser?.userName }}正在编辑</a-button>
        <a-button v-if="canEnterEdit" @click="enterEdit">进入编辑</a-button>
        <a-button v-if="canExitEdit" @click="exitEdit">退出编辑</a-button>
      </a-space>
    </div>
    <div style="margin-bottom: 16px" />
    <!-- 图片操作 -->
    <div class="image-cropper-actions">
      <a-space>
        <a-button @click="rotateLeft" :disabled="!canEdit">向左旋转</a-button>
        <a-button @click="rotateRight" :disabled="!canEdit">向右旋转</a-button>
        <a-button @click="changeScale(1)" :disabled="!canEdit">放大</a-button>
        <a-button @click="changeScale(-1)" :disabled="!canEdit">缩小</a-button>
        <a-button type="primary" :loading="loading" @click="handleConfirm">确认裁剪</a-button>
      </a-space>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { ref, reactive, computed, watchEffect, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import PictureEditWebSocket from '@/utils/pictureEditWebSocket'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constants/picture'
import { SPACE_TYPE_ENUM } from '@/constants/space'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  spaceId?: number
  space?: API.SpaceVO
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
// 是否为团队空间
const isTeamSpace = computed(()=>{
  return props.space?.spaceType===SPACE_TYPE_ENUM.TEAM
})
const loading = ref<boolean>(false)
const cropperRef = ref()

// 预览数据
const previews = reactive({
  url: '',
  img: {},
  div: {},
})

// 实时预览方法
const handleRealTime = (data: any) => {
  previews.url = data.url
  previews.img = data.img
  previews.div = data.div
}

// 向左旋转
const rotateLeft = () => {
  cropperRef.value.rotateLeft()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}

// 向右旋转
const rotateRight = () => {
  cropperRef.value.rotateRight()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
}

// 缩放
const changeScale = (num: number) => {
  cropperRef.value.changeScale(num)
  if(num>0){
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
  }else {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
  }
}

// 确认裁剪
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], fileName, { type: blob.type })
    handleUpload({ file })
  })
}

// 上传图片
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    console.log('执行编辑图片后上传图片功能')
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      props.onSuccess?.(res.data.data)
      closeModal()
    } else {
      message.error('图片上传失败')
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    loading.value = false
  }
}

const visible = ref(false)

const openModal = () => {
  visible.value = true
}

const closeModal = () => {
  visible.value = false
  // 关闭弹窗 也要关闭连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
}

defineExpose({
  openModal,
})

// -----------实时编辑功能实现------

const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser

// 正在编辑的用户
const editingUser = ref<API.UserVO>()
// 当前用户是否可进入编辑 只有当正在编辑用户为空 才可以进入编辑
const canEnterEdit = computed(() => {
  return !editingUser.value
})
// 当前用户是否可退出编辑 只有当正在编辑用户为当前用户 才可以退出编辑
const canExitEdit = computed(() => {
  return editingUser.value?.id === loginUser.id
})
// 可以编辑 只有当正在编辑用户为当前用户 才可以编辑
const canEdit = computed(() => {
  // 如果不是团队空间 直接可以编辑
  if(!isTeamSpace)return true
  return editingUser.value?.id === loginUser.id
})
let websocket: PictureEditWebSocket | null = null
// 初始化websocket连接 绑定监听事件
const initWebSocket = () => {
  const pictureId = props.picture?.id
  if (!pictureId || !visible.value) return
  // 防止之前的websocket未释放
  if (websocket) {
    websocket.disconnect()
  }
  // 创建websocket实例
  websocket = new PictureEditWebSocket(pictureId)
  websocket.connect()

  // 定义一个onopen事件
  // websocket.on("open",(msg)=>{
  //   if(msg.user){
  //     editingUser.value = msg.user
  //   }
  // })
  // 监听一系列的事件
  // 监听通知消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
    console.log('收到通知消息：', msg)
    message.info(msg.message)
  })
  // 监听错误消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
    console.log('收到错误消息：', msg)
    message.error(msg.message)
  })

  // 监听进入编辑状态消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
    console.log('收到进入编辑状态消息：', msg)
    message.info(msg.message)
    editingUser.value = msg.user
  })

  // 监听退出编辑状态消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
    console.log('收到退出编辑状态消息：', msg)
    message.info(msg.message)
    editingUser.value = undefined
    console.log(editingUser.value)
  })

  // 监听用户编辑行为 消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
    console.log('收到编辑操作消息：', msg)
    message.info(msg.message)
    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        cropperRef.value.rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        cropperRef.value.rotateRight()
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        cropperRef.value.changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        cropperRef.value.changeScale(-1)
        break
    }
  })
}
// 监听pictureId 和 visible变化 初始化websocket连接
watchEffect(() => {
  // 团队空间才初始化
  if(isTeamSpace.value){
    initWebSocket()
  }

})
// 页面销毁时 断开webSocket连接
onUnmounted(() => {
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
})

// 进入编辑
const enterEdit = () => {
  if (websocket) {
    websocket.sendMessage({ type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT })
  }
}

// 退出编辑
const exitEdit = () => {
  if (websocket) {
    // 发送退出编辑状态的消息
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}
const editAction = (action: string) => {
  websocket?.sendMessage({
    type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
    editAction:action,
  })
}
</script>

<style scoped>
.image-cropper {
  text-align: center;
}

.image-cropper .vue-cropper {
  height: 400px;
}

.show-preview {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.preview {
  border: 1px solid #ccc;
  overflow: hidden;
  max-width: 200px;
  max-height: 200px;
}

.preview img {
  display: block;
}
</style>
