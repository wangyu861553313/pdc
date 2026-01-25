export default (
  initialState: API.UserInfo & { username?: string; userId?: string },
) => {
  // 在这里按照初始化数据定义项目中的权限，统一管理
  // 参考文档 https://umijs.org/docs/max/access

  // 判断是否已登录：有 username 或 token 存在
  const isLogin = !!(
    initialState &&
    (initialState.username === 'admin' || localStorage.getItem('token'))
  );

  // 管理员权限
  const canSeeAdmin = !!(
    initialState &&
    initialState.name !== 'dontHaveAccess' &&
    isLogin
  );

  return {
    isLogin,
    canSeeAdmin,
  };
};
