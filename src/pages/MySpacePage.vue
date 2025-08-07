<template>
  <div id="mySpacePage">
    <p>正在跳转，请稍后。。。</p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { SPACE_TYPE_ENUM } from '@/constants/space'

const router = useRouter()

const loginUserStore = useLoginUserStore()
// 检查用户是否有个人空间
const checkUserSpace = async () => {
  //1. 用户是否登录
  const loginUser = loginUserStore.loginUser
  if (!loginUser?.id) {
    router.replace('/user/login')
    return
  }
  //2.获取用户空间
  const res = await listSpaceVoByPageUsingPost({
    userId: loginUser.id,
    current: 1,
    pageSize: 1,
    spaceType: SPACE_TYPE_ENUM.PRIVATE,
  })
  if (res.data.code === 0) {
    if (res.data.data?.records?.length > 0) {
      const space = res.data.data.records[0]
      router.replace(`/space/${space.id}`)
    } else {
      // 如果空间不存在 跳转到添加空间页面
      router.replace('/add_space')
      message.warn('您还没有个人空间，请先创建一个个人空间！')
    }
  } else {
    message.error('加载获取空间失败，' + res.data.message)
  }
}

onMounted(() => {
  checkUserSpace()
})
</script>
<style scoped>
#mySpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
