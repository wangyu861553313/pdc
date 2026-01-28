// Benefit Maintenance 模拟数据

export interface BenefitRecord {
  key: string;
  benefitCode: string;
  benefitDescription: string;
  benefitGroup: string;
  displaySequence: number;
  settleSequence: string;
  nonPayable: boolean;
}

// 模拟数据存储
let mockBenefitData: BenefitRecord[] = [
  {
    key: '1',
    benefitCode: 'H001',
    benefitDescription: 'Room & Board',
    benefitGroup: 'MC01 - Room & Board',
    displaySequence: 1,
    settleSequence: 'B1112',
    nonPayable: false,
  },
  {
    key: '2',
    benefitCode: 'H002',
    benefitDescription: 'Intensive Care Unit',
    benefitGroup: 'MC01 - Room & Board',
    displaySequence: 2,
    settleSequence: 'B1113',
    nonPayable: false,
  },
];

// 获取 Benefit 列表
export const getBenefits = () => {
  return mockBenefitData;
};

// 根据 key 新增或更新 Benefit
export const saveBenefit = (record: BenefitRecord) => {
  const index = mockBenefitData.findIndex((item) => item.key === record.key);
  if (index === -1) {
    mockBenefitData.push(record);
  } else {
    mockBenefitData[index] = record;
  }
  return mockBenefitData;
};

// 导出模拟接口（用于 umi mock）
export default {
  'GET /api/v1/benefit': (req: any, res: any) => {
    res.json({
      success: true,
      data: mockBenefitData,
      errorCode: 0,
    });
  },
  'POST /api/v1/benefit': (req: any, res: any) => {
    const { record } = req.body || {};
    if (
      record &&
      typeof record.benefitCode === 'string' &&
      record.benefitCode.trim() !== ''
    ) {
      // 如果没有 key，则自动生成
      const key = record.key || String(Date.now());
      const normalized: BenefitRecord = {
        key,
        benefitCode: record.benefitCode,
        benefitDescription: record.benefitDescription || '',
        benefitGroup: record.benefitGroup || '',
        displaySequence:
          typeof record.displaySequence === 'number'
            ? record.displaySequence
            : Number(record.displaySequence) || 0,
        settleSequence: record.settleSequence || '',
        nonPayable: !!record.nonPayable,
      };
      saveBenefit(normalized);
      res.json({
        success: true,
        data: mockBenefitData,
        errorCode: 0,
      });
    } else {
      res.status(400).json({
        success: false,
        errorMessage: 'Invalid record format',
        errorCode: 400,
      });
    }
  },
};
