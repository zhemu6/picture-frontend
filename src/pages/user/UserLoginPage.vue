<template>
  <div id="userLoginPage">
    <h2 class="title">云摄 - 用户登录</h2>
    <h3 class="desc">开源摄影作品分享网站</h3>
    <a-form :model="formState" name="basic" @finish="handleSubmit">
      <a-form-item
        name="userAccount"
        :rules="[{ required: true, message: '请输入账号!' },
                {min: 4, message: '账号长度不能小于4位'}]"
      >
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[{ required: true, message: '请输入密码!' },
            {min: 8, message: '密码长度不能小于8位'}]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <!-- 跳转到注册页面 -->
      <div class = "tips">
        还没有账号？
        <RouterLink to="/user/register">立刻注册</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { userLoginUsingPost } from '@/api/userController'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { message } from 'ant-design-vue'
import router from '@/router'

// 用户登录状态
const loginUserStore = useLoginUserStore()

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})
/**
 * 表单提交
 * @param values 输入的值
 */
const handleSubmit = async (values: any) => {
  try{
    const res = await userLoginUsingPost(values)
    // 用户登录成功  保存登录态 跳转到首页
    if(res.data.code===0&&res.data.data){
      await loginUserStore.fetchLoginUser();
      message.success("登录成功！")
      router.push({
        path: '/',
        replace: true
      })
    }else {
      message.error("登录失败 "+res.data.message)
    }
  }catch (e:any) {
    message.error(`登录失败 ${e.message}`)
  }
}
</script>

<style scoped>
#userLoginPage {
  max-width: 360px;
  margin: 0 auto;
}

.title{
text-align: center;
  margin-bottom: 16px;
}

.desc{
  text-align: right;
  color: #bbb;
  margin-bottom: 16px;
}

.tips{
  color: #bbb;
  text-align: right;
  font-size: 13px;
  margin-bottom: 16px;
}

</style>
