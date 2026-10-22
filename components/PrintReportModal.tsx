'use client';

import React, { useState } from 'react';
import { useMoc } from '@/context/MocContext';
import { Printer, X, FileSpreadsheet, Check, Download } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const { activeMoc } = useMoc();
  const [activeFormTab, setActiveFormTab] = useState<'fm0001' | 'fm0002'>('fm0001');

  if (!isOpen || !activeMoc) return null;

  const app = activeMoc.application;
  const deptReview = activeMoc.departmentReview;
  const imp = activeMoc.implementation;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-300">
        {/* 弹窗顶部栏 */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between rounded-t-xl shrink-0">
          <div className="flex items-center space-x-3">
            <Printer className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                工程变更纸质受控文件打印预览 (Print Preview)
              </h3>
              <p className="text-[11px] text-slate-400">
                严格遵循制造业 ISO/TS 16949 & VDA 6.3 纸质工程变更表单规范
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs flex">
              <button
                onClick={() => setActiveFormTab('fm0001')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeFormTab === 'fm0001' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                图1: 主表 (表一至表四)
              </button>
              <button
                onClick={() => setActiveFormTab('fm0002')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeFormTab === 'fm0002' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                图2: FM-0002 确认矩阵
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印 / 导出 PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 纸质预览内容区 */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div className="bg-white p-8 max-w-4xl w-full shadow-md border border-slate-300 text-black font-sans print:shadow-none print:border-none print:p-0">
            {activeFormTab === 'fm0001' ? (
              /* 图1 表一至表四纸质还原 */
              <div className="border-2 border-black divide-y-2 divide-black text-xs">
                {/* 顶部标题栏 */}
                <div className="text-center py-2 bg-slate-50 font-bold text-sm tracking-widest uppercase border-b-2 border-black">
                  工程变更申请与审批表 (FM-0001)
                </div>

                {/* 一、变更申请 */}
                <div>
                  <div className="grid grid-cols-6 border-b border-black divide-x border-collapse">
                    <div className="col-span-4 p-2 font-bold bg-slate-100">一、变更申请</div>
                    <div className="col-span-1 p-2 font-bold bg-slate-100 text-center">变更管理编号:</div>
                    <div className="col-span-1 p-2 font-mono font-bold text-center">{activeMoc.id}</div>
                  </div>

                  <div className="p-2 border-b border-black">
                    <span className="font-bold">更改原因（目的）：</span>
                    <span className="ml-2">{app.changeReason || '—'}</span>
                  </div>

                  {/* 现有状态 vs 更改后状态 */}
                  <div className="grid grid-cols-2 divide-x border-b border-black">
                    <div className="p-2.5">
                      <div className="font-bold text-center mb-2 pb-1 border-b border-slate-300">现有状态</div>
                      <div className="min-h-[100px] text-slate-700 leading-relaxed">
                        {app.currentState.description || '请用文件或图片等直观的方式进行说明，需要时添加附件进行详细说明'}
                      </div>
                      <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-[11px] text-slate-500">
                        附件数: {app.currentState.attachments.length} 件
                      </div>
                    </div>

                    <div className="p-2.5">
                      <div className="font-bold text-center mb-2 pb-1 border-b border-slate-300">更改后状态</div>
                      <div className="min-h-[100px] text-slate-700 leading-relaxed">
                        {app.proposedState.description || '请用文件或图片等直观的方式进行说明，需要时添加附件进行详细说明'}
                      </div>
                      <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-[11px] text-slate-500">
                        附件数: {app.proposedState.attachments.length} 件
                      </div>
                    </div>
                  </div>

                  {/* 申请部门人与签字 */}
                  <div className="grid grid-cols-4 divide-x border-b border-black text-center">
                    <div className="p-2 font-bold bg-slate-50">申请更改部门</div>
                    <div className="p-2 font-bold bg-slate-50">申请人</div>
                    <div className="p-2 font-bold bg-slate-50">申请日期</div>
                    <div className="p-2 font-bold bg-slate-50">部门经理确认</div>
                  </div>
                  <div className="grid grid-cols-4 divide-x text-center border-b border-black">
                    <div className="p-2">{app.applicantDept}</div>
                    <div className="p-2">{app.applicant}</div>
                    <div className="p-2 font-mono">{app.applyDate}</div>
                    <div className="p-2 font-semibold">
                      {app.deptManagerSign ? `✓ ${app.deptManagerSign}` : '—'}
                    </div>
                  </div>
                </div>

                {/* 二、变更评估 */}
                <div className="pt-2">
                  <div className="p-2 font-bold bg-slate-100 border-b border-black">二、变更评估</div>

                  <div className="p-2 border-b border-black space-y-1.5">
                    <div className="flex items-center space-x-6">
                      <span className="font-bold">EHS评估是否可行？</span>
                      <span>{deptReview.ehs.isFeasible === true ? '☑ 是  ☐ 否' : '☐ 是  ☑ 否'}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className="font-bold">是否按照集团EHS管理流程（504H0340A08）实施？</span>
                      <span>{deptReview.ehs.isProcessApplied === true ? '☑ 是  ☐ 否' : '☐ 是  ☑ 否'}</span>
                    </div>
                    <div className="flex items-center space-x-4 pt-1">
                      <span className="font-bold">评估人：</span>
                      <span>{deptReview.ehs.evaluator || '—'}</span>
                      <span className="font-bold ml-4">日期：</span>
                      <span className="font-mono">{deptReview.ehs.evalDate || '—'}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 border-b border-black text-[11px] text-slate-600">
                    变更评估：相关部门填写《变更评估实施确认表》和 504H0008A01 PPAP Worksheet Template 进行评估和明确行动计划
                  </div>

                  {/* 8部门评审表格 (严格还原图1样式) */}
                  <div className="border-b border-black">
                    <div className="grid grid-cols-6 divide-x text-center font-bold bg-slate-50 border-b border-black">
                      <div className="p-1.5">评估部门</div>
                      <div className="col-span-1 p-1.5">评估结果</div>
                      <div className="p-1.5">签名</div>
                      <div className="p-1.5">评估部门</div>
                      <div className="col-span-1 p-1.5">评估结果</div>
                      <div className="p-1.5">签名</div>
                    </div>

                    <div className="grid grid-cols-6 divide-x text-center divide-y border-b border-black">
                      {/* 行 1: 研发 vs 质量 */}
                      <div className="p-1.5 text-left pl-2">研发 {deptReview.deptReviews[0]?.checked ? '☑' : '☐'}</div>
                      <div className="p-1.5 truncate text-[11px]">{deptReview.deptReviews[0]?.result || '合格'}</div>
                      <div className="p-1.5 font-semibold">{deptReview.deptReviews[0]?.signature || '—'}</div>
                      <div className="p-1.5 text-left pl-2">质量 {deptReview.deptReviews[1]?.checked ? '☑' : '☐'}</div>
                      <div className="p-1.5 truncate text-[11px]">{deptReview.deptReviews[1]?.result || '合格'}</div>
                      <div className="p-1.5 font-semibold">{deptReview.deptReviews[1]?.signature || '—'}</div>

                      {/* 行 2: 生产 vs 采购 */}
                      <div className="p-1.5 text-left pl-2">生产 {deptReview.deptReviews[2]?.checked ? '☑' : '☐'}</div>
                      <div className="p-1.5 truncate text-[11px]">{deptReview.deptReviews[2]?.result || '可行'}</div>
                      <div className="p-1.5 font-semibold">{deptReview.deptReviews[2]?.signature || '—'}</div>
                      <div className="p-1.5 text-left pl-2">采购 {deptReview.deptReviews[3]?.checked ? '☑' : '☐'}</div>
                      <div className="p-1.5 truncate text-[11px]">{deptReview.deptReviews[3]?.result || '按计划'}</div>
                      <div className="p-1.5 font-semibold">{deptReview.deptReviews[3]?.signature || '—'}</div>

                      {/* 行 3: SCM vs 财务 */}
                      <div className="p-1.5 text-left pl-2">SCM {deptReview.deptReviews[4]?.checked ? '☑' : '☐'}</div>
                      <div className="p-1.5 truncate text-[11px]">{deptReview.deptReviews[4]?.result || '库存受控'}</div>
                      <div className="p-1.5 font-semibold">{deptReview.deptReviews[4]?.signature || '—'}</div>
                      <div className="p-1.5 text-left pl-2">财务 {deptReview.deptReviews[5]?.checked ? '☑' : '☐'}</div>
                      <div className="p-1.5 truncate text-[11px]">{deptReview.deptReviews[5]?.result || '成本合规'}</div>
                      <div className="p-1.5 font-semibold">{deptReview.deptReviews[5]?.signature || '—'}</div>

                      {/* 行 4: 制造工程 vs CI */}
                      <div className="p-1.5 text-left pl-2">制造工程 {deptReview.deptReviews[6]?.checked ? '☑' : '☐'}</div>
                      <div className="p-1.5 truncate text-[11px]">{deptReview.deptReviews[6]?.result || '工艺合格'}</div>
                      <div className="p-1.5 font-semibold">{deptReview.deptReviews[6]?.signature || '—'}</div>
                      <div className="p-1.5 text-left pl-2">CI {deptReview.deptReviews[7]?.checked ? '☑' : '☐'}</div>
                      <div className="p-1.5 truncate text-[11px]">{deptReview.deptReviews[7]?.result || '通过'}</div>
                      <div className="p-1.5 font-semibold">{deptReview.deptReviews[7]?.signature || '—'}</div>
                    </div>
                  </div>

                  {/* 最终批准 (工厂运营经理) */}
                  <div className="p-2.5 flex items-center justify-between border-b border-black">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold">最终批准：</span>
                      <span>{deptReview.plantManagerApproval.isApproved === true ? '☑ 是  ☐ 否' : '☐ 是  ☑ 否'}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div>
                        <span className="font-bold">批准人：</span>
                        <span>{deptReview.plantManagerApproval.approver || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold">日期：</span>
                        <span className="font-mono">{deptReview.plantManagerApproval.approvalDate || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 三、变更实施 */}
                <div>
                  <div className="p-2 font-bold bg-slate-100 border-b border-black">三、变更实施</div>
                  <div className="p-2 border-b border-black flex items-center space-x-8">
                    <span className="font-bold">变更通知是否发布？</span>
                    <span>客户通知: {imp.customerNotice ? '☑ 是  ☐ 否' : '☐ 是  ☑ 否'}</span>
                    <span>内部通知: {imp.internalNotice ? '☑ 是  ☐ 否' : '☐ 是  ☑ 否'}</span>
                  </div>

                  <div className="p-2 border-b border-black space-y-1">
                    <div className="flex items-center space-x-6">
                      <span className="font-bold">PPAP是否批准（PSW签署）？</span>
                      <span>{imp.isPpapApproved ? '☑ 是  ☐ 否' : '☐ 是  ☑ 否'}</span>
                      {imp.pswSigner && (
                        <span className="text-[11px] text-slate-600">(签署人: {imp.pswSigner})</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className="font-bold">试生产是否完成？</span>
                      <span>
                        {imp.pilotRunStatus === 'COMPLETED'
                          ? '☐ 不适用  ☑ 是  ☐ 否'
                          : imp.pilotRunStatus === 'NOT_APPLICABLE'
                          ? '☑ 不适用  ☐ 是  ☐ 否'
                          : '☐ 不适用  ☐ 是  ☑ 否'}
                      </span>
                      {imp.pilotQuantity > 0 && (
                        <span className="text-[11px] text-slate-600 font-mono">
                          (批量: {imp.pilotQuantity}件, 合格率: {imp.pilotPassRate}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 四、变更实施批准 */}
                <div>
                  <div className="p-2 font-bold bg-slate-100 border-b border-black">四、变更实施批准</div>
                  <div className="p-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="font-bold">变更实施是否批准？</span>
                      <span>{imp.executionApproval.isApproved ? '☑ 是  ☐ 否' : '☐ 是  ☑ 否'}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div>
                        <span className="font-bold">批准人：</span>
                        <span>{imp.executionApproval.approver || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold">日期：</span>
                        <span className="font-mono">{imp.executionApproval.approvalDate || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 图2 FM-0002 变更评估实施确认表纸质还原 */
              <div className="border border-black text-[11px]">
                <div className="text-center py-2 bg-slate-100 font-bold text-xs border-b border-black tracking-wider">
                  变更评估内容和结果 & 变更实施计划表 (FM-0002)
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 divide-x divide-black border-b border-black text-center font-bold">
                      <th className="p-1 w-[12%]">评估内容</th>
                      <th className="p-1 w-[26%]">评估内容说明</th>
                      <th className="p-1 w-[8%] text-red-600">主导部门</th>
                      <th className="p-1 w-[8%] text-red-600">责任人</th>
                      <th className="p-1 w-[8%]">评估结论</th>
                      <th className="p-1 w-[22%]">实施内容</th>
                      <th className="p-1 w-[8%]">责任人</th>
                      <th className="p-1 w-[8%]">计划完成</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {activeMoc.fm0002Matrix.map((item, idx) => (
                      <tr key={item.id} className="divide-x divide-black">
                        <td className="p-1 font-semibold text-center">{item.category}</td>
                        <td className="p-1">{item.description}</td>
                        <td className="p-1 text-center">{item.leadDept}</td>
                        <td className="p-1 text-center">{item.evaluator}</td>
                        <td className="p-1 text-center font-semibold">
                          {item.conclusion === 'FEASIBLE'
                            ? '可行'
                            : item.conclusion === 'INFEASIBLE'
                            ? '不可行'
                            : item.conclusion === 'NOT_APPLICABLE'
                            ? '不适用'
                            : '待定'}
                        </td>
                        <td className="p-1 text-[10px]">{item.actionPlan || '—'}</td>
                        <td className="p-1 text-center text-[10px]">{item.actionOwner}</td>
                        <td className="p-1 text-center font-mono text-[10px]">{item.targetDate || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
