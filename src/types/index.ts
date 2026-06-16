export interface Project {
  id: string;
  name: string;
  province: string;
  city: string;
  district: string;
  industry: string;
  constructionUnit: string;
  totalWorkers: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'suspended';
  paymentRate: number;
  riskScore: number;
  fundRatio: number;
}

export interface SalaryRecord {
  id: string;
  projectId: string;
  month: string;
  totalAmount: number;
  paidAmount: number;
  workerCount: number;
  paidCount: number;
  paymentRate: number;
  paymentDate: string | null;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
}

export interface AttendanceRecord {
  date: string;
  projectId: string;
  totalWorkers: number;
  presentWorkers: number;
  attendanceRate: number;
}

export interface SpecialAccount {
  projectId: string;
  balance: number;
  payableAmount: number;
  fundRatio: number;
  lastUpdate: string;
}

export type WarningLevel = 'primary' | 'secondary';
export type WarningType = 'low_payment_rate' | 'insufficient_funds' | 'complaint';
export type WarningStatus = 'pending' | 'processing' | 'resolved' | 'escalated';

export interface WarningEvidence {
  paymentRate?: number;
  paymentRateThreshold?: number;
  fundRatio?: number;
  fundRatioThreshold?: number;
  isConsecutive?: boolean;
  consecutiveMonths?: number;
  daysSinceCreated?: number;
  escalateDays?: number;
  isEscalated?: boolean;
}

export interface Warning {
  id: string;
  projectId: string;
  projectName: string;
  level: WarningLevel;
  type: WarningType;
  title: string;
  description: string;
  riskScore: number;
  createTime: string;
  status: WarningStatus;
  handler: string | null;
  handleDeadline: string;
  approvalFlow: ApprovalStep[];
  province: string;
  city: string;
  evidence?: WarningEvidence;
}

export interface ApprovalStep {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  approver: string | null;
  status: 'pending' | 'approved' | 'rejected';
  comment: string | null;
  approveTime: string | null;
}

export interface Complaint {
  id: string;
  projectId: string;
  projectName: string;
  type: string;
  description: string;
  complainant: string;
  contact: string;
  createTime: string;
  status: 'pending' | 'processing' | 'resolved';
}

export interface WeeklyReport {
  id: string;
  title: string;
  weekStart: string;
  weekEnd: string;
  generateTime: string;
  summary: {
    totalProjects: number;
    avgPaymentRate: number;
    totalWarnings: number;
    totalComplaints: number;
    paymentRateYoY: number;
    paymentRateMoM: number;
    totalOwedAmount: number;
  };
  riskDistribution: RiskItem[];
  complaintRanking: ComplaintRankItem[];
  paymentRanking: PaymentRankItem[];
  suggestions: string[];
}

export interface RiskItem {
  province: string;
  riskLevel: 'high' | 'medium' | 'low';
  warningCount: number;
  riskScore: number;
}

export interface ComplaintRankItem {
  type: string;
  count: number;
  percentage: number;
}

export interface PaymentRankItem {
  province: string;
  paymentRate: number;
  rank: number;
}

export type UserRole = 'national' | 'provincial' | 'municipal' | 'project';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  province?: string;
  city?: string;
  permissions: string[];
  avatar?: string;
}

export interface ProvinceData {
  name: string;
  value: number;
  riskLevel: 'high' | 'medium' | 'low';
  projectCount: number;
  paymentRate: number;
}

export interface SalaryVerifyResult {
  totalWorkers: number;
  systemActiveWorkers?: number;
  matchedWorkers: number;
  nameMismatchCount?: number;
  extraPersonCount?: number;
  missingPersonCount?: number;
  unmatchedWorkers: number;
  totalAmount: number;
  matchedAmount: number;
  unmatchedAmount: number;
  status: 'passed' | 'warning' | 'error';
  anomalies: AnomalyItem[];
}

export interface AnomalyItem {
  type: 'person_mismatch' | 'amount_mismatch' | 'attendance_mismatch';
  name: string;
  idCard?: string;
  expected: number | string;
  actual: number | string;
  description: string;
}

export interface Worker {
  id: string;
  name: string;
  idCard: string;
  projectId: string;
  status: 'active' | 'left';
  monthlySalary: number;
  expectedAttendance: number;
}

export interface DashboardStats {
  totalProjects: number;
  totalWorkers: number;
  avgPaymentRate: number;
  avgRiskScore: number;
  avgFundRatio: number;
  activeWarnings: number;
  primaryWarnings: number;
  secondaryWarnings: number;
  totalComplaints: number;
  paymentRateChange: number;
  riskScoreChange: number;
}
