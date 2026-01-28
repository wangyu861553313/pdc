import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { benefitApi, type BenefitRecord } from './api/benefitApi';

interface BenefitState {
  dataSource: BenefitRecord[];
  loading: boolean;
  error: string | null;
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
};

const benefitSlice = createSlice({
  name: 'benefit',
  initialState,
  reducers: {
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

export const { upsertBenefit } = benefitSlice.actions;

export default benefitSlice.reducer;
