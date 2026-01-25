import { LogoutOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Button, Dropdown, message } from 'antd';
import React from 'react';

const LogoutButton: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const isLoggedIn =
    initialState?.username === 'admin' || !!localStorage.getItem('token');

  if (!isLoggedIn) {
    return null;
  }

  const handleLogout = async () => {
    // 清除 token
    localStorage.removeItem('token');
    // 重置初始状态
    await setInitialState((s) => ({
      ...s,
      name: '@umijs/max',
      username: undefined,
      userId: undefined,
    }));
    message.success('已退出登录');
    // 跳转到登录页
    history.push('/login');
  };

  const menuItems = [
    {
      key: 'logout',
      label: (
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ width: '100%', textAlign: 'left' }}
        >
          退出登录
        </Button>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Button type="text" style={{ marginRight: 8 }}>
        {initialState?.username || initialState?.name || '用户'}
      </Button>
    </Dropdown>
  );
};

export default LogoutButton;
