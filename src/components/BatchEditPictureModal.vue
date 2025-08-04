<template>
  <div class="batch-edit-picture">
  <a-modal v-model:visible="visible" title="批量编辑图片" :footer="false" @cancel="closeModal">
  <a-typography-paragraph> * 只对当前页面的图片生效</a-typography-paragraph>

    <!--图片信息表单-->
    <a-form
      name="formData"
      layout="vertical"
      :model="formData"
      @finish="handleSubmit"
    >
      <a-form-item name="nameRule" label="命名规则">
        <a-input v-model:value="formData.nameRule" placeholder="请输入命名规则，输入 {序号} 可动态生成" allow-clear />

      </a-form-item>

      <a-form-item name="category" label="分类">
        <a-auto-complete
          v-model:value="formData.category"
          :options="categoryOptions"
          placeholder="输入图片分类"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="formData.tags"
          :options="tagOptions"
          mode="tags"
          placeholder="输入图片标签"
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%"
        >提交
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, withDefaults, defineExpose, reactive, onMounted } from 'vue'
import { editPictureByBatchUsingPost, listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * 定义组件属性类型
 * 支持传入 title 标题和 link 分享链接属性，可以由父组件决定要分享的信息。
 */
interface Props {
  pictureList:API.PictureVO[]
  spaceId: number
  onSuccess:() => void
}

/**
 * 给组件指定初始值
 */
const props = withDefaults(defineProps<Props>(), {

})

// 初始化表单数据
const formData = reactive<API.PictureEditByBatchRequest>({
  category: '', // 分类
  tags: [], // 标签
  nameRule: '', // 命名规则
})


const router = useRouter()
const route = useRoute()
const picture = ref<API.PictureVO>()
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


/**
 * 表单提交
 * @param values 输入的值
 */
const handleSubmit = async (values: any) => {
  if(!props.pictureList) {
    return;
  }
  try {
    const res = await editPictureByBatchUsingPost({
      pictureIds:props.pictureList?.map((picture:API.PictureVO) => picture.id),
      spaceId: props.spaceId,
      ...values
    })
    if (res.data.code === 0 && res.data.data) {
      message.success('操作成功');
      closeModal();
      props.onSuccess?.();
    } else {
      message.error('操作失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error(`操作失败 ${e.message}`)
  }
}

// 暴露函数给父组件使用
defineExpose({
  openModal,
})


onMounted(() => {
  getCategoryAndTagOptions()
})


</script>
