'use client';

import React, { useState } from 'react';
import { useMoc } from '@/context/MocContext';
import { useAuth } from '@/context/AuthContext';
import { WorkflowStepper } from '@/components/WorkflowStepper';
import { Module1Application } from '@/components/modules/Module1Application';
import { Module2MatrixFM0002 } from '@/components/modules/Module2MatrixFM0002';
import { Module3DeptApproval } from '@/components/modules/Module3DeptApproval';
import { Module4ExecutionClose } from '@/components/modules/Module4ExecutionClose';
import {
  ChevronLeft,
  ArrowRight,
  Save,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface MocDetailViewProps {
  onOpenPrintModal?: () => void;
}

export const MocDetailView: React.FC<MocDetailViewProps> = ({ onOpenPrintModal }) => {
  const { activeMoc, setActiveMocId, advanceStage, saveCurrentMoc, saving } = useMoc();
  const { currentUser } = useAuth();
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  if (!activeMoc) return null;

  const scrollToModule = (moduleId: string) => {
    const el = document.getElementById(moduleId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleManualSave = async () => {
    const ok = await saveCurrentMoc();
    if (ok) {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2500);
    }
  };

  const getStatusBadge = () => {
    switch (activeMoc.status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'DEPT_REVIEW':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'EHS_REVIEW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'FM0002_EVALUATION':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'PLANT_APPROVAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'IMPLEMENTING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PILOT_RUN':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'CLOSED':
        return 'bg-emerald-600 text-white border-emerald-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 顶部 Workflow 6 大阶段横向流转引擎 */}
      <WorkflowStepper onScrollToModule={scrollToModule} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 顶部操作面板与单据元信息 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveMocId(null)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="返回 MOC 台账概览列表"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`font-mono font-bold text-sm px-2 py-0.5 rounded border ${
                    activeMoc.isDraft || activeMoc.id === 'DRAFT_TEMP'
                      ? 'text-amber-900 bg-amber-50 border-amber-300'
                      : 'text-blue-900 bg-blue-50 border-blue-200'
                  }`}
                >
                  {activeMoc.isDraft || activeMoc.id === 'DRAFT_TEMP' ? '待生成草稿' : activeMoc.id}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge()}`}>
                  {activeMoc.isDraft || activeMoc.id === 'DRAFT_TEMP'
                    ? '未入库草稿'
                    : activeMoc.status === 'CLOSED'
                    ? '已结案归档'
                    : activeMoc.status === 'IMPLEMENTING'
                    ? '实施跟踪与PPAP中'
                    : activeMoc.status === 'DEPT_REVIEW'
                    ? '部门评审中'
                    : activeMoc.status === 'EHS_REVIEW'
                    ? 'EHS评估中'
                    : activeMoc.status === 'PLANT_APPROVAL'
                    ? '待工厂批准'
                    : '流转审批中'}
                </span>
              </div>
              <h1 className="text-base font-bold text-slate-900 mt-1">{activeMoc.title}</h1>
            </div>
          </div>

          {/* 右侧角色权限感知提示条与保存按钮 */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-500">登录人员:</span>
              <span className="font-bold text-slate-800">{currentUser.name}</span>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 font-mono">
                {currentUser.id}
              </span>
            </div>

            <button
              onClick={handleManualSave}
              disabled={saving}
              className={`px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-colors ${
                saveSuccessNotice
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
              }`}
              title="保存当前表单更改到后台数据库"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>保存中...</span>
                </>
              ) : saveSuccessNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已保存</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-blue-400" />
                  <span>保存更改</span>
                </>
              )}
            </button>

            {activeMoc.currentStage < 6 && (
              <button
                onClick={() => advanceStage(activeMoc.id)}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
                title="推进到下一个业务节点"
              >
                <span>推进下一阶段</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 快速定位锚点导航条 */}
        <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200 flex items-center justify-between overflow-x-auto text-xs font-medium text-slate-600">
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-slate-400 pl-2">快速跳转区块:</span>
            <button
              onClick={() => scrollToModule('module1')}
              className="px-3 py-1 rounded bg-white shadow-2xs hover:text-blue-600 text-slate-800 transition-colors"
            >
              1. 变更申请主表
            </button>
            <button
              onClick={() => scrollToModule('module2')}
              className="px-3 py-1 rounded bg-white shadow-2xs hover:text-blue-600 text-slate-800 transition-colors"
            >
              2. 各部门评审与最终批准
            </button>
            <button
              onClick={() => scrollToModule('module3')}
              className="px-3 py-1 rounded bg-white shadow-2xs hover:text-blue-600 text-slate-800 transition-colors"
            >
              3. 跨部门 FM-0002 确认矩阵 (13大类)
            </button>
            <button
              onClick={() => scrollToModule('module4')}
              className="px-3 py-1 rounded bg-white shadow-2xs hover:text-blue-600 text-slate-800 transition-colors"
            >
              4. 变更实施与闭环跟踪
            </button>
          </div>

          <div className="text-[11px] text-slate-400 pr-2 shrink-0 hidden sm:block font-mono">
            API Persistence Connected
          </div>
        </div>

        {/* 四大核心模块纵览 (新顺序: 1.申请 ➔ 2.各部门评审与核准 ➔ 3.跨部门FM-0002实施矩阵 ➔ 4.实施闭环跟踪) */}
        <div className="space-y-8">
          <Module1Application />
          <Module3DeptApproval />
          <Module2MatrixFM0002 />
          <Module4ExecutionClose />
        </div>
      </div>
    </div>
  );
};
