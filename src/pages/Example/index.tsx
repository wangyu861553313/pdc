import {
  useAddUserMutation,
  useDeleteUserMutation,
  useGetUserListQuery,
  UserInfo,
  useUpdateUserMutation,
} from '@/store/api/userApi';
import { Button, Form, Input, message, Modal, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const ExamplePage: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [params, setParams] = useState({ current: 1, pageSize: 10 });

  // 使用 RTK Query hooks
  const { data, isLoading, error, refetch } = useGetUserListQuery(params);
  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: UserInfo) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: async () => {
        try {
          await deleteUser(userId).unwrap();
          message.success('删除成功');
        } catch (err) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser?.userId) {
        await updateUser({ userId: editingUser.userId, data: values }).unwrap();
        message.success('更新成功');
      } else {
        await addUser(values).unwrap();
        message.success('添加成功');
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(editingUser ? '更新失败' : '添加失败');
    }
  };

  const columns: ColumnsType<UserInfo> = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.userId!)}
            loading={isDeleting}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          添加用户
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={() => refetch()}>
          刷新
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data?.list || []}
        loading={isLoading}
        rowKey="userId"
        pagination={{
          current: params.current,
          pageSize: params.pageSize,
          total: data?.data?.total || 0,
          onChange: (page, pageSize) => {
            setParams({ current: page, pageSize });
          },
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={isAdding || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {error && (
        <div style={{ color: 'red', marginTop: 16 }}>
          错误: {JSON.stringify(error)}
        </div>
      )}
    </div>
  );
};

export default ExamplePage;
