import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  AlertTriangle,
  PiggyBank,
  Building2,
  Users,
  Bell,
  Filter,
  ChevronDown,
  AlertCircle,
  Clock,
  MapPin,
  X,
  ExternalLink,
  TrendingUp,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import StatCard from '@/components/cards/StatCard';
import ChinaMapChart from '@/components/charts/ChinaMapChart';
import RankingList from '@/components/charts/RankingList';
import AttendanceChart from '@/components/charts/AttendanceChart';
import SalaryTimeline from '@/components/SalaryTimeline';
import ComplaintPieChart from '@/components/charts/ComplaintPieChart';
import type { ProvinceData, Warning, AttendanceRecord, SalaryRecord, Complaint } from '@/types';
import { industries, generateAttendanceRecords, generateSalaryRecords } from '@/mock/data';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    user,
    provinceData,
    warnings,
    selectedIndustry,
    setSelectedIndustry,
    setSelectedProvince,
    projects,
    complaints,
    getFilteredDashboardStats,
    getFilteredProjects,
    getFilteredWarnings,
    getFilteredProvinceData,
    getFilteredComplaints,
  } = useAppStore();

  const [selectedProvinceData, setSelectedProvinceData] = useState<ProvinceData | null>(null);

  const dashboardStats = useMemo(() => getFilteredDashboardStats(), [user, getFilteredDashboardStats]);
  const roleFilteredProvinceData = useMemo(() => getFilteredProvinceData(), [user, getFilteredProvinceData]);
  const roleFilteredWarnings = useMemo(() => getFilteredWarnings(), [user, getFilteredWarnings]);

  const filteredProvinceData = useMemo(() => {
    if (selectedIndustry === 'all') return roleFilteredProvinceData;
    return roleFilteredProvinceData.map((p) => ({
      ...p,
      value: Math.round(p.value * (0.7 + Math.random() * 0.6)),
      projectCount: Math.round(p.projectCount * (0.5 + Math.random() * 0.5)),
    }));
  }, [roleFilteredProvinceData, selectedIndustry]);

  const filteredWarnings = useMemo(() => {
    if (selectedIndustry === 'all') return roleFilteredWarnings;
    return roleFilteredWarnings.filter(() => Math.random() > 0.3);
  }, [roleFilteredWarnings, selectedIndustry]);

  const activeWarnings = useMemo(
    () => filteredWarnings.filter((w) => w.status !== 'resolved'),
    [filteredWarnings]
  );

  const primaryWarnings = useMemo(
    () => activeWarnings.filter((w) => w.level === 'primary'),
    [activeWarnings]
  );

  const secondaryWarnings = useMemo(
    () => activeWarnings.filter((w) => w.level === 'secondary'),
    [activeWarnings]
  );

  const latestWarnings = useMemo(
    () =>
      [...activeWarnings]
        .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
        .slice(0, 5),
    [activeWarnings]
  );

  const provinceProjects = useMemo(() => {
    if (!selectedProvinceData) return [];
    const filteredProjects = getFilteredProjects();
    return filteredProjects.filter((p) => p.province === selectedProvinceData.name);
  }, [selectedProvinceData, getFilteredProjects]);

  const provinceAttendanceData = useMemo((): AttendanceRecord[] => {
    if (!selectedProvinceData) return [];
    if (provinceProjects.length === 0) return [];
    return generateAttendanceRecords(provinceProjects[0].id, 7);
  }, [selectedProvinceData, provinceProjects]);

  const provinceSalaryData = useMemo((): SalaryRecord[] => {
    if (!selectedProvinceData) return [];
    if (provinceProjects.length === 0) return [];
    return generateSalaryRecords(provinceProjects[0].id, 6);
  }, [selectedProvinceData, provinceProjects]);

  const provinceComplaints = useMemo((): Complaint[] => {
    if (!selectedProvinceData) return [];
    const filteredComplaints = getFilteredComplaints();
    const projectIds = provinceProjects.map((p) => p.id);
    return filteredComplaints.filter((c) => projectIds.includes(c.projectId));
  }, [selectedProvinceData, provinceProjects, getFilteredComplaints]);

  const cityRiskDistribution = useMemo(() => {
    if (!selectedProvinceData) return [];
    const cityMap = new Map<string, { projects: typeof provinceProjects; warnings: number }>();
    provinceProjects.forEach((p) => {
      const city = p.city || '未知';
      if (!cityMap.has(city)) cityMap.set(city, { projects: [], warnings: 0 });
      cityMap.get(city)!.projects.push(p);
    });
    const provinceWarnings = getFilteredWarnings().filter(
      (w) => provinceProjects.some((p) => p.id === w.projectId)
    );
    provinceWarnings.forEach((w) => {
      const project = provinceProjects.find((p) => p.id === w.projectId);
      if (project) {
        const city = project.city || '未知';
        const entry = cityMap.get(city);
        if (entry) entry.warnings += 1;
      }
    });
    return Array.from(cityMap.entries())
      .map(([city, data]) => ({
        city,
        projectCount: data.projects.length,
        avgPaymentRate: data.projects.length > 0
          ? Math.round((data.projects.reduce((s, p) => s + p.paymentRate, 0) / data.projects.length) * 10) / 10
          : 0,
        avgRiskScore: data.projects.length > 0
          ? Math.round((data.projects.reduce((s, p) => s + p.riskScore, 0) / data.projects.length) * 10) / 10
          : 0,
        warningCount: data.warnings,
        riskLevel: data.projects.length > 0
          ? (data.projects.reduce((s, p) => s + p.riskScore, 0) / data.projects.length) >= 70 ? 'high' as const
            : (data.projects.reduce((s, p) => s + p.riskScore, 0) / data.projects.length) >= 40 ? 'medium' as const
            : 'low' as const
          : 'low' as const,
      }))
      .sort((a, b) => b.avgRiskScore - a.avgRiskScore);
  }, [selectedProvinceData, provinceProjects, getFilteredWarnings]);

  const projectRiskRanking = useMemo(() => {
    if (!selectedProvinceData) return [];
    return [...provinceProjects]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.name,
        city: p.city,
        riskScore: p.riskScore,
        paymentRate: p.paymentRate,
        fundRatio: p.fundRatio,
        riskLevel: p.riskScore >= 70 ? 'high' as const : p.riskScore >= 40 ? 'medium' as const : 'low' as const,
      }));
  }, [selectedProvinceData, provinceProjects]);

  const handleProvinceClick = (province: ProvinceData) => {
    setSelectedProvince(province.name);
    setSelectedProvinceData((prev) => (prev?.name === province.name ? null : province));
  };

  const handleCloseProvinceDrill = () => {
    setSelectedProvinceData(null);
    setSelectedProvince(null);
  };

  const handleGoToProjects = (city?: string) => {
    if (selectedProvinceData) {
      const params = new URLSearchParams();
      params.set('province', selectedProvinceData.name);
      if (city) {
        params.set('city', city);
      } else if (user.role === 'municipal' && user.city) {
        params.set('city', user.city);
      }
      navigate(`/projects?${params.toString()}`);
    }
  };

  const handleGoToProvinceDetail = () => {
    if (selectedProvinceData) {
      navigate(`/province/${encodeURIComponent(selectedProvinceData.name)}`);
    }
  };

  const getWarningLevelStyle = (level: Warning['level']) => {
    return level === 'secondary'
      ? 'bg-red-50 text-red-600 border-red-200'
      : 'bg-orange-50 text-orange-600 border-orange-200';
  };

  const getWarningLevelText = (level: Warning['level']) => {
    return level === 'secondary' ? '二级预警' : '一级预警';
  };

  const getWarningStatusStyle = (status: Warning['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'processing':
        return 'bg-blue-50 text-blue-600';
      case 'resolved':
        return 'bg-green-50 text-green-600';
      case 'escalated':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getWarningStatusText = (status: Warning['status']) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'resolved':
        return '已解决';
      case 'escalated':
        return '已升级';
      default:
        return status;
    }
  };

  const getRiskLevelColor = (level: ProvinceData['riskLevel']) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskLevelText = (level: ProvinceData['riskLevel']) => {
    switch (level) {
      case 'high':
        return '高风险';
      case 'medium':
        return '中风险';
      case 'low':
        return '低风险';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">全国欠薪风险监控看板</h1>
          <p className="text-sm text-gray-500 mt-1">实时监控全国在建项目工资发放情况</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {selectedIndustry === 'all' ? '全部行业' : selectedIndustry}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="all">全部行业</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="工资发放率"
          value={`${dashboardStats.avgPaymentRate}%`}
          trend={dashboardStats.paymentRateChange}
          icon={<Wallet className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="欠薪风险评分"
          value={dashboardStats.avgRiskScore}
          trend={dashboardStats.riskScoreChange}
          trendLabel="环比"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="专户资金比"
          value={`${dashboardStats.avgFundRatio}%`}
          trend={1.5}
          icon={<PiggyBank className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="在建项目数"
          value={dashboardStats.totalProjects.toLocaleString()}
          unit="个"
          trend={2.3}
          icon={<Building2 className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="农民工总数"
          value={(dashboardStats.totalWorkers / 10000).toFixed(1)}
          unit="万人"
          trend={1.8}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="活跃预警数"
          value={dashboardStats.activeWarnings}
          unit="条"
          trend={-3.2}
          icon={<Bell className="w-6 h-6" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-semibold text-gray-800">全国欠薪风险分布</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-gray-500">低风险</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-gray-500">中风险</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-500">高风险</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ChinaMapChart data={filteredProvinceData} onProvinceClick={handleProvinceClick} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-semibold text-gray-800">预警概览</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-orange-700 font-medium">一级预警</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {primaryWarnings.length}
                <span className="text-sm font-normal text-orange-500 ml-1">条</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-red-700 font-medium">二级预警</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {secondaryWarnings.length}
                <span className="text-sm font-normal text-red-500 ml-1">条</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">最新预警</h4>
              <span className="text-xs text-blue-500 cursor-pointer hover:text-blue-600">
                查看全部
              </span>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {latestWarnings.map((warning) => (
                <div
                  key={warning.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-800 line-clamp-1 flex-1">
                      {warning.title}
                    </span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded border flex-shrink-0',
                        getWarningLevelStyle(warning.level)
                      )}
                    >
                      {getWarningLevelText(warning.level)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{warning.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{warning.province}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded',
                          getWarningStatusStyle(warning.status)
                        )}
                      >
                        {getWarningStatusText(warning.status)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{warning.createTime.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-in-out',
          selectedProvinceData ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {selectedProvinceData && (
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{selectedProvinceData.name}</h3>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded border font-medium',
                        getRiskLevelColor(selectedProvinceData.riskLevel)
                      )}
                    >
                      {getRiskLevelText(selectedProvinceData.riskLevel)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">风险评分 {selectedProvinceData.value} · {selectedProvinceData.projectCount} 个在建项目 · 工资发放率 {selectedProvinceData.paymentRate}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoToProvinceDetail}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>查看详情</span>
                </button>
                <button
                  onClick={() => handleGoToProjects()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  <span>项目列表</span>
                </button>
                <button
                  onClick={handleCloseProvinceDrill}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <h4 className="text-sm font-semibold text-gray-800">市级风险分布</h4>
                </div>
                {cityRiskDistribution.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {cityRiskDistribution.map((city) => (
                      <div
                        key={city.city}
                        onClick={() => handleGoToProjects(city.city)}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white',
                            city.riskLevel === 'high' ? 'bg-red-500' : city.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                          )}>
                            {city.avgRiskScore}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{city.city}</div>
                            <div className="text-xs text-gray-500">{city.projectCount}个项目 · {city.warningCount}条预警</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">发放率 {city.avgPaymentRate}%</div>
                          <div className={cn(
                            'text-xs',
                            city.riskLevel === 'high' ? 'text-red-500' : city.riskLevel === 'medium' ? 'text-orange-500' : 'text-green-500'
                          )}>
                            {city.riskLevel === 'high' ? '高风险' : city.riskLevel === 'medium' ? '中风险' : '低风险'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm">暂无市级数据</div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <h4 className="text-sm font-semibold text-gray-800">近7天考勤趋势</h4>
                </div>
                <div className="h-60">
                  {provinceAttendanceData.length > 0 ? (
                    <AttendanceChart data={provinceAttendanceData} height={240} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      暂无考勤数据
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <h4 className="text-sm font-semibold text-gray-800">投诉类型分布</h4>
                </div>
                <div className="h-60">
                  {provinceComplaints.length > 0 ? (
                    <ComplaintPieChart data={provinceComplaints} height={240} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      暂无投诉数据
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h4 className="text-sm font-semibold text-gray-800">项目风险排行</h4>
                </div>
                {projectRiskRanking.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {projectRiskRanking.map((project, idx) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                            idx === 0 ? 'bg-red-100 text-red-600' : idx === 1 ? 'bg-orange-100 text-orange-600' : idx === 2 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'
                          )}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-800 line-clamp-1">{project.name}</div>
                            <div className="text-xs text-gray-500">{project.city} · 发放率{project.paymentRate}% · 资金比{project.fundRatio}%</div>
                          </div>
                        </div>
                        <span className={cn(
                          'text-sm font-bold',
                          project.riskLevel === 'high' ? 'text-red-600' : project.riskLevel === 'medium' ? 'text-orange-500' : 'text-green-500'
                        )}>
                          {project.riskScore}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm">暂无项目风险数据</div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <h4 className="text-sm font-semibold text-gray-800">工资发放时间线</h4>
                </div>
                {provinceSalaryData.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto pr-2">
                    <SalaryTimeline data={provinceSalaryData} />
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                    暂无工资数据
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="h-80">
            <RankingList
              data={filteredProvinceData}
              title="工资发放率排名 TOP10"
              topN={10}
              onItemClick={handleProvinceClick}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-semibold text-gray-800">行业分布</h3>
          </div>
          <div className="space-y-4">
            {industries.map((industry, index) => {
              const percentage = [35, 25, 18, 12, 10][index];
              const colors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-yellow-500',
                'bg-purple-500',
                'bg-orange-500',
              ];
              return (
                <div key={industry} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{industry}</span>
                    <span className="font-medium text-gray-800">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', colors[index])}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
