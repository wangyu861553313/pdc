# Redux DevTools 使用指南

## 1. 安装 Redux DevTools 浏览器扩展

### Chrome/Edge

1. 打开 Chrome 网上应用店
2. 搜索 "Redux DevTools"
3. 安装 [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

### Firefox

1. 打开 Firefox 附加组件页面
2. 搜索 "Redux DevTools"
3. 安装 [Redux DevTools Extension](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

## 2. 使用 Redux DevTools

### 基本功能

1. **打开 DevTools**

   - 按 `F12` 打开浏览器开发者工具
   - 找到 "Redux" 标签页
   - 或者点击浏览器工具栏中的 Redux DevTools 图标

2. **查看 Actions**

   - 在左侧面板可以看到所有触发的 action
   - 点击任意 action 可以查看详细信息：
     - Action type（如 `table/fetchTableData/pending`）
     - Payload（传递的数据）
     - Timestamp（触发时间）

3. **查看 State**

   - 右侧面板显示当前 Redux state
   - 可以展开查看各个 slice 的状态
   - 点击 action 后，可以看到 state 的变化（Diff 模式）

4. **时间旅行调试**

   - 点击左侧的 action 可以"跳转"到该时刻的 state
   - 使用时间轴滑块可以回退到任意历史状态
   - 非常适合调试复杂的状态变化

5. **Action 过滤**
   - 使用搜索框过滤特定的 action
   - 可以按 action type 或 payload 内容搜索

## 3. 在代码中添加日志（可选）

如果需要在代码中直接查看，可以在 store 配置中添加中间件：

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // ...reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 在开发环境启用 action 日志
    }).concat(
      // 自定义日志中间件（仅开发环境）
      ...(process.env.NODE_ENV === 'development'
        ? [
            (store: any) => (next: any) => (action: any) => {
              console.group(`🔵 Action: ${action.type}`);
              console.log('📦 Payload:', action.payload);
              console.log('📊 State Before:', store.getState());
              const result = next(action);
              console.log('📊 State After:', store.getState());
              console.groupEnd();
              return result;
            },
          ]
        : []),
    ),
});
```

## 4. 查看特定 Action 的 State 变化

在组件中可以这样查看：

```typescript
import { useAppSelector } from '@/store/hooks';

const MyComponent = () => {
  const tableState = useAppSelector((state) => state.table);

  // 在开发环境打印 state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Current Table State:', tableState);
    }
  }, [tableState]);

  return <div>...</div>;
};
```

## 5. 常用调试技巧

### 查看异步 Action 的完整流程

Redux Toolkit 的 `createAsyncThunk` 会生成三个 action：

- `table/fetchTableData/pending` - 开始请求
- `table/fetchTableData/fulfilled` - 请求成功
- `table/fetchTableData/rejected` - 请求失败

在 DevTools 中可以清楚地看到这三个阶段。

### 导出/导入 State

- 点击 DevTools 右上角的设置图标
- 可以导出当前 state 用于测试
- 可以导入 state 来重现特定场景

### 性能监控

- DevTools 会显示每个 action 的执行时间
- 可以帮助识别性能瓶颈

## 6. 示例：调试表格数据加载

1. 打开页面，触发 `fetchTableData`
2. 在 DevTools 中查看：

   - `table/fetchTableData/pending` - loading 变为 true
   - `table/fetchTableData/fulfilled` - dataSource 更新
   - 或者 `table/fetchTableData/rejected` - error 设置

3. 点击 action 查看：
   - Payload：返回的数据
   - State Diff：可以看到 dataSource 从空数组变为有数据

## 7. 快捷键

- `Ctrl+H` (Windows) / `Cmd+H` (Mac) - 切换 DevTools 面板位置
- `Ctrl+Q` (Windows) / `Cmd+Q` (Mac) - 切换 DevTools 窗口模式
