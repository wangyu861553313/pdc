import { useSubmitExampleMutation } from '@/store/api/examplePostApi';
import {
  useAddUserMutation,
  useDeleteUserMutation,
  useGetUserListQuery,
  UserInfo,
  useUpdateUserMutation,
} from '@/store/api/userApi';
import { Button, Card, Form, Input, message, Modal, Space, Table } from 'antd';
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

  // POST 请求真实调用示例
  const [submitExample, { isLoading: isSubmitting }] =
    useSubmitExampleMutation();
  const [postResult, setPostResult] = useState<string | null>(null);
  const [postForm] = Form.useForm();

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

  // 真实 POST 调用：提交后显示接口返回或错误详情
  const handlePostExample = async () => {
    setPostResult(null);
    try {
      const values = await postForm.validateFields();
      const res = await submitExample({
        title: values.title,
        content: values.content,
      }).unwrap();
      setPostResult(
        res.success
          ? `成功: ${JSON.stringify(res.data ?? res)}`
          : res.errorMessage || '请求失败',
      );
      if (res.success) message.success('POST 请求成功');
    } catch (err: any) {
      const status = err?.status;
      const statusText = err?.statusText;
      const data = err?.data;
      const backendMsg =
        (typeof data === 'object' &&
          (data?.errorMessage ?? data?.message ?? data?.msg)) ||
        (typeof data === 'string' ? data : null);
      const networkMsg = err?.message || err?.error || '';
      let detail = '';
      if (status)
        detail += `状态码: ${status} ${statusText || ''}`.trim() + '\n';
      if (backendMsg) detail += `后端返回: ${backendMsg}\n`;
      if (networkMsg && networkMsg !== backendMsg)
        detail += `错误信息: ${networkMsg}\n`;
      if (status === 404) {
        detail +=
          '提示: 接口不存在。请确认后端已实现 POST /v1/example/submit，或在 src/store/api/examplePostApi.ts 中改为已有接口地址。';
      } else if (
        status === 'FETCH_ERROR' ||
        networkMsg?.toLowerCase?.().includes('fetch')
      ) {
        detail +=
          '提示: 网络异常，请检查后端是否启动、代理配置(.umirc.ts proxy)或 CORS。';
      }
      const msg =
        backendMsg ||
        (status ? `${status} ${statusText || ''}`.trim() : networkMsg) ||
        '请求失败';
      setPostResult(detail ? `错误:\n${detail}` : `错误: ${msg}`);
      message.error(backendMsg || msg);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* POST 请求真实调用示例 */}
      <Card title="POST 请求示例" style={{ marginBottom: 24 }}>
        <Form form={postForm} layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="例如：测试标题" />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <Input.TextArea rows={2} placeholder="可选" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handlePostExample}
              loading={isSubmitting}
            >
              发送 POST 请求
            </Button>
          </Form.Item>
        </Form>
        {postResult && (
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              background: '#f5f5f5',
              borderRadius: 4,
            }}
          >
            {postResult}
          </pre>
        )}
      </Card>

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
