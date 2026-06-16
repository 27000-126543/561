import type {
  Project,
  Warning,
  Complaint,
  WeeklyReport,
  ProvinceData,
  AttendanceRecord,
  SalaryRecord,
  User,
  DashboardStats,
  Worker,
} from '@/types';

const provinces = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
  '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
  '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
  '海南省', '重庆市', '四川省', '贵州省', '云南省',
  '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
  '新疆维吾尔自治区',
];

const industries = ['房屋建筑', '市政工程', '交通工程', '水利工程', '电力工程'];

const constructionUnits = [
  '中国建筑集团有限公司',
  '中国铁路工程集团有限公司',
  '中国铁道建筑集团有限公司',
  '中国交通建设集团有限公司',
  '上海建工集团股份有限公司',
  '陕西建工集团有限公司',
  '广西建工集团有限责任公司',
  '湖南建工集团有限公司',
];

export const mockProjects: Project[] = [
  {
    id: 'p001',
    name: '中央商务区核心区项目',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    industry: '房屋建筑',
    constructionUnit: '中国建筑集团有限公司',
    totalWorkers: 586,
    startDate: '2024-03-15',
    endDate: '2026-09-30',
    status: 'active',
    paymentRate: 72.5,
    riskScore: 78,
    fundRatio: 42,
  },
  {
    id: 'p002',
    name: '滨江新区市民中心',
    province: '江苏省',
    city: '南京市',
    district: '建邺区',
    industry: '市政工程',
    constructionUnit: '上海建工集团股份有限公司',
    totalWorkers: 423,
    startDate: '2024-06-01',
    endDate: '2027-03-31',
    status: 'active',
    paymentRate: 95.8,
    riskScore: 22,
    fundRatio: 89,
  },
  {
    id: 'p003',
    name: '地铁3号线一期工程',
    province: '四川省',
    city: '成都市',
    district: '武侯区',
    industry: '交通工程',
    constructionUnit: '中国铁道建筑集团有限公司',
    totalWorkers: 1256,
    startDate: '2023-12-01',
    endDate: '2027-06-30',
    status: 'active',
    paymentRate: 68.3,
    riskScore: 85,
    fundRatio: 38,
  },
  {
    id: 'p004',
    name: '科技园区标准厂房',
    province: '浙江省',
    city: '杭州市',
    district: '余杭区',
    industry: '房屋建筑',
    constructionUnit: '陕西建工集团有限公司',
    totalWorkers: 312,
    startDate: '2025-01-10',
    endDate: '2026-12-31',
    status: 'active',
    paymentRate: 88.2,
    riskScore: 35,
    fundRatio: 76,
  },
  {
    id: 'p005',
    name: '南水北调配套工程',
    province: '河南省',
    city: '郑州市',
    district: '金水区',
    industry: '水利工程',
    constructionUnit: '中国水利水电建设集团',
    totalWorkers: 678,
    startDate: '2024-09-01',
    endDate: '2028-06-30',
    status: 'active',
    paymentRate: 75.6,
    riskScore: 62,
    fundRatio: 55,
  },
  {
    id: 'p006',
    name: '滨海新区商务综合体',
    province: '山东省',
    city: '青岛市',
    district: '黄岛区',
    industry: '房屋建筑',
    constructionUnit: '中国建筑集团有限公司',
    totalWorkers: 534,
    startDate: '2024-04-20',
    endDate: '2027-01-15',
    status: 'active',
    paymentRate: 91.5,
    riskScore: 28,
    fundRatio: 82,
  },
  {
    id: 'p007',
    name: '湘江生态治理工程',
    province: '湖南省',
    city: '长沙市',
    district: '岳麓区',
    industry: '水利工程',
    constructionUnit: '湖南建工集团有限公司',
    totalWorkers: 289,
    startDate: '2025-02-01',
    endDate: '2026-08-31',
    status: 'active',
    paymentRate: 82.4,
    riskScore: 45,
    fundRatio: 68,
  },
  {
    id: 'p008',
    name: '空港新城航站楼',
    province: '湖北省',
    city: '武汉市',
    district: '黄陂区',
    industry: '交通工程',
    constructionUnit: '中国交通建设集团有限公司',
    totalWorkers: 892,
    startDate: '2024-07-15',
    endDate: '2027-12-31',
    status: 'active',
    paymentRate: 65.8,
    riskScore: 88,
    fundRatio: 35,
  },
  {
    id: 'p009',
    name: '数据中心产业园',
    province: '贵州省',
    city: '贵阳市',
    district: '花溪区',
    industry: '房屋建筑',
    constructionUnit: '广西建工集团有限责任公司',
    totalWorkers: 245,
    startDate: '2025-03-01',
    endDate: '2026-10-31',
    status: 'active',
    paymentRate: 96.2,
    riskScore: 18,
    fundRatio: 92,
  },
  {
    id: 'p010',
    name: '大学城图书馆项目',
    province: '陕西省',
    city: '西安市',
    district: '长安区',
    industry: '房屋建筑',
    constructionUnit: '陕西建工集团有限公司',
    totalWorkers: 367,
    startDate: '2024-11-01',
    endDate: '2026-12-31',
    status: 'active',
    paymentRate: 79.2,
    riskScore: 55,
    fundRatio: 60,
  },
];

