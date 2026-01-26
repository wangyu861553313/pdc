export default (
  initialState: API.UserInfo & { username?: string; userId?: string },
) => {
  // 在这里按照初始化数据定义项目中的权限，统一管理
  // 参考文档 https://umijs.org/docs/max/access

  // 优先检查 localStorage 中的 token，确保权限检查的可靠性
  // 这样可以避免 initialState 更新延迟导致的权限检查问题
  const token = localStorage.getItem('token');
  const hasToken = !!token;

  // 判断是否已登录：优先检查 token，其次检查 initialState
  const isLogin = !!(
    hasToken ||
    (initialState && initialState.username === 'admin')
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
