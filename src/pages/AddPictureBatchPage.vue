<template>
  <div id="addPictureBatchPage">
    <h2 style="margin-bottom: 16px">批量创建</h2>
    <!--图片上传组件-->

    <!--图片信息表单-->
    <a-form name="fromData" layout="vertical" :model="fromData" @finish="handleSubmit">
      <a-form-item name="searchText" label="关键词">
        <a-input v-model:value="fromData.searchText" placeholder="输入关键词" allow-clear />
      </a-form-item>
      <a-form-item name="count" label="抓取数量">
        <a-input-number
          v-model:value="fromData.count"
          placeholder="输入抓取图片数量"
          :min="1"
          :max="30"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="namePrefix" label="名称前缀">
        <a-input
          v-model:value="fromData.namePrefix"
          placeholder="输入名称前缀，自动补充序号"
          allow-clear
        />
      </a-form-item>

      <a-form-item name="category" label="分类">
        <a-auto-complete
          v-model:value="fromData.category"
          :options="categoryOptions"
          placeholder="输入图片分类"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="fromData.tags"
          :options="tagOptions"
          mode="tags"
          placeholder="输入图片标签"
        />
      </a-form-item>


      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading"
          >批量提交
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { listPictureTagCategoryUsingGet, uploadPictureByBatchUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)

const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

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

const fromData = reactive<API.PictureUploadByBatchRequest>({})
/**
 * 表单提交
 * @param values 输入的值
 */
const handleSubmit = async (values: any) => {
  loading.value = true
  try {
    const res = await uploadPictureByBatchUsingPost({
      ...fromData,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success(`创建成功！,总共新增 ${res.data.data} 条数据`)
      // 跳转到首页
      router.push({
        path: `/`,
      })
    } else {
      message.error('创建失败 ' + res.data.message)
    }
  } catch (e: any) {
    message.error(`创建失败 ${e.message}`)
  }
  loading.value = false
}

onMounted(() => {
  getCategoryAndTagOptions()
})


</script>
<style scoped>
#addPictureBatchPage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
