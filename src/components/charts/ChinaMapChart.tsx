import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ProvinceData } from '@/types';

interface ChinaMapChartProps {
  data: ProvinceData[];
  onProvinceClick?: (province: ProvinceData) => void;
}

const provinceCoords: Record<string, [number, number]> = {
  '北京市': [116.46, 39.92],
  '天津市': [117.20, 39.13],
  '河北省': [114.48, 38.03],
  '山西省': [112.53, 37.87],
  '内蒙古自治区': [111.65, 40.82],
  '辽宁省': [123.43, 41.80],
  '吉林省': [125.32, 43.90],
  '黑龙江省': [126.64, 45.75],
  '上海市': [121.47, 31.23],
  '江苏省': [118.78, 32.04],
  '浙江省': [120.19, 30.26],
  '安徽省': [117.28, 31.86],
  '福建省': [119.30, 26.08],
  '江西省': [115.89, 28.68],
  '山东省': [117.00, 36.65],
  '河南省': [113.65, 34.76],
  '湖北省': [114.31, 30.52],
  '湖南省': [112.98, 28.19],
  '广东省': [113.23, 23.16],
  '广西壮族自治区': [108.33, 22.84],
  '海南省': [110.35, 20.02],
  '重庆市': [106.55, 29.56],
  '四川省': [104.06, 30.67],
  '贵州省': [106.71, 26.57],
  '云南省': [102.70, 25.04],
  '西藏自治区': [91.11, 29.97],
  '陕西省': [108.95, 34.27],
  '甘肃省': [103.82, 36.06],
  '青海省': [101.78, 36.62],
  '宁夏回族自治区': [106.27, 38.47],
  '新疆维吾尔自治区': [87.62, 43.82],
};

const chinaOutlinePoints = [
  [73.5, 39.5], [75.0, 37.0], [78.0, 37.0], [80.0, 40.0], [83.0, 47.0],
  [85.0, 48.5], [88.0, 49.0], [90.0, 47.0], [95.0, 45.0], [97.0, 42.5],
  [98.0, 40.0], [100.0, 42.0], [102.0, 42.0], [105.0, 41.5], [108.0, 42.0],
  [110.0, 42.5], [111.0, 44.0], [114.0, 45.0], [117.0, 44.0], [119.0, 44.5],
  [121.0, 44.0], [123.0, 45.5], [126.0, 44.0], [127.0, 42.0], [128.0, 40.0],
  [127.0, 38.0], [126.0, 37.0], [124.0, 35.0], [122.0, 33.0], [122.0, 32.0],
  [122.0, 30.0], [121.0, 28.5], [119.0, 26.5], [117.0, 24.5], [115.0, 23.0],
  [114.0, 22.0], [111.0, 21.5], [109.0, 21.5], [108.0, 21.0], [106.5, 20.0],
  [104.0, 21.5], [102.0, 22.0], [100.0, 21.3], [98.0, 22.0], [96.0, 22.5],
  [95.0, 24.0], [94.0, 25.0], [93.0, 26.0], [91.0, 27.5], [89.0, 28.0],
  [87.0, 28.0], [86.0, 28.0], [85.0, 29.0], [83.0, 30.0], [82.0, 32.0],
  [81.0, 34.0], [80.0, 35.5], [79.0, 36.5], [76.0, 37.5], [74.0, 38.5],
  [73.5, 39.5],
];

