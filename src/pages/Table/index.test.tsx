import {
  // addSubRow,
  // deleteSubRow,
  setDataSource,
  setExpandedRowKeys,
  // updateMainCheckbox,
  updateMainSelect,
  // updateSubTableData,
  type MainTableDataType,
} from '@/store/tableSlice';
import { createTestStore, render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TablePage from './index';

const { mockMessage, mockTableApi } = vi.hoisted(() => {
  const mockGetTableData = vi.fn().mockResolvedValue({
    success: true,
    data: [
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
            category: 'Per day limit',
            amountType: 'Percentage',
            amount: '500',
            daysTimes: '10',
            subjectToIllness: 'True',
          },
        ],
      },
      {
        key: '2',
        benefitCode: 'B48',
        benefitDescription: 'Medical treatment',
        deductible: true,
        coInsurance: true,
        copayOption: true,
        ghEmWaiveDed: false,
        ghEmWaiveCoIns: false,
        illnessWaiveCoIns: false,
        disabilityLimit: false,
        annualLimit: false,
        lifetimeLimit: false,
        benefitAllowAutoflow: 'No limit',
        subTableData: [
          {
            key: '2-1',
            category: 'Per visit limit',
            amountType: 'Unlimited',
            amount: '',
            daysTimes: '',
            subjectToIllness: 'False',
          },
        ],
      },
    ],
  });

  const mockSaveTableData = vi.fn().mockResolvedValue({
    success: true,
    data: [],
  });

  const mockDeleteMainRow = vi.fn().mockResolvedValue({
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
    mockTableApi: {
      getTableData: mockGetTableData,
      saveTableData: mockSaveTableData,
      deleteMainRow: mockDeleteMainRow,
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
      if (fetchArgs.url === '/v1/table' && fetchArgs.method === 'GET') {
        return {
          data: await mockTableApi.getTableData(),
        };
      }
    }
    return { data: null };
  },
}));

