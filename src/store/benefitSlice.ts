import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { benefitApi, type BenefitRecord } from './api/benefitApi';

export interface BenefitSearchValues {
  benefitCode?: string;
  benefitDescription?: string;
  benefitGroup?: string;
}

export interface BenefitPaginationState {
  currentPage: number;
  pageSize: number;
}

export interface BenefitState {
  dataSource: BenefitRecord[];
  loading: boolean;
  error: string | null;
  pagination: BenefitPaginationState;
  searchValues: BenefitSearchValues;
  editingRecord: BenefitRecord | null;
  isModalVisible: boolean;
}

export const fetchBenefits = createAsyncThunk(
  'benefit/fetchBenefits',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        benefitApi.endpoints.getBenefits.initiate(),
      ).unwrap();
      if (result.success && result.data) {
        return result.data as BenefitRecord[];
      }
      throw new Error('数据格式错误');
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '获取数据失败',
      );
    }
  },
);

const initialState: BenefitState = {
  dataSource: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 10,
  },
  searchValues: {},
  editingRecord: null,
  isModalVisible: false,
};

const benefitSlice = createSlice({
  name: 'benefit',
  initialState,
  reducers: {
    setSearchValues: (state, action: PayloadAction<BenefitSearchValues>) => {
      state.searchValues = action.payload;
      state.pagination.currentPage = 1;
    },
    resetSearch: (state) => {
      state.searchValues = {};
      state.pagination.currentPage = 1;
    },
    openCreateModal: (state) => {
      state.editingRecord = null;
      state.isModalVisible = true;
    },
    openEditModal: (state, action: PayloadAction<BenefitRecord>) => {
      state.editingRecord = action.payload;
      state.isModalVisible = true;
    },
    closeModal: (state) => {
      state.editingRecord = null;
      state.isModalVisible = false;
    },
    setPaginationPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setPaginationPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
      state.pagination.currentPage = 1;
    },
    upsertBenefit: (state, action: PayloadAction<BenefitRecord>) => {
      const index = state.dataSource.findIndex(
        (item) => item.key === action.payload.key,
      );
      if (index === -1) {
        state.dataSource.push(action.payload);
      } else {
        state.dataSource[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBenefits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBenefits.fulfilled, (state, action) => {
        state.loading = false;
        state.dataSource = action.payload;
      })
      .addCase(fetchBenefits.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || '获取数据失败';
      });
  },
});

export const {
  upsertBenefit,
  setSearchValues,
  resetSearch,
  openCreateModal,
  openEditModal,
  closeModal,
  setPaginationPage,
  setPaginationPageSize,
} = benefitSlice.actions;

function filterBenefits(
  data: BenefitRecord[],
  search: BenefitSearchValues,
): BenefitRecord[] {
  return data.filter((item) => {
    const { benefitCode, benefitDescription, benefitGroup } = search;
    if (
      benefitCode &&
      !item.benefitCode.toLowerCase().includes(benefitCode.toLowerCase())
    ) {
      return false;
    }
    if (
      benefitDescription &&
      !item.benefitDescription
        .toLowerCase()
        .includes(benefitDescription.toLowerCase())
    ) {
      return false;
    }
    if (benefitGroup && item.benefitGroup !== benefitGroup) {
      return false;
    }
    return true;
  });
}

export const selectFilteredBenefits = (state: {
  benefit: BenefitState;
}): BenefitRecord[] =>
  filterBenefits(state.benefit.dataSource, state.benefit.searchValues);

export const selectShouldFetchBenefits = (state: {
  benefit: BenefitState;
}): boolean => state.benefit.dataSource.length === 0;

export default benefitSlice.reducer;