export default function ChinaMapChart({ data, onProvinceClick }: ChinaMapChartProps) {
  const option = useMemo(() => {
    const highRiskData: any[] = [];
    const mediumRiskData: any[] = [];
    const lowRiskData: any[] = [];

    data.forEach((item) => {
      const coord = provinceCoords[item.name];
      if (!coord) return;

      const pointData = {
        name: item.name,
        value: [...coord, item.value],
      };

      if (item.value >= 70) {
        highRiskData.push(pointData);
      } else if (item.value >= 40) {
        mediumRiskData.push(pointData);
      } else {
        lowRiskData.push(pointData);
      }
    });

    return {
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#374151',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const provinceName = params.name;
          if (!provinceName) return '';
          const dataItem = data.find((d) => d.name === provinceName);
          if (!dataItem) return '';

          const riskText = { high: '高风险', medium: '中风险', low: '低风险' }[dataItem.riskLevel];
          const riskColor = dataItem.riskLevel === 'high' ? '#ef4444' : dataItem.riskLevel === 'medium' ? '#f97316' : '#22c55e';

          return `
            <div style="padding: 4px 0; min-width: 180px;">
              <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937; font-size: 14px;">${provinceName}</div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="color: #6b7280;">风险评分：</span>
                <span style="font-weight: 600; color: ${riskColor};">${dataItem.value}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="color: #6b7280;">风险等级：</span>
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: ${riskColor}20; color: ${riskColor}; font-size: 12px;">${riskText}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
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
      geo: {
        show: false,
      },
      xAxis: {
        type: 'value',
        min: 70,
        max: 140,
        show: false,
      },
      yAxis: {
        type: 'value',
        min: 15,
        max: 55,
        show: false,
      },
      series: [
        {
          type: 'line',
          data: chinaOutlinePoints,
          coordinateSystem: 'cartesian2d',
          smooth: false,
          showSymbol: false,
          lineStyle: {
            color: '#cbd5e1',
            width: 1.5,
            type: 'solid',
          },
          areaStyle: {
            color: {
              type: 'linear',
            },
          },
          z: 1,
          silent: true,
        },
        {
          name: '高风险',
          type: 'effectScatter',
          coordinateSystem: 'cartesian2d',
          data: highRiskData,
          symbolSize: (val: any) => {
            const riskValue = val[2];
            return 18 + (riskValue - 70) * 0.6;
          },
          rippleEffect: {
            brushType: 'stroke',
            scale: 4,
            period: 4,
          },
          itemStyle: {
            color: '#ef4444',
            shadowBlur: 10,
            shadowColor: 'rgba(239, 68, 68, 0.5)',
          },
          label: {
            show: true,
            formatter: '{b}',
            position: 'right',
            color: '#ef4444',
            fontSize: 11,
            fontWeight: 600,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(239, 68, 68, 0.8)',
            },
          },
          z: 3,
        },
        {
          name: '中风险',
          type: 'scatter',
          coordinateSystem: 'cartesian2d',
          data: mediumRiskData,
          symbolSize: (val: any) => {
            const riskValue = val[2];
            return 10 + (riskValue - 40) * 0.4;
          },
          itemStyle: {
            color: '#f97316',
            shadowBlur: 5,
            shadowColor: 'rgba(249, 115, 22, 0.4)',
          },
          label: {
            show: true,
            formatter: '{b}',
            position: 'right',
            color: '#ea580c',
            fontSize: 10,
            fontWeight: 500,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(249, 115, 22, 0.7)',
            },
          },
          z: 2,
        },
        {
          name: '低风险',
          type: 'scatter',
          coordinateSystem: 'cartesian2d',
          data: lowRiskData,
          symbolSize: (val: any) => {
            const riskValue = val[2];
            return 6 + riskValue * 0.15;
          },
          itemStyle: {
            color: '#22c55e',
            shadowBlur: 3,
            shadowColor: 'rgba(34, 197, 94, 0.4)',
          },
          label: {
            show: true,
            formatter: '{b}',
            position: 'right',
            color: '#16a34a',
            fontSize: 10,
            fontWeight: 500,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 12,
              shadowColor: 'rgba(34, 197, 94, 0.7)',
            },
          },
          z: 2,
        },
      ],
    };
  }, [data]);

  const handleChartClick = (params: any) => {
    if (onProvinceClick && params.name) {
      const province = data.find((d) => d.name === params.name);
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
        opts={{ renderer: 'canvas' }}
        onEvents={{
          click: handleChartClick,
        }}
      />
    </div>
  );
}
