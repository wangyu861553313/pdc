import { apiSlice } from './apiSlice';

export interface BenefitRecord {
  key: string;
  benefitCode: string;
  benefitDescription: string;
  benefitGroup: string;
  displaySequence: number;
  settleSequence: string;
  nonPayable: boolean;
}

export interface BenefitListResponse {
  data?: BenefitRecord[];
  success?: boolean;
  errorMessage?: string;
}

export interface SaveBenefitParams {
  record: BenefitRecord;
}

export const benefitApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBenefits: builder.query<BenefitListResponse, void>({
      query: () => ({
        url: '/v1/benefit',
        method: 'GET',
      }),
      providesTags: ['Benefit'],
    }),
    saveBenefit: builder.mutation<BenefitListResponse, SaveBenefitParams>({
      query: (body) => ({
        url: '/v1/benefit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Benefit'],
    }),
  }),
});

export const { useGetBenefitsQuery, useSaveBenefitMutation } = benefitApi;
