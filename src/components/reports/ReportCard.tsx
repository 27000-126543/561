import { FileText, Calendar, Clock, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { WeeklyReport } from '@/types';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  report: WeeklyReport;
  onClick?: () => void;
}

export default function ReportCard({ report, onClick }: ReportCardProps) {
  const isPaymentRateUp = report.summary.paymentRateMoM >= 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer',
        'hover:shadow-lg hover:border-blue-200 transition-all duration-300',
        'transform hover:-translate-y-1'
      )}
    >
      <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-400" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800 line-clamp-1">{report.title}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{report.weekStart} ~ {report.weekEnd}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">项目总数</div>
            <div className="text-lg font-bold text-blue-600">
              {report.summary.totalProjects.toLocaleString()}
              <span className="text-xs font-normal text-blue-400 ml-1">个</span>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">平均发放率</div>
            <div className="text-lg font-bold text-green-600">
              {report.summary.avgPaymentRate}%
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">预警总数</div>
            <div className="text-lg font-bold text-orange-600">
              {report.summary.totalWarnings}
              <span className="text-xs font-normal text-orange-400 ml-1">条</span>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">投诉总数</div>
            <div className="text-lg font-bold text-red-600">
              {report.summary.totalComplaints}
              <span className="text-xs font-normal text-red-400 ml-1">起</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>生成时间：{report.generateTime.split(' ')[0]}</span>
          </div>
          <div className={cn(
            'flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full',
            isPaymentRateUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          )}>
            {isPaymentRateUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>环比 {isPaymentRateUp ? '+' : ''}{report.summary.paymentRateMoM}%</span>
          </div>
        </div>

        {report.riskDistribution.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-gray-700">高风险省份</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {report.riskDistribution
                .filter(r => r.riskLevel === 'high')
                .slice(0, 3)
                .map(r => (
                  <span
                    key={r.province}
                    className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded border border-red-100"
                  >
                    {r.province}
                  </span>
                ))}
              {report.riskDistribution.filter(r => r.riskLevel === 'high').length > 3 && (
                <span className="text-xs px-2 py-0.5 text-gray-400">
                  +{report.riskDistribution.filter(r => r.riskLevel === 'high').length - 3}个
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
