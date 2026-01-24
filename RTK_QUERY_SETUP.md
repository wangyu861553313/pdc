# RTK Query + umimax 配置说明

## 安装依赖

```bash
pnpm add @reduxjs/toolkit react-redux
```

## 项目结构

```
src/
├── store/
│   ├── index.ts              # Store 配置
│   ├── hooks.ts               # 类型化的 hooks
│   └── api/
│       ├── apiSlice.ts        # API Slice 基础配置
│       ├── baseQuery.ts       # BaseQuery 配置（包含错误处理）
│       └── userApi.ts         # 用户 API 示例
└── app.ts                     # Redux Provider 配置
```

## 使用方式

### 1. 在组件中使用 Query

```tsx
import { useGetUserListQuery } from '@/store/api/userApi';

function MyComponent() {
  const { data, isLoading, error, refetch } = useGetUserListQuery({
    current: 1,
    pageSize: 10,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return <div>{/* 使用 data */}</div>;
}
```

### 2. 使用 Mutation

```tsx
import { useAddUserMutation } from '@/store/api/userApi';

function AddUserForm() {
  const [addUser, { isLoading }] = useAddUserMutation();

  const handleSubmit = async (values: any) => {
    try {
      await addUser(values).unwrap();
      message.success('添加成功');
    } catch (err) {
      message.error('添加失败');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. 创建新的 API Slice

在 `src/store/api/` 目录下创建新的 API 文件，例如 `tableApi.ts`:

```tsx
import { apiSlice } from './apiSlice';

export const tableApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTableData: builder.query<ResponseType, ParamsType>({
      query: (params) => ({
        url: '/v1/table',
        method: 'GET',
        params,
      }),
      providesTags: ['Table'],
    }),
    // 更多端点...
  }),
});

export const { useGetTableDataQuery } = tableApi;
```

## 特性

1. **自动缓存管理**: RTK Query 自动管理请求缓存
2. **自动重新获取**: 支持 refetchOnFocus 和 refetchOnReconnect
3. **类型安全**: 完整的 TypeScript 支持
4. **错误处理**: 统一的错误处理机制
5. **标签失效**: 使用 tags 自动失效和重新获取相关数据

## 配置说明

### baseUrl 配置

在 `src/store/api/baseQuery.ts` 中修改 `baseUrl` 为你的 API 基础路径。

### 认证配置

在 `baseQuery.ts` 的 `prepareHeaders` 中添加认证 token:

```tsx
prepareHeaders: (headers) => {
  const token = localStorage.getItem('token');
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  return headers;
},
```

## 示例页面

查看 `src/pages/Example/index.tsx` 了解完整的使用示例。
