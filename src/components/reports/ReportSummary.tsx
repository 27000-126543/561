import { Building2, Wallet, AlertTriangle, MessageSquare, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportSummaryProps {
  summary: {
    totalProjects: number;
    avgPaymentRate: number;
    totalWarnings: number;
    totalComplaints: number;
    paymentRateYoY: number;
    paymentRateMoM: number;
    totalOwedAmount: number;
  };
}

export default function ReportSummary({ summary }: ReportSummaryProps) {
  const isYoYUp = summary.paymentRateYoY >= 0;
  const isMoMUp = summary.paymentRateMoM >= 0;

  const stats = [
    {
      title: '项目总数',
      value: summary.totalProjects.toLocaleString(),
      unit: '个',
      icon: Building2,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-700',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      title: '平均工资发放率',
      value: `${summary.avgPaymentRate}%`,
      icon: Wallet,
      color: 'green',
      gradient: 'from-green-500 to-green-700',
      bg: 'bg-green-50',
      text: 'text-green-600',
      trend: summary.paymentRateMoM,
      trendLabel: '环比',
    },
    {
      title: '预警总数',
      value: summary.totalWarnings,
      unit: '条',
      icon: AlertTriangle,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-700',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
    },
    {
      title: '投诉总数',
      value: summary.totalComplaints,
      unit: '起',
      icon: MessageSquare,
      color: 'red',
      gradient: 'from-red-500 to-red-700',
      bg: 'bg-red-50',
      text: 'text-red-600',
    },
    {
      title: '欠薪金额',
      value: (summary.totalOwedAmount / 10000).toFixed(2),
      unit: '亿元',
      icon: DollarSign,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-700',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={cn(
                'rounded-xl p-4 border border-gray-100',
                'bg-white hover:shadow-md transition-all duration-300'
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-md',
                    stat.gradient
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-1">{stat.title}</div>
              <div className="flex items-baseline gap-1">
                <span className={cn('text-xl font-bold', stat.text)}>{stat.value}</span>
                {stat.unit && <span className="text-xs text-gray-400">{stat.unit}</span>}
              </div>
              {stat.trend !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-xs font-medium',
                      stat.trend >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    {stat.trend >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                  </span>
                  <span className="text-xs text-gray-400">{stat.trendLabel}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-800">同比变化</h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              'text-3xl font-bold',
              isYoYUp ? 'text-green-600' : 'text-red-600'
            )}>
              {isYoYUp ? '+' : ''}{summary.paymentRateYoY}%
            </span>
            <span className="text-sm text-blue-600">较去年同期</span>
          </div>
          <p className="text-xs text-blue-600/70 mt-2">
            工资发放率{isYoYUp ? '上升' : '下降'}，整体趋势{isYoYUp ? '向好' : '需关注'}
          </p>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-semibold text-amber-800">环比变化</h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              'text-3xl font-bold',
              isMoMUp ? 'text-green-600' : 'text-red-600'
            )}>
              {isMoMUp ? '+' : ''}{summary.paymentRateMoM}%
            </span>
            <span className="text-sm text-amber-600">较上周</span>
          </div>
          <p className="text-xs text-amber-600/70 mt-2">
            工资发放率{isMoMUp ? '上升' : '下降'}，需持续关注后续走势
          </p>
        </div>
      </div>
    </div>
  );
}
