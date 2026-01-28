## 项目简介

本项目基于 **`@umijs/max` + React 18** 搭建，集成了 **Ant Design / Pro Components、Redux Toolkit（含 RTK Query）、Vitest + React Testing Library、Tailwind CSS** 等常用前端工程化能力，用于演示/实践中后台管理场景（登录、表格页、接口调用、状态管理等）。

## 技术栈总览

- **框架与基础设施**

  - **React 18**：函数组件 + Hooks 架构，作为核心视图层框架。
  - **`@umijs/max`**：基于 Umi 的企业级应用框架，内置路由、构建、运行时配置等能力，简化工程初始化和配置。
  - **TypeScript**：提供静态类型检查，提升可维护性与开发体验。
  - **Vite**：作为底层构建与开发服务器（由 `@umijs/max` 集成），带来快速冷启动和按需编译。

- **UI 与样式**

  - **Ant Design (`antd`)**：主 UI 组件库，用于构建表格、表单、布局等中后台页面。
  - **`@ant-design/pro-components`**：在 Ant Design 之上封装的高阶组件（如 ProTable、ProForm），提高业务页面的搭建效率。
  - **Less / Tailwind CSS**：支持传统 Less 样式以及 **Tailwind CSS 原子化样式**，可按需选择使用方式。

- **状态管理与数据请求**

  - **Redux Toolkit (`@reduxjs/toolkit`)**：现代化 Redux 状态管理方案，提供简洁的 `createSlice` 等 API，减少样板代码。
  - **RTK Query**：通过 `createApi` 封装接口请求与缓存逻辑，统一管理加载状态、错误状态与数据缓存。
  - **React Redux (`react-redux`)**：在 React 组件中通过 `Provider` 与自定义 Hooks 访问 Redux 状态。
  - 项目中在 `src/store` 下划分了：
    - **`api/`**：RTK Query 接口定义（如 `apiSlice.ts`、`tableApi.ts`、`userApi.ts` 等）。
    - **`tableSlice.ts`**：与表格相关的业务状态。

- **接口与服务层**

  - 在 `src/services` 中定义接口服务（如 `demo/UserController.ts`），配合 RTK Query 将接口抽象为可直接在组件中调用的 Hooks。
  - `mock/` 目录下提供本地 mock 数据（如 `tableAPI.ts`、`userAPI.ts`），便于在无真实后端时开发与调试。

- **测试体系**

  - **Vitest**：与 Vite 深度集成的单元测试框架，执行速度快、配置轻量。
  - **React Testing Library (`@testing-library/react`)**：推荐的 React 组件测试库，通过“用户视角”进行渲染与断言。
  - **@testing-library/user-event / @testing-library/jest-dom**：分别用于模拟真实用户行为、扩展断言能力。
  - 示例用例位于 `src/pages/Table/index.test.tsx`，覆盖表格页渲染、保存、子表展开、行选与输入焦点等核心交互。

- **工程化与质量保障**
  - **Husky**：通过 Git hooks 在提交前执行 lint/测试等检查（配置见 `.husky/`）。
  - **lint-staged**：配合 Husky 对暂存区文件进行增量检查，提高提交效率。
  - **ESLint / Stylelint**：在 `.eslintrc.js`、`.stylelintrc.js` 中定义代码与样式规范。
  - **Prettier**：统一代码风格（配置见 `.prettierrc`），支持自动格式化。
  - **PostCSS + `postcss-pxtorem`**：用于将 px 转换为 rem，方便移动端或自适应布局。

## 脚本命令（常用）

使用 `pnpm` 作为包管理工具，常见命令如下：

- **启动开发环境**

```bash
pnpm install     # 安装依赖
pnpm dev         # 启动本地开发服务（max dev）
```

- **打包与本地预览**

```bash
pnpm build       # 打包到 dist/ 目录
pnpm preview     # 启动静态服务预览 dist（默认 http://localhost:4173）
```

**说明**：打包产物使用 ES Module，不能直接双击 `dist/index.html` 用 `file://` 打开，请使用 `pnpm preview` 启动本地服务后访问 **http://localhost:4173/**。

- **测试相关**

```bash
pnpm test        # 使用 Vitest 运行全部测试
pnpm test:watch  # 监听模式，修改后自动重新测试
pnpm test:coverage  # 生成覆盖率报告
```

- **代码风格与提交流程**

```bash
pnpm format      # 使用 Prettier 格式化代码
# 提交时会自动触发 Husky + lint-staged 进行增量检查
```