export const mockProvinceData: ProvinceData[] = [
  { name: '广东省', value: 85, riskLevel: 'high', projectCount: 245, paymentRate: 76.2 },
  { name: '江苏省', value: 35, riskLevel: 'low', projectCount: 198, paymentRate: 94.5 },
  { name: '浙江省', value: 42, riskLevel: 'medium', projectCount: 176, paymentRate: 91.8 },
  { name: '山东省', value: 48, riskLevel: 'medium', projectCount: 165, paymentRate: 88.6 },
  { name: '河南省', value: 62, riskLevel: 'medium', projectCount: 142, paymentRate: 85.3 },
  { name: '四川省', value: 78, riskLevel: 'high', projectCount: 138, paymentRate: 79.5 },
  { name: '湖北省', value: 72, riskLevel: 'high', projectCount: 112, paymentRate: 80.8 },
  { name: '湖南省', value: 55, riskLevel: 'medium', projectCount: 105, paymentRate: 86.2 },
  { name: '河北省', value: 68, riskLevel: 'medium', projectCount: 98, paymentRate: 83.5 },
  { name: '福建省', value: 38, riskLevel: 'low', projectCount: 92, paymentRate: 92.8 },
  { name: '上海市', value: 25, riskLevel: 'low', projectCount: 86, paymentRate: 95.8 },
  { name: '北京市', value: 28, riskLevel: 'low', projectCount: 78, paymentRate: 94.2 },
  { name: '安徽省', value: 52, riskLevel: 'medium', projectCount: 72, paymentRate: 87.5 },
  { name: '江西省', value: 45, riskLevel: 'medium', projectCount: 65, paymentRate: 89.1 },
  { name: '辽宁省', value: 58, riskLevel: 'medium', projectCount: 60, paymentRate: 85.8 },
  { name: '陕西省', value: 65, riskLevel: 'medium', projectCount: 58, paymentRate: 82.3 },
  { name: '重庆市', value: 70, riskLevel: 'high', projectCount: 55, paymentRate: 81.5 },
  { name: '天津市', value: 32, riskLevel: 'low', projectCount: 48, paymentRate: 93.5 },
  { name: '云南省', value: 50, riskLevel: 'medium', projectCount: 42, paymentRate: 88.0 },
  { name: '广西壮族自治区', value: 48, riskLevel: 'medium', projectCount: 38, paymentRate: 87.2 },
  { name: '山西省', value: 62, riskLevel: 'medium', projectCount: 35, paymentRate: 84.5 },
  { name: '黑龙江省', value: 55, riskLevel: 'medium', projectCount: 32, paymentRate: 86.0 },
  { name: '吉林省', value: 42, riskLevel: 'medium', projectCount: 28, paymentRate: 89.8 },
  { name: '甘肃省', value: 58, riskLevel: 'medium', projectCount: 25, paymentRate: 85.2 },
  { name: '内蒙古自治区', value: 45, riskLevel: 'medium', projectCount: 22, paymentRate: 87.8 },
  { name: '新疆维吾尔自治区', value: 52, riskLevel: 'medium', projectCount: 20, paymentRate: 86.5 },
  { name: '贵州省', value: 35, riskLevel: 'low', projectCount: 18, paymentRate: 92.5 },
  { name: '海南省', value: 38, riskLevel: 'low', projectCount: 15, paymentRate: 91.2 },
  { name: '宁夏回族自治区', value: 48, riskLevel: 'medium', projectCount: 12, paymentRate: 88.5 },
  { name: '青海省', value: 42, riskLevel: 'medium', projectCount: 10, paymentRate: 90.0 },
  { name: '西藏自治区', value: 30, riskLevel: 'low', projectCount: 8, paymentRate: 93.8 },
];

