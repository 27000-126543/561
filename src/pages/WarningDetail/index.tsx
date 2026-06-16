import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Building2,
  MapPin,
  Calendar,
  Clock,
  User,
  Gauge,
  FileText,
  ChevronRight,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import ApprovalFlow from '@/components/warnings/ApprovalFlow';
import HandleTimeline from '@/components/warnings/HandleTimeline';
import { cn } from '@/lib/utils';

const warningTypeLabels: Record<string, string> = {
  low_payment_rate: '工资发放率低',
  insufficient_funds: '专户资金不足',
  complaint: '投诉激增',
};

const statusLabels: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  escalated: '已升级',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  escalated: 'bg-red-100 text-red-800',
};

export default function WarningDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { warnings, projects, approveWarningStep, rejectWarningStep, warningThreshold } = useAppStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const warning = warnings.find((w) => w.id === id);
  const project = projects.find((p) => p.id === warning?.projectId);

  const getEscalationInfo = () => {
    if (!warning || warning.level === 'secondary' || warning.status === 'resolved') {
      return null;
    }
    const createTime = new Date(warning.createTime.replace(' ', 'T'));
    const escalateTime = new Date(createTime.getTime() + warningThreshold.escalateDays * 24 * 60 * 60 * 1000);
    const diffMs = escalateTime.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isUrgent = diffHours <= 24 && diffMs > 0;
    const isOverdue = diffMs <= 0;
    return { escalateTime, diffHours, diffDays, isUrgent, isOverdue };
  };

  const escalationInfo = getEscalationInfo();

  const relatedWarnings = warnings
    .filter((w) => w.id !== id && w.projectId === warning?.projectId)
    .slice(0, 3);

  if (!warning) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">预警不存在</p>
        <button
          onClick={() => navigate('/warnings')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          返回预警列表
        </button>
      </div>
    );
  }

  const isSecondary = warning.level === 'secondary';

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskScoreBg = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleApprove = (stepId: string, comment: string) => {
    if (warning.id) {
      approveWarningStep(warning.id, stepId, comment);
    }
  };

  const handleReject = (stepId: string, comment: string) => {
    if (warning.id && rejectWarningStep) {
      rejectWarningStep(warning.id, stepId, comment);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/warnings')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">预警详情</h1>
          <p className="text-sm text-gray-500">预警编号：{warning.id}</p>
        </div>
      </div>

      <div
        className={cn(
          'bg-white rounded-lg border p-6',
          isSecondary
            ? 'border-red-500 border-2'
            : 'border-orange-400 border-l-4 border-gray-200'
        )}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                isSecondary ? 'bg-red-100' : 'bg-orange-100'
              )}
            >
              <AlertTriangle
                className={cn('w-6 h-6', isSecondary ? 'text-red-600' : 'text-orange-600')}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{warning.title}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    isSecondary ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  )}
                >
                  {isSecondary ? '二级预警' : '一级预警'}
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium',
                    statusColors[warning.status]
                  )}
                >
                  {statusLabels[warning.status]}
                </span>
                <span className="text-xs text-gray-500">{warningTypeLabels[warning.type]}</span>
                {!isSecondary && escalationInfo && !escalationInfo.isOverdue && (
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1',
                    escalationInfo.isUrgent
                      ? 'bg-red-100 text-red-700 animate-pulse'
                      : 'bg-yellow-100 text-yellow-700'
                  )}>
                    {escalationInfo.isUrgent && <Zap className="w-3 h-3" />}
                    {escalationInfo.isUrgent
                      ? `即将升级（约${escalationInfo.diffHours}小时）`
                      : `${escalationInfo.diffDays}天后升级`
                    }
                  </span>
                )}
                {!isSecondary && escalationInfo && escalationInfo.isOverdue && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    已达升级时间
                  </span>
                )}
              </div>
              {!isSecondary && escalationInfo && escalationInfo.isUrgent && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-pulse">
                  <Zap className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">即将升级为二级预警，请尽快处理！</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">风险评分</p>
            <p className={cn('text-3xl font-bold', getRiskScoreColor(warning.riskScore))}>
              {warning.riskScore}
            </p>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 ml-auto overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', getRiskScoreBg(warning.riskScore))}
                style={{ width: `${warning.riskScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">项目：</span>
            <span className="text-gray-900 truncate">{warning.projectName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">地区：</span>
            <span className="text-gray-900">
              {warning.province} {warning.city}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">创建时间：</span>
            <span className="text-gray-900">{warning.createTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">处理截止：</span>
            <span className="text-gray-900">{warning.handleDeadline}</span>
          </div>
        </div>

        {warning.handler && (
          <div className="flex items-center gap-2 text-sm mt-4 pt-4 border-t border-gray-100">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">处理人：</span>
            <span className="text-gray-900">{warning.handler}</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">预警描述</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{warning.description}</p>
        </div>

        {warning.evidence && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">预警判断依据</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {warning.evidence.paymentRate !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">工资发放率</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-semibold',
                      warning.evidence.paymentRate < (warning.evidence.paymentRateThreshold || 80)
                        ? 'text-red-600'
                        : 'text-green-600'
                    )}>
                      {warning.evidence.paymentRate}%
                    </span>
                    <span className="text-xs text-gray-400">
                      (阈值: {warning.evidence.paymentRateThreshold}%)
                    </span>
                    {warning.evidence.paymentRate < (warning.evidence.paymentRateThreshold || 80) && (
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">低于阈值</span>
                    )}
                  </div>
                </div>
              )}

              {warning.evidence.fundRatio !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">专户资金比</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-semibold',
                      warning.evidence.fundRatio < (warning.evidence.fundRatioThreshold || 50)
                        ? 'text-red-600'
                        : 'text-green-600'
                    )}>
                      {warning.evidence.fundRatio}%
                    </span>
                    <span className="text-xs text-gray-400">
                      (阈值: {warning.evidence.fundRatioThreshold}%)
                    </span>
                    {warning.evidence.fundRatio < (warning.evidence.fundRatioThreshold || 50) && (
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">低于阈值</span>
                    )}
                  </div>
                </div>
              )}

              {warning.evidence.isConsecutive !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">连续低于阈值</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-semibold',
                      warning.evidence.isConsecutive ? 'text-red-600' : 'text-yellow-600'
                    )}>
                      {warning.evidence.isConsecutive ? `已连续 ${warning.evidence.consecutiveMonths} 个月` : '本月首次'}
                    </span>
                    {warning.evidence.isConsecutive && (
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">触发升级</span>
                    )}
                  </div>
                </div>
              )}

              {warning.evidence.daysSinceCreated !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">预警生成天数</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-semibold',
                      warning.evidence.isEscalated ? 'text-red-600' : 'text-gray-800'
                    )}>
                      {warning.evidence.daysSinceCreated} 天
                    </span>
                    <span className="text-xs text-gray-400">
                      (升级阈值: {warning.evidence.escalateDays} 天)
                    </span>
                    {warning.evidence.isEscalated && warning.evidence.daysSinceCreated > (warning.evidence.escalateDays || 5) && (
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">超时未处理</span>
                    )}
                  </div>
                </div>
              )}

              {warning.evidence.isEscalated !== undefined && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">预警等级</span>
                  <span className={cn(
                    'text-sm font-semibold px-2 py-0.5 rounded',
                    warning.evidence.isEscalated
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  )}>
                    {warning.evidence.isEscalated ? '二级预警（已升级）' : '一级预警'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {project && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">项目信息摘要</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">施工单位</p>
              <p className="text-base font-medium text-gray-900 truncate">
                {project.constructionUnit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">工人总数</p>
              <p className="text-base font-medium text-gray-900">{project.totalWorkers} 人</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">工资发放率</p>
              <p
                className={cn(
                  'text-base font-medium',
                  project.paymentRate >= 90
                    ? 'text-green-600'
                    : project.paymentRate >= 80
                    ? 'text-yellow-600'
                    : 'text-red-600'
                )}
              >
                {project.paymentRate}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">资金比</p>
              <p
                className={cn(
                  'text-base font-medium',
                  project.fundRatio >= 80
                    ? 'text-green-600'
                    : project.fundRatio >= 50
                    ? 'text-yellow-600'
                    : 'text-red-600'
                )}
              >
                {project.fundRatio}%
              </p>
            </div>
          </div>
        </div>
      )}

      {isSecondary && warning.approvalFlow && warning.approvalFlow.length > 0 && (
        <ApprovalFlow
          steps={warning.approvalFlow}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {!isSecondary && warning.status !== 'resolved' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">处理状态</h3>
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">待处理</p>
              <p className="text-sm text-yellow-600 mt-0.5">
                请相关负责人及时跟进处理此预警事项
                {escalationInfo && !escalationInfo.isOverdue && (
                  <span className="ml-1">
                    （剩余 {escalationInfo.diffDays > 0 ? `${escalationInfo.diffDays} 天` : `${escalationInfo.diffHours} 小时`} 自动升级为二级预警）
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HandleTimeline warning={warning} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">相关预警推荐</h3>
            {relatedWarnings.length > 0 ? (
              <div className="space-y-3">
                {relatedWarnings.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => navigate(`/warnings/${w.id}`)}
                    className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{w.title}</p>
                      <AlertTriangle
                        className={cn(
                          'w-4 h-4 flex-shrink-0',
                          w.level === 'secondary' ? 'text-red-500' : 'text-orange-500'
                        )}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{warningTypeLabels[w.type]}</span>
                      <span>{w.createTime.slice(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">暂无相关预警</p>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  查看项目详情
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  查看风险分析
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  联系处理人
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
