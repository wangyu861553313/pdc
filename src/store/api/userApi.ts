import { apiSlice } from './apiSlice';

// 定义类型（根据实际 API 响应调整）
export interface UserInfo {
  userId?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

export interface UserListParams {
  keyword?: string;
  current?: number;
  pageSize?: number;
}

export interface UserListResponse {
  data?: {
    list?: UserInfo[];
    total?: number;
    current?: number;
    pageSize?: number;
  };
  success?: boolean;
  errorMessage?: string;
}

// 扩展 API Slice
export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 获取用户列表
    getUserList: builder.query<UserListResponse, UserListParams>({
      query: (params) => ({
        url: '/v1/queryUserList',
        method: 'GET',
        params,
      }),
      providesTags: ['User'],
    }),

    // 获取用户详情
    getUserDetail: builder.query<UserListResponse, string>({
      query: (userId) => ({
        url: `/v1/user/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // 添加用户
    addUser: builder.mutation<UserListResponse, Partial<UserInfo>>({
      query: (body) => ({
        url: '/v1/user',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // 更新用户
    updateUser: builder.mutation<
      UserListResponse,
      { userId: string; data: Partial<UserInfo> }
    >({
      query: ({ userId, data }) => ({
        url: `/v1/user/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    // 删除用户
    deleteUser: builder.mutation<UserListResponse, string>({
      query: (userId) => ({
        url: `/v1/user/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// 导出 hooks
export const {
  useGetUserListQuery,
  useGetUserDetailQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
