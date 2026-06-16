import { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSalaryStore } from '@/store/useSalaryStore';
import type { SalaryVerifyResult } from '@/types';

function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  delay = 0,
}: {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'orange' | 'red';
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible || typeof value !== 'number') return;

    const duration = 800;
    const start = 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (value - start) * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value]);

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
  };

  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 border border-gray-100 shadow-sm',
        'transition-all duration-500',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className={cn('text-2xl font-bold', colors.text)}>
              {typeof value === 'number' ? displayValue.toLocaleString() : value}
            </span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md',
            colors.icon
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function VerifyResult() {
  const { verifyResult, uploadStatus } = useSalaryStore();

  if (!verifyResult || uploadStatus !== 'success') return null;

  const statusConfig = {
    passed: {
      icon: CheckCircle,
      text: '校验通过',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      description: '所有数据校验通过，无异常项',
    },
    warning: {
      icon: AlertTriangle,
      text: '存在警告',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      description: '部分数据存在异常，请查看异常明细',
    },
    error: {
      icon: XCircle,
      text: '校验失败',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      description: '存在严重数据异常，请核查后重新上传',
    },
  };

  const status = statusConfig[verifyResult.status];
  const StatusIcon = status.icon;

  const personMatchRate = verifyResult.totalWorkers > 0
    ? ((verifyResult.matchedWorkers / verifyResult.totalWorkers) * 100).toFixed(1)
    : '0';

  const amountMatchRate = verifyResult.totalAmount > 0
    ? ((verifyResult.matchedAmount / verifyResult.totalAmount) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'bg-white rounded-xl border p-6 shadow-sm animate-fade-in',
          status.border
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn('w-16 h-16 rounded-full flex items-center justify-center', status.bg)}>
            <StatusIcon className={cn('w-8 h-8', status.color)} />
          </div>
          <div className="flex-1">
            <h3 className={cn('text-xl font-bold', status.color)}>{status.text}</h3>
            <p className="text-gray-600 mt-1">{status.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">校验完成</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="工资表人数"
          value={verifyResult.totalWorkers}
          unit="人"
          icon={Users}
          color="blue"
          delay={100}
        />
        <StatCard
          title="系统在职人数"
          value={verifyResult.systemActiveWorkers ?? '-'}
          unit="人"
          icon={Users}
          color="blue"
          delay={150}
        />
        <StatCard
          title="匹配人数"
          value={verifyResult.matchedWorkers}
          unit="人"
          icon={CheckCircle}
          color="green"
          delay={200}
        />
        <StatCard
          title="姓名不一致"
          value={verifyResult.nameMismatchCount ?? 0}
          unit="人"
          icon={AlertTriangle}
          color={(verifyResult.nameMismatchCount ?? 0) > 0 ? 'orange' : 'green'}
          delay={250}
        />
        <StatCard
          title="多出人员"
          value={verifyResult.extraPersonCount ?? 0}
          unit="人"
          icon={XCircle}
          color={(verifyResult.extraPersonCount ?? 0) > 0 ? 'red' : 'green'}
          delay={300}
        />
        <StatCard
          title="漏发人员"
          value={verifyResult.missingPersonCount ?? 0}
          unit="人"
          icon={XCircle}
          color={(verifyResult.missingPersonCount ?? 0) > 0 ? 'red' : 'green'}
          delay={350}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="总金额"
          value={verifyResult.totalAmount}
          unit="元"
          icon={DollarSign}
          color="blue"
          delay={400}
        />
        <StatCard
          title="匹配金额"
          value={verifyResult.matchedAmount}
          unit="元"
          icon={TrendingUp}
          color="green"
          delay={500}
        />
        <StatCard
          title="不匹配金额"
          value={verifyResult.unmatchedAmount}
          unit="元"
          icon={TrendingDown}
          color={verifyResult.unmatchedAmount > 0 ? 'red' : 'green'}
          delay={600}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">人员匹配率</span>
            <span className="text-sm font-bold text-blue-600">{personMatchRate}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${personMatchRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">金额匹配率</span>
            <span className="text-sm font-bold text-green-600">{amountMatchRate}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${amountMatchRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
