import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { history } from '@umijs/max';
import { message } from 'antd';

// 请求基础地址：.umirc define 注入 process.env.API_BASE_URL，默认 '/api'
function getBaseUrl(): string {
  const v =
    (typeof process !== 'undefined' && (process.env as any)?.API_BASE_URL) ||
    '';
  const s = (typeof v === 'string' ? v : '').replace(/^["']|["']$/g, '').trim();
  return (s || '/api').replace(/\/$/, '') || '/api';
}

export const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  timeout: 30000,
  credentials: 'same-origin',
  prepareHeaders: (headers, { arg }) => {
    const token = localStorage.getItem('token');
    if (token) headers.set('authorization', `Bearer ${token}`);
    const a =
      typeof arg === 'object' && arg && 'method' in arg
        ? (arg as { method?: string; body?: unknown })
        : null;
    if (
      a?.method &&
      ['POST', 'PUT', 'PATCH'].includes(a.method.toUpperCase()) &&
      'body' in a
    )
      headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error) {
    const { status, data } = result.error;
    const msg = (data as { message?: string })?.message;
    if (status === 401) {
      localStorage.removeItem('token');
      message.error('未授权，请重新登录');
      if (window.location.pathname !== '/login') history.push('/login');
    } else if (status === 403) message.error('没有权限访问');
    else if (status === 404) message.error('请求的资源不存在');
    else if (status === 500) message.error('服务器错误');
    else message.error(msg || '请求失败');
  }
  return result;
};
