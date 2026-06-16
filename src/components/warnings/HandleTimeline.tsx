import { AlertCircle, UserCheck, ClipboardList, CheckCircle, FileText, Clock } from 'lucide-react';
import type { Warning } from '@/types';
import { cn } from '@/lib/utils';

interface HandleTimelineProps {
  warning: Warning;
}

interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'create' | 'assign' | 'process' | 'approve' | 'complete';
  operator?: string;
}

function generateTimeline(warning: Warning): TimelineItem[] {
  const items: TimelineItem[] = [];

  items.push({
    id: 'create',
    time: warning.createTime,
    title: '预警生成',
    description: `系统自动检测到${warning.title}，触发${warning.level === 'secondary' ? '二级' : '一级'}预警`,
    type: 'create',
    operator: '系统',
  });

  if (warning.status !== 'pending' && warning.handler) {
    items.push({
      id: 'assign',
      time: warning.createTime,
      title: '预警分派',
      description: `预警已分派给 ${warning.handler} 处理`,
      type: 'assign',
      operator: '系统',
    });
  }

  if (warning.approvalFlow && warning.approvalFlow.length > 0) {
    warning.approvalFlow.forEach((step) => {
      if (step.status === 'approved' && step.approveTime) {
        items.push({
          id: step.id,
          time: step.approveTime,
          title: step.title,
          description: step.comment || '审批通过',
          type: 'approve',
          operator: step.approver || '',
        });
      }
    });
  }

  if (warning.status === 'processing') {
    items.push({
      id: 'processing',
      time: warning.createTime,
      title: '处理中',
      description: '正在进行风险处置，请关注后续进展',
      type: 'process',
      operator: warning.handler || '',
    });
  }

  if (warning.status === 'resolved') {
    items.push({
      id: 'resolved',
      time: warning.handleDeadline,
      title: '预警已解除',
      description: '风险已消除，预警状态更新为已解决',
      type: 'complete',
      operator: warning.handler || '',
    });
  }

  return items.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

const typeConfig = {
  create: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-100' },
  assign: { icon: UserCheck, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  process: { icon: ClipboardList, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  approve: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100' },
  complete: { icon: FileText, color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

export default function HandleTimeline({ warning }: HandleTimelineProps) {
  const timeline = generateTimeline(warning);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">处置记录</h3>

      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {timeline.map((item, index) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            const isLast = index === timeline.length - 1;

            return (
              <div key={item.id} className="relative pl-10">
                <div
                  className={cn(
                    'absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center z-10',
                    config.bgColor
                  )}
                >
                  <Icon className={cn('w-4 h-4', config.color)} />
                </div>

                <div className={cn(isLast ? '' : '')}>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    {isLast && item.type !== 'complete' && (
                      <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        当前
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    {item.operator && (
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        {item.operator}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
