import { useMemo } from 'react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProvinceData } from '@/types';

interface RankingListProps {
  data: ProvinceData[];
  title?: string;
  topN?: number;
  onItemClick?: (item: ProvinceData) => void;
}

export default function RankingList({ data, title, topN = 10, onItemClick }: RankingListProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.paymentRate - a.paymentRate).slice(0, topN);
  }, [data, topN]);

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
    if (index === 1) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
    if (index === 2) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
    return 'bg-gray-100 text-gray-600';
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 80) return 'bg-blue-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full flex flex-col">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto space-y-3">
        {sortedData.map((item, index) => (
          <div
            key={item.name}
            onClick={() => onItemClick?.(item)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer',
              'hover:bg-blue-50 hover:shadow-sm',
              'group'
            )}
          >
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                getRankStyle(index)
              )}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700 truncate">{item.name}</span>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <span className="text-sm font-bold text-gray-800">{item.paymentRate}%</span>
                  {item.value !== undefined && (
                    <span
                      className={cn(
                        'text-xs flex items-center gap-0.5',
                        item.value < 50 ? 'text-green-500' : 'text-red-500'
                      )}
                    >
                      {item.value < 50 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', getProgressColor(item.paymentRate))}
                  style={{ width: `${item.paymentRate}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
