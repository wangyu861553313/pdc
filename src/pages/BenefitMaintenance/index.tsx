import type { BenefitRecord } from '@/store/api/benefitApi';
import {
  useGetBenefitsQuery,
  useSaveBenefitMutation,
} from '@/store/api/benefitApi';
import {
  closeModal,
  fetchBenefits,
  openCreateModal,
  openEditModal,
  resetSearch,
  selectFilteredBenefits,
  selectShouldFetchBenefits,
  setPaginationPage,
  setPaginationPageSize,
  setSearchValues,
  upsertBenefit,
} from '@/store/benefitSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  type TableColumnsType,
} from 'antd';
import React, { useEffect } from 'react';

interface EditFormValues {
  benefitCode: string;
  benefitDescription?: string;
  benefitGroup?: string;
  displaySequence?: number;
  claimType?: string;
  vitality?: boolean;
  nonPayable?: boolean;
}

const benefitGroupOptions = [
  { label: 'MC01 - Room & Board', value: 'MC01 - Room & Board' },
  { label: 'APM1', value: 'APM1' },
];

const claimTypeOptions = [
  { label: 'HS - Hospitalization', value: 'HS - Hospitalization' },
  { label: 'OP - Outpatient', value: 'OP - Outpatient' },
];

interface SearchFormValues {
  benefitCode?: string;
  benefitDescription?: string;
  benefitGroup?: string;
}

const BenefitMaintenancePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pagination, editingRecord, isModalVisible } = useAppSelector(
    (state) => state.benefit,
  );
  const filteredData = useAppSelector(selectFilteredBenefits);
  const shouldFetch = useAppSelector(selectShouldFetchBenefits);

  const [form] = Form.useForm<SearchFormValues>();
  const [editForm] = Form.useForm<EditFormValues>();
  const { isLoading: isQueryLoading } = useGetBenefitsQuery();
  const [saveBenefit, { isLoading: isSaving }] = useSaveBenefitMutation();

  useEffect(() => {
    if (shouldFetch) {
      dispatch(fetchBenefits());
    }
  }, [shouldFetch, dispatch]);

  const handleSearch = () => {
    const values = form.getFieldsValue() as SearchFormValues;
    dispatch(setSearchValues(values));
  };

  const handleReset = () => {
    form.resetFields();
    dispatch(resetSearch());
  };

  const handleOpenCreateModal = () => {
    editForm.resetFields();
    dispatch(openCreateModal());
  };

  const handleOpenEditModal = (record: BenefitRecord) => {
    editForm.setFieldsValue({
      benefitCode: record.benefitCode,
      benefitDescription: record.benefitDescription,
      benefitGroup: record.benefitGroup,
      displaySequence: record.displaySequence,
      nonPayable: record.nonPayable,
    });
    dispatch(openEditModal(record));
  };

  const handleModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      const key = editingRecord?.key ?? String(Date.now());
      const nextRecord: BenefitRecord = {
        key,
        benefitCode: values.benefitCode,
        benefitDescription: values.benefitDescription || '',
        benefitGroup: values.benefitGroup || '',
        displaySequence: values.displaySequence || 0,
        settleSequence: editingRecord?.settleSequence || '',
        nonPayable: !!values.nonPayable,
      };

      await saveBenefit({ record: nextRecord }).unwrap();
      dispatch(upsertBenefit(nextRecord));
      dispatch(closeModal());
    } catch {
      // validate failed
    }
  };

  const handleModalCancel = () => {
    dispatch(closeModal());
  };

  const columns: TableColumnsType<BenefitRecord> = [
    {
      title: 'Benefit Code',
      dataIndex: 'benefitCode',
      key: 'benefitCode',
    },
    {
      title: 'Benefit Description',
      dataIndex: 'benefitDescription',
      key: 'benefitDescription',
    },
    {
      title: 'Benefit Group',
      dataIndex: 'benefitGroup',
      key: 'benefitGroup',
    },
    {
      title: 'Display sequence',
      dataIndex: 'displaySequence',
      key: 'displaySequence',
      width: 140,
    },
    {
      title: 'Settle sequence',
      dataIndex: 'settleSequence',
      key: 'settleSequence',
      width: 140,
    },
    {
      title: 'Non payable',
      dataIndex: 'nonPayable',
      key: 'nonPayable',
      width: 110,
      render: (value: boolean) => <Checkbox checked={value} disabled />,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleOpenEditModal(record)}
        />
      ),
    },
  ];

  const isLoading = isQueryLoading || isSaving;

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          backgroundColor: '#fff',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            backgroundColor: '#cf1322',
            color: '#fff',
            padding: '12px 24px',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Benefit Maintenance
        </div>

        <div style={{ padding: 24 }}>
          <Form
            form={form}
            layout="inline"
            style={{ marginBottom: 16, rowGap: 12 }}
          >
            <Form.Item label="Benefit Code" name="benefitCode">
              <Input
                placeholder="Placeholder"
                allowClear
                style={{ width: 220 }}
              />
            </Form.Item>
            <Form.Item label="Benefit Description" name="benefitDescription">
              <Input
                placeholder="Placeholder"
                allowClear
                style={{ width: 260 }}
              />
            </Form.Item>
            <Form.Item label="Benefit Group" name="benefitGroup">
              <Select
                options={benefitGroupOptions}
                placeholder="Select benefit group"
                allowClear
                style={{ width: 260 }}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                >
                  Search
                </Button>
                <Button onClick={handleReset}>Reset</Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleOpenCreateModal}
                >
                  Create
                </Button>
              </Space>
            </Form.Item>
          </Form>

          <Spin spinning={isLoading}>
            <Table<BenefitRecord>
              columns={columns}
              dataSource={filteredData}
              rowKey="key"
              pagination={{
                current: pagination.currentPage,
                pageSize: pagination.pageSize,
                total: filteredData.length,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, pageSize) => {
                  dispatch(setPaginationPage(page));
                  if (pageSize !== pagination.pageSize) {
                    dispatch(setPaginationPageSize(pageSize));
                  }
                },
              }}
            />
          </Spin>
        </div>
      </div>

      <Modal
        open={isModalVisible}
        title={editingRecord ? 'Edit Benefit' : 'Create Benefit'}
        afterClose={() => editForm.resetFields()}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={900}
        okText="Save"
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: 8 }}
          initialValues={{
            vitality: false,
            nonPayable: false,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 16,
            }}
          >
            <Form.Item
              label="* Benefit Code"
              name="benefitCode"
              rules={[{ required: true, message: 'Benefit Code is required' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Benefit Description" name="benefitDescription">
              <Input />
            </Form.Item>
            <Form.Item label="Benefit Group" name="benefitGroup">
              <Select
                placeholder="Select benefit group"
                options={benefitGroupOptions}
                allowClear
              />
            </Form.Item>
            <Form.Item label="Display Sequence" name="displaySequence">
              <Input type="number" />
            </Form.Item>
            <Form.Item label="Claim Type" name="claimType">
              <Select
                placeholder="Claim Type"
                options={claimTypeOptions}
                allowClear
              />
            </Form.Item>
            <Form.Item label="Vitality" name="vitality" valuePropName="checked">
              <Checkbox />
            </Form.Item>
            <Form.Item
              label="Non payable"
              name="nonPayable"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </div>

          <div
            style={{
              marginTop: 32,
              padding: '16px 12px',
              backgroundColor: '#fafafa',
              borderRadius: 4,
              textAlign: 'center',
              color: '#595959',
            }}
          >
            Fixed content area for user to put in some comments to guide about
            how to create / maintain a benefit code
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BenefitMaintenancePage;
