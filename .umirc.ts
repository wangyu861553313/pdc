import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
    },
    {
      name: 'Example',
      path: '/Example',
      component: './Example',
    },
  ],
  npmClient: 'pnpm',

  // ========== 打包基础配置 ==========
  /** 构建输出目录，默认 dist */
  outputPath: 'dist',
  /** 路由 base，部署在非根路径时配置，如 /app/ */
  base: '/',
  /** 静态资源 CDN 路径前缀，部署到 CDN 或子路径时配置 */
  // 使用相对路径，支持 file:// 协议直接打开
  publicPath: './',
  /** 使用 hash 路由，支持 file:// 协议直接打开 */
  history: { type: 'hash' },
  /** 文件名带 hash，利于长期缓存，生产建议开启 */
  hash: true,
  /** 解决 esbuild helpers 冲突，避免构建报错 */
  esbuildMinifyIIFE: true,
  /** 注入构建时环境变量，供代码中 process.env.XXX 使用 */
  define: {
    // 'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV || 'production'),
  },
  /** 构建产物 source map，生产可关掉以减小体积 */
  // devtool: process.env.NODE_ENV === 'production' ? false : 'eval-cheap-module-source-map',
});
