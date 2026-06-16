import ReactECharts from 'echarts-for-react';

interface RiskGaugeProps {
  score: number;
  height?: number;
}

export default function RiskGauge({ score, height = 280 }: RiskGaugeProps) {
  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: '低风险', color: '#10b981' };
    if (score < 70) return { label: '中风险', color: '#f59e0b' };
    return { label: '高风险', color: '#ef4444' };
  };

  const riskLevel = getRiskLevel(score);

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: {
          color: riskLevel.color,
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 5,
        },
        progress: {
          show: true,
          width: 18,
          roundCap: true,
        },
        pointer: {
          show: true,
          icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.82902,732.647677 2083.82902,729.031152 L2088.28741,617.588179 C2088.33217,616.469251 2089.25228,615.30999 2090.36389,615.30999 Z',
          length: '65%',
          width: 8,
          offsetCenter: [0, '5%'],
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 18,
            color: [
              [0.3, '#10b981'],
              [0.7, '#f59e0b'],
              [1, '#ef4444'],
            ],
          },
        },
        axisTick: {
          show: true,
          distance: -24,
          length: 6,
          lineStyle: {
            color: '#fff',
            width: 2,
          },
        },
        splitLine: {
          show: true,
          distance: -28,
          length: 10,
          lineStyle: {
            color: '#fff',
            width: 3,
          },
        },
        axisLabel: {
          show: true,
          distance: -35,
          color: '#6b7280',
          fontSize: 11,
          formatter: (value: number) => {
            if (value === 0 || value === 50 || value === 100) {
              return value.toString();
            }
            return '';
          },
        },
        anchor: {
          show: true,
          size: 18,
          itemStyle: {
            color: '#fff',
            borderColor: riskLevel.color,
            borderWidth: 4,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
          },
        },
        title: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '40%'],
          fontSize: 36,
          fontWeight: 'bold',
          formatter: '{value}',
          color: riskLevel.color,
        },
        data: [
          {
            value: score,
          },
        ],
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        bottom: '12%',
        style: {
          text: riskLevel.label,
          fontSize: 16,
          fontWeight: 'bold',
          fill: riskLevel.color,
        },
      },
    ],
  };

  return (
    <div className="flex flex-col items-center">
      <ReactECharts
        option={option}
        style={{ height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
