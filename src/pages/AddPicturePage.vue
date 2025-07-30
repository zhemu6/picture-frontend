<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">{{route.query?.id? '修改图片':'创建图片'}}</h2>
    <!--图片上传组件-->
    <PictureUpload  :picture="picture" :onSuccess="onSuccess" />
    <!--图片信息表单-->
    <a-form  v-if="picture" name="pictureForm" layout="vertical" :model="pictureForm" @finish="handleSubmit">
      <a-form-item name="name" label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="输入图片名称" allow-clear />
      </a-form-item>
      <a-form-item name="introduction" label="简介">
        <a-textarea v-model:value="pictureForm.introduction" placeholder="输入图片简介" :autoSize = "{ minRows:2,maxRows:5}" allow-clear/>
      </a-form-item>
      <a-form-item name="category"  label="分类">
        <a-auto-complete v-model:value="pictureForm.category" :options="categoryOptions" placeholder="输入图片分类" allow-clear  />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select v-model:value="pictureForm.tags" :options="tagOptions" mode="tags" placeholder="输入图片标签"  />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">{{route.query?.id? '修改':'创建'}}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, reactive, ref } from 'vue'
import { editPictureUsingPost, getPictureVoByIdUsingGet, listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
const router = useRouter();


const picture = ref<API.PictureVO>();
const onSuccess = (newPicture:API.PictureVO) =>{
  picture.value = newPicture;
  pictureForm.name = newPicture.name;
}
const pictureForm = reactive<API.PictureEditRequest>({})
/**
 * 表单提交
 * @param values 输入的值
 */
const handleSubmit = async (values: any) => {
  try{
    const pictureId = picture.value?.id;
    if(!pictureId){
      return
    }
    const res = await editPictureUsingPost({
      id: pictureId,
      ...values})
    if(res.data.code===0&&res.data.data){
      message.success("创建成功！")
      // todo 这里在修改或者是保存后的 跳转到图片详情页的功能尚未开发
      router.push({
        path: `/picture/${pictureId}`
      })
    }else {
      message.error("创建失败 "+res.data.message)
    }
  }catch (e:any) {
    message.error(`创建失败 ${e.message}`)
  }
}

const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])
const getCategoryAndTagOptions = async () => {
  try{
    const res = await listPictureTagCategoryUsingGet()
    if(res.data.code===0&&res.data.data){
      //console.log(res.data.data.categoryList)
      //console.log(res.data.data.tagList)
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

    }else {
      message.error('加载选项失败，' + res.data.message)

    }
  }catch (e:any) {
    message.error('加载选项失败，' + e.message)

  }
}

onMounted(()=>{
  getCategoryAndTagOptions()
  getOldPictureInfo()
})

const route = useRoute()

// 获取旧的图片的信息
const getOldPictureInfo = async ()=>{
  // 获取到id
  // const id = Number(route.query?.id)
  const id = route.query?.id as string; // ✅ 保留为 string

  console.log(id)
  if(id){
    const res = await getPictureVoByIdUsingGet({
      id: id,
    })
    console.log(res)
    if(res.data.code===0&&res.data.data){
      const data = res.data.data;
      console.log(data)
      picture.value = data;
      pictureForm.name =  data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}




</script>
<style scoped>


#addPicturePage{
  max-width: 720px;
  margin: 0 auto;
}

</style>
