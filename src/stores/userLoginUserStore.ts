import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLoginUserUsingGet } from '@/api/userController'


// 全局状态管理 所有页面都要共享的变量 比如用户登录信息
// 一个状态就存储一类 定义状态初始值
export const useLoginUserStore =
  // 定义一个loginUser的初始值 默认为未登录
  defineStore('loginUser', () => {
    const loginUser = ref<API.LoginUserVO>({
      userName: '未登录',
    })

    // 获取用户登录
    async function fetchLoginUser() {
      // 调用获取用户登录信息接口 看用户是否登录
      const res = await getLoginUserUsingGet()
      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data
      }
    }

    // 设置登录用户 接受给的用户
    function setLoginUser(newLoginUser: any) {
      loginUser.value = newLoginUser
    }

    // 返回一个登录用户
    return { loginUser, setLoginUser, fetchLoginUser }
  })
