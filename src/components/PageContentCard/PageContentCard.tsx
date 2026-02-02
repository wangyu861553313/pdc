import { LAYOUT_CONTENT_PADDING, PAGE_CONTENT_CARD } from '@/constants';
import React from 'react';
import './index.less';

export interface PageContentCardProps {
  /** 页面标题 */
  title: React.ReactNode;
  /** 头部背景色，默认与 layout 统一配置 */
  headerColor?: string;
  /** 内容区最大宽度，默认与 layout 统一配置 */
  maxWidth?: number;
  /** 子内容 */
  children: React.ReactNode;
}

/**
 * 通用页面内容卡片 - 结合 Umi Max ProLayout 使用
 * 与 app.tsx layout 的 contentStyle、token 统一配置
 */
const PageContentCard: React.FC<PageContentCardProps> = ({
  title,
  headerColor = PAGE_CONTENT_CARD.headerColor,
  // maxWidth = PAGE_CONTENT_CARD.maxWidth,
  children,
}) => {
  return (
    <div
      className="pageContentCard"
      style={{ padding: LAYOUT_CONTENT_PADDING }}
    >
      <div
        className="pageContentCardInner"
        // style={{ maxWidth: maxWidth ? `${maxWidth}px` : undefined }}
      >
        <div
          className="pageContentCardHeader"
          style={{ backgroundColor: headerColor }}
        >
          {title}
        </div>
        <div className="pageContentCardBody">{children}</div>
      </div>
    </div>
  );
};

export default PageContentCard;
