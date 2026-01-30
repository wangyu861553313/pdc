import { apiSlice } from '@/store/api/apiSlice';
import type { BenefitRecord } from '@/store/api/benefitApi';
import benefitReducer, {
  closeModal,
  fetchBenefits,
  openCreateModal,
  resetSearch,
  setSearchValues,
} from '@/store/benefitSlice';
import { render, screen, waitFor, within } from '@/test-utils';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BenefitMaintenancePage from './index';

const { mockMessage, mockBenefitApi } = vi.hoisted(() => {
  const mockGetBenefits = vi.fn().mockResolvedValue({
    success: true,
    data: [
      {
        key: '1',
        benefitCode: 'H001',
        benefitDescription: 'Room & Board',
        benefitGroup: 'MC01 - Room & Board',
        displaySequence: 1,
        settleSequence: 'B1112',
        nonPayable: false,
      },
      {
        key: '2',
        benefitCode: 'H002',
        benefitDescription: 'Intensive Care Unit',
        benefitGroup: 'MC01 - Room & Board',
        displaySequence: 2,
        settleSequence: 'B1113',
        nonPayable: false,
      },
      {
        key: '3',
        benefitCode: 'AP001',
        benefitDescription: 'Outpatient Service',
        benefitGroup: 'APM1',
        displaySequence: 1,
        settleSequence: 'B2001',
        nonPayable: true,
      },
    ],
  });

  const mockSaveBenefit = vi.fn().mockResolvedValue({
    success: true,
    data: [],
  });

  return {
    mockMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
    mockBenefitApi: {
      getBenefits: mockGetBenefits,
      saveBenefit: mockSaveBenefit,
    },
  };
});

vi.mock('antd', async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;
  return {
    ...mod,
    message: mockMessage,
  };
});

vi.mock('@/store/api/baseQuery', () => ({
  baseQueryWithReauth: async (args: unknown) => {
    if (typeof args === 'object' && args !== null) {
      const fetchArgs = args as { url?: string; method?: string };
      if (fetchArgs.url === '/v1/benefit' && fetchArgs.method === 'GET') {
        return {
          data: await mockBenefitApi.getBenefits(),
        };
      }
    }
    return { data: null };
  },
}));

vi.mock('@/store/api/benefitApi', async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;
  return {
    ...mod,
    useGetBenefitsQuery: () => ({
      data: { success: true, data: [] },
      isLoading: false,
      refetch: vi.fn(),
    }),
    useSaveBenefitMutation: () => {
      const mutationFn = async (params: { record: BenefitRecord }) => {
        try {
          const result = await mockBenefitApi.saveBenefit(params);
          return {
            data: result,
            unwrap: async () => result,
          };
        } catch (error) {
          return {
            error,
            unwrap: async () => {
              throw error;
            },
          };
        }
      };
      return [mutationFn, { isLoading: false }];
    },
  };
});

function createBenefitTestStore() {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      benefit: benefitReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });
}

