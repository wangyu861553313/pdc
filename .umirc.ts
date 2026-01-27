import { defineConfig } from '@umijs/max';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  antd: {},
  access: {
    // 未授权时跳转到登录页
    unauthorizedRedirect: '/login',
  },
  model: {},
  initialState: {},
  /**
   * PC 端 px -> rem
   * 只处理业务样式，不污染第三方库（antd）
   * 该配置在 Umi Max 中会自动接入 PostCSS 流程（无论是否使用 Vite）
   */
  extraPostCSSPlugins: [
    require('postcss-pxtorem')({
      // 和 setupRem(2000, 16) 对齐：设计稿宽 2000 时 html = 16px
      // 这里写 16，表示 1rem = 16px
      rootValue: 16,
      propList: ['*'],
      minPixelValue: 2,
      mediaQuery: false,
      // 忽略第三方库，避免污染 antd 等
      exclude: /node_modules/i,
    }),
  ],

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
      name: '登录',
      path: '/login',
      component: './Login',
      layout: false,
      // 登录页面不需要权限，但已登录用户访问时重定向到首页
      // 只对这个页面生效
      // headerRender: false,      // 隐藏顶部
      // menuRender: false,        // 隐藏侧边菜单
      // footerRender: false,      // 隐藏底部
      // menuHeaderRender: false,  // 隐藏 logo + 标题
    },
    /**
     * 多层嵌套路由示例：
     * 第一层：/system（只做分组，不渲染页面）
     * 第二层：/system/config（只做分组，不渲染页面）
     * 第三层：具体业务页面
     */
    {
      path: '/system',
      name: '系统管理',
      access: 'isLogin', // 统一在第一层做登录校验
      routes: [
        {
          path: '/system/config',
          name: '配置管理',
          routes: [
            {
              name: '首页',
              path: '/system/config/home',
              component: './Home',
            },
            {
              name: '权限演示',
              path: '/system/config/access',
              component: './Access',
            },
            {
              name: 'table',
              path: '/system/config/table',
              component: './Table',
            },
            {
              name: 'Example',
              path: '/system/config/example',
              component: './Example',
            },
          ],
        },
      ],
    },

    /**
     * 兼容旧地址：保持原有 /home、/access、/table、/Example 可访问
     * 仅做重定向到新的多级路径
     */
    {
      path: '/home',
      redirect: '/system/config/home',
      access: 'isLogin',
    },
    {
      path: '/access',
      redirect: '/system/config/access',
      access: 'isLogin',
    },
    {
      path: '/table',
      redirect: '/system/config/table',
      access: 'isLogin',
    },
    {
      path: '/Example',
      redirect: '/system/config/example',
      access: 'isLogin',
    },
  ],

  npmClient: 'pnpm',

  // ========== 启用 Vite 模式 ==========
  vite: {
    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port: 8000,
      open: true,
    },

    // 构建优化配置
    build: {
      // 目标浏览器
      target: 'es2020',
      // source map：开发环境启用，生产环境关闭
      sourcemap: !isProd,
      // 启用 CSS 代码分割
      cssCodeSplit: true,
      // chunk 大小警告阈值 (KB) - 降低阈值以便及时发现大文件
      chunkSizeWarningLimit: 500,
      // 启用最小化混淆
      minify: 'esbuild',
      // 压缩选项
      terserOptions: isProd
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info'],
            },
          }
        : undefined,
      // 构建时报告压缩后的大小
      reportCompressedSize: true,
      // 启用 gzip 压缩大小报告
      brotliSize: false,
      // Rollup 打包配置
      rollupOptions: {
        output: {
          // 静态资源分类输出 - 优化缓存策略
          chunkFileNames: isProd
            ? 'assets/js/[name]-[hash:8].js'
            : 'assets/js/[name].js',
          entryFileNames: isProd
            ? 'assets/js/[name]-[hash:8].js'
            : 'assets/js/[name].js',
          assetFileNames: isProd
            ? 'assets/[ext]/[name]-[hash:8].[ext]'
            : 'assets/[ext]/[name].[ext]',
          // 优化 chunk 导入
          generatedCode: {
            constBindings: true,
          },
        },
        // 外部化配置（如果需要）
        // external: [],
      },
      // 启用 CSS 压缩
      cssMinify: 'esbuild',
    },

    // 依赖预构建优化
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'antd',
        '@ant-design/icons',
        '@ant-design/pro-components',
        '@reduxjs/toolkit',
        'react-redux',
      ],

      esbuildOptions: {
        target: 'es2020',
        // 开发环境保留源码映射
        sourcemap: true,
      },
    },

    // esbuild 配置
    esbuild: {
      // 生产环境移除 console 和 debugger
      drop: isProd ? ['console', 'debugger'] : [],
      legalComments: 'none',
      // 开发环境保留源码映射
      sourcemap: !isProd,
    },

    // CSS 配置
    css: {
      // 开发模式启用 CSS source map
      devSourcemap: true,
    },
  },

  // ========== 打包基础配置 ==========
  /** 构建输出目录，默认 dist */
  outputPath: 'dist',
  /** 路由 base - 预览/部署在根路径时用 '/' */
  base: '/',
  /** 静态资源路径前缀 - 用 '/' 确保预览时 /assets/... 可正确加载 */
  publicPath: '/',
  /** 使用 hash 路由，支持 file:// 协议直接打开 */
  history: { type: 'hash' },
  /** 文件名带 hash，利于长期缓存，生产建议开启 */
  hash: true,
  /** 解决 esbuild helpers 冲突，避免构建报错 */
  esbuildMinifyIIFE: true,
  /** 注入构建时环境变量，供代码中 process.env.XXX 使用 */
  define: {
    'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
  },
  /** 开发环境 source map 配置 - 错误信息映射到具体代码行 */
  devtool: isProd ? false : 'eval-cheap-module-source-map',

  /** 快速刷新 - Vite 原生支持 */
  fastRefresh: true,

  /** Tailwind CSS 配置 */
  tailwindcss: {},

  /** 打包产物分析 - 运行 ANALYZE=1 pnpm build 查看 */
  analyze: {
    analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
    openAnalyzer: true,
  },

  /** 图片优化配置 */
  inlineLimit: 8192, // 8KB 以下图片内联为 base64

  /** 忽略 moment 的 locale 文件（减小体积）*/
  ignoreMomentLocale: true,

  /** 死代码消除 */
  deadCode: {
    detectUnusedFiles: isProd,
    detectUnusedExport: isProd,
    failOnHint: false,
  },
});
