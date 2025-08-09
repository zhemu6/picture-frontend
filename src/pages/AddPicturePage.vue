<template>
  <div class="add-picture-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          {{ route.query?.id ? '修改图片' : '创建图片' }}
        </h1>
        <p v-if="spaceId" class="space-info">
          保存至空间:
          <a :href="`/space/${spaceId}`" target="_blank" class="space-link">{{ spaceId }}</a>
        </p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 图片上传区域 -->
      <div class="upload-section">
        <div class="section-header">
          <h3 class="section-title">选择上传方式</h3>
        </div>
        <div class="upload-tabs">
          <a-tabs v-model:activeKey="uploadType" class="custom-tabs">
            <a-tab-pane key="file" tab="文件上传">
              <PictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
            </a-tab-pane>
            <a-tab-pane key="url" tab="URL上传" force-render>
              <UrlPictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <!-- 编辑工具栏 -->
      <div v-if="picture" class="edit-section">
        <div class="section-header">
          <h3 class="section-title">图片编辑工具</h3>
        </div>
        <div class="edit-tools">
          <a-button class="edit-tool-btn" @click="doEditPicture">
            <EditOutlined />
            编辑图片
          </a-button>
          <a-button class="edit-tool-btn" @click="doOutpaintingPicture">
            <EditOutlined />
            AI拓图
          </a-button>
          <a-button class="edit-tool-btn" @click="doCommonSynthesisPicture">
            <EditOutlined />
            AI风格化
          </a-button>
        </div>

        <!-- 隐藏的组件 -->
        <ImageCrop
          ref="imageCropperRef"
          :imageUrl="picture?.url"
          :picture="picture"
          :spaceId="spaceId"
          :onSuccess="onCropSuccess"
          :space="space"
        />
        <ImageOutPainting
          ref="imageOutpaintingRef"
          :spaceId="spaceId"
          :onSuccess="onOutPaintingSuccess"
          :picture="picture"
        />
        <ImageCommonSynthesis
          ref="imageCommonSynthesisRef"
          :spaceId="spaceId"
          :onSuccess="onCommonSynthesisSuccess"
          :picture="picture"
        />
      </div>

      <!-- 图片信息表单 -->
      <div v-if="picture" class="form-section">
        <div class="section-header">
          <h3 class="section-title">图片信息</h3>
        </div>
        <div class="form-container">
          <a-form
            name="pictureForm"
            layout="vertical"
            :model="pictureForm"
            @finish="handleSubmit"
            class="picture-form"
          >
            <a-form-item name="name" label="名称" class="form-item">
              <a-input
                v-model:value="pictureForm.name"
                placeholder="输入图片名称"
                allow-clear
                class="custom-input"
              />
            </a-form-item>

            <a-form-item name="introduction" label="简介" class="form-item">
              <a-textarea
                v-model:value="pictureForm.introduction"
                placeholder="输入图片简介"
                :autoSize="{ minRows: 3, maxRows: 6 }"
                allow-clear
                class="custom-textarea"
              />
            </a-form-item>

            <a-form-item name="category" label="分类" class="form-item">
              <a-auto-complete
                v-model:value="pictureForm.category"
                :options="categoryOptions"
                placeholder="输入图片分类"
                allow-clear
                class="custom-input"
              />
            </a-form-item>

            <a-form-item name="tags" label="标签" class="form-item">
              <a-select
                v-model:value="pictureForm.tags"
                :options="tagOptions"
                mode="tags"
                placeholder="输入图片标签"
                class="custom-select"
              />
            </a-form-item>

            <a-form-item class="submit-item">
              <a-button type="primary" html-type="submit" class="submit-button">
                {{ route.query?.id ? '修改图片' : '创建图片' }}
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import PictureUpload from '@/components/PictureUpload.vue'
import { computed, h, onMounted, reactive, ref, watchEffect } from 'vue'
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
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
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
// 获取空间信息
const space = ref<API.SpaceVO>()
// 获取空间信息
const fetchSpace = async () => {
  // 获取数据
  if (spaceId.value) {
    const res = await getSpaceVoByIdUsingGet({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }
  }
}

watchEffect(() => {
  fetchSpace()
})
</script>
<style scoped>
.add-picture-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px 16px 0 0;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.space-info {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.space-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.space-link:hover {
  color: #4f46e5;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 通用区域样式 */
.upload-section,
.form-section,
.edit-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-section:hover,
.form-section:hover,
.edit-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.12);
  border-color: rgba(102, 126, 234, 0.2);
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 2px;
}

/* 上传区域样式 */
.upload-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 12px;
}

.upload-tabs :deep(.ant-tabs-content-holder) {
  border-radius: 0 0 8px 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-top: none;
  background: rgba(255, 255, 255, 0.5);
  padding: 16px;
}

/* 表单样式 */
.form-container {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(102, 126, 234, 0.05);
}

.picture-form .form-item {
  margin-bottom: 16px;
}

/* 表单样式 */
.form-container {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(102, 126, 234, 0.05);
}

.picture-form .form-item {
  margin-bottom: 20px;
}

.picture-form :deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.custom-input,
.custom-textarea,
.custom-select {
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.custom-input:hover,
.custom-textarea:hover,
.custom-select:hover {
  border-color: rgba(102, 126, 234, 0.4);
}

.custom-input:focus,
.custom-textarea:focus,
.custom-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.submit-item {
  margin-bottom: 0;
  margin-top: 32px;
}

.submit-button {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.submit-button:active {
  transform: translateY(0);
}

/* 编辑工具栏样式 */
.edit-tools {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.edit-tool-btn {
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  color: #667eea;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
}

.edit-tool-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.edit-tool-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .add-picture-page {
    padding: 16px;
  }

  .page-header,
  .upload-section,
  .form-section,
  .edit-section {
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .edit-tools {
    flex-direction: column;
  }

  .edit-tool-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .add-picture-page {
    padding: 12px;
  }

  .page-header,
  .upload-section,
  .form-section,
  .edit-section {
    padding: 16px;
  }

  .form-container {
    padding: 16px;
  }
}
</style>