describe('BenefitMaintenance Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBenefitApi.getBenefits.mockResolvedValue({
      success: true,
      data: [
        {
          key: '1',
          benefitCode: 'H001',
          benefitDescription: 'Room & Board',
          benefitGroup: 'MC01 - Room & Board',
          displaySequence: 1,
          settleSequence: 'B1112',
          nonPayable: false,
        },
        {
          key: '2',
          benefitCode: 'H002',
          benefitDescription: 'Intensive Care Unit',
          benefitGroup: 'MC01 - Room & Board',
          displaySequence: 2,
          settleSequence: 'B1113',
          nonPayable: false,
        },
        {
          key: '3',
          benefitCode: 'AP001',
          benefitDescription: 'Outpatient Service',
          benefitGroup: 'APM1',
          displaySequence: 1,
          settleSequence: 'B2001',
          nonPayable: true,
        },
      ],
    });
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      expect(document.body).toBeInTheDocument();
    });

    it('renders page title "Benefit Maintenance"', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await waitFor(() => {
        expect(screen.getByText('Benefit Maintenance')).toBeInTheDocument();
      });
    });

    it('renders Search, Reset and Create buttons', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Search/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Reset/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Create/i }),
        ).toBeInTheDocument();
      });
    });

    it('renders search form inputs', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('Placeholder');
        expect(inputs.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('renders table with data after fetch', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await store.dispatch(fetchBenefits());
      await waitFor(() => {
        const table = document.querySelector('.ant-table');
        expect(table).toBeInTheDocument();
        const rows = document.querySelectorAll('.ant-table-tbody > tr');
        expect(rows.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('renders table columns: Benefit Code, Benefit Description, Benefit Group', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await store.dispatch(fetchBenefits());
      await waitFor(() => {
        expect(
          screen.getAllByText('Benefit Code').length,
        ).toBeGreaterThanOrEqual(1);
        expect(
          screen.getAllByText('Benefit Description').length,
        ).toBeGreaterThanOrEqual(1);
        expect(
          screen.getAllByText('Benefit Group').length,
        ).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('search', () => {
    it('filters data when Search is clicked with benefit code', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await store.dispatch(fetchBenefits());

      await waitFor(() => {
        const rows = document.querySelectorAll('.ant-table-tbody > tr');
        expect(rows.length).toBe(3);
      });

      const benefitCodeInput = screen.getAllByPlaceholderText('Placeholder')[0];
      await userEvent.type(benefitCodeInput, 'H001');
      const searchButton = screen.getByRole('button', { name: /Search/i });
      await userEvent.click(searchButton);

      await waitFor(() => {
        const rows = document.querySelectorAll('.ant-table-tbody > tr');
        expect(rows.length).toBe(1);
        expect(screen.getByText('H001')).toBeInTheDocument();
      });
    });

    it('filters data when Search is clicked with benefit description', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await store.dispatch(fetchBenefits());

      const inputs = screen.getAllByPlaceholderText('Placeholder');
      const benefitDescInput = inputs[1];
      await userEvent.type(benefitDescInput, 'Room');
      const searchButton = screen.getByRole('button', { name: /Search/i });
      await userEvent.click(searchButton);

      await waitFor(() => {
        const rows = document.querySelectorAll('.ant-table-tbody > tr');
        expect(rows.length).toBe(1);
        expect(screen.getByText('Room & Board')).toBeInTheDocument();
      });
    });

    it('resets search when Reset is clicked', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await store.dispatch(fetchBenefits());

      const benefitCodeInput = screen.getAllByPlaceholderText('Placeholder')[0];
      await userEvent.type(benefitCodeInput, 'H001');
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() => {
        const rows = document.querySelectorAll('.ant-table-tbody > tr');
        expect(rows.length).toBe(1);
      });

      await userEvent.click(screen.getByRole('button', { name: /Reset/i }));

      await waitFor(() => {
        const rows = document.querySelectorAll('.ant-table-tbody > tr');
        expect(rows.length).toBe(3);
      });
    });
  });

  describe('modal', () => {
    it('opens Create modal when Create button is clicked', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });

      const createButton = screen.getByRole('button', { name: /Create/i });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create Benefit')).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Save/i }),
        ).toBeInTheDocument();
      });
    });

    it('opens Edit modal when Edit icon is clicked on a row', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await store.dispatch(fetchBenefits());

      await waitFor(() => {
        const editButtons = document.querySelectorAll('.anticon-edit');
        expect(editButtons.length).toBeGreaterThan(0);
      });

      const editButton = document.querySelector('.anticon-edit');
      await userEvent.click(editButton!);

      await waitFor(() => {
        expect(screen.getByText('Edit Benefit')).toBeInTheDocument();
        expect(screen.getByDisplayValue('H001')).toBeInTheDocument();
      });
    });

    it('closes modal when Cancel is clicked', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });

      await userEvent.click(screen.getByRole('button', { name: /Create/i }));

      await waitFor(() => {
        expect(screen.getByText('Create Benefit')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Create Benefit')).not.toBeInTheDocument();
      });
    });

    it('saves and closes modal when Save is clicked with valid data', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });

      await userEvent.click(screen.getByRole('button', { name: /Create/i }));

      await waitFor(() => {
        expect(screen.getByText('Create Benefit')).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog');
      const textInputs = within(modal).getAllByRole('textbox');
      const benefitCodeInput = textInputs[0];
      await userEvent.type(benefitCodeInput, 'NEW001');

      const saveButton = within(modal).getByRole('button', { name: /Save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockBenefitApi.saveBenefit).toHaveBeenCalled();
        expect(screen.queryByText('Create Benefit')).not.toBeInTheDocument();
      });
    });
  });

  describe('form validation', () => {
    it('does not close modal when Save is clicked without Benefit Code', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });

      await userEvent.click(screen.getByRole('button', { name: /Create/i }));

      await waitFor(() => {
        expect(screen.getByText('Create Benefit')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /Save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Create Benefit')).toBeInTheDocument();
        expect(mockBenefitApi.saveBenefit).not.toHaveBeenCalled();
      });
    });

    it('displays validation error for required Benefit Code', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });

      await userEvent.click(screen.getByRole('button', { name: /Create/i }));

      await waitFor(() => {
        expect(screen.getByText('Create Benefit')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /Save/i });
      await userEvent.click(saveButton);

      await waitFor(
        () => {
          expect(
            screen.getByText(/Benefit Code is required/i),
          ).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  });

  describe('Redux state', () => {
    it('dispatches setSearchValues when Search is clicked', async () => {
      const store = createBenefitTestStore();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      render(<BenefitMaintenancePage />, { store });

      const benefitCodeInput = screen.getAllByPlaceholderText('Placeholder')[0];
      await userEvent.type(benefitCodeInput, 'H001');
      await userEvent.click(screen.getByRole('button', { name: /Search/i }));

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          setSearchValues(
            expect.objectContaining({
              benefitCode: 'H001',
            }),
          ),
        );
      });
    });

    it('dispatches resetSearch when Reset is clicked', async () => {
      const store = createBenefitTestStore();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      render(<BenefitMaintenancePage />, { store });

      await userEvent.click(screen.getByRole('button', { name: /Reset/i }));

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(resetSearch());
      });
    });

    it('dispatches openCreateModal when Create is clicked', async () => {
      const store = createBenefitTestStore();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      render(<BenefitMaintenancePage />, { store });

      await userEvent.click(screen.getByRole('button', { name: /Create/i }));

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(openCreateModal());
      });
    });

    it('dispatches openEditModal when Edit icon is clicked', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await store.dispatch(fetchBenefits());

      await waitFor(() => {
        const editButton = document.querySelector('.anticon-edit');
        expect(editButton).toBeInTheDocument();
      });

      const editButton = document.querySelector('.anticon-edit');
      await userEvent.click(editButton!);

      await waitFor(() => {
        const { editingRecord } = store.getState().benefit;
        expect(editingRecord).toBeTruthy();
        expect(editingRecord).toMatchObject({
          key: '1',
          benefitCode: 'H001',
        });
      });
    });

    it('dispatches closeModal when Cancel is clicked', async () => {
      const store = createBenefitTestStore();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      render(<BenefitMaintenancePage />, { store });

      await userEvent.click(screen.getByRole('button', { name: /Create/i }));
      await waitFor(() => {
        expect(screen.getByText('Create Benefit')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(closeModal());
      });
    });
  });

  describe('data fetching', () => {
    it('fetches data on mount when dataSource is empty', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });

      await waitFor(
        () => {
          expect(store.getState().benefit.dataSource.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('pagination', () => {
    it('renders pagination when data is loaded', async () => {
      const store = createBenefitTestStore();
      render(<BenefitMaintenancePage />, { store });
      await store.dispatch(fetchBenefits());

      await waitFor(() => {
        const pagination = document.querySelector('.ant-pagination');
        expect(pagination).toBeInTheDocument();
      });
    });
  });
});
