import { AlertTriangle, Clock, MapPin, Building2, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Warning } from '@/types';
import { cn } from '@/lib/utils';

interface WarningCardProps {
  warning: Warning;
}

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

function getRemainingTime(deadline: string): { text: string; isUrgent: boolean } {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return { text: '已超期', isUrgent: true };
  }
  if (days <= 1) {
    return { text: `剩余${days}天`, isUrgent: true };
  }
  return { text: `剩余${days}天`, isUrgent: false };
}

export default function WarningCard({ warning }: WarningCardProps) {
  const navigate = useNavigate();
  const remaining = getRemainingTime(warning.handleDeadline);
  const isSecondary = warning.level === 'secondary';

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div
      onClick={() => navigate(`/warnings/${warning.id}`)}
      className={cn(
        'relative bg-white rounded-lg shadow-sm border p-5 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
        isSecondary
          ? 'border-red-500 border-2 animate-pulse'
          : warning.level === 'primary'
          ? 'border-orange-400 border-l-4'
          : 'border-gray-200'
      )}
    >
      {isSecondary && (
        <div className="absolute -top-2 -right-2">
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            二级预警
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className={cn(
              'w-5 h-5',
              isSecondary ? 'text-red-600' : 'text-orange-500'
            )}
          />
          <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
            {warning.title}
          </h3>
        </div>
        <span
          className={cn(
            'text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap',
            statusColors[warning.status]
          )}
        >
          {statusLabels[warning.status]}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Building2 className="w-4 h-4 text-gray-400" />
        <span className="truncate">{warning.projectName}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">预警等级：</span>
          <span
            className={cn(
              'font-medium',
              isSecondary ? 'text-red-600' : 'text-orange-500'
            )}
          >
            {isSecondary ? '二级' : '一级'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">预警类型：</span>
          <span className="text-gray-700">{warningTypeLabels[warning.type]}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Gauge className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">风险评分：</span>
            <span className={cn('font-semibold text-sm', getRiskScoreColor(warning.riskScore))}>
              {warning.riskScore}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{warning.province}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{warning.createTime}</span>
        </div>
        <span
          className={cn(
            'text-sm font-medium',
            remaining.isUrgent ? 'text-red-600' : 'text-gray-600'
          )}
        >
          {remaining.text}
        </span>
      </div>
    </div>
  );
}
