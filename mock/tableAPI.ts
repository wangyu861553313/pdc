// 表格模拟数据
// 子表格数据类型
export interface SubTableDataType {
  key: string | number;
  category: string;
  amountType: string;
  amount: string;
  daysTimes: string;
  subjectToIllness: string;
}

// 主表格数据类型
export interface MainTableDataType {
  key: string | number;
  benefitCode: string;
  benefitDescription: string;
  deductible: boolean;
  coInsurance: boolean;
  copayOption: boolean;
  ghEmWaiveDed: boolean;
  ghEmWaiveCoIns: boolean;
  illnessWaiveCoIns: boolean;
  disabilityLimit: boolean;
  annualLimit: boolean;
  lifetimeLimit: boolean;
  benefitAllowAutoflow: string;
  subTableData: SubTableDataType[];
}

// 模拟数据存储
let mockTableData: MainTableDataType[] = [
  {
    key: '1',
    benefitCode: 'A47',
    benefitDescription: 'Dental treatment',
    deductible: false,
    coInsurance: false,
    copayOption: false,
    ghEmWaiveDed: false,
    ghEmWaiveCoIns: false,
    illnessWaiveCoIns: false,
    disabilityLimit: false,
    annualLimit: false,
    lifetimeLimit: false,
    benefitAllowAutoflow: 'Within days limit',
    subTableData: [
      {
        key: '1-1',
        category: 'Per accident limit',
        amountType: 'Fixed value',
        amount: '3000',
        daysTimes: 'Input amount',
        subjectToIllness: 'False',
      },
      {
        key: '1-2',
        category: 'Per accident limit',
        amountType: 'Fixed value',
        amount: '3000',
        daysTimes: 'Input amount',
        subjectToIllness: 'False',
      },
      {
        key: '1-3',
        category: 'Per accident limit',
        amountType: 'Fixed value',
        amount: '3000',
        daysTimes: 'Input amount',
        subjectToIllness: 'False',
      },
      {
        key: '1-4',
        category: 'Per accident limit',
        amountType: 'Fixed value',
        amount: '3000',
        daysTimes: 'Input amount',
        subjectToIllness: 'False',
      },
    ],
  },
  {
    key: '2',
    benefitCode: 'A47',
    benefitDescription: 'Dental treatment',
    deductible: false,
    coInsurance: false,
    copayOption: false,
    ghEmWaiveDed: false,
    ghEmWaiveCoIns: false,
    illnessWaiveCoIns: false,
    disabilityLimit: false,
    annualLimit: false,
    lifetimeLimit: false,
    benefitAllowAutoflow: 'Within days limit',
    subTableData: [
      {
        key: '2-1',
        category: 'Per accident limit',
        amountType: 'Fixed value',
        amount: '3000',
        daysTimes: 'Input amount',
        subjectToIllness: 'False',
      },
    ],
  },
];

// 获取表格数据
export const getTableData = () => {
  return mockTableData;
};

// 保存表格数据
export const saveTableData = (data: MainTableDataType[]) => {
  mockTableData = data;
  return mockTableData;
};

// 删除主表格行
export const deleteMainRow = (key: string | number) => {
  mockTableData = mockTableData.filter((item) => item.key !== key);
  return mockTableData;
};

// 添加主表格行
export const addMainRow = (data: Partial<MainTableDataType>) => {
  const newRow: MainTableDataType = {
    key: String(Date.now()),
    benefitCode: data.benefitCode || '',
    benefitDescription: data.benefitDescription || '',
    deductible: data.deductible || false,
    coInsurance: data.coInsurance || false,
    copayOption: data.copayOption || false,
    ghEmWaiveDed: data.ghEmWaiveDed || false,
    ghEmWaiveCoIns: data.ghEmWaiveCoIns || false,
    illnessWaiveCoIns: data.illnessWaiveCoIns || false,
    disabilityLimit: data.disabilityLimit || false,
    annualLimit: data.annualLimit || false,
    lifetimeLimit: data.lifetimeLimit || false,
    benefitAllowAutoflow: data.benefitAllowAutoflow || '',
    subTableData: data.subTableData || [],
  };
  mockTableData.push(newRow);
  return mockTableData;
};

// 导出模拟数据（用于 umi mock）
export default {
  'GET /api/v1/table': (req: any, res: any) => {
    res.json({
      success: true,
      data: mockTableData,
      errorCode: 0,
    });
  },
  'POST /api/v1/table': (req: any, res: any) => {
    const { data } = req.body;
    if (data && Array.isArray(data)) {
      mockTableData = data;
      res.json({
        success: true,
        data: mockTableData,
        errorCode: 0,
      });
    } else {
      res.status(400).json({
        success: false,
        errorMessage: 'Invalid data format',
        errorCode: 400,
      });
    }
  },
  'DELETE /api/v1/table/:key': (req: any, res: any) => {
    const { key } = req.params;
    mockTableData = mockTableData.filter((item) => String(item.key) !== key);
    res.json({
      success: true,
      data: mockTableData,
      errorCode: 0,
    });
  },
  'POST /api/v1/table/add': (req: any, res: any) => {
    const { data } = req.body;
    if (data) {
      const newRow: MainTableDataType = {
        key: String(Date.now()),
        benefitCode: data.benefitCode || '',
        benefitDescription: data.benefitDescription || '',
        deductible: data.deductible || false,
        coInsurance: data.coInsurance || false,
        copayOption: data.copayOption || false,
        ghEmWaiveDed: data.ghEmWaiveDed || false,
        ghEmWaiveCoIns: data.ghEmWaiveCoIns || false,
        illnessWaiveCoIns: data.illnessWaiveCoIns || false,
        disabilityLimit: data.disabilityLimit || false,
        annualLimit: data.annualLimit || false,
        lifetimeLimit: data.lifetimeLimit || false,
        benefitAllowAutoflow: data.benefitAllowAutoflow || '',
        subTableData: data.subTableData || [],
      };
      mockTableData.push(newRow);
      res.json({
        success: true,
        data: mockTableData,
        errorCode: 0,
      });
    } else {
      res.status(400).json({
        success: false,
        errorMessage: 'Invalid data format',
        errorCode: 400,
      });
    }
  },
};
