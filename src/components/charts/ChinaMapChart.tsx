import { useMemo, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import type { ProvinceData } from '@/types';
import chinaGeoJSON from '@/data/chinaMap.json';

interface ChinaMapChartProps {
  data: ProvinceData[];
  onProvinceClick?: (province: ProvinceData) => void;
}

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
        title: { text: '地图加载中...', left: 'center', top: 'center', textStyle: { color: '#6b7280' } },
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
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: [12, 16],
        textStyle: { color: '#374151', fontSize: 12 },
        formatter: (params: any) => {
          const name = params.name;
          if (!name) return '';
          const d = data.find((item) => item.name === name);
          if (!d) return `<div style="font-weight:600;color:#1f2937">${name}</div><div style="color:#9ca3af;margin-top:4px">暂无数据</div>`;

          const riskText = { high: '高风险', medium: '中风险', low: '低风险' }[d.riskLevel] || '低风险';
          const riskColor = d.riskLevel === 'high' ? '#ef4444' : d.riskLevel === 'medium' ? '#f97316' : '#22c55e';

          return `
            <div style="min-width:220px">
              <div style="font-weight:700;font-size:14px;color:#1f2937;margin-bottom:10px">${name}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <span style="color:#6b7280">风险评分</span>
                <span style="font-weight:700;color:${riskColor};font-size:16px">${d.value}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <span style="color:#6b7280">风险等级</span>
                <span style="padding:2px 10px;border-radius:10px;background:${riskColor}18;color:${riskColor};font-size:12px;font-weight:500">${riskText}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <span style="color:#6b7280">在建项目</span>
                <span style="font-weight:600">${d.projectCount} 个</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="color:#6b7280">工资发放率</span>
                <span style="font-weight:600">${d.paymentRate}%</span>
              </div>
              <div style="margin-top:10px;padding-top:8px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11px">点击查看省级下钻详情</div>
            </div>
          `;
        },
      },
      visualMap: {
        type: 'piecewise',
        pieces: [
          { min: 70, max: 100, color: '#dc2626', label: '高风险 (≥70)' },
          { min: 40, max: 69, color: '#f97316', label: '中风险 (40-69)' },
          { min: 1, max: 39, color: '#22c55e', label: '低风险 (<40)' },
          { min: 0, max: 0, color: '#e5e7eb', label: '暂无数据' },
        ],
        left: 20,
        bottom: 20,
        itemWidth: 22,
        itemHeight: 14,
        textStyle: { color: '#6b7280', fontSize: 11 },
      },
      series: [
        {
          name: '欠薪风险',
          type: 'map',
          map: 'china',
          roam: false,
          zoom: 1.2,
          center: [104, 36],
          selectedMode: false,
          data: mapData,
          nameMap: {},
          label: {
            show: true,
            color: '#1e3a5f',
            fontSize: 9,
            fontWeight: 500,
            formatter: (params: any) => {
              const n = params.name;
              if (n.includes('自治区')) return n.replace(/维吾尔|壮族|回族/, '').replace('自治区', '');
              if (n.includes('特别行政区')) return n.replace('特别行政区', '');
              if (n.includes('省')) return n.replace('省', '');
              if (n.includes('市')) return n.replace('市', '');
              return n;
            },
          },
          itemStyle: {
            areaColor: '#e5e7eb',
            borderColor: '#94a3b8',
            borderWidth: 0.8,
          },
          emphasis: {
            label: {
              show: true,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
            },
            itemStyle: {
              areaColor: '#1e40af',
              borderColor: '#1e3a5f',
              borderWidth: 2,
              shadowBlur: 20,
              shadowColor: 'rgba(30, 58, 95, 0.5)',
            },
          },
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
