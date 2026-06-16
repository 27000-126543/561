import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, XCircle, ChevronDown, RefreshCw, Settings, Wallet, PiggyBank } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import WarningCard from '@/components/warnings/WarningCard';
import { cn } from '@/lib/utils';
import { provinces } from '@/mock/data';

export default function Warnings() {
  const navigate = useNavigate();
  const { user, warningThreshold, getFilteredWarnings } = useAppStore();
  const warnings = useMemo(() => getFilteredWarnings(), [user, getFilteredWarnings]);
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProvince, setFilterProvince] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const stats = useMemo(() => {
    const primaryCount = warnings.filter((w) => w.level === 'primary').length;
    const secondaryCount = warnings.filter((w) => w.level === 'secondary').length;
    const resolvedCount = warnings.filter((w) => w.status === 'resolved').length;
    const pendingCount = warnings.filter(
      (w) => w.status === 'pending' || w.status === 'processing' || w.status === 'escalated'
    ).length;
    return { primaryCount, secondaryCount, resolvedCount, pendingCount };
  }, [warnings]);

  const filteredWarnings = useMemo(() => {
    return warnings.filter((warning) => {
      if (searchText && !warning.title.includes(searchText) && !warning.projectName.includes(searchText)) {
        return false;
      }
      if (filterLevel !== 'all' && warning.level !== filterLevel) {
        return false;
      }
      if (filterType !== 'all' && warning.type !== filterType) {
        return false;
      }
      if (filterStatus !== 'all' && warning.status !== filterStatus) {
        return false;
      }
      if (filterProvince !== 'all' && warning.province !== filterProvince) {
        return false;
      }
      return true;
    });
  }, [warnings, searchText, filterLevel, filterType, filterStatus, filterProvince]);

  const warningTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'low_payment_rate', label: '工资发放率低' },
    { value: 'insufficient_funds', label: '专户资金不足' },
    { value: 'complaint', label: '投诉激增' },
  ];

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待处理' },
    { value: 'processing', label: '处理中' },
    { value: 'resolved', label: '已解决' },
    { value: 'escalated', label: '已升级' },
  ];

  const levelOptions = [
    { value: 'all', label: '全部等级' },
    { value: 'primary', label: '一级预警' },
    { value: 'secondary', label: '二级预警' },
  ];

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => setIsRecalculating(false), 1000);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', bgColor)}>
        <Icon className={cn('w-6 h-6', color)} />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className={cn('text-2xl font-bold', color)}>{value}</p>
      </div>
    </div>
  );

  const ThresholdCard = ({
    label,
    value,
    unit,
    icon: Icon,
    color,
  }: {
    label: string;
    value: number;
    unit: string;
    icon: React.ElementType;
    color: string;
  }) => (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={cn('w-4 h-4', color)} />
      <span className="text-gray-500">{label}：</span>
      <span className={cn('font-semibold', color)}>{value}{unit}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">预警中心</h1>
          <p className="text-gray-500 mt-1">实时监控在建项目风险预警情况</p>
        </div>
        <button
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors',
            isRecalculating
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          <RefreshCw className={cn('w-4 h-4', isRecalculating && 'animate-spin')} />
          <span>{isRecalculating ? '重新计算中...' : '重新计算预警'}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <ThresholdCard
              label="工资发放率阈值"
              value={warningThreshold.paymentRate}
              unit="%"
              icon={Wallet}
              color="text-blue-600"
            />
            <ThresholdCard
              label="专户资金比阈值"
              value={warningThreshold.fundRatio}
              unit="%"
              icon={PiggyBank}
              color="text-green-600"
            />
            <ThresholdCard
              label="预警升级天数"
              value={warningThreshold.escalateDays}
              unit="天"
              icon={Clock}
              color="text-purple-600"
            />
          </div>
          <button
            onClick={() => navigate('/system?tab=settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>修改设置</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="一级预警"
          value={stats.primaryCount}
          icon={AlertTriangle}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          title="二级预警"
          value={stats.secondaryCount}
          icon={XCircle}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          title="待处理"
          value={stats.pendingCount}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="已处理"
          value={stats.resolvedCount}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-50"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索预警标题或项目名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>筛选</span>
            <ChevronDown
              className={cn('w-4 h-4 transition-transform', showFilters ? 'rotate-180' : '')}
            />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm text-gray-600 mb-1">预警等级</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">预警类型</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {warningTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">状态</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">省份</label>
              <select
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部省份</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            共 <span className="font-medium text-gray-900">{filteredWarnings.length}</span> 条预警
          </p>
        </div>
      </div>

      {filteredWarnings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredWarnings.map((warning) => (
            <WarningCard key={warning.id} warning={warning} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无匹配的预警记录</p>
        </div>
      )}
    </div>
  );
}
