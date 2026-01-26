import { configureStore, Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './api/apiSlice';
import tableReducer from './tableSlice';

// 开发环境日志中间件（可选，用于在控制台查看 actions）
const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === 'development') {
    const prevState = store.getState();
    console.group(`🔵 Action: ${action.type}`);
    console.log('📦 Payload:', action.payload);
    console.log('📊 State Before:', prevState);
    const result = next(action);
    const nextState = store.getState();
    console.log('📊 State After:', nextState);

    // 显示 state 变化（仅 table slice）
    if (prevState.table !== nextState.table) {
      console.log('🔄 Table State Changed:', {
        before: prevState.table,
        after: nextState.table,
      });
    }

    console.groupEnd();
    return result;
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    table: tableReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware).concat(loggerMiddleware), // 添加日志中间件
  // Redux DevTools 在开发环境默认启用
  devTools: process.env.NODE_ENV !== 'production',
});

// 启用 refetchOnFocus 和 refetchOnReconnect 行为
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
