<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">{{ route.query?.id ? '修改图片' : '创建图片' }}</h2>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间:<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>

    <!--图片上传组件-->
    选择上传方式
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="Url上传" force-render>
        <UrlPictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
      </a-tab-pane>
    </a-tabs>

    <!--图片信息表单-->
    <a-form
      v-if="picture"
      name="pictureForm"
      layout="vertical"
      :model="pictureForm"
      @finish="handleSubmit"
    >
      <a-form-item name="name" label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="输入图片名称" allow-clear />
      </a-form-item>
      <a-form-item name="introduction" label="简介">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="输入图片简介"
          :autoSize="{ minRows: 2, maxRows: 5 }"
          allow-clear
        />
      </a-form-item>

      <a-form-item name="category" label="分类">
        <a-auto-complete
          v-model:value="pictureForm.category"
          :options="categoryOptions"
          placeholder="输入图片分类"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="pictureForm.tags"
          :options="tagOptions"
          mode="tags"
          placeholder="输入图片标签"
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%"
          >{{ route.query?.id ? '修改' : '创建' }}
        </a-button>
      </a-form-item>
    </a-form>
    <!--编辑图片按钮 包括 1.旋转 裁剪等常规操作、2.AI拓图、3.AI风格化  -->
    <div v-if="picture" class="edit-bar">
      <a-button :icon="h(EditOutlined)" @click="doEditPicture"> 编辑图片</a-button>
      <a-button :icon="h(EditOutlined)" @click="doOutpaintingPicture"> AI拓图</a-button>
      <a-button :icon="h(EditOutlined)" @click="doCommonSynthesisPicture"> AI风格化</a-button>
      <!-- 图片裁剪 -->
      {{ picture?.url }}
      <ImageCrop
        ref="imageCropperRef"
        :imageUrl="picture?.url"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onCropSuccess"
      />
      <!-- AI 拓图 -->
      <ImageOutPainting
        ref="imageOutpaintingRef"
        :spaceId="spaceId"
        :onSuccess="onOutPaintingSuccess"
        :picture="picture"
      />
      <!-- AI 风格化 -->
      <ImageCommonSynthesis
        ref="imageCommonSynthesisRef"
        :spaceId="spaceId"
        :onSuccess="onCommonSynthesisSuccess"
        :picture="picture"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import PictureUpload from '@/components/PictureUpload.vue'
import { computed, h, onMounted, reactive, ref } from 'vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import ImageCrop from '@/components/ImageCrop.vue'
import { EditOutlined } from '@ant-design/icons-vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'
import ImageCommonSynthesis from '@/components/ImageCommonSynthesis.vue'
const testImageUrl = 'https://www.codefather.cn/logo.png'
const router = useRouter()

const uploadType = ref<'file' | 'url'>('file')
// 空间id
const spaceId = computed(() => {
  return route.query?.spaceId
})

const picture = ref<API.PictureVO>()

const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}
const pictureForm = reactive<API.PictureEditRequest>({})
/**
 * 表单提交
 * @param values 输入的值
 */
const handleSubmit = async (values: any) => {
  try {
    const pictureId = picture.value?.id
    if (!pictureId) {
      return
    }
    const res = await editPictureUsingPost({
      id: pictureId,
      spaceId: spaceId.value,
      ...values,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success('创建成功！')
      // todo 这里在修改或者是保存后的 跳转到图片详情页的功能尚未开发
      router.push({
        path: `/picture/${pictureId}`,
      })
    } else {
      message.error('创建失败 ' + res.data.message)
    }
  } catch (e: any) {
    message.error(`创建失败 ${e.message}`)
  }
}

// 分类和标签
const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])
// 获取分类和标签
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
  getOldPictureInfo()
})

const route = useRoute()

// 获取旧的图片的信息
const getOldPictureInfo = async () => {
  // 获取到id  string
  const id = route.query?.id as string

  console.log(id)
  if (id) {
    const res = await getPictureVoByIdUsingGet({
      id: id,
    })
    console.log(res)
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      console.log(data)
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}

// 图片编辑弹窗引用
const imageCropperRef = ref()
const imageOutpaintingRef = ref()
const imageCommonSynthesisRef = ref()
// 编辑图片
const doEditPicture = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal()
  }
}

const doOutpaintingPicture = () => {
  if (imageOutpaintingRef.value) {
    imageOutpaintingRef.value.openModal()
  }
}

const doCommonSynthesisPicture = () => {
  if (imageCommonSynthesisRef.value) {
    imageCommonSynthesisRef.value.openModal()
  }
}

const onOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}
const onCommonSynthesisSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}
// 编辑成功事件
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}
</script>
<style scoped>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}

#addPicturePage .edit-bar {
  text-align: center;
  margin: 16px 0;
}
</style>
