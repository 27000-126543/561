import ReactECharts from 'echarts-for-react';
import type { AttendanceRecord } from '@/types';

interface AttendanceChartProps {
  data: AttendanceRecord[];
  height?: number;
}

export default function AttendanceChart({ data, height = 300 }: AttendanceChartProps) {
  const dates = data.map((item) => {
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const attendanceRates = data.map((item) => item.attendanceRate);
  const presentWorkers = data.map((item) => item.presentWorkers);

  const option = {
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
        const date = params[0].axisValue;
        const rate = params[0].value;
        const workers = params[1]?.value || 0;
        return `
          <div class="font-medium mb-1">${date}</div>
          <div class="text-sm">出勤率: <span class="font-semibold text-blue-600">${rate}%</span></div>
          <div class="text-sm">出勤人数: <span class="font-semibold">${workers}人</span></div>
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
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '出勤率(%)',
        min: 0,
        max: 100,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
            type: 'dashed',
          },
        },
      },
      {
        type: 'value',
        name: '出勤人数',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 12,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: '出勤率',
        type: 'line',
        smooth: true,
        data: attendanceRates,
        lineStyle: {
          color: '#1e40af',
          width: 2,
        },
        itemStyle: {
          color: '#1e40af',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(30, 64, 175, 0.25)' },
              { offset: 1, color: 'rgba(30, 64, 175, 0.02)' },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 6,
        yAxisIndex: 0,
      },
      {
        name: '出勤人数',
        type: 'line',
        smooth: true,
        data: presentWorkers,
        lineStyle: {
          color: '#10b981',
          width: 2,
          type: 'dashed',
        },
        itemStyle: {
          color: '#10b981',
        },
        symbol: 'circle',
        symbolSize: 5,
        yAxisIndex: 1,
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
