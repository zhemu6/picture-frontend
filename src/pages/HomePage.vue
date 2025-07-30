<template>
  <div id = "homePage">
    <!-- 搜索框 -->
    <div class = "search-bat">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 分类和标签筛选 -->

    <!-- 图片列表 -->
    <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }" :pagination = "pagination" :loading="loading" :data-source="dataList">
      <template #renderItem="{ item: picture}">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a-card hoverable>
            <template #cover>
              <img
                style="height: 180px; object-fit: cover"
                :alt="picture.name"
                :src="picture.url"
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
import { listPictureTagCategoryUsingGet, listPictureVoByPageUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'

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
  loading.value=true
  const res = await listPictureVoByPageUsingPost({ ...searchParams })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value=false
}

const pagination =computed(()=>{
  return  {
    current:searchParams.current,
    pageSize:searchParams.pageSize,
    total:total.value,
    onChange:(page:number,pageSize:number) =>{
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    }
  }
})

const doSearch=()=>{
  // 重置页码
  searchParams.current = 1
  fetchData()
}

const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectCategory = ref<string>("all")
const selectTag = ref<string>("all")

const getCategoryAndTagOptions = async () => {
  try{
    const res = await listPictureTagCategoryUsingGet()
    if(res.data.code===0&&res.data.data){
      //console.log(res.data.data.categoryList)
      //console.log(res.data.data.tagList)
      tagList.value = res.data.data.tagList ?? []
      categoryList.value = res.data.data.categoryList ?? []
    }else {
      message.error('加载选项失败，' + res.data.message)

    }
  }catch (e:any) {
    message.error('加载选项失败，' + e.message)

  }
}


onMounted(() => {
  fetchData()
  getCategoryAndTagOptions()
})


</script>

<style scoped>

#homePage .search-bat{
  max-width: 480px;
  margin: 0 auto 16px;
}


</style>
