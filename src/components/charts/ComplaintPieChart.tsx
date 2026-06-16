import ReactECharts from 'echarts-for-react';
import type { Complaint } from '@/types';

interface ComplaintPieChartProps {
  data: Complaint[];
  height?: number;
}

export default function ComplaintPieChart({ data, height = 300 }: ComplaintPieChartProps) {
  const typeMap = new Map<string, number>();
  data.forEach((complaint) => {
    const count = typeMap.get(complaint.type) || 0;
    typeMap.set(complaint.type, count + 1);
  });

  const pieData = Array.from(typeMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const colors = ['#1e40af', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#1f2937',
        fontSize: 12,
      },
      formatter: '{b}: {c}起 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
      textStyle: {
        color: '#4b5563',
        fontSize: 12,
      },
    },
    series: [
      {
        name: '投诉类型',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1f2937',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        labelLine: {
          show: false,
        },
        data: pieData,
        color: colors,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
