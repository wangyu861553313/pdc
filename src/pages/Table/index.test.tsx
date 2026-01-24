import { updateSubTableData } from '@/store/tableSlice';
import { createTestStore, render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TablePage from './index';

const { mockMessage } = vi.hoisted(() => {
  return {
    mockMessage: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
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

describe('Table Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<TablePage />);
    expect(document.body).toBeInTheDocument();
  });

  describe('rendering', () => {
    it('renders page title "Benefits shared limit"', async () => {
      render(<TablePage />);
      await waitFor(
        () => {
          expect(
            screen.getByRole('heading', { name: /Benefits shared limit/i }),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('renders Select and Save buttons', async () => {
      render(<TablePage />);
      await waitFor(
        () => {
          expect(
            screen.getByRole('button', { name: /Select/i }),
          ).toBeInTheDocument();
          expect(
            screen.getByRole('button', { name: /Save/i }),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('renders main table with initial data rows', async () => {
      render(<TablePage />);
      await waitFor(
        () => {
          const table = document.querySelector('.ant-table');
          expect(table).toBeInTheDocument();
          const rows = document.querySelectorAll('.ant-table-tbody > tr');
          expect(rows.length).toBeGreaterThanOrEqual(2);
        },
        { timeout: 3000 },
      );
    });

    it('renders benefit code and benefit description inputs', async () => {
      render(<TablePage />);
      await waitFor(
        () => {
          const inputs = screen.getAllByPlaceholderText(/福利代码|福利描述/);
          expect(inputs.length).toBeGreaterThanOrEqual(2);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Save behavior', () => {
    it('calls message.success when Save is clicked with valid data', async () => {
      render(<TablePage />);
      await waitFor(
        () => {
          expect(
            screen.getByRole('button', { name: /Save/i }),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      const saveButton = screen.getByRole('button', { name: /Save/i });
      await userEvent.click(saveButton);
      await waitFor(
        () => {
          expect(mockMessage.success).toHaveBeenCalledWith('保存成功');
        },
        { timeout: 3000 },
      );
    });

    it('calls message.error when Save is clicked with missing required fields', async () => {
      const store = createTestStore();
      store.dispatch(
        updateSubTableData({
          mainKey: '1',
          subKey: '1-1',
          field: 'category',
          value: '',
        }),
      );
      store.dispatch(
        updateSubTableData({
          mainKey: '1',
          subKey: '1-1',
          field: 'amountType',
          value: '',
        }),
      );
      render(<TablePage />, { store });
      await waitFor(
        () => {
          expect(
            screen.getByRole('button', { name: /Save/i }),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      const saveButton = screen.getByRole('button', { name: /Save/i });
      await userEvent.click(saveButton);
      await waitFor(
        () => {
          expect(mockMessage.error).toHaveBeenCalledWith('请填写所有必填字段');
        },
        { timeout: 3000 },
      );
    });
  });

  describe('expandable sub-table', () => {
    it('shows sub-table with Add one button when rows are expanded', async () => {
      render(<TablePage />);
      await waitFor(
        () => {
          const addButtons = screen.getAllByRole('button', {
            name: /Add one/i,
          });
          expect(addButtons.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('row selection', () => {
    it('selects row when row checkbox is checked', async () => {
      render(<TablePage />);
      let rowCheckboxes: Element[] = [];
      await waitFor(
        () => {
          const checkboxes = document.querySelectorAll('.ant-checkbox-input');
          rowCheckboxes = Array.from(checkboxes).filter(
            (el) => el.closest('.ant-table-tbody') !== null,
          );
          expect(rowCheckboxes.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );
      await userEvent.click(rowCheckboxes[0] as HTMLElement);
      await waitFor(
        () => {
          expect((rowCheckboxes[0] as HTMLInputElement).checked).toBe(true);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('editable inputs', () => {
    it('keeps focus when typing in benefit code input', async () => {
      render(<TablePage />);
      await waitFor(
        () => {
          const inputs = screen.getAllByPlaceholderText('福利代码');
          expect(inputs.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );
      const codeInput = screen.getAllByPlaceholderText('福利代码')[0];
      codeInput.focus();
      await userEvent.type(codeInput, 'A');
      await waitFor(
        () => {
          expect(document.activeElement).toBe(codeInput);
        },
        { timeout: 3000 },
      );
    });
  });
});
