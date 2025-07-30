import { ACCESS_CONSTANTS } from '@/constants/access'


/**
 * 检查权限（判断当前登录用户是否具有某个权限）
 * @param loginUser 当前登录用户
 * @param needAccess 需要有的权限
 * @return boolean 有无权限
 */
const checkAccess = (loginUser:any,needAccess = ACCESS_CONSTANTS.NOT_LOGIN) => {
  // 获取当前用户具有的权限 如果没有登录 就给他not login权限 否则就是真正的权限
  const loginUserAccess = loginUser?.userRole??ACCESS_CONSTANTS.NOT_LOGIN;

  // 如果需要的权限是无需登陆
  if(needAccess === ACCESS_CONSTANTS.NOT_LOGIN){
    return true;
  }

  // 如果需要的权限是登录用户
  if(needAccess === ACCESS_CONSTANTS.USER){
    // 如果用户没登录，那么表示无权限
    if (loginUserAccess === ACCESS_CONSTANTS.NOT_LOGIN) {
      return false;
    }
  }

  // 如果需要的权限是管理员
  if(needAccess === ACCESS_CONSTANTS.ADMIN){
    // 如果不为管理员，表示无权限
    if (loginUserAccess !== ACCESS_CONSTANTS.ADMIN) {
      return false;
    }
  }

  return true;

};

export default checkAccess;