export const mockWarnings: Warning[] = [
  {
    id: 'w001',
    projectId: 'p001',
    projectName: '中央商务区核心区项目',
    level: 'secondary',
    type: 'low_payment_rate',
    title: '连续2个月工资发放率低于80%',
    description: '该项目2026年4月、5月连续两个月工资发放率分别为75.2%和72.5%，已触发二级预警，请及时处置。',
    riskScore: 78,
    createTime: '2026-06-10 09:30:00',
    status: 'escalated',
    handler: null,
    handleDeadline: '2026-06-15 09:30:00',
    approvalFlow: [
      { id: 'a1', level: 1, title: '项目经理确认', approver: null, status: 'pending', comment: null, approveTime: null },
      { id: 'a2', level: 2, title: '区人社局复核', approver: null, status: 'pending', comment: null, approveTime: null },
      { id: 'a3', level: 3, title: '市人社局批准', approver: null, status: 'pending', comment: null, approveTime: null },
    ],
    province: '广东省',
    city: '深圳市',
  },
  {
    id: 'w002',
    projectId: 'p003',
    projectName: '地铁3号线一期工程',
    level: 'secondary',
    type: 'insufficient_funds',
    title: '专户资金余额低于应发工资50%',
    description: '该项目工资专户余额为1280万元，应发工资总额为3368万元，资金比为38%，已低于50%警戒线。',
    riskScore: 85,
    createTime: '2026-06-08 14:20:00',
    status: 'processing',
    handler: '张建国',
    handleDeadline: '2026-06-13 14:20:00',
    approvalFlow: [
      { id: 'a1', level: 1, title: '项目经理确认', approver: '李明', status: 'approved', comment: '情况属实，正在筹措资金', approveTime: '2026-06-09 10:00:00' },
      { id: 'a2', level: 2, title: '区人社局复核', approver: '王芳', status: 'approved', comment: '同意进入市级审批', approveTime: '2026-06-10 15:30:00' },
      { id: 'a3', level: 3, title: '市人社局批准', approver: null, status: 'pending', comment: null, approveTime: null },
    ],
    province: '四川省',
    city: '成都市',
  },
  {
    id: 'w003',
    projectId: 'p008',
    projectName: '空港新城航站楼',
    level: 'primary',
    type: 'low_payment_rate',
    title: '工资发放率连续偏低',
    description: '该项目近月工资发放率为65.8%，如持续下降将触发二级预警。',
    riskScore: 88,
    createTime: '2026-06-12 11:00:00',
    status: 'pending',
    handler: null,
    handleDeadline: '2026-06-17 11:00:00',
    approvalFlow: [],
    province: '湖北省',
    city: '武汉市',
  },
  {
    id: 'w004',
    projectId: 'p005',
    projectName: '南水北调配套工程',
    level: 'primary',
    type: 'complaint',
    title: '劳动监察投诉数量激增',
    description: '近7天收到该项目农民工投诉12起，主要涉及工资拖欠问题，请关注。',
    riskScore: 62,
    createTime: '2026-06-11 16:45:00',
    status: 'processing',
    handler: '赵伟',
    handleDeadline: '2026-06-16 16:45:00',
    approvalFlow: [],
    province: '河南省',
    city: '郑州市',
  },
  {
    id: 'w005',
    projectId: 'p010',
    projectName: '大学城图书馆项目',
    level: 'primary',
    type: 'insufficient_funds',
    title: '专户资金接近警戒线',
    description: '该项目工资专户资金比为60%，接近50%预警线，请督促施工单位及时补充资金。',
    riskScore: 55,
    createTime: '2026-06-13 08:15:00',
    status: 'pending',
    handler: null,
    handleDeadline: '2026-06-18 08:15:00',
    approvalFlow: [],
    province: '陕西省',
    city: '西安市',
  },
  {
    id: 'w006',
    projectId: 'p007',
    projectName: '湘江生态治理工程',
    level: 'primary',
    type: 'low_payment_rate',
    title: '本月工资发放率下降',
    description: '该项目本月工资发放率为82.4%，较上月下降6.3个百分点，需关注后续发放情况。',
    riskScore: 45,
    createTime: '2026-06-14 10:30:00',
    status: 'resolved',
    handler: '陈静',
    handleDeadline: '2026-06-19 10:30:00',
    approvalFlow: [],
    province: '湖南省',
    city: '长沙市',
  },
];

