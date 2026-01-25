# README

`@umijs/max` 模板项目，更多功能参考 [Umi Max 简介](https://umijs.org/docs/max/introduce)

## 打包与本地预览

```bash
pnpm build       # 打包到 dist/
pnpm preview     # 启动静态服务预览 dist（默认 http://localhost:4173）
```

**说明**：打包产物使用 ES 模块，不能直接双击 `dist/index.html` 用 `file://` 打开。请用 `pnpm preview` 启动本地服务，在浏览器打开 **http://localhost:4173/**。

## 测试

使用 [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react)：

```bash
pnpm install   # 若尚未安装依赖（含 vitest、@testing-library/*）
pnpm test      # 运行测试
pnpm run test:watch   # 监听模式
```

用例位于 `src/pages/Table/index.test.tsx`，覆盖 Table 页的渲染、保存、子表展开、行选与输入焦点等。
