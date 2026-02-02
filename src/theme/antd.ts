import type { ThemeConfig } from 'antd';

/**
 * antd 全局默认样式配置
 * 通过 ConfigProvider 的 theme 传入，影响所有 antd 组件
 * 文档：https://ant.design/docs/react/customize-theme
 *
 * 其他 ConfigProvider 常用默认：
 * - componentSize: 'small' | 'middle' | 'large' 控件尺寸，在 app.tsx 中传入
 * - locale: 语言包
 * - message/Modal/notification 等静态方法需配合 App 组件或 useModal 才能继承 theme
 */
export const antdTheme: ThemeConfig = {
  token: {
    // Seed Token：主色，会衍生出一套色板
    colorPrimary: 'rgb(207, 19, 34)',
    // 圆角
    borderRadius: 6,
    /** 边框宽度（影响 Table 表头下边框、Button/Input 边框等）默认 1 */
    // lineWidth: 1,
    // 控件高度（Button、Input、Select 等）
    // controlHeight: 32,
    // 字体
    // fontSize: 14,
    // fontFamily: '-apple-system, ...',
  },
  // 组件级 Token：只影响指定组件
  // headerColor: 'rgb(207, 19, 34)',
  components: {
    // Button: { primaryColor: 'rgb(207, 19, 34)' },
    // headerColor: 'rgb(207, 19, 34)',
    // tdBorderColor: 'rgb(207, 19, 34)'
    // colorTextLabel: 'rgb(207, 19, 34)'
    Table: {
      headerBg: '#fff',
      /** 表头下边框颜色（表头与内容区分割线） */
      headerSplitColor: 'rgba(0, 0, 0, 0.06)',
      /** 表格整体边框颜色，也可影响表头边框 */
      // borderColor: '#d9d9d9',
      // 表头下边框宽度由全局 token.lineWidth 控制；仅改表头时用 CSS：.ant-table-thead > tr > th { border-bottom-width: 2px; }
      cellFontSize: 12,
      cellPaddingBlock: 12,
      cellPaddingInline: 12,
    },
  },
  // 预设算法：defaultAlgorithm | darkAlgorithm | compactAlgorithm
  // algorithm: theme.defaultAlgorithm,
};