export const mockComplaints: Complaint[] = [
  {
    id: 'c001',
    projectId: 'p005',
    projectName: '南水北调配套工程',
    type: '工资拖欠',
    description: '3月份工资至今未发放，涉及工人45人，金额约180万元',
    complainant: '王某某',
    contact: '138****5678',
    createTime: '2026-06-10 09:15:00',
    status: 'processing',
  },
  {
    id: 'c002',
    projectId: 'p005',
    projectName: '南水北调配套工程',
    type: '克扣工资',
    description: '计件工资单价与约定不符，每人每月少发约500元',
    complainant: '李某某',
    contact: '139****1234',
    createTime: '2026-06-11 14:30:00',
    status: 'pending',
  },
  {
    id: 'c003',
    projectId: 'p008',
    projectName: '空港新城航站楼',
    type: '工资拖欠',
    description: '4月份工资已拖欠15天，涉及工人120人',
    complainant: '张某某',
    contact: '136****9876',
    createTime: '2026-06-09 11:20:00',
    status: 'processing',
  },
  {
    id: 'c004',
    projectId: 'p001',
    projectName: '中央商务区核心区项目',
    type: '加班工资',
    description: '连续加班一个月未支付加班费，涉及工人60人',
    complainant: '刘某某',
    contact: '137****4321',
    createTime: '2026-06-12 16:45:00',
    status: 'pending',
  },
  {
    id: 'c005',
    projectId: 'p003',
    projectName: '地铁3号线一期工程',
    type: '社保缴纳',
    description: '入职三个月未缴纳社保，多次催促无果',
    complainant: '赵某某',
    contact: '135****7654',
    createTime: '2026-06-08 10:00:00',
    status: 'resolved',
  },
];

const complaintTypes = ['工资拖欠', '克扣工资', '加班工资', '社保缴纳', '工伤赔偿', '解除合同', '其他'];

