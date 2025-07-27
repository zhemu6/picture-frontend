import { defineStore } from 'pinia'
import { ref } from 'vue'

// 全局状态管理 所有页面都要共享的变量 比如用户登录信息
// 一个状态就存储一类 定义状态初始值
export const useLoginUserStore =

  // 定义一个loginUser的初始值 默认为未登录
  defineStore('loginUser', () => {
  const loginUser = ref<any>({
    userName: '未登录',
  })

  // 获取用户登录
  async function fetchLoginUser() {
    // todo 由于后端还没提供接口，暂时注释
    // const res = await getCurrentUser();
    // if (res.data.code === 0 && res.data.data) {
    //   loginUser.value = res.data.data;
    // }
    setTimeout(() => {
      loginUser.value = {
        userName: '测试用户',
        id: 1
      }
    },3000)

  }

  // 设置登录用户 接受给的用户
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }


  // 返回一个登录用户
  return { loginUser, setLoginUser, fetchLoginUser }
})
