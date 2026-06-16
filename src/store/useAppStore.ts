import { create } from 'zustand';
import type { User, Warning, Project, DashboardStats, ProvinceData, WeeklyReport, Complaint, UserRole, ApprovalStep } from '@/types';
import { mockUser, mockDashboardStats, mockWarnings, mockProjects, mockProvinceData, mockWeeklyReports, mockComplaints } from '@/mock/data';

const defaultWarningThreshold = {
  paymentRate: 80,
  fundRatio: 50,
  escalateDays: 5,
};

type WarningThreshold = typeof defaultWarningThreshold;

interface AppState {
  user: User;
  currentPage: string;
  sidebarCollapsed: boolean;
  dashboardStats: DashboardStats;
  warnings: Warning[];
  projects: Project[];
  provinceData: ProvinceData[];
  weeklyReports: WeeklyReport[];
  complaints: Complaint[];
  selectedProvince: string | null;
  selectedIndustry: string;
  warningThreshold: WarningThreshold;

  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;
  setSelectedProvince: (province: string | null) => void;
  setSelectedIndustry: (industry: string) => void;
  updateWarningStatus: (id: string, status: Warning['status']) => void;
  approveWarningStep: (warningId: string, stepId: string, comment: string) => void;
  rejectWarningStep: (warningId: string, stepId: string, comment: string) => void;

  setUserRole: (role: UserRole, province?: string, city?: string) => void;
  updateSystemSettings: (settings: Partial<WarningThreshold>) => void;

  getFilteredProjects: () => Project[];
  getFilteredWarnings: () => Warning[];
  getFilteredProvinceData: () => ProvinceData[];
  getFilteredWeeklyReports: () => WeeklyReport[];
  getFilteredComplaints: () => Complaint[];
  getFilteredDashboardStats: () => DashboardStats;

  calculateWarnings: (projects: Project[], settings: WarningThreshold) => Warning[];
  recalculateWarnings: () => void;
}

function loadPersistedSettings(): WarningThreshold {
  try {
    const saved = localStorage.getItem('systemSettings');
    if (saved) {
      return { ...defaultWarningThreshold, ...JSON.parse(saved) };
    }
  } catch {
    return defaultWarningThreshold;
  }
  return defaultWarningThreshold;
}

function loadPersistedUser(): User {
  try {
    const saved = localStorage.getItem('userRole');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...mockUser, ...parsed };
    }
  } catch {
    return mockUser;
  }
  return mockUser;
}

function filterProjectsByRole(projects: Project[], user: User): Project[] {
  switch (user.role) {
    case 'national':
      return projects;
    case 'provincial':
      return projects.filter((p) => p.province === user.province);
    case 'municipal':
      return projects.filter((p) => p.province === user.province && p.city === user.city);
    case 'project':
      return projects;
    default:
      return projects;
  }
}

function filterWarningsByRole(warnings: Warning[], user: User): Warning[] {
  switch (user.role) {
    case 'national':
      return warnings;
    case 'provincial':
      return warnings.filter((w) => w.province === user.province);
    case 'municipal':
      return warnings.filter((w) => w.province === user.province && w.city === user.city);
    case 'project':
      return warnings;
    default:
      return warnings;
  }
}

function filterProvinceDataByRole(data: ProvinceData[], user: User): ProvinceData[] {
  switch (user.role) {
    case 'national':
      return data;
    case 'provincial':
      return data.filter((d) => d.name === user.province);
    case 'municipal':
      return data.filter((d) => d.name === user.province);
    case 'project':
      return data;
    default:
      return data;
  }
}

function filterComplaintsByRole(complaints: Complaint[], projects: Project[], user: User): Complaint[] {
  const filteredProjects = filterProjectsByRole(projects, user);
  const filteredProjectIds = new Set(filteredProjects.map((p) => p.id));
  return complaints.filter((c) => filteredProjectIds.has(c.projectId));
}

