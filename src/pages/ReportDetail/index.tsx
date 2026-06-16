import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Trophy,
  MessageSquare,
  Lightbulb,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import ReportSummary from '@/components/reports/ReportSummary';
import RiskDistribution from '@/components/reports/RiskDistribution';
import Empty from '@/components/Empty';
import { cn } from '@/lib/utils';

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, getFilteredWeeklyReports } = useAppStore();
  const weeklyReports = useMemo(() => getFilteredWeeklyReports(), [user, getFilteredWeeklyReports]);

  const report = useMemo(() => {
    return weeklyReports.find(r => r.id === id);
  }, [weeklyReports, id]);

  const paymentRankingOption = useMemo(() => {
    if (!report || report.paymentRanking.length === 0) {
      return {
        title: {
          text: '',
        },
        xAxis: {},
        yAxis: {},
        series: [],
      };
    }

    const data = [...report.paymentRanking].sort((a, b) => a.rank - b.rank).slice(0, 5);

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
        formatter: '{b}: {c}%',
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '3%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          formatter: '{value}%',
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
      yAxis: {
        type: 'category',
        data: data.map(d => d.province).reverse(),
        axisLabel: {
          color: '#374151',
          fontSize: 12,
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
      series: [
        {
          type: 'bar',
          data: data.map(d => d.paymentRate).reverse(),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#1d4ed8' },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
          barWidth: '55%',
          label: {
            show: true,
            position: 'right',
            color: '#374151',
            fontSize: 12,
            fontWeight: 500,
            formatter: '{c}%',
          },
        },
      ],
    };
  }, [report]);

  const complaintPieOption = useMemo(() => {
    if (!report || report.complaintRanking.length === 0) {
      return {
        title: {
          text: '',
        },
        tooltip: {},
        series: [],
      };
    }

    const colors = ['#1e40af', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return {
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
          data: report.complaintRanking.map(c => ({
            name: c.type,
            value: c.count,
          })),
          color: colors,
        },
      ],
    };
  }, [report]);

  const owedAmountOption = useMemo(() => {
    if (!report || report.summary.totalOwedAmount <= 0) {
      return {
        title: {
          text: '',
        },
        tooltip: {},
        series: [],
      };
    }

    const data = [
      { name: '高风险项目', value: Math.round(report.summary.totalOwedAmount * 0.5), color: '#ef4444' },
      { name: '中风险项目', value: Math.round(report.summary.totalOwedAmount * 0.3), color: '#f59e0b' },
      { name: '低风险项目', value: Math.round(report.summary.totalOwedAmount * 0.2), color: '#10b981' },
    ];

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#1f2937',
          fontSize: 12,
        },
        formatter: (params: any) => `${params.name}: ${(params.value / 10000).toFixed(2)}亿元 (${params.percent}%)`,
      },
      series: [
        {
          name: '欠薪金额',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 3,
          },
          label: {
            show: true,
            position: 'outside',
            color: '#374151',
            fontSize: 12,
            formatter: '{b}\n{d}%',
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 15,
            lineStyle: {
              color: '#d1d5db',
            },
          },
          data: data.map(d => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color },
          })),
        },
      ],
    };
  }, [report]);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Empty description="未找到该周报" />
        <button
          onClick={() => navigate('/reports')}
          className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          返回周报列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/reports')}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回周报列表</span>
      </button>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#2563eb] text-white p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FileText className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-medium rounded-full">
                官方报告
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{report.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>报告周期：{report.weekStart} ~ {report.weekEnd}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>生成时间：{report.generateTime}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            <div>
              <div className="text-xs text-blue-200 mb-1">项目总数</div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {report.summary.totalProjects.toLocaleString()}
                <span className="text-sm font-normal text-blue-200 ml-1">个</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-blue-200 mb-1">平均发放率</div>
              <div className="text-xl sm:text-2xl font-bold text-green-300">
                {report.summary.avgPaymentRate}%
              </div>
            </div>
            <div>
              <div className="text-xs text-blue-200 mb-1">预警总数</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-300">
                {report.summary.totalWarnings}
                <span className="text-sm font-normal text-blue-200 ml-1">条</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-blue-200 mb-1">欠薪金额</div>
              <div className="text-xl sm:text-2xl font-bold text-red-300">
                {(report.summary.totalOwedAmount / 10000).toFixed(2)}
                <span className="text-sm font-normal text-blue-200 ml-1">亿元</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">核心指标摘要</h3>
        </div>
        <ReportSummary summary={report.summary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <RiskDistribution data={report.riskDistribution} />
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-semibold text-gray-800">欠薪金额分布</h3>
          </div>
          <div className="h-72">
            {report.summary.totalOwedAmount > 0 ? (
              <ReactECharts
                key={report.id}
                option={owedAmountOption}
                style={{ height: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            ) : (
              <Empty description="暂无欠薪金额数据" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-base font-semibold text-gray-800">工资发放率排名 TOP5</h3>
          </div>
          <div className="h-72">
            {report.paymentRanking.length > 0 ? (
              <ReactECharts
                key={report.id}
                option={paymentRankingOption}
                style={{ height: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            ) : (
              <Empty description="暂无排名数据" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-semibold text-gray-800">投诉热点排名</h3>
          </div>
          <div className="h-72">
            {report.complaintRanking.length > 0 ? (
              <ReactECharts
                key={report.id}
                option={complaintPieOption}
                style={{ height: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            ) : (
              <Empty description="暂无投诉数据" />
            )}
          </div>

          {report.complaintRanking.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                {report.complaintRanking.slice(0, 3).map((item, index) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white',
                        index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                      )}>
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{item.count}起</span>
                      <span className="text-xs text-gray-400">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-800">监管建议</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-100">
            <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              优化监管重点
            </h4>
            <ul className="space-y-2">
              {report.suggestions.slice(0, 2).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                  <span>{suggestion}</span>
                </li>
              ))}
              {report.suggestions.length === 0 && (
                <li className="text-sm text-blue-400">暂无建议</li>
              )}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-100">
            <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              保证金方案建议
            </h4>
            <ul className="space-y-2">
              {report.suggestions.slice(2, 4).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                  <span>{suggestion}</span>
                </li>
              ))}
              {report.suggestions.length <= 2 && (
                <li className="text-sm text-amber-400">暂无建议</li>
              )}
            </ul>
          </div>
        </div>

        {report.suggestions.length > 4 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">其他建议</h4>
            <ul className="space-y-2">
              {report.suggestions.slice(4).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回列表</span>
        </button>
        <div className="text-xs text-gray-400">
          报告编号：{report.id}
        </div>
      </div>
    </div>
  );
}
