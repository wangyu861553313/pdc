import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';
import { tableApi } from './api/tableApi';

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

interface TableState {
  dataSource: MainTableDataType[];
  selectedRowKeys: React.Key[];
  expandedRowKeys: React.Key[];
  validationErrors: Record<string, Record<string, Record<string, string>>>;
  loading: boolean;
  error: string | null;
}

// 使用 tableApi 获取表格数据
export const fetchTableData = createAsyncThunk(
  'table/fetchTableData',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // 使用 tableApi 的 initiate 方法调用 API
      const result = await dispatch(
        tableApi.endpoints.getTableData.initiate(),
      ).unwrap();

      // 返回数据，格式：{ success: true, data: MainTableDataType[] }
      if (result.success && result.data) {
        return result.data as MainTableDataType[];
      }
      throw new Error('数据格式错误');
    } catch (error) {
      // 如果 API 调用失败，返回错误信息
      return rejectWithValue(
        error instanceof Error ? error.message : '获取数据失败',
      );
    }
  },
);

const initialState: TableState = {
  dataSource: [],
  selectedRowKeys: [],
  expandedRowKeys: [],
  validationErrors: {},
  loading: false,
  error: null,
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    // 设置数据源
    setDataSource: (state, action: PayloadAction<MainTableDataType[]>) => {
      state.dataSource = action.payload;
    },
    // 更新主表格行
    updateMainRow: (
      state,
      action: PayloadAction<{
        key: React.Key;
        data: Partial<MainTableDataType>;
      }>,
    ) => {
      const index = state.dataSource.findIndex(
        (item) => item.key === action.payload.key,
      );
      if (index !== -1) {
        state.dataSource[index] = {
          ...state.dataSource[index],
          ...action.payload.data,
        };
      }
    },
    // 更新主表格复选框
    updateMainCheckbox: (
      state,
      action: PayloadAction<{
        key: React.Key;
        field: keyof MainTableDataType;
        checked: boolean;
      }>,
    ) => {
      const index = state.dataSource.findIndex(
        (item) => item.key === action.payload.key,
      );
      if (index !== -1) {
        state.dataSource[index] = {
          ...state.dataSource[index],
          [action.payload.field]: action.payload.checked,
        };
      }
    },
    // 更新主表格下拉菜单
    updateMainSelect: (
      state,
      action: PayloadAction<{
        key: React.Key;
        field: keyof MainTableDataType;
        value: string;
      }>,
    ) => {
      const index = state.dataSource.findIndex(
        (item) => item.key === action.payload.key,
      );
      if (index !== -1) {
        state.dataSource[index] = {
          ...state.dataSource[index],
          [action.payload.field]: action.payload.value,
        };
      }
    },
    // 更新子表格数据
    updateSubTableData: (
      state,
      action: PayloadAction<{
        mainKey: React.Key;
        subKey: React.Key;
        field: keyof SubTableDataType;
        value: string;
      }>,
    ) => {
      const mainIndex = state.dataSource.findIndex(
        (item) => item.key === action.payload.mainKey,
      );
      if (mainIndex !== -1) {
        const subIndex = state.dataSource[mainIndex].subTableData.findIndex(
          (item) => item.key === action.payload.subKey,
        );
        if (subIndex !== -1) {
          state.dataSource[mainIndex].subTableData[subIndex] = {
            ...state.dataSource[mainIndex].subTableData[subIndex],
            [action.payload.field]: action.payload.value,
          };
        }
      }
    },
    // 添加子表格行
    addSubRow: (state, action: PayloadAction<{ mainKey: React.Key }>) => {
      const mainIndex = state.dataSource.findIndex(
        (item) => item.key === action.payload.mainKey,
      );
      if (mainIndex !== -1) {
        const newSubKey = `${action.payload.mainKey}-${Date.now()}`;
        // 使用 Immer 的 push 方法，确保状态正确更新
        state.dataSource[mainIndex].subTableData.push({
          key: newSubKey,
          category: 'Per accident limit',
          amountType: 'Fixed value',
          amount: '',
          daysTimes: '',
          subjectToIllness: 'False',
        });
      }
    },
    // 删除子表格行
    deleteSubRow: (
      state,
      action: PayloadAction<{ mainKey: React.Key; subKey: React.Key }>,
    ) => {
      const mainIndex = state.dataSource.findIndex(
        (item) => item.key === action.payload.mainKey,
      );
      if (mainIndex !== -1) {
        state.dataSource[mainIndex].subTableData = state.dataSource[
          mainIndex
        ].subTableData.filter((item) => item.key !== action.payload.subKey);
      }
    },
    // 删除主表格行
    deleteMainRow: (state, action: PayloadAction<React.Key>) => {
      state.dataSource = state.dataSource.filter(
        (item) => item.key !== action.payload,
      );
      state.selectedRowKeys = state.selectedRowKeys.filter(
        (key) => key !== action.payload,
      );
    },
    // 设置选中的行
    setSelectedRowKeys: (state, action: PayloadAction<React.Key[]>) => {
      state.selectedRowKeys = action.payload;
    },
    // 设置展开的行
    setExpandedRowKeys: (state, action: PayloadAction<React.Key[]>) => {
      state.expandedRowKeys = action.payload;
    },
    // 设置验证错误
    setValidationErrors: (
      state,
      action: PayloadAction<
        Record<string, Record<string, Record<string, string>>>
      >,
    ) => {
      state.validationErrors = action.payload;
    },
    // 清除单个字段的错误
    clearFieldError: (
      state,
      action: PayloadAction<{
        mainKey: React.Key;
        subKey: React.Key;
        field: string;
      }>,
    ) => {
      const mainKeyStr = String(action.payload.mainKey);
      const subKeyStr = String(action.payload.subKey);
      if (state.validationErrors[mainKeyStr]?.[subKeyStr]) {
        const subErrors = { ...state.validationErrors[mainKeyStr][subKeyStr] };
        delete subErrors[action.payload.field];
        if (Object.keys(subErrors).length === 0) {
          delete state.validationErrors[mainKeyStr][subKeyStr];
        } else {
          state.validationErrors[mainKeyStr] = {
            ...state.validationErrors[mainKeyStr],
            [subKeyStr]: subErrors,
          };
        }
        if (
          Object.keys(state.validationErrors[mainKeyStr] || {}).length === 0
        ) {
          delete state.validationErrors[mainKeyStr];
        }
      }
    },
  },
  extraReducers: (builder) => {
    // 处理 fetchTableData
    builder
      .addCase(fetchTableData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTableData.fulfilled, (state, action) => {
        state.loading = false;
        state.dataSource = action.payload;
        // 默认展开所有行
        state.expandedRowKeys = action.payload.map(
          (item: MainTableDataType) => item.key,
        );
        state.error = null;
      })
      .addCase(fetchTableData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || '获取数据失败';
      });
  },
});

export const {
  setDataSource,
  updateMainRow,
  updateMainCheckbox,
  updateMainSelect,
  updateSubTableData,
  addSubRow,
  deleteSubRow,
  deleteMainRow,
  setSelectedRowKeys,
  setExpandedRowKeys,
  setValidationErrors,
  clearFieldError,
} = tableSlice.actions;

export default tableSlice.reducer;