export const mockWeeklyReports: WeeklyReport[] = [
  {
    id: 'r001',
    title: '第24周全国欠薪风险诊断报告',
    weekStart: '2026-06-09',
    weekEnd: '2026-06-15',
    generateTime: '2026-06-16 08:00:00',
    summary: {
      totalProjects: 2356,
      avgPaymentRate: 87.5,
      totalWarnings: 156,
      totalComplaints: 328,
      paymentRateYoY: 2.3,
      paymentRateMoM: -0.8,
      totalOwedAmount: 12580,
    },
    riskDistribution: [
      { province: '广东省', riskLevel: 'high', warningCount: 28, riskScore: 85 },
      { province: '四川省', riskLevel: 'high', warningCount: 22, riskScore: 78 },
      { province: '湖北省', riskLevel: 'high', warningCount: 18, riskScore: 72 },
      { province: '重庆市', riskLevel: 'high', warningCount: 15, riskScore: 70 },
      { province: '河南省', riskLevel: 'medium', warningCount: 14, riskScore: 62 },
    ],
    complaintRanking: complaintTypes.slice(0, 5).map((type, index) => ({
      type,
      count: [145, 68, 45, 32, 25][index],
      percentage: [44.2, 20.7, 13.7, 9.8, 7.6][index],
    })),
    paymentRanking: [
      { province: '上海市', paymentRate: 95.8, rank: 1 },
      { province: '北京市', paymentRate: 94.2, rank: 2 },
      { province: '江苏省', paymentRate: 94.5, rank: 3 },
      { province: '浙江省', paymentRate: 91.8, rank: 4 },
      { province: '福建省', paymentRate: 92.8, rank: 5 },
    ],
    suggestions: [
      '重点关注广东省、四川省、湖北省等高风险省份的在建项目，建议开展专项督查行动',
      '工资拖欠类投诉占比最高（44.2%），建议加强工资专户监管力度，确保资金专款专用',
      '建议对连续3个月工资发放率低于85%的项目，提高保证金缴存比例',
      '推广江苏省实名制管理经验，实现考勤数据与工资发放自动联动校验',
    ],
  },
  {
    id: 'r002',
    title: '第23周全国欠薪风险诊断报告',
    weekStart: '2026-06-02',
    weekEnd: '2026-06-08',
    generateTime: '2026-06-09 08:00:00',
    summary: {
      totalProjects: 2342,
      avgPaymentRate: 88.3,
      totalWarnings: 142,
      totalComplaints: 312,
      paymentRateYoY: 1.5,
      paymentRateMoM: 0.5,
      totalOwedAmount: 11320,
    },
    riskDistribution: [
      { province: '广东省', riskLevel: 'high', warningCount: 25, riskScore: 82 },
      { province: '四川省', riskLevel: 'high', warningCount: 20, riskScore: 75 },
      { province: '湖北省', riskLevel: 'medium', warningCount: 16, riskScore: 68 },
    ],
    complaintRanking: complaintTypes.slice(0, 5).map((type, index) => ({
      type,
      count: [138, 62, 42, 35, 22][index],
      percentage: [44.2, 19.9, 13.5, 11.2, 7.1][index],
    })),
    paymentRanking: [
      { province: '上海市', paymentRate: 96.2, rank: 1 },
      { province: '北京市', paymentRate: 94.8, rank: 2 },
      { province: '江苏省', paymentRate: 94.0, rank: 3 },
    ],
    suggestions: [
      '持续加强重点省份监管力度',
      '进一步完善工资保证金制度',
    ],
  },
  {
    id: 'r003',
    title: '第22周全国欠薪风险诊断报告',
    weekStart: '2026-05-26',
    weekEnd: '2026-06-01',
    generateTime: '2026-06-02 08:00:00',
    summary: {
      totalProjects: 2328,
      avgPaymentRate: 87.8,
      totalWarnings: 148,
      totalComplaints: 305,
      paymentRateYoY: 1.2,
      paymentRateMoM: -0.3,
      totalOwedAmount: 10850,
    },
    riskDistribution: [
      { province: '广东省', riskLevel: 'high', warningCount: 23, riskScore: 80 },
      { province: '四川省', riskLevel: 'high', warningCount: 18, riskScore: 73 },
    ],
    complaintRanking: [],
    paymentRanking: [],
    suggestions: [],
  },
];

export function generateAttendanceRecords(projectId: string, days: number = 7): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const project = mockProjects.find(p => p.id === projectId);
  const baseWorkers = project?.totalWorkers || 500;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const variation = Math.random() * 0.2 - 0.1;
    const presentWorkers = Math.round(baseWorkers * (0.85 + variation));
    const attendanceRate = Math.round((presentWorkers / baseWorkers) * 1000) / 10;
    
    records.push({
      date: dateStr,
      projectId,
      totalWorkers: baseWorkers,
      presentWorkers,
      attendanceRate,
    });
  }
  
  return records;
}

