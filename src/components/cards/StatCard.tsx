import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    text: 'text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-500',
    text: 'text-green-600',
    border: 'border-green-100',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-500',
    text: 'text-orange-600',
    border: 'border-orange-100',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-500',
    text: 'text-red-600',
    border: 'border-red-100',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-500',
    text: 'text-purple-600',
    border: 'border-purple-100',
  },
};

export default function StatCard({
  title,
  value,
  unit,
  trend,
  trendLabel = '环比',
  icon,
  color = 'blue',
}: StatCardProps) {
  const colors = colorMap[color];
  const isPositive = trend !== undefined && trend >= 0;
  const isNeutral = trend === undefined;

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 border border-gray-100',
        'hover:shadow-lg hover:border-gray-200 transition-all duration-300',
        'transform hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-800">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {!isNeutral && (
            <div className="flex items-center gap-1 mt-3">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-medium',
                  isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(trend!)}%
              </span>
              <span className="text-xs text-gray-400">{trendLabel}</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-white',
              colors.icon,
              'shadow-md'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
