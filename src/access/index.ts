/**
 * 全局权限校验核心文件
 */
import router from '@/router'
import { useLoginUserStore } from '@/stores/userLoginUserStore'
import { message } from 'ant-design-vue'
import { ACCESS_CONSTANTS } from '@/constants/access'
import checkAccess from '@/access/checkAccess'

router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser
  console.log('用户登录信息，', loginUser)

  // // 如果之前没登陆过，自动登录
  if (!loginUser || !loginUser.userRole) {
    // 加 await 是为了等用户登录成功之后，再执行后续的代码
    await loginUserStore.fetchLoginUser();
    loginUser = loginUserStore.loginUser;
  }

  // 获取当前路由需要的权限 如果meta.access为空 代表无需登录也行
  const needAccess = (to.meta?.access as string) ?? ACCESS_CONSTANTS.NOT_LOGIN

  // 如果要跳转的页面是必须要登录的页面
  if (needAccess !== ACCESS_CONSTANTS.NOT_LOGIN) {
    //如果没有登录，跳转到登录页面
    if (!loginUser || !loginUser.userRole || loginUser.userRole === ACCESS_CONSTANTS.NOT_LOGIN) {
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
    //用户已经登录，但是权限不足，那么就跳转到屋权限页面
    if (!checkAccess(loginUser, needAccess)) {
      next('/noAuth')
      return
    }
  }
  next()
})
