const users = [
  { id: 0, name: 'Umi', nickName: 'U', gender: 'MALE' },
  { id: 1, name: 'Fish', nickName: 'B', gender: 'FEMALE' },
];

export default {
  'GET /api/v1/queryUserList': (req: any, res: any) => {
    res.json({
      success: true,
      data: { list: users },
      errorCode: 0,
    });
  },
  'PUT /api/v1/user/': (req: any, res: any) => {
    res.json({
      success: true,
      errorCode: 0,
    });
  },
  // 示例 POST，与 src/store/api/examplePostApi.ts 对应（无代理时走 mock）
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
