import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { RiskItem } from '@/types';
import { AlertTriangle } from 'lucide-react';
import Empty from '@/components/Empty';

interface RiskDistributionProps {
  data: RiskItem[];
}

export default function RiskDistribution({ data }: RiskDistributionProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-base font-semibold text-gray-800">欠薪风险分布</h3>
        </div>
        <div className="flex-1 min-h-0">
          <Empty description="暂无风险分布数据" />
        </div>
      </div>
    );
  }

  const highRisk = data.filter(d => d.riskLevel === 'high');
  const mediumRisk = data.filter(d => d.riskLevel === 'medium');
  const lowRisk = data.filter(d => d.riskLevel === 'low');

  const sortedData = [...data].sort((a, b) => b.riskScore - a.riskScore);

  const barOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#1f2937',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const item = params[0];
          const riskItem = sortedData.find(d => d.province === item.name);
          return `
            <div class="font-medium mb-1">${item.name}</div>
            <div>风险评分：${riskItem?.riskScore || 0}</div>
            <div>预警数量：${riskItem?.warningCount || 0}条</div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedData.map(d => d.province),
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          interval: 0,
          rotate: 30,
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          type: 'bar',
          data: sortedData.map(d => ({
            value: d.riskScore,
            itemStyle: {
              color: d.riskLevel === 'high'
                ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#ef4444' },
                    { offset: 1, color: '#dc2626' },
                  ])
                : d.riskLevel === 'medium'
                ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#f59e0b' },
                    { offset: 1, color: '#d97706' },
                  ])
                : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#10b981' },
                    { offset: 1, color: '#059669' },
                  ]),
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barWidth: '50%',
        },
      ],
    };
  }, [sortedData]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-base font-semibold text-gray-800">欠薪风险分布</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-gray-500">高风险</span>
            <span className="text-gray-400">({highRisk.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-gray-500">中风险</span>
            <span className="text-gray-400">({mediumRisk.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-500">低风险</span>
            <span className="text-gray-400">({lowRisk.length})</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ReactECharts
          option={barOption}
          style={{ height: '100%', minHeight: 280 }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-3">高风险省份详情</div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {highRisk.length > 0 ? (
            highRisk.map((item) => (
              <div
                key={item.province}
                className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg border border-red-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-800">{item.province}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    风险分 <span className="font-semibold text-red-600">{item.riskScore}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    预警 <span className="font-semibold text-red-600">{item.warningCount}</span>条
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-gray-400 py-4">暂无高风险省份</div>
          )}
        </div>
      </div>
    </div>
  );
}
