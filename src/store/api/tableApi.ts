import React from 'react';
import { apiSlice } from './apiSlice';

// 子表格数据类型
export interface SubTableDataType {
  key: React.Key;
  category: string;
  amountType: string;
  amount: string;
  daysTimes: string;
  subjectToIllness: string;
}

// 主表格数据类型
export interface MainTableDataType {
  key: React.Key;
  benefitCode: string;
  benefitDescription: string;
  deductible: boolean;
  coInsurance: boolean;
  copayOption: boolean;
  ghEmWaiveDed: boolean;
  ghEmWaiveCoIns: boolean;
  illnessWaiveCoIns: boolean;
  disabilityLimit: boolean;
  annualLimit: boolean;
  lifetimeLimit: boolean;
  benefitAllowAutoflow: string;
  subTableData: SubTableDataType[];
}

// API 响应类型
export interface TableDataResponse {
  data?: MainTableDataType[];
  success?: boolean;
  errorMessage?: string;
}

export interface SaveTableDataParams {
  data: MainTableDataType[];
}

export interface AddMainRowParams {
  data: Partial<MainTableDataType>;
}

// 扩展 API Slice
export const tableApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 获取表格数据
    getTableData: builder.query<TableDataResponse, void>({
      query: () => ({
        url: '/v1/table',
        method: 'GET',
      }),
      providesTags: ['Table'],
    }),

    // 保存表格数据
    saveTableData: builder.mutation<TableDataResponse, SaveTableDataParams>({
      query: (body) => ({
        url: '/v1/table',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Table'],
    }),

    // 删除主表格行
    deleteMainRow: builder.mutation<TableDataResponse, React.Key>({
      query: (key) => ({
        url: `/v1/table/${key}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Table'],
    }),

    // 添加主表格行
    addMainRow: builder.mutation<TableDataResponse, AddMainRowParams>({
      query: (body) => ({
        url: '/v1/table/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Table'],
    }),
  }),
});

// 导出 hooks
export const {
  useGetTableDataQuery,
  useSaveTableDataMutation,
  useDeleteMainRowMutation,
  useAddMainRowMutation,
} = tableApi;
