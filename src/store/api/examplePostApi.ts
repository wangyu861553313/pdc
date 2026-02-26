import { apiSlice } from './apiSlice';

/**
 * POST 请求真实调用示例
 * 后端需提供 POST /v1/example/submit 接口，或在本文件中改为你已有的 POST 地址
 */

export interface ExamplePostParams {
  title: string;
  content?: string;
}

export interface ExamplePostResponse {
  success?: boolean;
  data?: { id?: string; title?: string; createdAt?: string };
  errorMessage?: string;
}

export const examplePostApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 示例：提交一条数据（POST，带 body）
    submitExample: builder.mutation<ExamplePostResponse, ExamplePostParams>({
      query: (body) => ({
        url: '/v1/example/submit',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSubmitExampleMutation } = examplePostApi;