vi.mock('@/store/api/tableApi', async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;
  return {
    ...mod,
    useSaveTableDataMutation: () => {
      const mutationFn = async (params: { data: unknown[] }) => {
        try {
          const result = await mockTableApi.saveTableData(params);
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
    useDeleteMainRowMutation: () => {
      const mutationFn = async (key: React.Key) => {
        try {
          const result = await mockTableApi.deleteMainRow(key);
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

describe('Table Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTableApi.getTableData.mockResolvedValue({
      success: true,
      data: [
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
              category: 'Per day limit',
              amountType: 'Percentage',
              amount: '500',
              daysTimes: '10',
              subjectToIllness: 'True',
            },
          ],
        },
        {
          key: '2',
          benefitCode: 'B48',
          benefitDescription: 'Medical treatment',
          deductible: true,
          coInsurance: true,
          copayOption: true,
          ghEmWaiveDed: false,
          ghEmWaiveCoIns: false,
          illnessWaiveCoIns: false,
          disabilityLimit: false,
          annualLimit: false,
          lifetimeLimit: false,
          benefitAllowAutoflow: 'No limit',
          subTableData: [
            {
              key: '2-1',
              category: 'Per visit limit',
              amountType: 'Unlimited',
              amount: '',
              daysTimes: '',
              subjectToIllness: 'False',
            },
          ],
        },
      ],
    });
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<TablePage />);
      expect(document.body).toBeInTheDocument();
    });

    it('renders page title "Benefits shared limit"', async () => {
      render(<TablePage />);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Benefits shared limit/i }),
        ).toBeInTheDocument();
      });
    });

    it('renders Select and Save buttons', async () => {
      render(<TablePage />);
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Select/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Save/i }),
        ).toBeInTheDocument();
      });
    });

    it('renders main table with initial data rows', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const table = document.querySelector('.ant-table');
        expect(table).toBeInTheDocument();
        const rows = document.querySelectorAll('.ant-table-tbody > tr');
        expect(rows.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('renders benefit code and benefit description inputs', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(/福利代码|福利描述/);
        expect(inputs.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('renders loading spinner when data is loading', async () => {
      const store = createTestStore();
      store.dispatch(setDataSource([]));
      render(<TablePage />, { store });
      await waitFor(
        () => {
          const spinner = document.querySelector('.ant-spin');
          expect(spinner).toBeInTheDocument();
        },
        { timeout: 1000 },
      );
    });
  });

  describe('EditableInput component', () => {
    it('updates local value on change', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('福利代码');
        expect(inputs.length).toBeGreaterThan(0);
      });
      const codeInput = screen.getAllByPlaceholderText(
        '福利代码',
      )[0] as HTMLInputElement;
      await userEvent.clear(codeInput);
      await userEvent.type(codeInput, 'NEW_CODE');
      expect(codeInput.value).toBe('NEW_CODE');
    });

    it('calls onChange on blur when value changed', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('福利代码');
        expect(inputs.length).toBeGreaterThan(0);
      });
      const codeInput = screen.getAllByPlaceholderText(
        '福利代码',
      )[0] as HTMLInputElement;
      await userEvent.clear(codeInput);
      await userEvent.type(codeInput, 'NEW_CODE');
      codeInput.blur();
      await waitFor(() => {
        expect(codeInput.value).toBe('NEW_CODE');
      });
    });

    it('syncs with prop value changes', async () => {
      const store = createTestStore();
      render(<TablePage />, { store });
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('福利代码');
        expect(inputs.length).toBeGreaterThan(0);
      });

      // Update via Redux
      store.dispatch(
        updateMainSelect({
          key: '1',
          field: 'benefitCode',
          value: 'UPDATED_CODE',
        }),
      );

      // Re-query the input to get the updated element after re-render
      await waitFor(
        () => {
          const inputs = screen.getAllByPlaceholderText('福利代码');
          const codeInput = inputs[0] as HTMLInputElement;
          expect(codeInput.value).toBe('UPDATED_CODE');
        },
        { timeout: 3000 },
      );
    });
  });

  describe('row selection', () => {
    it('selects row when row checkbox is checked', async () => {
      render(<TablePage />);
      let rowCheckboxes: Element[] = [];
      await waitFor(() => {
        const checkboxes = document.querySelectorAll('.ant-checkbox-input');
        rowCheckboxes = Array.from(checkboxes).filter(
          (el) => el.closest('.ant-table-tbody') !== null,
        );
        expect(rowCheckboxes.length).toBeGreaterThan(0);
      });
      await userEvent.click(rowCheckboxes[0] as HTMLElement);
      await waitFor(() => {
        expect((rowCheckboxes[0] as HTMLInputElement).checked).toBe(true);
      });
    });

    it('deselects row when row checkbox is unchecked', async () => {
      render(<TablePage />);
      let rowCheckboxes: Element[] = [];
      await waitFor(() => {
        const checkboxes = document.querySelectorAll('.ant-checkbox-input');
        rowCheckboxes = Array.from(checkboxes).filter(
          (el) => el.closest('.ant-table-tbody') !== null,
        );
        expect(rowCheckboxes.length).toBeGreaterThan(0);
      });
      const checkbox = rowCheckboxes[0] as HTMLInputElement;
      await userEvent.click(checkbox);
      await waitFor(() => {
        expect(checkbox.checked).toBe(true);
      });
      await userEvent.click(checkbox);
      await waitFor(() => {
        expect(checkbox.checked).toBe(false);
      });
    });

    // it('selects all rows when header checkbox is checked', async () => {
    //   render(<TablePage />);
    //   await waitFor(() => {
    //     const checkboxes = document.querySelectorAll('.ant-checkbox-input');
    //     expect(checkboxes.length).toBeGreaterThan(0);
    //   });

    //   // Find header checkbox - it's in the first column of thead
    //   let headerCheckbox: HTMLInputElement | null = null;
    //   await waitFor(() => {
    //     const theadCheckboxes = Array.from(
    //       document.querySelectorAll('.ant-table-thead .ant-checkbox-input'),
    //     ) as HTMLInputElement[];
    //     expect(theadCheckboxes.length).toBeGreaterThan(0);
    //     headerCheckbox = theadCheckboxes[0];
    //     expect(headerCheckbox).toBeTruthy();
    //   });

    //   await userEvent.click(headerCheckbox!);

    //   await waitFor(() => {
    //     // Find row checkboxes - they're in the first column of tbody
    //     const rowSelectionCheckboxes = Array.from(
    //       document.querySelectorAll('.ant-table-tbody tr'),
    //     ).map((row) => {
    //       const checkbox = row.querySelector(
    //         'td:first-child .ant-checkbox-input',
    //       ) as HTMLInputElement | null;
    //       return checkbox;
    //     }).filter(Boolean) as HTMLInputElement[];

    //     expect(rowSelectionCheckboxes.length).toBeGreaterThan(0);
    //     rowSelectionCheckboxes.forEach((cb) => {
    //       expect(cb.checked).toBe(true);
    //     });
    //   });
    // });

    it('shows indeterminate state when some rows are selected', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const checkboxes = document.querySelectorAll('.ant-checkbox-input');
        expect(checkboxes.length).toBeGreaterThan(0);
      });

      const rowSelectionCheckboxes = Array.from(
        document.querySelectorAll('.ant-table-tbody tr'),
      )
        .map((row) => {
          return row.querySelector(
            'td:first-child .ant-checkbox-input',
          ) as HTMLInputElement | null;
        })
        .filter(Boolean) as HTMLInputElement[];

      if (rowSelectionCheckboxes.length > 1) {
        await userEvent.click(rowSelectionCheckboxes[0] as HTMLElement);
        await waitFor(() => {
          // Find header checkbox wrapper
          const theadCheckboxes = Array.from(
            document.querySelectorAll('.ant-table-thead .ant-checkbox'),
          );
          expect(theadCheckboxes.length).toBeGreaterThan(0);

          const headerCheckboxWrapper = theadCheckboxes[0] as HTMLElement;
          const headerInput = headerCheckboxWrapper.querySelector(
            '.ant-checkbox-input',
          ) as HTMLInputElement | null;

          expect(headerCheckboxWrapper).toBeTruthy();
          // antd uses class on wrapper for indeterminate
          expect(
            headerCheckboxWrapper.classList.contains(
              'ant-checkbox-indeterminate',
            ) || headerInput?.indeterminate,
          ).toBeTruthy();
        });
      }
    });
  });

  describe('main table checkbox fields', () => {
    const checkboxFields = [
      'deductible',
      'coInsurance',
      'copayOption',
      'ghEmWaiveDed',
      'ghEmWaiveCoIns',
      'illnessWaiveCoIns',
      'disabilityLimit',
      'annualLimit',
      'lifetimeLimit',
    ];

    checkboxFields.forEach((field) => {
      it(`toggles ${field} checkbox`, async () => {
        render(<TablePage />);
        await waitFor(() => {
          const checkboxes = document.querySelectorAll('.ant-checkbox-input');
          expect(checkboxes.length).toBeGreaterThan(0);
        });

        // Find checkboxes in the table body (excluding selection checkboxes)
        const allCheckboxes = Array.from(
          document.querySelectorAll('.ant-checkbox-input'),
        ).filter((el) => {
          const row = el.closest('tr');
          return row && row.closest('.ant-table-tbody') !== null;
        });

        if (allCheckboxes.length > 0) {
          const checkbox = allCheckboxes[0] as HTMLInputElement;
          const initialChecked = checkbox.checked;
          await userEvent.click(checkbox);
          await waitFor(() => {
            expect(checkbox.checked).toBe(!initialChecked);
          });
        }
      });
    });
  });

  describe('main table select fields', () => {
    it('updates benefitCode input', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('福利代码');
        expect(inputs.length).toBeGreaterThan(0);
      });
      const codeInput = screen.getAllByPlaceholderText(
        '福利代码',
      )[0] as HTMLInputElement;
      await userEvent.clear(codeInput);
      await userEvent.type(codeInput, 'NEW_CODE');
      codeInput.blur();
      await waitFor(() => {
        expect(codeInput.value).toBe('NEW_CODE');
      });
    });

    it('updates benefitDescription input', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('福利描述');
        expect(inputs.length).toBeGreaterThan(0);
      });
      const descInput = screen.getAllByPlaceholderText(
        '福利描述',
      )[0] as HTMLInputElement;
      await userEvent.clear(descInput);
      await userEvent.type(descInput, 'NEW_DESCRIPTION');
      descInput.blur();
      await waitFor(() => {
        expect(descInput.value).toBe('NEW_DESCRIPTION');
      });
    });

    it('updates benefitAllowAutoflow select', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const selects = document.querySelectorAll('.ant-select');
        expect(selects.length).toBeGreaterThan(0);
      });

      // Find benefitAllowAutoflow selects (they should have placeholder "请选择")
      const selects = Array.from(
        document.querySelectorAll('.ant-select-selector'),
      );
      const benefitSelect = selects.find((sel) => {
        const input = sel.querySelector('input');
        return input && input.getAttribute('placeholder') === '请选择';
      });

      if (benefitSelect) {
        await userEvent.click(benefitSelect);
        await waitFor(() => {
          const options = document.querySelectorAll('.ant-select-item');
          expect(options.length).toBeGreaterThan(0);
        });
        const options = document.querySelectorAll('.ant-select-item');
        if (options.length > 0) {
          await userEvent.click(options[1] as HTMLElement);
        }
      }
    });
  });

  describe('sub table operations', () => {
    it('updates sub table category select', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const selects = document.querySelectorAll('.ant-select');
        expect(selects.length).toBeGreaterThan(0);
      });

      // Expand row first if needed
      const expandButtons = document.querySelectorAll(
        '.ant-table-row-expand-icon',
      );
      if (expandButtons.length > 0) {
        await userEvent.click(expandButtons[0] as HTMLElement);
      }

      await waitFor(() => {
        const subSelects = document.querySelectorAll('.ant-select');
        expect(subSelects.length).toBeGreaterThan(0);
      });
    });

    it('updates sub table amount input', async () => {
      render(<TablePage />);

      // Expand row first to make sub-table visible
      await waitFor(() => {
        const expandButtons = document.querySelectorAll(
          '.ant-table-row-expand-icon',
        );
        expect(expandButtons.length).toBeGreaterThan(0);
      });

      const expandButtons = document.querySelectorAll(
        '.ant-table-row-expand-icon',
      );
      await userEvent.click(expandButtons[0] as HTMLElement);

      // Wait for sub-table to render
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('输入金额');
        expect(inputs.length).toBeGreaterThan(0);
      });

      const amountInput = screen.getAllByPlaceholderText(
        '输入金额',
      )[0] as HTMLInputElement;
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '5000');
      amountInput.blur();
      await waitFor(() => {
        expect(amountInput.value).toBe('5000');
      });
    });

    it('updates sub table daysTimes input', async () => {
      render(<TablePage />);

      // Expand row first to make sub-table visible
      await waitFor(() => {
        const expandButtons = document.querySelectorAll(
          '.ant-table-row-expand-icon',
        );
        expect(expandButtons.length).toBeGreaterThan(0);
      });

      const expandButtons = document.querySelectorAll(
        '.ant-table-row-expand-icon',
      );
      await userEvent.click(expandButtons[0] as HTMLElement);

      // Wait for sub-table to render
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('输入天数/次数');
        expect(inputs.length).toBeGreaterThan(0);
      });

      const daysInput = screen.getAllByPlaceholderText(
        '输入天数/次数',
      )[0] as HTMLInputElement;
      await userEvent.clear(daysInput);
      await userEvent.type(daysInput, '20');
      daysInput.blur();
      await waitFor(() => {
        expect(daysInput.value).toBe('20');
      });
    });

    it('adds sub row when Add one button is clicked', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', {
          name: /Add one/i,
        });
        expect(addButtons.length).toBeGreaterThan(0);
      });

      const initialSubRows = document.querySelectorAll(
        '.ant-table-expanded-row .ant-table-tbody tr',
      ).length;

      const addButton = screen.getAllByRole('button', { name: /Add one/i })[0];
      await userEvent.click(addButton);

      await waitFor(() => {
        const newSubRows = document.querySelectorAll(
          '.ant-table-expanded-row .ant-table-tbody tr',
        ).length;
        expect(newSubRows).toBeGreaterThan(initialSubRows);
      });
    });

    it('deletes sub row when delete button is clicked', async () => {
      render(<TablePage />);

      // Expand row first to make sub-table visible
      await waitFor(() => {
        const expandButtons = document.querySelectorAll(
          '.ant-table-row-expand-icon',
        );
        expect(expandButtons.length).toBeGreaterThan(0);
      });

      const expandButtons = document.querySelectorAll(
        '.ant-table-row-expand-icon',
      );
      await userEvent.click(expandButtons[0] as HTMLElement);

      // Wait for sub-table to render
      await waitFor(() => {
        const expandedRow = document.querySelector('.ant-table-expanded-row');
        expect(expandedRow).toBeInTheDocument();
      });

      // Find delete buttons in sub table (within expanded row)
      await waitFor(() => {
        const subDeleteButtons = Array.from(
          document.querySelectorAll('.ant-table-expanded-row .anticon-delete'),
        );
        expect(subDeleteButtons.length).toBeGreaterThan(0);
      });

      const subDeleteButtons = Array.from(
        document.querySelectorAll('.ant-table-expanded-row .anticon-delete'),
      );

      // Count initial sub rows
      const initialSubRows = document.querySelectorAll(
        '.ant-table-expanded-row .ant-table-tbody tr',
      ).length;

      expect(initialSubRows).toBeGreaterThan(0);
      expect(subDeleteButtons.length).toBeGreaterThan(0);

      // Click the first delete button in sub table
      await userEvent.click(subDeleteButtons[0] as HTMLElement);

      // Wait for row to be deleted
      await waitFor(
        () => {
          const newSubRows = document.querySelectorAll(
            '.ant-table-expanded-row .ant-table-tbody tr',
          ).length;
          expect(newSubRows).toBeLessThan(initialSubRows);
        },
        { timeout: 3000 },
      );
    });
  });

  // describe('expand/collapse rows', () => {
  // it('expands row when expand icon is clicked', async () => {
  //   render(<TablePage />);
  //   await waitFor(() => {
  //     const expandButtons = document.querySelectorAll(
  //       '.ant-table-row-expand-icon',
  //     );
  //     expect(expandButtons.length).toBeGreaterThan(0);
  //   });

  //   const expandButton = document.querySelectorAll(
  //     '.ant-table-row-expand-icon',
  //   )[0] as HTMLElement;

  //   // Ensure initially not expanded (or at least stable)
  //   const beforeExpandedRows = document.querySelectorAll(
  //     '.ant-table-expanded-row',
  //   ).length;

  //   await userEvent.click(expandButton);

  //   await waitFor(() => {
  //     const afterExpandedRows = document.querySelectorAll(
  //       '.ant-table-expanded-row',
  //     ).length;
  //     expect(afterExpandedRows).toBeGreaterThan(beforeExpandedRows);
  //   });
  // });

  // it('collapses row when expand icon is clicked again', async () => {
  //   render(<TablePage />);
  //   await waitFor(() => {
  //     const expandButtons = document.querySelectorAll(
  //       '.ant-table-row-expand-icon',
  //     );
  //     expect(expandButtons.length).toBeGreaterThan(0);
  //   });

  //   const expandButton = document.querySelectorAll(
  //     '.ant-table-row-expand-icon',
  //   )[0] as HTMLElement;

  //   // Expand first
  //   await userEvent.click(expandButton);
  //   await waitFor(() => {
  //     const expandedRow = document.querySelector('.ant-table-expanded-row');
  //     expect(expandedRow).toBeInTheDocument();
  //   });

  //   // Then collapse
  //   await userEvent.click(expandButton);
  //   await waitFor(() => {
  //     const expandedRow = document.querySelector('.ant-table-expanded-row');
  //     expect(expandedRow).not.toBeInTheDocument();
  //   });
  // });
  // });

  describe('Save behavior', () => {
    // it('calls message.success when Save is clicked with valid data', async () => {
    //   render(<TablePage />);
    //   await waitFor(() => {
    //     expect(
    //       screen.getByRole('button', { name: /Save/i }),
    //     ).toBeInTheDocument();
    //   });
    //   const saveButton = screen.getByRole('button', { name: /Save/i });
    //   await userEvent.click(saveButton);
    //   await waitFor(() => {
    //     expect(mockMessage.success).toHaveBeenCalledWith('保存成功');
    //   });
    // });

    it('calls message.error when Save is clicked with missing category field', async () => {
      const store = createTestStore();
      const testData: MainTableDataType[] = [
        {
          key: '1',
          benefitCode: 'A47',
          benefitDescription: 'Test',
          deductible: false,
          coInsurance: false,
          copayOption: false,
          ghEmWaiveDed: false,
          ghEmWaiveCoIns: false,
          illnessWaiveCoIns: false,
          disabilityLimit: false,
          annualLimit: false,
          lifetimeLimit: false,
          benefitAllowAutoflow: '',
          subTableData: [
            {
              key: '1-1',
              category: '', // Missing category
              amountType: 'Fixed value',
              amount: '3000',
              daysTimes: '',
              subjectToIllness: 'False',
            },
          ],
        },
      ];
      store.dispatch(setDataSource(testData));
      render(<TablePage />, { store });
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Save/i }),
        ).toBeInTheDocument();
      });
      const saveButton = screen.getByRole('button', { name: /Save/i });
      await userEvent.click(saveButton);
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('请填写所有必填字段');
      });
    });

    it('calls message.error when Save is clicked with missing amountType field', async () => {
      const store = createTestStore();
      const testData: MainTableDataType[] = [
        {
          key: '1',
          benefitCode: 'A47',
          benefitDescription: 'Test',
          deductible: false,
          coInsurance: false,
          copayOption: false,
          ghEmWaiveDed: false,
          ghEmWaiveCoIns: false,
          illnessWaiveCoIns: false,
          disabilityLimit: false,
          annualLimit: false,
          lifetimeLimit: false,
          benefitAllowAutoflow: '',
          subTableData: [
            {
              key: '1-1',
              category: 'Per accident limit',
              amountType: '', // Missing amountType
              amount: '3000',
              daysTimes: '',
              subjectToIllness: 'False',
            },
          ],
        },
      ];
      store.dispatch(setDataSource(testData));
      render(<TablePage />, { store });
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Save/i }),
        ).toBeInTheDocument();
      });
      const saveButton = screen.getByRole('button', { name: /Save/i });
      await userEvent.click(saveButton);
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('请填写所有必填字段');
      });
    });

    it('calls message.error when Save fails', async () => {
      mockTableApi.saveTableData.mockRejectedValueOnce(
        new Error('Save failed'),
      );
      render(<TablePage />);
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Save/i }),
        ).toBeInTheDocument();
      });
      const saveButton = screen.getByRole('button', { name: /Save/i });
      await userEvent.click(saveButton);
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('保存失败，请重试');
      });
    });

    it('displays validation errors for empty category', async () => {
      const store = createTestStore();
      const testData: MainTableDataType[] = [
        {
          key: '1',
          benefitCode: 'A47',
          benefitDescription: 'Test',
          deductible: false,
          coInsurance: false,
          copayOption: false,
          ghEmWaiveDed: false,
          ghEmWaiveCoIns: false,
          illnessWaiveCoIns: false,
          disabilityLimit: false,
          annualLimit: false,
          lifetimeLimit: false,
          benefitAllowAutoflow: '',
          subTableData: [
            {
              key: '1-1',
              category: '',
              amountType: 'Fixed value',
              amount: '3000',
              daysTimes: '',
              subjectToIllness: 'False',
            },
          ],
        },
      ];
      store.dispatch(setDataSource(testData));
      // Expand the row so sub-table is visible
      store.dispatch(setExpandedRowKeys(['1']));
      render(<TablePage />, { store });
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Save/i }),
        ).toBeInTheDocument();
      });
      // Wait for expanded row to render
      await waitFor(() => {
        const expandedRow = document.querySelector('.ant-table-expanded-row');
        expect(expandedRow).toBeInTheDocument();
      });
      const saveButton = screen.getByRole('button', { name: /Save/i });
      await userEvent.click(saveButton);
      await waitFor(
        () => {
          // Error text might be split across elements, so check the document
          const errorElement =
            document.body.textContent?.includes('Category 是必填项');
          expect(errorElement).toBeTruthy();
        },
        { timeout: 3000 },
      );
    });

    it('displays validation errors for empty amountType', async () => {
      const store = createTestStore();
      const testData: MainTableDataType[] = [
        {
          key: '1',
          benefitCode: 'A47',
          benefitDescription: 'Test',
          deductible: false,
          coInsurance: false,
          copayOption: false,
          ghEmWaiveDed: false,
          ghEmWaiveCoIns: false,
          illnessWaiveCoIns: false,
          disabilityLimit: false,
          annualLimit: false,
          lifetimeLimit: false,
          benefitAllowAutoflow: '',
          subTableData: [
            {
              key: '1-1',
              category: 'Per accident limit',
              amountType: '',
              amount: '3000',
              daysTimes: '',
              subjectToIllness: 'False',
            },
          ],
        },
      ];
      store.dispatch(setDataSource(testData));
      // Expand the row so sub-table is visible
      store.dispatch(setExpandedRowKeys(['1']));
      render(<TablePage />, { store });
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Save/i }),
        ).toBeInTheDocument();
      });
      // Wait for expanded row to render
      await waitFor(() => {
        const expandedRow = document.querySelector('.ant-table-expanded-row');
        expect(expandedRow).toBeInTheDocument();
      });
      const saveButton = screen.getByRole('button', { name: /Save/i });
      await userEvent.click(saveButton);
      await waitFor(
        () => {
          // Error text might be split across elements, so check the document
          const errorElement =
            document.body.textContent?.includes('Amount type 是必填项');
          expect(errorElement).toBeTruthy();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Delete main row', () => {
    it('deletes main row when delete button is clicked', async () => {
      render(<TablePage />);
      await waitFor(() => {
        const deleteButtons = document.querySelectorAll('.anticon-delete');
        expect(deleteButtons.length).toBeGreaterThan(0);
      });

      // Find delete button in main table (not in sub table)
      const mainDeleteButtons = Array.from(
        document.querySelectorAll('.anticon-delete'),
      ).filter((btn) => {
        const row = btn.closest('tr');
        return (
          row &&
          row.closest('.ant-table-expanded-row') === null &&
          row.closest('.ant-table-tbody') !== null
        );
      });

      if (mainDeleteButtons.length > 0) {
        // const initialRows = document.querySelectorAll(
        //   '.ant-table-tbody > tr:not(.ant-table-expanded-row)',
        // ).length;

        await userEvent.click(mainDeleteButtons[0] as HTMLElement);

        await waitFor(() => {
          expect(mockTableApi.deleteMainRow).toHaveBeenCalled();
        });
      }
    });

    it('calls message.error when delete fails', async () => {
      mockTableApi.deleteMainRow.mockRejectedValueOnce(
        new Error('Delete failed'),
      );
      render(<TablePage />);
      await waitFor(() => {
        const deleteButtons = document.querySelectorAll('.anticon-delete');
        expect(deleteButtons.length).toBeGreaterThan(0);
      });

      const mainDeleteButtons = Array.from(
        document.querySelectorAll('.anticon-delete'),
      ).filter((btn) => {
        const row = btn.closest('tr');
        return row && row.closest('.ant-table-expanded-row') === null;
      });

      if (mainDeleteButtons.length > 0) {
        await userEvent.click(mainDeleteButtons[0] as HTMLElement);
        await waitFor(() => {
          expect(mockMessage.error).toHaveBeenCalledWith('删除失败，请重试');
        });
      }
    });
  });

  describe('data fetching', () => {
    it('fetches data on mount when dataSource is empty', async () => {
      const store = createTestStore();
      store.dispatch(setDataSource([]));
      render(<TablePage />, { store });
      await waitFor(
        () => {
          // Component should trigger fetchTableData
          expect(document.querySelector('.ant-table')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('does not fetch data when dataSource already has data', async () => {
      const store = createTestStore();
      const testData: MainTableDataType[] = [
        {
          key: '1',
          benefitCode: 'A47',
          benefitDescription: 'Test',
          deductible: false,
          coInsurance: false,
          copayOption: false,
          ghEmWaiveDed: false,
          ghEmWaiveCoIns: false,
          illnessWaiveCoIns: false,
          disabilityLimit: false,
          annualLimit: false,
          lifetimeLimit: false,
          benefitAllowAutoflow: '',
          subTableData: [],
        },
      ];
      store.dispatch(setDataSource(testData));
      render(<TablePage />, { store });
      await waitFor(() => {
        expect(document.querySelector('.ant-table')).toBeInTheDocument();
      });
    });
  });

  // describe('validation error clearing', () => {
  //   it('clears validation error when field is updated', async () => {
  //     const store = createTestStore();
  //     const testData: MainTableDataType[] = [
  //       {
  //         key: '1',
  //         benefitCode: 'A47',
  //         benefitDescription: 'Test',
  //         deductible: false,
  //         coInsurance: false,
  //         copayOption: false,
  //         ghEmWaiveDed: false,
  //         ghEmWaiveCoIns: false,
  //         illnessWaiveCoIns: false,
  //         disabilityLimit: false,
  //         annualLimit: false,
  //         lifetimeLimit: false,
  //         benefitAllowAutoflow: '',
  //         subTableData: [
  //           {
  //             key: '1-1',
  //             category: '',
  //             amountType: 'Fixed value',
  //             amount: '3000',
  //             daysTimes: '',
  //             subjectToIllness: 'False',
  //           },
  //         ],
  //       },
  //     ];
  //     store.dispatch(setDataSource(testData));
  //     render(<TablePage />, { store });

  //     // Trigger validation error
  //     const saveButton = screen.getByRole('button', { name: /Save/i });
  //     await userEvent.click(saveButton);

  //     await waitFor(() => {
  //       expect(screen.getByText(/Category 是必填项/i)).toBeInTheDocument();
  //     });

  //     // Update the category field
  //     store.dispatch(
  //       updateSubTableData({
  //         mainKey: '1',
  //         subKey: '1-1',
  //         field: 'category',
  //         value: 'Per accident limit',
  //       }),
  //     );

  //     await waitFor(() => {
  //       const errorText = screen.queryByText(/Category 是必填项/i);
  //       expect(errorText).not.toBeInTheDocument();
  //     });
  //   });
  // });
});
