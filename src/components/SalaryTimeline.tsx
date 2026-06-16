import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import type { SalaryRecord } from '@/types';

interface SalaryTimelineProps {
  data: SalaryRecord[];
}

const statusConfig = {
  paid: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    label: '已发放',
  },
  partial: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    label: '部分发放',
  },
  overdue: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: '逾期未发',
  },
  pending: {
    icon: XCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    label: '待发放',
  },
};

function formatAmount(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}万`;
  }
  return amount.toLocaleString();
}

export default function SalaryTimeline({ data }: SalaryTimelineProps) {
  return (
    <div className="space-y-4">
      {data.map((record, index) => {
        const config = statusConfig[record.status];
        const StatusIcon = config.icon;

        return (
          <div key={record.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                <StatusIcon className={`w-5 h-5 ${config.color}`} />
              </div>
              {index < data.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-2" />
              )}
            </div>

            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-800">{record.month}</h4>
                <span className={`text-sm font-medium ${config.color}`}>
                  {config.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                <div>
                  <span className="text-gray-500">应发工资：</span>
                  <span className="text-gray-800 font-medium">¥{formatAmount(record.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-gray-500">实发工资：</span>
                  <span className="text-gray-800 font-medium">¥{formatAmount(record.paidAmount)}</span>
                </div>
                <div>
                  <span className="text-gray-500">发放率：</span>
                  <span className={`font-medium ${
                    record.paymentRate >= 95 ? 'text-green-600' :
                    record.paymentRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {record.paymentRate}%
                  </span>
                </div>
              </div>

              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    record.paymentRate >= 95 ? 'bg-green-500' :
                    record.paymentRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(record.paymentRate, 100)}%` }}
                />
              </div>

              {record.paymentDate && (
                <p className="text-xs text-gray-400 mt-1">发放日期：{record.paymentDate}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