function filterWeeklyReportsByRole(
  reports: WeeklyReport[],
  projects: Project[],
  warnings: Warning[],
  complaints: Complaint[],
  user: User
): WeeklyReport[] {
  const filteredProjects = filterProjectsByRole(projects, user);
  const filteredProjectIds = new Set(filteredProjects.map((p) => p.id));
  const filteredWarnings = filterWarningsByRole(warnings, user);
  const filteredComplaints = filterComplaintsByRole(complaints, projects, user);

  if (user.role === 'national') {
    return reports;
  }

  const targetProvince = user.province;
  const targetCity = user.city;
  const areaName = user.role === 'municipal' ? `${targetProvince}${targetCity}` : targetProvince;

  const areaPaymentRate = filteredProjects.length > 0
    ? Math.round((filteredProjects.reduce((sum, p) => sum + p.paymentRate, 0) / filteredProjects.length) * 10) / 10
    : 0;

  const areaRiskScore = filteredProjects.length > 0
    ? Math.round((filteredProjects.reduce((sum, p) => sum + p.riskScore, 0) / filteredProjects.length) * 10) / 10
    : 0;

  const areaRiskLevel: 'high' | 'medium' | 'low' =
    areaRiskScore >= 70 ? 'high' : areaRiskScore >= 40 ? 'medium' : 'low';

  const complaintTypeCount: Record<string, number> = {};
  filteredComplaints.forEach((c) => {
    complaintTypeCount[c.type] = (complaintTypeCount[c.type] || 0) + 1;
  });

  const totalComplaints = filteredComplaints.length;
  const areaComplaintRanking = Object.entries(complaintTypeCount)
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalComplaints > 0 ? Math.round((count / totalComplaints) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const areaRiskDistribution = filteredProjects.length > 0
    ? [{
        province: user.role === 'municipal' ? targetCity || targetProvince : targetProvince,
        riskLevel: areaRiskLevel,
        warningCount: filteredWarnings.length,
        riskScore: areaRiskScore,
      }]
    : [];

  const areaPaymentRanking = filteredProjects.length > 0
    ? [{
        province: user.role === 'municipal' ? targetCity || targetProvince : targetProvince,
        paymentRate: areaPaymentRate,
        rank: 1,
      }]
    : [];

  return reports.map((report) => {
    return {
      ...report,
      title: report.title.replace('全国', areaName),
      summary: {
        ...report.summary,
        totalProjects: filteredProjects.length,
        avgPaymentRate: areaPaymentRate,
        totalWarnings: filteredWarnings.length,
        totalComplaints,
        totalOwedAmount: Math.round(filteredWarnings.length * 800),
      },
      riskDistribution: areaRiskDistribution,
      paymentRanking: areaPaymentRanking,
      complaintRanking: areaComplaintRanking,
    };
  });
}

function computeDashboardStats(projects: Project[], warnings: Warning[], complaints: Complaint[]): DashboardStats {
  if (projects.length === 0) {
    return {
      totalProjects: 0,
      totalWorkers: 0,
      avgPaymentRate: 0,
      avgRiskScore: 0,
      avgFundRatio: 0,
      activeWarnings: 0,
      primaryWarnings: 0,
      secondaryWarnings: 0,
      totalComplaints: 0,
      paymentRateChange: 0,
      riskScoreChange: 0,
    };
  }

  const totalProjects = projects.length;
  const totalWorkers = projects.reduce((sum, p) => sum + p.totalWorkers, 0);
  const avgPaymentRate = Math.round((projects.reduce((sum, p) => sum + p.paymentRate, 0) / totalProjects) * 10) / 10;
  const avgRiskScore = Math.round((projects.reduce((sum, p) => sum + p.riskScore, 0) / totalProjects) * 10) / 10;
  const avgFundRatio = Math.round((projects.reduce((sum, p) => sum + p.fundRatio, 0) / totalProjects) * 10) / 10;

  const activeWarnings = warnings.filter((w) => w.status !== 'resolved');
  const primaryWarnings = activeWarnings.filter((w) => w.level === 'primary');
  const secondaryWarnings = activeWarnings.filter((w) => w.level === 'secondary');

  return {
    totalProjects,
    totalWorkers,
    avgPaymentRate,
    avgRiskScore,
    avgFundRatio,
    activeWarnings: activeWarnings.length,
    primaryWarnings: primaryWarnings.length,
    secondaryWarnings: secondaryWarnings.length,
    totalComplaints: complaints.length,
    paymentRateChange: Math.round((avgPaymentRate - 87.5) * 10) / 10,
    riskScoreChange: Math.round((avgRiskScore - 42.3) * 10) / 10,
  };
}

const formatDate = (date: Date): string => {
  return date.toISOString().replace('T', ' ').slice(0, 19);
};

const generateWarningId = (projectId: string, type: string): string => {
  const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `w${hash}${type}`;
};

const hashProjectId = (projectId: string): number => {
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    const char = projectId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const createApprovalFlow = (): ApprovalStep[] => [
  { id: 'a1', level: 1, title: '项目经理确认', approver: null, status: 'pending', comment: null, approveTime: null },
  { id: 'a2', level: 2, title: '区人社局复核', approver: null, status: 'pending', comment: null, approveTime: null },
  { id: 'a3', level: 3, title: '市人社局批准', approver: null, status: 'pending', comment: null, approveTime: null },
];

export const useAppStore = create<AppState>((set, get) => ({
  user: loadPersistedUser(),
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  dashboardStats: mockDashboardStats,
  warnings: mockWarnings,
  projects: mockProjects,
  provinceData: mockProvinceData,
  weeklyReports: mockWeeklyReports,
  complaints: mockComplaints,
  selectedProvince: null,
  selectedIndustry: 'all',
  warningThreshold: loadPersistedSettings(),

  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSelectedProvince: (province) => set({ selectedProvince: province }),
  setSelectedIndustry: (industry) => set({ selectedIndustry: industry }),

  updateWarningStatus: (id, status) =>
    set((state) => ({
      warnings: state.warnings.map((w) =>
        w.id === id ? { ...w, status, handler: state.user.name } : w
      ),
    })),

  approveWarningStep: (warningId, stepId, comment) =>
    set((state) => ({
      warnings: state.warnings.map((w) => {
        if (w.id !== warningId) return w;
        return {
          ...w,
          approvalFlow: w.approvalFlow.map((step) =>
            step.id === stepId
              ? {
                  ...step,
                  status: 'approved' as const,
                  approver: state.user.name,
                  comment,
                  approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
                }
              : step
          ),
        };
      }),
    })),

  rejectWarningStep: (warningId, stepId, comment) =>
    set((state) => ({
      warnings: state.warnings.map((w) => {
        if (w.id !== warningId) return w;
        return {
          ...w,
          approvalFlow: w.approvalFlow.map((step) =>
            step.id === stepId
              ? {
                  ...step,
                  status: 'rejected' as const,
                  approver: state.user.name,
                  comment,
                  approveTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
                }
              : step
          ),
        };
      }),
    })),

  setUserRole: (role, province, city) => {
    const newUser: User = {
      ...get().user,
      role,
      province,
      city,
    };
    localStorage.setItem('userRole', JSON.stringify({ role, province, city }));
    set({ user: newUser });
  },

  updateSystemSettings: (settings) => {
    const newThreshold = { ...get().warningThreshold, ...settings };
    localStorage.setItem('systemSettings', JSON.stringify(newThreshold));
    set({ warningThreshold: newThreshold });
  },

  calculateWarnings: (projects: Project[], settings: WarningThreshold): Warning[] => {
    const result: Warning[] = [];
    const baseDate = new Date('2026-06-16T00:00:00');

    projects.forEach((project) => {
      const projectHash = hashProjectId(project.id);

      if (project.paymentRate < settings.paymentRate) {
        const isConsecutive = projectHash % 3 === 0;
        const daysAgo = projectHash % 7;
        const createTime = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const handleDeadline = new Date(createTime.getTime() + settings.escalateDays * 24 * 60 * 60 * 1000);
        const daysSinceCreated = Math.floor((baseDate.getTime() - createTime.getTime()) / (24 * 60 * 60 * 1000));
        const isEscalated = isConsecutive || (daysSinceCreated > settings.escalateDays);
        const level = isEscalated ? 'secondary' : 'primary';
        const status: Warning['status'] = isEscalated ? 'escalated' : 'pending';

        const title = isConsecutive
          ? `连续2个月工资发放率低于${settings.paymentRate}%`
          : `本月工资发放率${project.paymentRate}%低于阈值${settings.paymentRate}%`;

        const description = isConsecutive
          ? `该项目近两个月工资发放率持续低于${settings.paymentRate}%警戒线，本月实际发放率为${project.paymentRate}%，请高度重视并立即处置。`
          : `该项目本月工资发放率为${project.paymentRate}%，低于设定的预警阈值${settings.paymentRate}%，请及时关注。`;

        result.push({
          id: generateWarningId(project.id, 'p'),
          projectId: project.id,
          projectName: project.name,
          level,
          type: 'low_payment_rate',
          title,
          description,
          riskScore: Math.min(100, Math.round(project.riskScore + (isConsecutive ? 15 : 0))),
          createTime: formatDate(createTime),
          status,
          handler: null,
          handleDeadline: formatDate(handleDeadline),
          approvalFlow: level === 'secondary' ? createApprovalFlow() : [],
          province: project.province,
          city: project.city,
          evidence: {
            paymentRate: project.paymentRate,
            paymentRateThreshold: settings.paymentRate,
            isConsecutive,
            consecutiveMonths: isConsecutive ? 2 : 1,
            daysSinceCreated,
            escalateDays: settings.escalateDays,
            isEscalated,
          },
        });
      }

      if (project.fundRatio < settings.fundRatio) {
        const daysAgo = (projectHash + 2) % 7;
        const createTime = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const handleDeadline = new Date(createTime.getTime() + settings.escalateDays * 24 * 60 * 60 * 1000);
        const daysSinceCreated = Math.floor((baseDate.getTime() - createTime.getTime()) / (24 * 60 * 60 * 1000));
        const isEscalated = daysSinceCreated > settings.escalateDays;
        const level = isEscalated ? 'secondary' : 'primary';
        const status: Warning['status'] = isEscalated ? 'escalated' : 'pending';

        const title = `专户资金比${project.fundRatio}%低于阈值${settings.fundRatio}%`;
        const description = `该项目工资专户资金比为${project.fundRatio}%，已低于设定的预警阈值${settings.fundRatio}%，请督促施工单位及时补充资金。`;

        result.push({
          id: generateWarningId(project.id, 'f'),
          projectId: project.id,
          projectName: project.name,
          level,
          type: 'insufficient_funds',
          title,
          description,
          riskScore: Math.min(100, Math.round(project.riskScore + 5)),
          createTime: formatDate(createTime),
          status,
          handler: null,
          handleDeadline: formatDate(handleDeadline),
          approvalFlow: level === 'secondary' ? createApprovalFlow() : [],
          province: project.province,
          city: project.city,
          evidence: {
            fundRatio: project.fundRatio,
            fundRatioThreshold: settings.fundRatio,
            daysSinceCreated,
            escalateDays: settings.escalateDays,
            isEscalated,
          },
        });
      }
    });

    return result.sort((a, b) => {
      if (a.level !== b.level) return a.level === 'secondary' ? -1 : 1;
      if (a.riskScore !== b.riskScore) return b.riskScore - a.riskScore;
      return a.id.localeCompare(b.id);
    });
  },

  recalculateWarnings: () => {
    const { projects, warningThreshold, calculateWarnings } = get();
    const calculatedWarnings = calculateWarnings(projects, warningThreshold);
    const complaintWarnings = mockWarnings.filter((w) => w.type === 'complaint');
    const allWarnings = [...calculatedWarnings, ...complaintWarnings];
    set({ warnings: allWarnings });
  },

  getFilteredProjects: () => {
    const { projects, user } = get();
    return filterProjectsByRole(projects, user);
  },

  getFilteredWarnings: () => {
    const { warnings, user } = get();
    return filterWarningsByRole(warnings, user);
  },

  getFilteredProvinceData: () => {
    const { provinceData, user } = get();
    return filterProvinceDataByRole(provinceData, user);
  },

  getFilteredWeeklyReports: () => {
    const { weeklyReports, projects, warnings, complaints, user } = get();
    return filterWeeklyReportsByRole(weeklyReports, projects, warnings, complaints, user);
  },

  getFilteredComplaints: () => {
    const { complaints, projects, user } = get();
    return filterComplaintsByRole(complaints, projects, user);
  },

  getFilteredDashboardStats: () => {
    const { projects, warnings, complaints, user } = get();
    const filteredProjects = filterProjectsByRole(projects, user);
    const filteredWarnings = filterWarningsByRole(warnings, user);
    const filteredComplaints = filterComplaintsByRole(complaints, projects, user);
    return computeDashboardStats(filteredProjects, filteredWarnings, filteredComplaints);
  },
}));
