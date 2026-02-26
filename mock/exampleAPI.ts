/**
 * 模拟 POST /api/v1/example/submit 接口
 * 开发环境下请求会走 mock，返回模拟数据
 */
export default {
  'POST /api/v1/example/submit': (req: any, res: any) => {
    const { title, content } = req.body || {};
    res.json({
      success: true,
      data: {
        id: `mock-${Date.now()}`,
        title: title || '（未填标题）',
        content: content || '',
        createdAt: new Date().toISOString(),
      },
    });
  },
};
