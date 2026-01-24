import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';

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
}

const initialState: TableState = {
  dataSource: [
    {
      key: '1',
      benefitCode: 'A47',
      benefitDescription: 'Dental treatment',
      deductible: false,
      coInsurance: false,
      copayOption: false,
      ghEmWaiveDed: false,
      ghEmWaiveCoIns: false,
      illnessWaiveCoIns: false,
      disabilityLimit: false,
      annualLimit: false,
      lifetimeLimit: false,
      benefitAllowAutoflow: 'Within days limit',
      subTableData: [
        {
          key: '1-1',
          category: 'Per accident limit',
          amountType: 'Fixed value',
          amount: '3000',
          daysTimes: 'Input amount',
          subjectToIllness: 'False',
        },
        {
          key: '1-2',
          category: 'Per accident limit',
          amountType: 'Fixed value',
          amount: '3000',
          daysTimes: 'Input amount',
          subjectToIllness: 'False',
        },
        {
          key: '1-3',
          category: 'Per accident limit',
          amountType: 'Fixed value',
          amount: '3000',
          daysTimes: 'Input amount',
          subjectToIllness: 'False',
        },
        {
          key: '1-4',
          category: 'Per accident limit',
          amountType: 'Fixed value',
          amount: '3000',
          daysTimes: 'Input amount',
          subjectToIllness: 'False',
        },
      ],
    },
    {
      key: '2',
      benefitCode: 'A47',
      benefitDescription: 'Dental treatment',
      deductible: false,
      coInsurance: false,
      copayOption: false,
      ghEmWaiveDed: false,
      ghEmWaiveCoIns: false,
      illnessWaiveCoIns: false,
      disabilityLimit: false,
      annualLimit: false,
      lifetimeLimit: false,
      benefitAllowAutoflow: 'Within days limit',
      subTableData: [
        {
          key: '2-1',
          category: 'Per accident limit',
          amountType: 'Fixed value',
          amount: '3000',
          daysTimes: 'Input amount',
          subjectToIllness: 'False',
        },
      ],
    },
  ],
  selectedRowKeys: [],
  expandedRowKeys: ['1', '2'],
  validationErrors: {},
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
