import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { history } from '@umijs/max';
import { message } from 'antd';

// 创建基础 baseQuery，集成 umimax 的 request 配置
export const baseQuery = fetchBaseQuery({
  baseUrl: '/api', // 根据项目实际情况调整
  prepareHeaders: (headers) => {
    // 添加 token 等认证信息
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// 带错误处理的 baseQuery
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // 处理错误
  if (result.error) {
    const { status, data } = result.error;

    if (status === 401) {
      // 未授权，清除 token 并跳转到登录页
      localStorage.removeItem('token');
      message.error('未授权，请重新登录');
      // 避免在登录页重复跳转
      if (window.location.pathname !== '/login') {
        history.push('/login');
      }
    } else if (status === 403) {
      message.error('没有权限访问');
    } else if (status === 404) {
      message.error('请求的资源不存在');
    } else if (status === 500) {
      message.error('服务器错误');
    } else {
      const errorData = data as { message?: string };
      message.error(errorData?.message || '请求失败');
    }
  }

  return result;
};
