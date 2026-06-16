import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ProvinceData } from '@/types';

interface HeatMapChartProps {
  data: ProvinceData[];
  onProvinceClick?: (province: ProvinceData) => void;
  title?: string;
}

export default function HeatMapChart({ data, onProvinceClick, title }: HeatMapChartProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value).slice(0, 15);
  }, [data]);

  const option = useMemo(() => {
    const riskColors = {
      high: '#ef4444',
      medium: '#f97316',
      low: '#22c55e',
    };

    return {
      title: title
        ? {
            text: title,
            left: 'left',
            top: 0,
            textStyle: {
              fontSize: 16,
              fontWeight: 600,
              color: '#1f2937',
            },
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#374151',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const item = params[0];
          const dataItem = sortedData.find((d) => d.name === item.name);
          if (!dataItem) return '';
          const riskText = { high: '高风险', medium: '中风险', low: '低风险' }[dataItem.riskLevel];
          const riskColor = riskColors[dataItem.riskLevel];
          return `
            <div style="padding: 4px 0;">
              <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">${dataItem.name}</div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="color: #6b7280;">风险评分：</span>
                <span style="font-weight: 600; color: ${riskColor};">${dataItem.value}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="color: #6b7280;">风险等级：</span>
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: ${riskColor}20; color: ${riskColor}; font-size: 12px;">${riskText}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="color: #6b7280;">在建项目：</span>
                <span style="font-weight: 500;">${dataItem.projectCount} 个</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #6b7280;">工资发放率：</span>
                <span style="font-weight: 500;">${dataItem.paymentRate}%</span>
              </div>
            </div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: title ? 40 : 10,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 11,
          formatter: '{value}',
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: sortedData.map((item) => item.name).reverse(),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#4b5563',
          fontSize: 12,
          fontWeight: 500,
        },
      },
      series: [
        {
          type: 'bar',
          data: sortedData
            .map((item) => ({
              value: item.value,
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 0,
                      color:
                        item.riskLevel === 'high'
                          ? '#fca5a5'
                          : item.riskLevel === 'medium'
                          ? '#fdba74'
                          : '#86efac',
                    },
                    {
                      offset: 1,
                      color:
                        item.riskLevel === 'high'
                          ? '#ef4444'
                          : item.riskLevel === 'medium'
                          ? '#f97316'
                          : '#22c55e',
                    },
                  ],
                },
                borderRadius: [0, 4, 4, 0],
              },
            }))
            .reverse(),
          barWidth: 16,
          label: {
            show: true,
            position: 'right',
            color: '#6b7280',
            fontSize: 11,
            formatter: '{c}',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
        },
      ],
      animationDuration: 1000,
      animationEasing: 'cubicOut',
    };
  }, [sortedData, title]);

  const handleChartClick = (params: any) => {
    if (onProvinceClick && params.name) {
      const province = sortedData.find((d) => d.name === params.name);
      if (province) {
        onProvinceClick(province);
      }
    }
  };

  return (
    <div className="w-full h-full">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
        onEvents={{
          click: handleChartClick,
        }}
      />
    </div>
  );
}
