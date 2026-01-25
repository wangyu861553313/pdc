import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addSubRow,
  clearFieldError,
  deleteMainRow,
  deleteSubRow,
  setExpandedRowKeys,
  setSelectedRowKeys,
  setValidationErrors,
  updateMainCheckbox,
  updateMainSelect,
  updateSubTableData,
  type MainTableDataType,
  type SubTableDataType,
} from '@/store/tableSlice';
import {
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  message,
  Select,
  Space,
  Table,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// 缓存选项数组，避免每次渲染时重新创建
const categoryOptions = [
  { label: '请选择', value: '' },
  { label: 'Per accident limit', value: 'Per accident limit' },
  { label: 'Per day limit', value: 'Per day limit' },
  { label: 'Per visit limit', value: 'Per visit limit' },
  { label: 'Per year limit', value: 'Per year limit' },
];

const amountTypeOptions = [
  { label: '请选择', value: '' },
  { label: 'Fixed value', value: 'Fixed value' },
  { label: 'Percentage', value: 'Percentage' },
  { label: 'Unlimited', value: 'Unlimited' },
];

const subjectToIllnessOptions = [
  { label: '请选择', value: '' },
  { label: 'True', value: 'True' },
  { label: 'False', value: 'False' },
];

const benefitAllowAutoflowOptions = [
  { label: '请选择', value: '' },
  { label: 'Within days limit', value: 'Within days limit' },
  { label: 'No limit', value: 'No limit' },
  { label: 'Custom', value: 'Custom' },
];

// 可编辑输入组件，使用本地状态避免频繁更新 Redux
interface EditableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const EditableInput: React.FC<EditableInputProps> = React.memo(
  ({ value, onChange, placeholder }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    };

    const handleBlur = () => {
      if (localValue !== value) {
        onChange(localValue);
      }
    };

    return (
      <Input
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        size="small"
        style={{ padding: '4px 8px' }}
      />
    );
  },
);

