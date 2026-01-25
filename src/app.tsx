// 运行时配置
import LogoutButton from '@/components/LogoutButton';
import { history } from '@umijs/max';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{
  name: string;
  username?: string;
  userId?: string;
}> {
  // 从 localStorage 读取 token，判断是否已登录
  const token = localStorage.getItem('token');
  if (token) {
    return {
      name: 'admin',
      username: 'admin',
      userId: '1',
    };
  }
  return { name: '@umijs/max' };
}

export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    actionsRender: () => <LogoutButton />,
  };
};

// 路由变化时的权限检查
export function onRouteChange({
  location,
}: {
  location: { pathname: string };
}) {
  const token = localStorage.getItem('token');
  const isLogin = !!token;
  const isLoginPage = location.pathname === '/login';

  // 如果未登录且不在登录页，跳转到登录页
  if (!isLogin && !isLoginPage) {
    history.push('/login');
  }
  // 如果已登录且在登录页，跳转到首页
  else if (isLogin && isLoginPage) {
    history.push('/home');
  }
}

// 配置 Redux Provider
export function rootContainer(container: React.ReactElement) {
  return <Provider store={store}>{container}</Provider>;
}
