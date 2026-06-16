import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Users,
  Wallet,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Calendar,
  ChevronRight,
  PiggyBank,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { generateAttendanceRecords, generateSalaryRecords } from '@/mock/data';
import StatCard from '@/components/cards/StatCard';
import AttendanceChart from '@/components/charts/AttendanceChart';
import SalaryTimeline from '@/components/SalaryTimeline';
import ComplaintPieChart from '@/components/charts/ComplaintPieChart';
import type { AttendanceRecord, SalaryRecord, Complaint, Warning, Project } from '@/types';

const statusMap: Record<string, string> = {
  active: '在建',
  completed: '已完工',
  suspended: '停工',
};

export default function ProvinceDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { projects, provinceData, warnings, complaints } = useAppStore();

  const provinceName = decodeURIComponent(name || '');

  const provinceInfo = useMemo(() => {
    return provinceData.find((p) => p.name === provinceName);
  }, [provinceData, provinceName]);

  const provinceProjects = useMemo((): Project[] => {
    return projects.filter((p) => p.province === provinceName);
  }, [projects, provinceName]);

  const provinceWarnings = useMemo((): Warning[] => {
    return warnings.filter((w) => w.province === provinceName);
  }, [warnings, provinceName]);

  const activeWarnings = useMemo(
    () => provinceWarnings.filter((w) => w.status !== 'resolved'),
    [provinceWarnings]
  );

  const provinceComplaints = useMemo((): Complaint[] => {
    const projectIds = provinceProjects.map((p) => p.id);
    return complaints.filter((c) => projectIds.includes(c.projectId));
  }, [provinceProjects, complaints]);

  const attendanceData = useMemo((): AttendanceRecord[] => {
    if (provinceProjects.length === 0) return [];
    return generateAttendanceRecords(provinceProjects[0].id, 14);
  }, [provinceProjects]);

  const salaryData = useMemo((): SalaryRecord[] => {
    if (provinceProjects.length === 0) return [];
    return generateSalaryRecords(provinceProjects[0].id, 6);
  }, [provinceProjects]);

  const stats = useMemo(() => {
    const totalWorkers = provinceProjects.reduce((sum, p) => sum + p.totalWorkers, 0);
    const avgPaymentRate =
      provinceProjects.length > 0
        ? Math.round(
            (provinceProjects.reduce((sum, p) => sum + p.paymentRate, 0) / provinceProjects.length) *
              10
          ) / 10
        : 0;
    const avgRiskScore =
      provinceProjects.length > 0
        ? Math.round(
            (provinceProjects.reduce((sum, p) => sum + p.riskScore, 0) / provinceProjects.length) *
              10
          ) / 10
        : 0;
    const avgFundRatio =
      provinceProjects.length > 0
        ? Math.round(
            (provinceProjects.reduce((sum, p) => sum + p.fundRatio, 0) / provinceProjects.length) *
              10
          ) / 10
        : 0;

    return {
      totalProjects: provinceProjects.length,
      totalWorkers,
      avgPaymentRate,
      avgRiskScore,
      avgFundRatio,
      activeWarnings: activeWarnings.length,
      totalComplaints: provinceComplaints.length,
    };
  }, [provinceProjects, activeWarnings, provinceComplaints]);

  const getRiskLevelColor = (level: string | undefined) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLevelText = (level: string | undefined) => {
    switch (level) {
      case 'high':
        return '高风险';
      case 'medium':
        return '中风险';
      case 'low':
        return '低风险';
      default:
        return '未知';
    }
  };

  const getProjectRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-50';
    if (score < 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getWarningLevelStyle = (level: Warning['level']) => {
    return level === 'secondary'
      ? 'bg-red-50 text-red-600 border-red-200'
      : 'bg-orange-50 text-orange-600 border-orange-200';
  };

  const getWarningLevelText = (level: Warning['level']) => {
    return level === 'secondary' ? '二级预警' : '一级预警';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800">{provinceName}</h1>
              {provinceInfo && (
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded border font-medium',
                    getRiskLevelColor(provinceInfo.riskLevel)
                  )}
                >
                  {getRiskLevelText(provinceInfo.riskLevel)}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {provinceInfo
                ? `风险评分 ${provinceInfo.value} · 工资发放率 ${provinceInfo.paymentRate}%`
                : '省份数据加载中...'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="在建项目"
          value={stats.totalProjects}
          unit="个"
          icon={<Building2 className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="农民工总数"
          value={(stats.totalWorkers / 10000).toFixed(2)}
          unit="万人"
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="平均工资发放率"
          value={`${stats.avgPaymentRate}%`}
          icon={<Wallet className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="平均风险评分"
          value={stats.avgRiskScore}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="平均专户资金比"
          value={`${stats.avgFundRatio}%`}
          icon={<PiggyBank className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="活跃预警"
          value={stats.activeWarnings}
          unit="条"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="投诉总数"
          value={stats.totalComplaints}
          unit="起"
          icon={<BarChart3 className="w-6 h-6" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-semibold text-gray-800">近14天考勤趋势</h3>
          </div>
          <div className="h-64">
            {attendanceData.length > 0 ? (
              <AttendanceChart data={attendanceData} height={256} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                暂无考勤数据
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-semibold text-gray-800">投诉类型分布</h3>
          </div>
          <div className="h-64">
            {provinceComplaints.length > 0 ? (
              <ComplaintPieChart data={provinceComplaints} height={256} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                暂无投诉数据
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-semibold text-gray-800">项目列表</h3>
          </div>
          <button
            onClick={() => navigate(`/projects?province=${encodeURIComponent(provinceName)}`)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>查看全部</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {provinceProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {provinceProjects.slice(0, 6).map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1 flex-1 pr-2">
                    {project.name}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      project.status === 'active'
                        ? 'bg-blue-50 text-blue-600'
                        : project.status === 'completed'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {statusMap[project.status]}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">工人数量</span>
                    <span className="text-gray-800 font-medium">{project.totalWorkers} 人</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">工资发放率</span>
                    <span
                      className={`font-medium ${
                        project.paymentRate >= 95
                          ? 'text-green-600'
                          : project.paymentRate >= 80
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {project.paymentRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">风险评分</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${getProjectRiskColor(
                        project.riskScore
                      )}`}
                    >
                      {project.riskScore}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">暂无该省份项目数据</div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-500" />
          <h3 className="text-base font-semibold text-gray-800">工资发放时间线</h3>
        </div>
        {salaryData.length > 0 ? (
          <div className="max-h-96 overflow-y-auto pr-2">
            <SalaryTimeline data={salaryData} />
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">暂无工资发放数据</div>
        )}
      </div>

      {activeWarnings.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-semibold text-gray-800">活跃预警</h3>
          </div>
          <div className="space-y-3">
            {activeWarnings.slice(0, 5).map((warning) => (
              <div
                key={warning.id}
                onClick={() => navigate(`/warnings/${warning.id}`)}
                className="p-4 border border-gray-100 rounded-xl hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 line-clamp-1 flex-1 pr-2">
                    {warning.title}
                  </h4>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded border flex-shrink-0',
                      getWarningLevelStyle(warning.level)
                    )}
                  >
                    {getWarningLevelText(warning.level)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{warning.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{warning.projectName}</span>
                  <span>{warning.createTime.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
