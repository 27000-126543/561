import { useMemo, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { ProvinceData } from '@/types';

interface ChinaMapChartProps {
  data: ProvinceData[];
  onProvinceClick?: (province: ProvinceData) => void;
}

const provinceCenters: Record<string, [number, number]> = {
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

const chinaGeoJSON = {
  type: 'FeatureCollection',
  features: Object.entries(provinceCenters).map(([name, center]) => {
    const [lng, lat] = center;
    const offset = 2.5;
    return {
      type: 'Feature',
      properties: { name },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lng - offset, lat - offset],
          [lng + offset, lat - offset],
          [lng + offset, lat + offset],
          [lng - offset, lat + offset],
          [lng - offset, lat - offset],
        ]],
      },
    };
  }),
};

export default function ChinaMapChart({ data, onProvinceClick }: ChinaMapChartProps) {
  const [mapRegistered, setMapRegistered] = useState(false);

  useEffect(() => {
    try {
      echarts.registerMap('china', chinaGeoJSON as any);
      setMapRegistered(true);
    } catch (e) {
      console.warn('Map registration failed:', e);
      setMapRegistered(true);
    }
  }, []);

  const option = useMemo(() => {
    if (!mapRegistered) {
      return {
        title: { text: '地图加载中...', left: 'center', top: 'center' },
        series: [],
      };
    }

    const mapData = data.map((item) => ({
      name: item.name,
      value: item.value,
      riskLevel: item.riskLevel,
      projectCount: item.projectCount,
      paymentRate: item.paymentRate,
    }));

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
          if (!dataItem) return `${provinceName}: 暂无数据`;

          const riskText = { high: '高风险', medium: '中风险', low: '低风险' }[dataItem.riskLevel];
          const riskColor = dataItem.riskLevel === 'high' ? '#ef4444' : dataItem.riskLevel === 'medium' ? '#f97316' : '#22c55e';

          return `
            <div style="padding: 4px 0; min-width: 200px;">
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
      visualMap: {
        type: 'piecewise',
        pieces: [
          { min: 70, max: 100, color: '#ef4444', label: '高风险 (≥70)' },
          { min: 40, max: 69, color: '#f97316', label: '中风险 (40-69)' },
          { min: 0, max: 39, color: '#22c55e', label: '低风险 (<40)' },
        ],
        left: 20,
        bottom: 20,
        itemWidth: 20,
        itemHeight: 14,
        textStyle: {
          color: '#6b7280',
          fontSize: 11,
        },
      },
      geo: {
        map: 'china',
        roam: false,
        zoom: 1.2,
        center: [104, 36],
        label: {
          show: true,
          color: '#1e3a5f',
          fontSize: 10,
          fontWeight: 500,
        },
        itemStyle: {
          areaColor: '#f3f4f6',
          borderColor: '#cbd5e1',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
          },
          itemStyle: {
            areaColor: '#1e40af',
            borderColor: '#1e3a5f',
            borderWidth: 2,
            shadowBlur: 15,
            shadowColor: 'rgba(30, 58, 95, 0.4)',
          },
        },
      },
      series: [
        {
          name: '欠薪风险',
          type: 'map',
          map: 'china',
          roam: false,
          zoom: 1.2,
          center: [104, 36],
          data: mapData,
          label: {
            show: true,
            color: '#1e3a5f',
            fontSize: 10,
            fontWeight: 500,
          },
          itemStyle: {
            borderColor: '#cbd5e1',
            borderWidth: 1,
          },
          emphasis: {
            label: {
              show: true,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
            },
            itemStyle: {
              borderColor: '#1e3a5f',
              borderWidth: 2,
              shadowBlur: 15,
              shadowColor: 'rgba(30, 58, 95, 0.4)',
            },
          },
        },
        {
          name: '风险标记',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 2,
          rippleEffect: {
            brushType: 'stroke',
            scale: 3,
            period: 4,
          },
          symbolSize: (val: any) => {
            const riskValue = val[2];
            if (riskValue >= 70) return 14;
            if (riskValue >= 40) return 10;
            return 6;
          },
          itemStyle: {
            color: '#fff',
            shadowBlur: 8,
            shadowColor: 'rgba(255, 255, 255, 0.6)',
          },
          data: data
            .filter((d) => d.value >= 40)
            .map((d) => ({
              name: d.name,
              value: [...(provinceCenters[d.name] || [0, 0]), d.value],
            })),
        },
      ],
    };
  }, [data, mapRegistered]);

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