export function generateSalaryRecords(projectId: string, months: number = 6): SalaryRecord[] {
  const records: SalaryRecord[] = [];
  const project = mockProjects.find(p => p.id === projectId);
  const baseWorkers = project?.totalWorkers || 500;
  const baseSalary = 6500;
  
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const paymentRate = project?.paymentRate 
      ? project.paymentRate + (Math.random() * 10 - 5) 
      : 85 + Math.random() * 15;
    
    const totalAmount = Math.round(baseWorkers * baseSalary * (0.95 + Math.random() * 0.1));
    const paidAmount = Math.round(totalAmount * (Math.min(paymentRate, 100) / 100));
    
    const isPaid = paymentRate >= 95;
    const isPartial = paymentRate >= 80 && paymentRate < 95;
    const isOverdue = paymentRate < 80 && i < months - 1;
    
    let status: SalaryRecord['status'] = 'pending';
    let paymentDate: string | null = null;
    
    if (isPaid) {
      status = 'paid';
      const payDate = new Date(date.getFullYear(), date.getMonth(), 25);
      paymentDate = payDate.toISOString().split('T')[0];
    } else if (isPartial) {
      status = 'partial';
      const payDate = new Date(date.getFullYear(), date.getMonth(), 28);
      paymentDate = payDate.toISOString().split('T')[0];
    } else if (isOverdue) {
      status = 'overdue';
    }
    
    records.push({
      id: `s${projectId}-${monthStr}`,
      projectId,
      month: monthStr,
      totalAmount,
      paidAmount,
      workerCount: baseWorkers,
      paidCount: Math.round(baseWorkers * (Math.min(paymentRate, 100) / 100)),
      paymentRate: Math.min(Math.round(paymentRate * 10) / 10, 100),
      paymentDate,
      status,
    });
  }
  
  return records;
}

export const mockUser: User = {
  id: 'u001',
  name: '管理员',
  role: 'national',
  permissions: [
    'dashboard:view',
    'projects:view',
    'warnings:manage',
    'salary-verify:use',
    'reports:view',
    'system:manage',
  ],
};

export const mockDashboardStats: DashboardStats = {
  totalProjects: 2356,
  totalWorkers: 1258600,
  avgPaymentRate: 87.5,
  avgRiskScore: 42.3,
  avgFundRatio: 76.8,
  activeWarnings: 156,
  primaryWarnings: 98,
  secondaryWarnings: 58,
  totalComplaints: 328,
  paymentRateChange: -0.8,
  riskScoreChange: 1.2,
};

const workerNames = [
  '张伟', '王芳', '李娜', '刘强', '陈静', '杨洋', '赵磊', '黄敏',
  '周杰', '吴秀兰', '徐建军', '孙丽华', '胡建国', '朱桂英', '高志强',
  '林美玲', '何卫东', '郭淑芬', '马晓东', '罗春燕', '梁文博', '宋彩霞',
  '郑海涛', '谢玉梅', '唐建华', '韩雪梅', '曹国强', '许丽娟', '邓志勇',
  '萧素珍', '冯文博', '程亚丽', '蔡建平', '彭丽华', '潘文博', '田野',
  '董文博', '袁秀兰', '于建军', '蒋丽华', '沈志强', '姚美玲', '卢卫东',
  '姜淑芬', '崔晓东', '钟春燕', '谭文博', '廖彩霞', '范海涛', '方玉梅',
];

const salaryLevels = [6500, 7200, 7800, 8500, 9200, 6800, 7500, 8200, 8800, 9500];
const projectIds = ['p001', 'p002', 'p003', 'p004', 'p005', 'p006', 'p007', 'p008', 'p009', 'p010'];

function generateIdCard(index: number): string {
  const areaCodes = ['110101', '310101', '440301', '320102', '510104', '330106', '410102', '370203'];
  const areaCode = areaCodes[index % areaCodes.length];
  const year = 1975 + (index % 25);
  const month = String(((index % 12) + 1)).padStart(2, '0');
  const day = String(((index % 28) + 1)).padStart(2, '0');
  const seq = String(1000 + index).slice(-3);
  const check = (index % 10);
  return `${areaCode}${year}${month}${day}${seq}${check}`;
}

export const registerWorkers: Worker[] = workerNames.map((name, index) => {
  const projectId = projectIds[index % projectIds.length];
  const monthlySalary = salaryLevels[index % salaryLevels.length];
  const isLeft = index === 7 || index === 23 || index === 41;
  
  return {
    id: `w${String(index + 1).padStart(4, '0')}`,
    name,
    idCard: generateIdCard(index),
    projectId,
    status: isLeft ? 'left' : 'active',
    monthlySalary,
    expectedAttendance: 22,
  };
});

export { provinces, industries, constructionUnits };
