'use client';

import React from 'react';
import { useMoc } from '@/context/MocContext';
import { STAGES_CONFIG } from '@/lib/mocTemplate';
import {
  FileText,
  ShieldAlert,
  Layers,
  CheckCheck,
  Wrench,
  Archive,
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
} from 'lucide-react';

interface WorkflowStepperProps {
  onScrollToModule?: (moduleKey: string) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ onScrollToModule }) => {
  const { activeMoc, setStage } = useMoc();

  if (!activeMoc) return null;

  const currentStage = activeMoc.currentStage || 1;

  const getStageIcon = (stageNumber: number) => {
    switch (stageNumber) {
      case 1:
        return FileText;
      case 2:
        return ShieldAlert;
      case 3:
        return Layers;
      case 4:
        return CheckCheck;
      case 5:
        return Wrench;
      case 6:
        return Archive;
      default:
        return Circle;
    }
  };

  const getStageStatusText = (stage: number) => {
    if (stage < currentStage) {
      return { text: '已完成', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    if (stage === currentStage) {
      if (activeMoc.status === 'CLOSED') {
        return { text: '已归档', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      }
      return { text: '进行中', color: 'text-blue-700 bg-blue-50 border-blue-200 animate-pulse' };
    }
    return { text: '待流转', color: 'text-slate-400 bg-slate-50 border-slate-200' };
  };

  const handleStageClick = (stage: number) => {
    // 滚动至对应模块 (按新顺序: 1.申请 2.评审与批准 3.跨部门FM-0002 4.实施与闭环)
    if (onScrollToModule) {
      if (stage === 1) onScrollToModule('module1');
      else if (stage === 2 || stage === 3 || stage === 4) onScrollToModule('module2');
      else if (stage === 5) onScrollToModule('module3');
      else onScrollToModule('module4');
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* 顶部简述 */}
        <div className="flex flex-wrap items-center justify-between mb-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700 uppercase tracking-wider">变更全流程状态引擎:</span>
            <span className="text-slate-500">闭环业务流转进度</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-500">
            <span>当前流转阶段:</span>
            <span className="font-semibold text-blue-600">
              第 {currentStage} 阶段 / {STAGES_CONFIG[currentStage - 1]?.title}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-400">点击任意阶段可直达对应表单区块</span>
          </div>
        </div>

        {/* 6 大阶段横向流转卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {STAGES_CONFIG.map((item) => {
            const Icon = getStageIcon(item.stage);
            const isCurrent = item.stage === currentStage;
            const isPassed = item.stage < currentStage;
            const statusInfo = getStageStatusText(item.stage);

            return (
              <button
                key={item.stage}
                onClick={() => handleStageClick(item.stage)}
                className={`relative p-2.5 rounded-lg border text-left transition-all ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/60 shadow-sm ring-1 ring-blue-400'
                    : isPassed
                    ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 opacity-80'
                }`}
              >
                {/* 顶部数字与状态徽标 */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.stage}
                    </span>
                    <Icon
                      className={`w-4 h-4 ${
                        isCurrent ? 'text-blue-600' : isPassed ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>

                {/* 标题与角色 */}
                <div className="min-w-0">
                  <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.subTitle}</div>
                  <div className="text-[9px] text-slate-400 truncate mt-1 border-t border-slate-100 pt-1">
                    责任: {item.responsibleRole.split('/')[0]}
                  </div>
                </div>

                {/* 快速调试阶段切换按钮 (鼠标悬停或当前卡片可一键设定) */}
                {isCurrent && item.stage < 6 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setStage(activeMoc.id, item.stage + 1);
                    }}
                    className="mt-1.5 pt-1 border-t border-blue-200 flex items-center justify-end text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    title="推进至下一业务阶段"
                  >
                    <span>推进下步</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
