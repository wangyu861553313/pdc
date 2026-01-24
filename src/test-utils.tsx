import { configureStore } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { apiSlice } from './store/api/apiSlice';
import tableReducer from './store/tableSlice';

export function createTestStore() {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      table: tableReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });
}

interface WrapperProps {
  children: React.ReactNode;
}

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  store?: ReturnType<typeof createTestStore>;
};

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  const { store: providedStore, ...rest } = options ?? {};
  const store = providedStore ?? createTestStore();
  function Wrapper({ children }: WrapperProps) {
    return (
      <ConfigProvider>
        <Provider store={store}>{children}</Provider>
      </ConfigProvider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...rest });
}

export * from '@testing-library/react';
export { customRender as render };
