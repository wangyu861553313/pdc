import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  type TableColumnsType,
} from 'antd';
import React, { useMemo, useState } from 'react';

interface BenefitRecord {
  key: string;
  benefitCode: string;
  benefitDescription: string;
  benefitGroup: string;
  displaySequence: number;
  settleSequence: string;
  nonPayable: boolean;
}

interface SearchFormValues {
  benefitCode?: string;
  benefitDescription?: string;
  benefitGroup?: string;
}

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

const initialData: BenefitRecord[] = [
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
];

const BenefitMaintenancePage: React.FC = () => {
  const [form] = Form.useForm<SearchFormValues>();
  const [editForm] = Form.useForm<EditFormValues>();
  const [dataSource, setDataSource] = useState<BenefitRecord[]>(initialData);
  const [editingRecord, setEditingRecord] = useState<BenefitRecord | null>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [searchValues, setSearchValues] = useState<SearchFormValues>({});

  const filteredData = useMemo(() => {
    return dataSource.filter((item) => {
      const { benefitCode, benefitDescription, benefitGroup } = searchValues;
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
  }, [dataSource, searchValues]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setSearchValues(values);
  };

  const handleReset = () => {
    form.resetFields();
    setSearchValues({});
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    editForm.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (record: BenefitRecord) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      benefitCode: record.benefitCode,
      benefitDescription: record.benefitDescription,
      benefitGroup: record.benefitGroup,
      displaySequence: record.displaySequence,
      nonPayable: record.nonPayable,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      if (editingRecord) {
        setDataSource((prev) =>
          prev.map((item) =>
            item.key === editingRecord.key
              ? {
                  ...item,
                  benefitCode: values.benefitCode,
                  benefitDescription: values.benefitDescription || '',
                  benefitGroup: values.benefitGroup || '',
                  displaySequence: values.displaySequence || 0,
                  nonPayable: !!values.nonPayable,
                }
              : item,
          ),
        );
      } else {
        const newKey = String(Date.now());
        const newRecord: BenefitRecord = {
          key: newKey,
          benefitCode: values.benefitCode,
          benefitDescription: values.benefitDescription || '',
          benefitGroup: values.benefitGroup || '',
          displaySequence: values.displaySequence || 0,
          settleSequence: '',
          nonPayable: !!values.nonPayable,
        };
        setDataSource((prev) => [...prev, newRecord]);
      }
      setIsModalVisible(false);
    } catch {
      // validate failed
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
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
          onClick={() => openEditModal(record)}
        />
      ),
    },
  ];

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
                  onClick={openCreateModal}
                >
                  Create
                </Button>
              </Space>
            </Form.Item>
          </Form>

          <Table<BenefitRecord>
            columns={columns}
            dataSource={filteredData}
            rowKey="key"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
          />
        </div>
      </div>

      <Modal
        open={isModalVisible}
        title={editingRecord ? 'Edit Benefit' : 'Create Benefit'}
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
