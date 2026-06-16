import { useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  UserX,
  DollarSign,
  CalendarX,
  AlertCircle,
  FileSpreadsheet,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSalaryStore } from '@/store/useSalaryStore';
import type { AnomalyItem } from '@/types';
import * as XLSX from 'xlsx';

const typeConfig = {
  person_mismatch: {
    label: '人员不匹配',
    icon: UserX,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  amount_mismatch: {
    label: '金额不匹配',
    icon: DollarSign,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  attendance_mismatch: {
    label: '考勤不匹配',
    icon: CalendarX,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
};

const filterOptions = [
  { value: 'all', label: '全部异常' },
  { value: 'person_mismatch', label: '人员不匹配' },
  { value: 'amount_mismatch', label: '金额不匹配' },
  { value: 'attendance_mismatch', label: '考勤不匹配' },
];

export default function AnomalyList() {
  const { verifyResult, selectedFilter, setSelectedFilter, expandedItems, toggleExpandItem } =
    useSalaryStore();

  const filteredAnomalies = useMemo(() => {
    if (!verifyResult) return [];
    if (selectedFilter === 'all') return verifyResult.anomalies;
    return verifyResult.anomalies.filter((a) => a.type === selectedFilter);
  }, [verifyResult, selectedFilter]);

  const stats = useMemo(() => {
    if (!verifyResult) return { person: 0, amount: 0, attendance: 0 };
    return {
      person: verifyResult.anomalies.filter((a) => a.type === 'person_mismatch').length,
      amount: verifyResult.anomalies.filter((a) => a.type === 'amount_mismatch').length,
      attendance: verifyResult.anomalies.filter((a) => a.type === 'attendance_mismatch').length,
    };
  }, [verifyResult]);

  const handleExport = () => {
    if (!verifyResult) return;

    const exportData = filteredAnomalies.map((item) => ({
      异常类型: typeConfig[item.type].label,
      姓名: item.name,
      身份证号: item.idCard || '',
      期望值: String(item.expected),
      实际值: String(item.actual),
      异常描述: item.description,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '异常明细');
    XLSX.writeFile(wb, '工资校验异常报告.xlsx');
  };

  if (!verifyResult || verifyResult.anomalies.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">异常明细</h3>
            <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              共 {filteredAnomalies.length} 条
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) =>
                  setSelectedFilter(
                    e.target.value as 'all' | 'person_mismatch' | 'amount_mismatch' | 'attendance_mismatch'
                  )
                }
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              导出报告
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <button
            onClick={() => setSelectedFilter('person_mismatch')}
            className={cn(
              'p-3 rounded-lg border-2 transition-all text-left',
              selectedFilter === 'person_mismatch'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', typeConfig.person_mismatch.bg)}>
                <UserX className={cn('w-4 h-4', typeConfig.person_mismatch.color)} />
              </div>
              <div>
                <p className="text-xs text-gray-500">人员不匹配</p>
                <p className={cn('text-lg font-bold', typeConfig.person_mismatch.color)}>{stats.person}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedFilter('amount_mismatch')}
            className={cn(
              'p-3 rounded-lg border-2 transition-all text-left',
              selectedFilter === 'amount_mismatch'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', typeConfig.amount_mismatch.bg)}>
                <DollarSign className={cn('w-4 h-4', typeConfig.amount_mismatch.color)} />
              </div>
              <div>
                <p className="text-xs text-gray-500">金额不匹配</p>
                <p className={cn('text-lg font-bold', typeConfig.amount_mismatch.color)}>{stats.amount}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedFilter('attendance_mismatch')}
            className={cn(
              'p-3 rounded-lg border-2 transition-all text-left',
              selectedFilter === 'attendance_mismatch'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', typeConfig.attendance_mismatch.bg)}>
                <CalendarX className={cn('w-4 h-4', typeConfig.attendance_mismatch.color)} />
              </div>
              <div>
                <p className="text-xs text-gray-500">考勤不匹配</p>
                <p className={cn('text-lg font-bold', typeConfig.attendance_mismatch.color)}>{stats.attendance}</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                类型
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                姓名
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                身份证号
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                期望值
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                实际值
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                详情
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAnomalies.map((item, index) => {
              const config = typeConfig[item.type];
              const TypeIcon = config.icon;
              const isExpanded = expandedItems.includes(String(index));

              return (
                <AnomalyRow
                  key={index}
                  item={item}
                  index={index}
                  config={config}
                  TypeIcon={TypeIcon}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpandItem(index)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAnomalies.length === 0 && (
        <div className="py-12 text-center">
          <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无异常数据</p>
        </div>
      )}
    </div>
  );
}

interface AnomalyRowProps {
  item: AnomalyItem;
  index: number;
  config: (typeof typeConfig)[keyof typeof typeConfig];
  TypeIcon: React.ElementType;
  isExpanded: boolean;
  onToggle: () => void;
}

function AnomalyRow({ item, config, TypeIcon, isExpanded, onToggle }: AnomalyRowProps) {
  return (
    <>
      <tr
        className="hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
              config.bg,
              config.color
            )}
          >
            <TypeIcon className="w-3 h-3" />
            {config.label}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
          {item.idCard || '-'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{item.expected}</td>
        <td className="px-4 py-3 text-sm text-red-600 font-medium">{item.actual}</td>
        <td className="px-4 py-3">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-4 py-4">
            <div className="animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">异常说明</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
