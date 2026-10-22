'use client';

import React, { useState } from 'react';
import { useMoc } from '@/context/MocContext';
import { useAuth } from '@/context/AuthContext';
import {
  Wrench,
  CheckCircle,
  FileCheck2,
  Bell,
  Gauge,
  Upload,
  ArrowRight,
  Stamp,
  Award,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const Module4ExecutionClose: React.FC = () => {
  const { activeMoc, updateMoc } = useMoc();
  const {
    currentUser,
    accounts,
    switchUser,
    isSuperUser,
    canApprovePsw,
    canApproveFinal,
    currentRole,
    setCurrentRole,
  } = useAuth();


  const [pswModalOpen, setPswModalOpen] = useState(false);

  if (!activeMoc) return null;

  const imp = activeMoc.implementation;
  const isQualityRole = canApprovePsw();
  const isFinalApprover = canApproveFinal();

  const handleUpdateImp = (changes: Partial<typeof imp>) => {
    updateMoc({
      ...activeMoc,
      implementation: {
        ...imp,
        ...changes,
      },
    });
  };

  // 周经理 PSW 签发 (支持 SuperUser 代签)
  const handleSignPsw = (approved: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const signerName = isSuperUser
      ? `${currentUser.name} (超级管理员特权代签)`
      : '周经理 (质量保证部)';
    handleUpdateImp({
      isPpapApproved: approved,
      pswSigner: approved ? signerName : (isSuperUser ? `${currentUser.name} (特权驳回)` : '周经理 (驳回)'),
      pswSignDate: today,
      pswDocumentName: imp.pswDocumentName || '504H0008A03_PSW_Signed_Certificate.pdf',
    });
  };

  // 最终实施批准（表四闭环归档，支持 SuperUser 特权批准）
  const handleFinalExecutionSign = (approved: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const approverName = isSuperUser
      ? `${currentUser.name} (超级管理员特权批准)`
      : (currentUser.role === 'PLANT_MANAGER' ? '赵总 (工厂运营总监)' : '周经理 (质量保证经理)');

    const updated = {
      ...activeMoc,
      implementation: {
        ...imp,
        executionApproval: {
          isApproved: approved,
          approver: approverName,
          approvalDate: today,
          comments:
            imp.executionApproval.comments ||
            (approved
              ? '经全生命周期跟踪：变更通知已发布、PPAP与PSW已签署、试生产合格率达标，变更实施全要素闭环确认OK，准予正式归档并在全厂量产推行！'
              : '实施指标未达标，暂缓归档。'),
        },
      },
      status: approved ? ('CLOSED' as const) : ('IMPLEMENTING' as const),
      currentStage: approved ? 6 : 5,
    };
    updateMoc(updated);
  };



  const isClosed = activeMoc.status === 'CLOSED';

  return (
    <div id="module4" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* 模块标题栏 */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            4
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold tracking-wide">四、变更实施与闭环跟踪 (表三、表四)</h2>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-blue-800/80 text-blue-200 font-mono">
                通知发布 · PPAP/PSW 签核 · 试生产验证 · 最终实施批准
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <span className="text-[11px] text-slate-400 font-mono">
            {isClosed ? '已正式归档' : imp.isPpapApproved ? 'PSW已签发' : '实施跟踪中'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* 表三：变更实施 */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center border-b border-slate-200 pb-2">
            <Wrench className="w-4 h-4 mr-1 text-blue-600" />
            表三：变更实施与关键里程碑验证
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. 变更通知是否发布 */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                <Bell className="w-4 h-4 text-blue-500" />
                <span>变更通知是否发布？</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* 客户通知 */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-700 mb-1.5">
                    客户通知 (504H0050):
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <label className="inline-flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="custNotice"
                        checked={imp.customerNotice === true}
                        onChange={() => handleUpdateImp({ customerNotice: true })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>是</span>
                    </label>
                    <label className="inline-flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="custNotice"
                        checked={imp.customerNotice === false}
                        onChange={() => handleUpdateImp({ customerNotice: false })}
                        className="text-slate-600 focus:ring-slate-500"
                      />
                      <span>否</span>
                    </label>
                  </div>
                </div>

                {/* 内部通知 */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-700 mb-1.5">内部通知:</div>
                  <div className="flex items-center space-x-3 text-xs">
                    <label className="inline-flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="innerNotice"
                        checked={imp.internalNotice === true}
                        onChange={() => handleUpdateImp({ internalNotice: true })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>是</span>
                    </label>
                    <label className="inline-flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        name="innerNotice"
                        checked={imp.internalNotice === false}
                        onChange={() => handleUpdateImp({ internalNotice: false })}
                        className="text-slate-600 focus:ring-slate-500"
                      />
                      <span>否</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-tight">
                依据集团规程：《变更评估实施确认表》和 504H0008A01 PPAP Worksheet Template 定义的任务均需完成且OK。
              </div>
            </div>

            {/* 2. PPAP 是否批准 (PSW签署) */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                  <FileCheck2 className="w-4 h-4 text-cyan-600" />
                  <span>PPAP 是否批准 (PSW签署)？</span>
                </div>
                {!isQualityRole && !isSuperUser && (
                  <button
                    onClick={() => {
                      const qaAcc =
                        accounts.find((a) => a.id === 'EMP-QA-001') ||
                        accounts.find((a) => a.role === 'QUALITY_MANAGER');
                      if (qaAcc) switchUser(qaAcc.id);
                      else setCurrentRole('QUALITY_MANAGER');
                    }}
                    className="text-[11px] px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-300 hover:bg-cyan-100 flex items-center space-x-1"
                  >
                    <span>切换为 周经理 (质量)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>


              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="ppapApproved"
                        disabled={!isQualityRole}
                        checked={imp.isPpapApproved === true}
                        onChange={() => handleSignPsw(true)}
                        className="text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="font-semibold text-cyan-900">是 (PSW 已签署)</span>
                    </label>
                    <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="ppapApproved"
                        disabled={!isQualityRole}
                        checked={imp.isPpapApproved === false}
                        onChange={() => handleSignPsw(false)}
                        className="text-slate-600 focus:ring-slate-500"
                      />
                      <span>否</span>
                    </label>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      imp.isPpapApproved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {imp.isPpapApproved ? 'PSW 审批合格' : '待PSW签核'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-1 truncate max-w-[200px]">
                    <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono text-slate-700 truncate text-[11px]">
                      {imp.pswDocumentName || '504H0008A03_PSW_Report.pdf'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    签署人: <span className="font-semibold text-slate-800">{imp.pswSigner || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 试生产验证 */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 font-semibold text-slate-800">
                <Gauge className="w-4 h-4 text-purple-600" />
                <span>试生产是否完成？</span>
              </div>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pilotStatus"
                    checked={imp.pilotRunStatus === 'NOT_APPLICABLE'}
                    onChange={() => handleUpdateImp({ pilotRunStatus: 'NOT_APPLICABLE' })}
                  />
                  <span>不适用</span>
                </label>
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pilotStatus"
                    checked={imp.pilotRunStatus === 'COMPLETED'}
                    onChange={() => handleUpdateImp({ pilotRunStatus: 'COMPLETED' })}
                  />
                  <span className="font-semibold text-emerald-700">是 (试生产完成)</span>
                </label>
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pilotStatus"
                    checked={imp.pilotRunStatus === 'FAILED' || imp.pilotRunStatus === 'PENDING'}
                    onChange={() => handleUpdateImp({ pilotRunStatus: 'PENDING' })}
                  />
                  <span>否 (进行中/待定)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">小批量试生产数量 (件):</label>
                <input
                  type="number"
                  value={imp.pilotQuantity || ''}
                  onChange={(e) => handleUpdateImp({ pilotQuantity: Number(e.target.value) })}
                  placeholder="如 200"
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">检验合格率 (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={imp.pilotPassRate || ''}
                  onChange={(e) => handleUpdateImp({ pilotPassRate: Number(e.target.value) })}
                  placeholder="如 99.8"
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">试生产验证结论与工件表现:</label>
                <input
                  type="text"
                  value={imp.pilotRemarks}
                  onChange={(e) => handleUpdateImp({ pilotRemarks: e.target.value })}
                  placeholder="如首件合格，全尺寸检验均在公差中值，气密测试无泄漏..."
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 表四：变更实施批准 (还原图1 表四，全生命周期最终闭环归档) */}
        <div className="border-2 border-blue-500 bg-blue-50/20 rounded-xl p-5 relative overflow-hidden">
          {isClosed && (
            <div className="absolute right-6 top-6 pointer-events-none transform rotate-12">
              <div className="border-4 border-emerald-600 text-emerald-700 font-black text-xl px-4 py-1.5 rounded-lg tracking-widest uppercase shadow-md bg-emerald-50/80">
                已结案归档 CLOSED
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-blue-200 mb-4 gap-2">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  四、变更实施批准 (表四 · 全流程结案归档)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  全部实施动作、PSW及试生产合格后，由此处下达最终量产放行令
                </span>
              </div>
            </div>

            {!isFinalApprover && (
              <button
                onClick={() => setCurrentRole('QUALITY_MANAGER')}
                className="text-xs px-2.5 py-1 rounded bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 transition-colors flex items-center space-x-1"
                title="切换角色为质量经理周经理"
              >
                <span>切换为 质量经理 周经理 终审</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center space-x-6 text-xs">
                <span className="font-bold text-slate-800">变更实施是否批准？</span>
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="executionApproved"
                    disabled={!isFinalApprover}
                    checked={imp.executionApproval.isApproved === true}
                    onChange={() =>
                      updateMoc({
                        ...activeMoc,
                        implementation: {
                          ...imp,
                          executionApproval: { ...imp.executionApproval, isApproved: true },
                        },
                      })
                    }
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-emerald-800">是 (批准量产归档)</span>
                </label>

                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="executionApproved"
                    disabled={!isFinalApprover}
                    checked={imp.executionApproval.isApproved === false}
                    onChange={() =>
                      updateMoc({
                        ...activeMoc,
                        implementation: {
                          ...imp,
                          executionApproval: { ...imp.executionApproval, isApproved: false },
                        },
                      })
                    }
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-bold text-rose-800">否</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">最终批准意见/结案结论:</label>
                <textarea
                  rows={2}
                  disabled={!isFinalApprover}
                  value={imp.executionApproval.comments}
                  onChange={(e) =>
                    updateMoc({
                      ...activeMoc,
                      implementation: {
                        ...imp,
                        executionApproval: { ...imp.executionApproval, comments: e.target.value },
                      },
                    })
                  }
                  placeholder={isFinalApprover ? '请填写变更实施最终验收结论...' : '待质量经理/决策人批准结案'}
                  className="w-full text-xs p-2.5 rounded-lg border border-blue-200 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              {isFinalApprover ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleFinalExecutionSign(true)}
                    className={`w-full px-4 py-3 rounded-lg text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-colors ${
                      isSuperUser
                        ? 'bg-indigo-700 hover:bg-indigo-600 border border-indigo-400'
                        : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isSuperUser ? '【超级管理员特权批准】正式结案归档' : '批准变更实施 · 正式结案归档'}</span>
                  </button>
                  <button
                    onClick={() => handleFinalExecutionSign(false)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-300 transition-colors"
                  >
                    暂缓实施 / 驳回
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs bg-white p-3 rounded-lg border border-blue-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">最终批准人:</span>
                      <span className="font-bold text-slate-900">{imp.executionApproval.approver || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">批准日期:</span>
                      <span className="font-mono text-slate-600 text-[11px]">
                        {imp.executionApproval.approvalDate || '待签署'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const qaAcc =
                        accounts.find((a) => a.id === 'EMP-QA-001') ||
                        accounts.find((a) => a.role === 'QUALITY_MANAGER');
                      if (qaAcc) switchUser(qaAcc.id);
                      else setCurrentRole('QUALITY_MANAGER');
                    }}
                    className="w-full py-1.5 rounded bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 text-xs flex items-center justify-center space-x-1"
                  >
                    <span>切换为 周经理 (质量保证) 批准</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
