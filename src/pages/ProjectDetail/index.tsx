import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Users,
  Calendar,
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { generateAttendanceRecords, generateSalaryRecords } from '@/mock/data';
import AttendanceChart from '@/components/charts/AttendanceChart';
import ComplaintPieChart from '@/components/charts/ComplaintPieChart';
import SalaryTimeline from '@/components/SalaryTimeline';
import RiskGauge from '@/components/RiskGauge';

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: '在建', color: 'bg-blue-100 text-blue-600' },
  completed: { label: '已完工', color: 'bg-green-100 text-green-600' },
  suspended: { label: '停工', color: 'bg-gray-100 text-gray-600' },
};

function formatAmount(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(2)}万`;
  }
  return amount.toLocaleString();
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, complaints } = useAppStore();

  const project = useMemo(() => projects.find((p) => p.id === id), [projects, id]);

  const attendanceRecords = useMemo(() => {
    if (!id) return [];
    return generateAttendanceRecords(id, 7);
  }, [id]);

  const salaryRecords = useMemo(() => {
    if (!id) return [];
    return generateSalaryRecords(id, 6);
  }, [id]);

  const projectComplaints = useMemo(
    () => complaints.filter((c) => c.projectId === id),
    [complaints, id]
  );

  const specialAccount = useMemo(() => {
    if (!project) return null;
    const baseSalary = 6500;
    const payableAmount = project.totalWorkers * baseSalary;
    const balance = Math.round(payableAmount * (project.fundRatio / 100));
    return {
      balance,
      payableAmount,
      fundRatio: project.fundRatio,
    };
  }, [project]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 mb-4">项目不存在</p>
        <button
          onClick={() => navigate('/projects')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          返回项目列表
        </button>
      </div>
    );
  }

  const statusInfo = statusMap[project.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <span className="text-sm text-gray-500">
              {project.province} {project.city} {project.district}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">项目基本信息</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">建设单位</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{project.constructionUnit}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">行业类型</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{project.industry}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">工人总数</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{project.totalWorkers} 人</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">项目周期</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {project.startDate} ~ {project.endDate}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">项目地址</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {project.province}{project.city}{project.district}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">近7天考勤趋势</h2>
          <AttendanceChart data={attendanceRecords} height={280} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">风险评分</h2>
          <RiskGauge score={project.riskScore} height={260} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">工资发放记录</h2>
          <SalaryTimeline data={salaryRecords} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">专户资金情况</h2>
          {specialAccount && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-1">专户余额</p>
                <p className="text-3xl font-bold text-gray-800">
                  ¥{formatAmount(specialAccount.balance)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">应发工资（月）</span>
                  <span className="font-medium text-gray-800">
                    ¥{formatAmount(specialAccount.payableAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">资金保障率</span>
                  <span className={`font-medium ${
                    specialAccount.fundRatio >= 80 ? 'text-green-600' :
                    specialAccount.fundRatio >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {specialAccount.fundRatio}%
                  </span>
                </div>
              </div>

              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    specialAccount.fundRatio >= 80 ? 'bg-green-500' :
                    specialAccount.fundRatio >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(specialAccount.fundRatio, 100)}%` }}
                />
              </div>

              <div className={`p-3 rounded-lg ${
                specialAccount.fundRatio >= 80 ? 'bg-green-50' :
                specialAccount.fundRatio >= 50 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <div className="flex items-start gap-2">
                  {specialAccount.fundRatio >= 80 ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : specialAccount.fundRatio >= 50 ? (
                    <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p className={`font-medium ${
                      specialAccount.fundRatio >= 80 ? 'text-green-700' :
                      specialAccount.fundRatio >= 50 ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {specialAccount.fundRatio >= 80 ? '资金充足' :
                       specialAccount.fundRatio >= 50 ? '资金预警' : '资金不足'}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      specialAccount.fundRatio >= 80 ? 'text-green-600' :
                      specialAccount.fundRatio >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {specialAccount.fundRatio >= 80
                        ? '工资专户资金充足，可保障工资发放'
                        : specialAccount.fundRatio >= 50
                        ? '接近警戒线，请督促施工单位及时补充资金'
                        : '已低于警戒线，存在欠薪风险，请及时处置'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">投诉类型分布</h2>
            <span className="text-sm text-gray-500">共 {projectComplaints.length} 起</span>
          </div>
          {projectComplaints.length > 0 ? (
            <ComplaintPieChart data={projectComplaints} height={260} />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <CheckCircle className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">暂无投诉记录</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">工资发放率统计</h2>
          </div>
          <div className="space-y-4">
            {salaryRecords.map((record) => (
              <div key={record.id} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-500 flex-shrink-0">
                  {record.month}
                </div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-2 ${
                      record.paymentRate >= 95 ? 'bg-green-500' :
                      record.paymentRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(record.paymentRate, 100)}%` }}
                  >
                    {record.paymentRate >= 20 && (
                      <span className="text-xs text-white font-medium">
                        {record.paymentRate}%
                      </span>
                    )}
                  </div>
                  {record.paymentRate < 20 && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-medium">
                      {record.paymentRate}%
                    </span>
                  )}
                </div>
                <div className="w-24 text-right text-sm text-gray-600 flex-shrink-0">
                  ¥{formatAmount(record.paidAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
