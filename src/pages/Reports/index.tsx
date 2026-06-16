import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileBarChart, Calendar, TrendingUp, TrendingDown, Filter, ChevronDown, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import StatCard from '@/components/cards/StatCard';
import ReportCard from '@/components/reports/ReportCard';
import Empty from '@/components/Empty';

const timeRanges = [
  { value: 'all', label: '全部时间' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
];

export default function Reports() {
  const navigate = useNavigate();
  const { user, getFilteredWeeklyReports } = useAppStore();
  const weeklyReports = useMemo(() => getFilteredWeeklyReports(), [user, getFilteredWeeklyReports]);
  const [timeRange, setTimeRange] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const stats = useMemo(() => {
    const thisWeekReport = weeklyReports[0];
    const totalReports = weeklyReports.length;
    const riskTrend = thisWeekReport ? thisWeekReport.summary.paymentRateMoM : 0;

    return {
      thisWeek: thisWeekReport ? 1 : 0,
      total: totalReports,
      riskTrend,
    };
  }, [weeklyReports]);

  const filteredReports = useMemo(() => {
    let result = [...weeklyReports];

    if (searchKeyword) {
      result = result.filter(r =>
        r.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (timeRange !== 'all') {
      const now = new Date();
      result = result.filter(r => {
        const reportDate = new Date(r.weekStart);
        switch (timeRange) {
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return reportDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            return reportDate >= monthAgo;
          case 'quarter':
            const quarterAgo = new Date(now);
            quarterAgo.setMonth(now.getMonth() - 3);
            return reportDate >= quarterAgo;
          default:
            return true;
        }
      });
    }

    return result;
  }, [weeklyReports, timeRange, searchKeyword]);

  const handleCardClick = (reportId: string) => {
    navigate(`/reports/${reportId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">周报中心</h1>
          <p className="text-sm text-gray-500 mt-1">查看和管理全国欠薪风险诊断周报</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="本周报告"
          value={stats.thisWeek}
          unit="份"
          icon={<FileBarChart className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="报告总数"
          value={stats.total}
          unit="份"
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="风险趋势"
          value={`${Math.abs(stats.riskTrend)}%`}
          trend={stats.riskTrend}
          trendLabel="环比"
          icon={stats.riskTrend >= 0 ? (
            <TrendingUp className="w-6 h-6" />
          ) : (
            <TrendingDown className="w-6 h-6" />
          )}
          color={stats.riskTrend >= 0 ? 'green' : 'orange'}
        />
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h3 className="text-base font-semibold text-gray-800">周报列表</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索报告..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {timeRanges.find(r => r.value === timeRange)?.label}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => handleCardClick(report.id)}
              />
            ))}
          </div>
        ) : (
          <Empty description="暂无符合条件的周报" />
        )}
      </div>
    </div>
  );
}
