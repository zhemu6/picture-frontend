<template>
  <div id="picture-search-form">
    <!--  搜索表单  -->
    {{searchParams}}
    <a-form style="margin-bottom: 16px" layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
        />
      </a-form-item>

      <a-form-item name="category" label="分类">
        <a-auto-complete
          v-model:value="searchParams.category"
          :options="categoryOptions"
          placeholder="输入图片分类"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="tags" style="min-width:200px" label="标签">
        <a-select
          v-model:value="searchParams.tags"
          :options="tagOptions"
          mode="tags"
          placeholder="输入图片标签"
        />
      </a-form-item>

      <a-form-item label="日期" name="dataRange">
        <a-range-picker
          style="width: 400px"
          show-time
          format="YYYY/MM/DD HH:mm:ss"
          v-model:value="dateRange"
          :placeholder="['编辑开始日期', '编辑结束日期']"
          :presets="rangePresets"
          @change="onRangeChange"
        />
      </a-form-item>

      <a-form-item label="名称" name="name">
        <a-input v-model:value="searchParams.name" placeholder="请输入名称" allow-clear />
      </a-form-item>

      <a-form-item label="简介" name="introduction">
        <a-input v-model:value="searchParams.introduction" placeholder="请输入简介" allow-clear />
      </a-form-item>

      <a-form-item label="宽度" name="picWidth">
        <a-input-number v-model:value="searchParams.picWidth" />
      </a-form-item>

      <a-form-item label="高度" name="picHeight">
        <a-input-number v-model:value="searchParams.picHeight" />
      </a-form-item>

      <a-form-item label="图片格式" name="picFormat">
        <a-input v-model:value="searchParams.picFormat" />
      </a-form-item>



      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button html-type="reset" @click="doClear">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <a-form-item>


    </a-form-item>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'

import { PIC_REVIEW_STATUS_OPTIONS } from '../constants/picture'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import {ColorPicker} from 'vue3-colorpicker'

interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()

// 搜索条件 todo 实现动态排序 根据点击列来给sortField和sortOrder赋值
const searchParams = reactive<API.PictureQueryRequest>({})

const doSearch = () => {
  props.onSearch?.(searchParams)
}

const dateRange = ref<[]>([])

type RangeValue = [Dayjs, Dayjs]
const onChange = (date: Dayjs) => {
  if (date) {
    console.log('Date: ', date)
  } else {
    console.log('Clear')
  }
}
const doClear=()  =>{
  // 取消所有对象的值
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  dateRange.value = []
  props.onSearch?.(searchParams)
}

const dataRange = ref<[]>([])
/**
 * 日期范围更改时触发
 * @param dates
 * @param dateStrings
 */
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if(dates?.length>=2){
  searchParams.startEditTime = dates[0].toDate()
  searchParams.endEditTime = dates[1].toDate()
  }else{
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}


// 时间范围预设
const rangePresets = ref([
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

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

onMounted(() => {
  getCategoryAndTagOptions()
})

</script>

<style scoped>
#picture-search-form {
  margin: 0 auto;
}
.picture-search-form .ant-form-item {
  margin-bottom: 16px;
}
</style>
