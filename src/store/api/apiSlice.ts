import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// 创建 API Slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Table'], // 定义标签类型，用于缓存失效
  endpoints: () => ({}), // 端点将在其他文件中定义
});

// 确保导出
export type ApiSlice = typeof apiSlice;
