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
  vite: {
    // ========== Vite 配置优化 ==========
    // 开发服务器配置
    server: {
      // 启用 Gzip 压缩
      compress: true,
      // 提高开发服务器响应速度
      hmr: {
        // 热更新模式
        overlay: true,
      },
    },
    // 构建配置
    build: {
      // 构建目标，兼容现代浏览器
      target: 'es2015',
      // 启用 CSS 代码分割
      cssCodeSplit: true,
      // 启用 Rollup 混淆
      minify: 'terser',
      // Terser 配置
      terserOptions: {
        // 启用压缩
        compress: {
          // 移除控制台日志
          drop_console: true,
          // 移除调试器语句
          drop_debugger: true,
          // 折叠变量
          collapse_vars: true,
          // 提取公共函数
          reduce_funcs: true,
        },
        // 启用 mangle
        mangle: {
          // 保留类名
          keep_classnames: true,
          // 保留函数名
          keep_fnames: false,
        },
      },
      // Rollup 配置优化
      rollupOptions: {
        // 代码分割配置
        output: {
          // 静态资源分类打包
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          // 代码分割策略
          manualChunks: {
            // 将 React 相关依赖打包成一个 chunk
            'react-vendor': ['react', 'react-dom', 'react-redux'],
            // 将 Ant Design 相关依赖打包成一个 chunk
            'antd-vendor': [
              'antd',
              '@ant-design/icons',
              '@ant-design/pro-components',
            ],
            // 将 Redux Toolkit 相关依赖打包成一个 chunk
            'redux-vendor': ['@reduxjs/toolkit'],
          },
        },
      },
      // 启用构建缓存
      cache: true,
      // 启用资源大小警告限制
      chunkSizeWarningLimit: 1500,
      // 生成 source map 仅用于生产环境调试
      sourcemap: process.env.NODE_ENV === 'production' ? false : true,
    },
    // 依赖优化配置
    optimizeDeps: {
      // 启用依赖预构建
      esbuildOptions: {
        // 目标
        target: 'es2015',
        // 优化依赖构建
        treeShaking: true,
      },
      // 包含需要预构建的依赖
      include: ['react', 'react-dom', 'antd', '@ant-design/icons'],
    },
    // 性能优化
    performance: {
      // 启用性能分析
      hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    },
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
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
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
