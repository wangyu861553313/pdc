import { useLoginMutation } from '@/store/api/userApi';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAccess, useModel, useNavigate } from '@umijs/max';
import { Button, Form, Input, message } from 'antd';
import React, { useEffect } from 'react';
import styles from './index.less';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setInitialState } = useModel('@@initialState');
  const access = useAccess();
  const [login, { isLoading }] = useLoginMutation();

  // 如果已登录，自动跳转到首页
  useEffect(() => {
    if (access.isLogin) {
      navigate('/home', { replace: true });
    }
  }, [access.isLogin, navigate]);

  const onFinish = async (values: { username: string; password: string }) => {
    // 前端验证：账号密码都为 admin
    if (values.username === 'admin' && values.password === 'admin') {
      // 保存 token（模拟）
      localStorage.setItem('token', 'mock-token-' + Date.now());

      // 更新全局初始状态
      await setInitialState((s) => ({
        ...s,
        name: 'admin',
        username: 'admin',
        userId: '1',
      }));

      message.success('登录成功');
      // 跳转到首页
      navigate('/home');
      return;
    }

    // 如果不是 admin/admin，尝试调用后端 API
    try {
      const response = await login({
        username: values.username,
        password: values.password,
      }).unwrap();

      if (response.success && response.data) {
        // 保存 token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        // 更新全局初始状态
        if (response.data.userInfo) {
          await setInitialState((s) => ({
            ...s,
            ...response.data?.userInfo,
          }));
        }

        message.success('登录成功');
        // 跳转到首页
        navigate('/home');
      } else {
        message.error(response.errorMessage || '登录失败');
      }
    } catch (error: any) {
      message.error(
        error?.data?.errorMessage || '登录失败，请检查用户名和密码',
      );
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <h1 className={styles.title}>欢迎登录</h1>
          <p className={styles.subtitle}>请输入您的账号和密码</p>
        </div>
        <Form
          name="login"
          size="large"
          onFinish={onFinish}
          autoComplete="off"
          className={styles.loginForm}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              className={styles.loginButton}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