EditableInput.displayName = 'EditableInput';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataSource, selectedRowKeys, expandedRowKeys, validationErrors } =
    useAppSelector((state) => state.table);

  // 全选/取消全选
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        dispatch(setSelectedRowKeys(dataSource.map((item) => item.key)));
      } else {
        dispatch(setSelectedRowKeys([]));
      }
    },
    [dispatch, dataSource],
  );

  const isAllSelected =
    dataSource.length > 0 && selectedRowKeys.length === dataSource.length;
  const isIndeterminate =
    selectedRowKeys.length > 0 && selectedRowKeys.length < dataSource.length;

  // 验证必填字段
  const validateRequiredFields = (): boolean => {
    const errors: Record<string, Record<string, Record<string, string>>> = {};
    let hasError = false;

    dataSource.forEach((mainRecord) => {
      const mainKey = String(mainRecord.key);
      mainRecord.subTableData.forEach((subRecord) => {
        const subKey = String(subRecord.key);
        const subErrors: Record<string, string> = {};

        // 验证 Category (必填)
        if (!subRecord.category || subRecord.category.trim() === '') {
          subErrors.category = 'Category 是必填项';
          hasError = true;
        }

        // 验证 Amount type (必填)
        if (!subRecord.amountType || subRecord.amountType.trim() === '') {
          subErrors.amountType = 'Amount type 是必填项';
          hasError = true;
        }

        if (Object.keys(subErrors).length > 0) {
          if (!errors[mainKey]) {
            errors[mainKey] = {};
          }
          errors[mainKey][subKey] = subErrors;
        }
      });
    });

    dispatch(setValidationErrors(errors));
    return !hasError;
  };

  // 处理主表格复选框变化
  const handleMainCheckboxChange = useCallback(
    (
      record: MainTableDataType,
      field: keyof MainTableDataType,
      checked: boolean,
    ) => {
      dispatch(updateMainCheckbox({ key: record.key, field, checked }));
    },
    [dispatch],
  );

  // 处理主表格下拉菜单变化
  const handleMainSelectChange = useCallback(
    (
      record: MainTableDataType,
      field: keyof MainTableDataType,
      value: string,
    ) => {
      dispatch(updateMainSelect({ key: record.key, field, value }));
    },
    [dispatch],
  );

  // 处理子表格数据变化
  const handleSubTableChange = useCallback(
    (
      mainKey: React.Key,
      subKey: React.Key,
      field: keyof SubTableDataType,
      value: string,
    ) => {
      dispatch(updateSubTableData({ mainKey, subKey, field, value }));
      // 清除该字段的错误
      dispatch(clearFieldError({ mainKey, subKey, field }));
    },
    [dispatch],
  );

  // 添加子表格行
  const handleAddSubRow = useCallback(
    (mainKey: React.Key) => {
      dispatch(addSubRow({ mainKey }));
    },
    [dispatch],
  );

  // 删除子表格行
  const handleDeleteSubRow = useCallback(
    (mainKey: React.Key, subKey: React.Key) => {
      dispatch(deleteSubRow({ mainKey, subKey }));
    },
    [dispatch],
  );

  // 删除主表格行
  const handleDeleteMainRow = useCallback(
    (key: React.Key) => {
      dispatch(deleteMainRow(key));
    },
    [dispatch],
  );

  // 保存数据
  const handleSave = () => {
    if (!validateRequiredFields()) {
      message.error('请填写所有必填字段');
      return;
    }
    console.log('保存数据:', dataSource);
    message.success('保存成功');
  };

  // 子表格列定义
  const subTableColumns: TableColumnsType<SubTableDataType> = useMemo(
    () => [
      {
        title: '*Category',
        dataIndex: 'category',
        key: 'category',
        width: 200,
        render: (text, record) => {
          const mainRecord = dataSource.find((item) =>
            item.subTableData.some((sub) => sub.key === record.key),
          );
          if (!mainRecord) return text;

          const error =
            validationErrors[String(mainRecord.key)]?.[String(record.key)]
              ?.category;
          return (
            <div>
              <Select
                key={`${mainRecord.key}-${record.key}-category`}
                value={text || undefined}
                style={{ width: '100%' }}
                onChange={(value) =>
                  handleSubTableChange(
                    mainRecord.key,
                    record.key,
                    'category',
                    value || '',
                  )
                }
                placeholder="请选择"
                allowClear
                status={error ? 'error' : ''}
                options={categoryOptions}
                size="small"
              />
              {error && (
                <div
                  style={{
                    color: '#ff4d4f',
                    fontSize: '12px',
                    marginTop: '4px',
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: '*Amount type',
        dataIndex: 'amountType',
        key: 'amountType',
        width: 150,
        render: (text, record) => {
          const mainRecord = dataSource.find((item) =>
            item.subTableData.some((sub) => sub.key === record.key),
          );
          if (!mainRecord) return text;

          const error =
            validationErrors[String(mainRecord.key)]?.[String(record.key)]
              ?.amountType;
          return (
            <div>
              <Select
                // key={`${mainRecord.key}-${record.key}-amountType`}
                value={text || undefined}
                style={{ width: '100%' }}
                onChange={(value) =>
                  handleSubTableChange(
                    mainRecord.key,
                    record.key,
                    'amountType',
                    value || '',
                  )
                }
                placeholder="请选择"
                allowClear
                status={error ? 'error' : ''}
                options={amountTypeOptions}
                size="small"
              />
              {error && (
                <div
                  style={{
                    color: '#ff4d4f',
                    fontSize: '12px',
                    marginTop: '4px',
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        width: 150,
        render: (text, record) => {
          const mainRecord = dataSource.find((item) =>
            item.subTableData.some((sub) => sub.key === record.key),
          );
          if (!mainRecord) return text;

          return (
            <EditableInput
              value={text}
              onChange={(value) =>
                handleSubTableChange(
                  mainRecord.key,
                  record.key,
                  'amount',
                  value,
                )
              }
              placeholder="输入金额"
            />
          );
        },
      },
      {
        title: 'No. of Days/Times',
        dataIndex: 'daysTimes',
        key: 'daysTimes',
        width: 180,
        render: (text, record) => {
          const mainRecord = dataSource.find((item) =>
            item.subTableData.some((sub) => sub.key === record.key),
          );
          if (!mainRecord) return text;

          const inputKey = `${mainRecord.key}-${record.key}-daysTimes`;
          return (
            <EditableInput
              key={inputKey}
              value={text}
              onChange={(value) =>
                handleSubTableChange(
                  mainRecord.key,
                  record.key,
                  'daysTimes',
                  value,
                )
              }
              placeholder="输入天数/次数"
            />
          );
        },
      },
      {
        title: 'Subject to Illness',
        dataIndex: 'subjectToIllness',
        key: 'subjectToIllness',
        width: 150,
        render: (text, record) => {
          const mainRecord = dataSource.find((item) =>
            item.subTableData.some((sub) => sub.key === record.key),
          );
          if (!mainRecord) return text;

          return (
            <Select
              key={`${mainRecord.key}-${record.key}-subjectToIllness`}
              value={text || undefined}
              style={{ width: '100%' }}
              onChange={(value) =>
                handleSubTableChange(
                  mainRecord.key,
                  record.key,
                  'subjectToIllness',
                  value || '',
                )
              }
              placeholder="请选择"
              allowClear
              options={subjectToIllnessOptions}
              size="small"
            />
          );
        },
      },
      {
        title: 'Action',
        key: 'action',
        width: 120,
        render: (_, record) => {
          const mainRecord = dataSource.find((item) =>
            item.subTableData.some((sub) => sub.key === record.key),
          );
          if (!mainRecord) return null;

          const items = [
            {
              key: 'more',
              label: '更多操作',
            },
          ];

          return (
            <Space size="small">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteSubRow(mainRecord.key, record.key)}
                size="small"
              />
              <Dropdown menu={{ items }} trigger={['click']}>
                <Button type="text" icon={<DownOutlined />} size="small" />
              </Dropdown>
            </Space>
          );
        },
      },
    ],
    [dataSource, validationErrors, handleSubTableChange, handleDeleteSubRow],
  );

  // 主表格列定义
  const mainTableColumns: TableColumnsType<MainTableDataType> = useMemo(
    () => [
      {
        title: () => (
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
        ),
        key: 'selection',
        width: 50,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={selectedRowKeys.includes(record.key)}
            onChange={(e) => {
              const newKeys = e.target.checked
                ? [...selectedRowKeys, record.key]
                : selectedRowKeys.filter((key) => key !== record.key);
              dispatch(setSelectedRowKeys(newKeys));
            }}
          />
        ),
      },
      {
        title: 'Benefit code',
        dataIndex: 'benefitCode',
        key: 'benefitCode',
        width: 120,
        render: (text, record) => (
          <EditableInput
            key={`${record.key}-benefitCode`}
            value={text}
            onChange={(value) =>
              handleMainSelectChange(record, 'benefitCode', value)
            }
            placeholder="福利代码"
          />
        ),
      },
      {
        title: 'Benefit description',
        dataIndex: 'benefitDescription',
        key: 'benefitDescription',
        width: 200,
        render: (text, record) => (
          <EditableInput
            key={`${record.key}-benefitDescription`}
            value={text}
            onChange={(value) =>
              handleMainSelectChange(record, 'benefitDescription', value)
            }
            placeholder="福利描述"
          />
        ),
      },
      {
        title: 'Deductible',
        key: 'deductible',
        width: 100,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={record.deductible}
            onChange={(e) =>
              handleMainCheckboxChange(record, 'deductible', e.target.checked)
            }
          />
        ),
      },
      {
        title: 'Co-Insurance',
        key: 'coInsurance',
        width: 120,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={record.coInsurance}
            onChange={(e) =>
              handleMainCheckboxChange(record, 'coInsurance', e.target.checked)
            }
          />
        ),
      },
      {
        title: 'Copay option',
        key: 'copayOption',
        width: 120,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={record.copayOption}
            onChange={(e) =>
              handleMainCheckboxChange(record, 'copayOption', e.target.checked)
            }
          />
        ),
      },
      {
        title: 'GH/EM (Waive ded)',
        key: 'ghEmWaiveDed',
        width: 150,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={record.ghEmWaiveDed}
            onChange={(e) =>
              handleMainCheckboxChange(record, 'ghEmWaiveDed', e.target.checked)
            }
          />
        ),
      },
      {
        title: 'GH/EM (Waive co-ins)',
        key: 'ghEmWaiveCoIns',
        width: 170,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={record.ghEmWaiveCoIns}
            onChange={(e) =>
              handleMainCheckboxChange(
                record,
                'ghEmWaiveCoIns',
                e.target.checked,
              )
            }
          />
        ),
      },
      {
        title: 'Illness (Waive co-ins)',
        key: 'illnessWaiveCoIns',
        width: 180,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={record.illnessWaiveCoIns}
            onChange={(e) =>
              handleMainCheckboxChange(
                record,
                'illnessWaiveCoIns',
                e.target.checked,
              )
            }
          />
        ),
      },
      {
        title: 'Disability limit',
        key: 'disabilityLimit',
        width: 130,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={record.disabilityLimit}
            onChange={(e) =>
              handleMainCheckboxChange(
                record,
                'disabilityLimit',
                e.target.checked,
              )
            }
          />
        ),
      },
      {
        title: 'Annual limit',
        key: 'annualLimit',
        width: 110,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={record.annualLimit}
            onChange={(e) =>
              handleMainCheckboxChange(record, 'annualLimit', e.target.checked)
            }
          />
        ),
      },
      {
        title: 'Lifetime limit',
        key: 'lifetimeLimit',
        width: 120,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={record.lifetimeLimit}
            onChange={(e) =>
              handleMainCheckboxChange(
                record,
                'lifetimeLimit',
                e.target.checked,
              )
            }
          />
        ),
      },
      {
        title: 'Benefit allow autoflow',
        key: 'benefitAllowAutoflow',
        width: 200,
        render: (_, record) => (
          <Select
            key={`${record.key}-benefitAllowAutoflow`}
            value={record.benefitAllowAutoflow || undefined}
            style={{ width: '100%' }}
            onChange={(value) =>
              handleMainSelectChange(
                record,
                'benefitAllowAutoflow',
                value || '',
              )
            }
            placeholder="请选择"
            allowClear
            options={benefitAllowAutoflowOptions}
            size="small"
          />
        ),
      },
      {
        title: 'Action',
        key: 'action',
        width: 150,
        fixed: 'right',
        render: (_, record) => {
          const items = [
            {
              key: 'more',
              label: '更多操作',
            },
          ];

          return (
            <Space size="small">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteMainRow(record.key)}
                size="small"
              />
              <Button type="text" icon={<SettingOutlined />} size="small" />
              <Dropdown menu={{ items }} trigger={['click']}>
                <Button type="text" icon={<DownOutlined />} size="small" />
              </Dropdown>
            </Space>
          );
        },
      },
    ],
    [
      isAllSelected,
      isIndeterminate,
      selectedRowKeys,
      handleSelectAll,
      handleMainSelectChange,
      handleMainCheckboxChange,
      handleDeleteMainRow,
      dispatch,
    ],
  );

  // 处理展开行变化
  const handleExpandedRowsChange = useCallback(
    (keys: readonly React.Key[]) => {
      dispatch(setExpandedRowKeys(Array.from(keys)));
    },
    [dispatch],
  );

  // 展开行渲染
  const expandedRowRender = useCallback(
    (record: MainTableDataType) => {
      return (
        <div style={{ padding: '12px 16px', backgroundColor: '#fafafa' }}>
          <Table<SubTableDataType>
            columns={subTableColumns}
            dataSource={record.subTableData}
            pagination={false}
            size="small"
            rowKey="key"
            style={{ fontSize: '12px' }}
            components={{
              header: {
                cell: (props: any) => (
                  <th
                    {...props}
                    style={{
                      ...props.style,
                      borderBottom: '1px solid #f0f0f0',
                      borderRight: 'none',
                      borderLeft: 'none',
                      borderTop: 'none',
                    }}
                  />
                ),
              },
              body: {
                cell: (props: any) => (
                  <td
                    {...props}
                    style={{
                      ...props.style,
                      border: 'none',
                    }}
                  />
                ),
              },
            }}
          />
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => handleAddSubRow(record.key)}
            style={{ marginTop: 12, width: '100%' }}
            size="small"
          >
            Add one
          </Button>
        </div>
      );
    },
    [subTableColumns, handleAddSubRow],
  );

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          danger
          style={{
            backgroundColor: '#ff4d4f',
            borderColor: '#ff4d4f',
            color: '#fff',
            fontWeight: 500,
          }}
        >
          Select
        </Button>
        <h2
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            color: '#262626',
          }}
        >
          Benefits shared limit
        </h2>
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          padding: '16px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Table<MainTableDataType>
          columns={mainTableColumns}
          dataSource={dataSource}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpandedRowsChange: handleExpandedRowsChange,
          }}
          pagination={false}
          scroll={{ x: 2000 }}
          size="small"
          rowKey="key"
          style={{ fontSize: '13px' }}
          components={{
            header: {
              cell: (props: any) => (
                <th
                  {...props}
                  style={{
                    ...props.style,
                    borderBottom: '1px solid #f0f0f0',
                    borderRight: 'none',
                    borderLeft: 'none',
                    borderTop: 'none',
                  }}
                />
              ),
            },
            body: {
              cell: (props: any) => (
                <td
                  {...props}
                  style={{
                    ...props.style,
                    border: 'none',
                  }}
                />
              ),
            },
          }}
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
      <div className="text-red-500 bg-blue-500 h-10">123</div>
    </div>
  );
};

export default App;
