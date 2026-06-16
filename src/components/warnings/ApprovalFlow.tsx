import { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import type { ApprovalStep } from '@/types';
import { cn } from '@/lib/utils';

interface ApprovalFlowProps {
  steps: ApprovalStep[];
  onApprove?: (stepId: string, comment: string) => void;
  onReject?: (stepId: string, comment: string) => void;
}

export default function ApprovalFlow({ steps, onApprove, onReject }: ApprovalFlowProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  if (!steps || steps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无审批流程
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.status === 'pending');
  const isAllApproved = steps.every((s) => s.status === 'approved');

  const handleApprove = (stepId: string) => {
    if (onApprove && comment.trim()) {
      onApprove(stepId, comment);
      setActiveStep(null);
      setComment('');
    }
  };

  const handleReject = (stepId: string) => {
    if (onReject && comment.trim()) {
      onReject(stepId, comment);
      setActiveStep(null);
      setComment('');
    }
  };

  const getStepIcon = (status: string, isCurrent: boolean) => {
    if (status === 'approved') {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    if (status === 'rejected') {
      return <XCircle className="w-6 h-6 text-red-500" />;
    }
    if (isCurrent) {
      return (
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
          <span className="text-white text-xs font-bold">{steps.findIndex(s => s.status === 'pending') + 1}</span>
        </div>
      );
    }
    return <Clock className="w-6 h-6 text-gray-300" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">三级审批流程</h3>

      <div className="relative">
        <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCurrent = index === currentStepIndex;
            const isPast = step.status === 'approved' || step.status === 'rejected';
            const isFuture = currentStepIndex !== -1 && index > currentStepIndex;

            return (
              <div key={step.id} className="relative">
                <div
                  className={cn(
                    'relative z-10 flex items-start gap-4',
                    isCurrent ? 'bg-blue-50 -mx-4 -my-2 p-4 rounded-lg' : ''
                  )}
                >
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status, isCurrent)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={cn(
                          'font-medium',
                          isPast ? 'text-gray-900' : isCurrent ? 'text-blue-900' : 'text-gray-400'
                        )}
                      >
                        {step.title}
                      </h4>
                      {isCurrent && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          当前待审批
                        </span>
                      )}
                      {step.status === 'approved' && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          已通过
                        </span>
                      )}
                      {step.status === 'rejected' && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          已拒绝
                        </span>
                      )}
                    </div>

                    {isPast && step.approver && (
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>审批人：{step.approver}</span>
                        </div>
                        {step.approveTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>审批时间：{step.approveTime}</span>
                          </div>
                        )}
                        {step.comment && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MessageSquare className="w-4 h-4 mt-0.5" />
                            <span>审批意见：{step.comment}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {isCurrent && onApprove && onReject && (
                      <div className="mt-3">
                        {activeStep === step.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="请输入审批意见..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(step.id)}
                                disabled={!comment.trim()}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                确认通过
                              </button>
                              <button
                                onClick={() => handleReject(step.id)}
                                disabled={!comment.trim()}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                驳回
                              </button>
                              <button
                                onClick={() => {
                                  setActiveStep(null);
                                  setComment('');
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveStep(step.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            进行审批
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}

                    {isFuture && (
                      <p className="text-sm text-gray-400">等待上一级审批完成</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isAllApproved && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">审批流程已全部通过</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
