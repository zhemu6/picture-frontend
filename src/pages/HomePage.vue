<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-bat">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 分类和标签筛选 -->
    <!-- 分类 -->
<!--    <a-tabs v-model:activeKey="selectCategory" @change="doSearch">-->
      <a-tabs v-model:activeKey="selectCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
    </a-tabs>
    <!-- 标签 -->
    <div class="tag-bar">
      <span style="margin-right: 8px">标签:</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :pagination="pagination"
      :loading="loading"
      :data-source="dataList"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a-card hoverable @click="doClickPicture(picture)">
            <template #cover>
              <img
                style="height: 180px; object-fit: cover"
                :alt="picture.name"
                :src="picture.thumbnailUrl??picture.url"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'


const loading = ref(true)
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
// 搜索条件 todo 实现动态排序 根据点击列来给sortField和sortOrder赋值
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索函数
  const params = {
    ...searchParams,
    tags:[] as string[],
  }
  if(selectCategory.value !== 'all'){
    params.category = selectCategory.value
    console.log(params.category)
  }
  selectTagList.value.forEach((useTag:string,index:number)=>{
    if(useTag){
      params.tags.push(tagList.value[index])
    }
  })
  console.log(params.tags)
  // const res = await listPictureVoByPageUsingPost(searchParams )
  const res = await listPictureVoByPageUsingPost({ ...params })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}
// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 12,
    total: total.value,
    // 切换页号时 会修改搜索参数并获取数据
    onChange: (page: number, pageSize: number) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    },
  }
})

const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectCategory = ref<string>('all')
const selectTagList =ref<string[]>([])


const getCategoryAndTagOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      tagList.value = res.data.data.tagList ?? []
      categoryList.value = res.data.data.categoryList ?? []
    } else {
      message.error('加载选项失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('加载选项失败，' + e.message)
  }
}
const router = useRouter();
// 点击图片跳转到图片详情页面
const doClickPicture =  (picture:API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}



onMounted(() => {
  fetchData()
  getCategoryAndTagOptions()
})
</script>

<style scoped>

#homePage{
  margin-bottom: 16px;
}

#homePage .search-bat {
  max-width: 480px;
  margin: 0 auto 16px;
}


#homePage .tag-bar{
  margin-bottom: 16px;
}
</style>
