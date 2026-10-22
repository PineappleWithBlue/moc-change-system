'use client';

import React, { useState } from 'react';
import { useMoc } from '@/context/MocContext';
import { useAuth } from '@/context/AuthContext';
import { AttachmentItem } from '@/types/moc';
import { DEPARTMENT_OPTIONS } from '@/lib/mocTemplate';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  FileCode,
  Paperclip,
  Upload,
  Trash2,
  Building2,
  User,
  Save,
  Send,
  Loader2,
  Clock,
  Lock,
} from 'lucide-react';

export const Module1Application: React.FC = () => {
  const { activeMoc, updateMoc, saveDraft, submitToReview, saving } = useMoc();
  const { currentUser, accounts, switchUser, isSuperUser, canEditApplication } = useAuth();

  const [operationMsg, setOperationMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!activeMoc) return null;

  const app = activeMoc.application;
  const isApplicant = canEditApplication();
  const isDraftMode = activeMoc.isDraft || activeMoc.id === 'DRAFT_TEMP' || activeMoc.status === 'DRAFT';
  // 变更提报流转到下一阶段后（Stage > 1），申请内容全量受控锁定，不可篡改
  const isApplicationLocked = activeMoc.currentStage > 1;
  const canEdit = isSuperUser || (isApplicant && !isApplicationLocked);


  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setOperationMsg({ text, type });
    setTimeout(() => setOperationMsg(null), 4000);
  };

  const handleTitleChange = (val: string) => {
    updateMoc({
      ...activeMoc,
      title: val,
    });
  };

  const handleDeptChange = (val: string) => {
    updateMoc({
      ...activeMoc,
      application: {
        ...app,
        applicantDept: val,
      },
    });
  };

  const handleReasonChange = (val: string) => {
    updateMoc({
      ...activeMoc,
      application: {
        ...app,
        changeReason: val,
      },
    });
  };

  const handleStateDescChange = (side: 'current' | 'proposed', val: string) => {
    if (side === 'current') {
      updateMoc({
        ...activeMoc,
        application: {
          ...app,
          currentState: {
            ...app.currentState,
            description: val,
          },
        },
      });
    } else {
      updateMoc({
        ...activeMoc,
        application: {
          ...app,
          proposedState: {
            ...app.proposedState,
            description: val,
          },
        },
      });
    }
  };

  // 统一 Reference Item 单一附件栏上传处理
  const handleReferenceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let fileType: 'drawing' | 'image' | 'document' | 'report' = 'document';
    if (['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext)) fileType = 'image';
    else if (['dwg', 'dxf', 'step', 'stp', 'igs'].includes(ext)) fileType = 'drawing';
    else if (['pdf', 'doc', 'docx', 'xlsx'].includes(ext)) fileType = 'report';

    const newAttachment: AttachmentItem = {
      id: `att-ref-${Date.now()}`,
      name: file.name,
      type: fileType,
      size: sizeMb,
      uploadTime: new Date().toISOString().split('T')[0],
    };

    const currentRefs = app.referenceAttachments || [];
    updateMoc({
      ...activeMoc,
      application: {
        ...app,
        referenceAttachments: [...currentRefs, newAttachment],
      },
    });
    // 重置 input 以便能再次上传相同文件
    e.target.value = '';
    showNotice(`已添加参考附件: ${file.name}`);
  };

  const handleRemoveReferenceAttachment = (attId: string) => {
    const currentRefs = app.referenceAttachments || [];
    updateMoc({
      ...activeMoc,
      application: {
        ...app,
        referenceAttachments: currentRefs.filter((a) => a.id !== attId),
      },
    });
    showNotice('已移除参考附件');
  };

  // 保存草稿（方案A之一：分配/沿用单号并落盘保存）
  const handleSaveDraft = async () => {
    try {
      const assignedId = await saveDraft();
      showNotice(`变更单草稿已成功保存，系统正式单号: ${assignedId}`);
    } catch (e: any) {
      showNotice(e?.message || '保存草稿失败', 'error');
    }
  };

  // 提交进入评审（方案A之二：分配单号并流转至阶段二）
  const handleSubmitReview = async () => {
    if (!activeMoc.title.trim()) {
      showNotice('请先填写变更主题名称后再提交评审', 'error');
      return;
    }
    if (!app.changeReason.trim()) {
      showNotice('请先填写更改原因（目的）后再提交评审', 'error');
      return;
    }
    try {
      const assignedId = await submitToReview();
      showNotice(`变更申请提交成功！单号: ${assignedId}，已正式进入【二、各部门评审】阶段`);
    } catch (e: any) {
      showNotice(e?.message || '提交评审失败', 'error');
    }
  };

  const referenceAttachments = app.referenceAttachments || [];

  return (
    <div id="module1" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* 模块标题栏：一、变更申请 */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            1
          </span>
          <h2 className="text-sm font-bold tracking-wide">一、变更申请</h2>
        </div>
        <div className="flex items-center space-x-2 mt-1 sm:mt-0">
          <span className="text-xs text-slate-400 font-mono">变更管理编号:</span>
          {isDraftMode ? (
            <span className="bg-amber-950/70 text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded border border-amber-600/60 shadow-inner">
              [待生成草稿]
            </span>
          ) : (
            <span className="bg-blue-950 text-blue-300 font-mono font-bold text-xs px-2.5 py-1 rounded border border-blue-700/60 shadow-inner">
              {activeMoc.id}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* 权限提示条：非申请人且非管理员 */}
        {!isSuperUser && !isApplicant && (
          <div className="bg-slate-100 border border-slate-300 text-slate-700 rounded-lg p-3 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                当前登录身份（<strong>{currentUser.name}</strong> - {currentUser.department}）非变更申请人，仅支持只读查阅。
              </span>
            </div>
            <button
              onClick={() => {
                const applicantAcc = accounts.find((a) => a.role === 'APPLICANT');
                if (applicantAcc) switchUser(applicantAcc.id);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline shrink-0 font-medium ml-2"
            >
              一键切换为申请人 (张工)
            </button>
          </div>
        )}

        {/* 阶段锁定警示条 */}
        {isApplicationLocked && (
          <div
            className={`rounded-lg p-3 text-xs flex items-center space-x-2.5 shadow-2xs ${
              isSuperUser
                ? 'bg-indigo-50 border border-indigo-300 text-indigo-900'
                : 'bg-amber-50 border border-amber-300 text-amber-900'
            }`}
          >
            <Lock className={`w-4 h-4 shrink-0 ${isSuperUser ? 'text-indigo-600' : 'text-amber-600'}`} />
            <span>
              {isSuperUser ? (
                <>
                  <strong>【超级管理员特权模式】</strong>当前单据虽已流转进入后续阶段（Stage {activeMoc.currentStage}），但作为 SuperUser 您享有强制编辑与重写特权。
                </>
              ) : (
                <>
                  <strong>已归档受控锁定：</strong>本变更申请已正式立项并流转进入后续阶段（当前阶段：{activeMoc.currentStage}）。根据质量受控体系规范，申请源头信息已全量锁定，不可再篡改。
                </>
              )}
            </span>
          </div>
        )}


        {/* 操作消息提示 Toast */}
        {operationMsg && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-center space-x-2 ${
              operationMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}
          >
            {operationMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{operationMsg.text}</span>
          </div>
        )}

        {/* 基础信息区 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">变更主题名称 *</label>
            <input
              type="text"
              value={activeMoc.title}
              disabled={!canEdit}
              placeholder="请输入本次工程变更的简明主题..."
              onChange={(e) => handleTitleChange(e.target.value)}
              className={`w-full text-xs font-medium px-3 py-2 rounded border focus:outline-none transition-colors ${
                canEdit
                  ? 'bg-white border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
              申请更改部门 *
            </label>
            <select
              value={app.applicantDept}
              disabled={!canEdit}
              onChange={(e) => handleDeptChange(e.target.value)}
              className={`w-full text-xs px-3 py-2 rounded border focus:outline-none transition-colors ${
                canEdit
                  ? 'bg-white border-slate-300 focus:border-blue-500 text-slate-800 font-medium'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept.code} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">保存时将依此部门分配专属前缀</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
              申请人 / 申请日期
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={app.applicant}
                disabled
                className="w-1/2 text-xs px-2.5 py-2 rounded border bg-slate-100 border-slate-200 text-slate-700 font-medium"
              />
              <input
                type="text"
                value={app.applyDate}
                disabled
                className="w-1/2 text-xs px-2.5 py-2 rounded border bg-slate-100 border-slate-200 text-slate-700 font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>更改原因（目的）:</span>
              <span className="text-[11px] text-slate-400 font-normal">请清晰阐明变更触发点（如质量改进、工艺降本、客户需求等）</span>
            </label>
            <textarea
              rows={2}
              value={app.changeReason}
              disabled={!canEdit}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder="请输入本次工程变更的具体原因、背景与预期目的..."
              className={`w-full text-xs p-3 rounded-lg border focus:outline-none transition-colors ${
                canEdit
                  ? 'bg-white border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400'
                  : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* 双栏图文对比器：现有状态 VS 更改后状态 (纯双栏，去除参数对照表与冗余文字) */}
        <div>
          <div className="mb-2.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <FileCode className="w-4 h-4 mr-1 text-blue-600" />
              现有状态 VS 更改后状态
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左栏：现有状态 (Current State) */}
            <div className="border border-amber-200 bg-amber-50/20 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-amber-200 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    现有状态 (Current State)
                  </span>
                  <span className="text-[11px] text-slate-400">变更前基线版本</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">方案与技术现状描述:</label>
                  <textarea
                    rows={4}
                    value={app.currentState.description}
                    disabled={!canEdit}
                    onChange={(e) => handleStateDescChange('current', e.target.value)}
                    placeholder="请详细描述现有工艺、结构、材料或图纸现状及存在的痛点..."
                    className={`w-full text-xs p-2.5 rounded-lg border leading-relaxed ${
                      canEdit ? 'bg-white border-amber-200 focus:border-amber-500' : 'bg-slate-100 border-slate-200'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 右栏：更改后状态 (Proposed State) */}
            <div className="border border-blue-200 bg-blue-50/20 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-blue-200 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    更改后状态 (Proposed State)
                  </span>
                  <span className="text-[11px] text-slate-400">变更后目标版本</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">目标方案与预期改动描述:</label>
                  <textarea
                    rows={4}
                    value={app.proposedState.description}
                    disabled={!canEdit}
                    onChange={(e) => handleStateDescChange('proposed', e.target.value)}
                    placeholder="请详细阐述更改后的目标设计、工艺优化方案、技术参数调整..."
                    className={`w-full text-xs p-2.5 rounded-lg border leading-relaxed ${
                      canEdit ? 'bg-white border-blue-200 focus:border-blue-500' : 'bg-slate-100 border-slate-200'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 统一单一 Reference Item 栏目 (不设更改前后对比附件) */}
        <div className="border border-slate-200 rounded-xl bg-slate-50/60 p-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 mb-3 gap-2">
            <div className="flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-bold text-slate-800">Reference Item (参考项 / 参考物料与附件)</span>
              <span className="text-[11px] text-slate-400">
                (已上传 {referenceAttachments.length} 个参考技术文件/图纸)
              </span>
            </div>

            {canEdit && (
              <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-600 text-xs font-medium cursor-pointer flex items-center space-x-1.5 shadow-xs transition-colors">
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>上传参考文件 (2D/3D图纸、技术规格书等)</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleReferenceFileUpload}
                  accept=".pdf,.dwg,.dxf,.step,.stp,.igs,.png,.jpg,.jpeg,.doc,.docx,.xlsx"
                />
              </label>
            )}
          </div>

          {referenceAttachments.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-white/60 rounded-lg border border-dashed border-slate-200">
              暂无参考物料附件。申请人可上传相关工程图纸 (DWG/STEP/PDF)、技术说明或实验报告作为本次变更的依据。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {referenceAttachments.map((att) => (
                <div
                  key={att.id}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between space-x-2 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate" title={att.name}>
                        {att.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {att.size} · {att.uploadTime}
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleRemoveReferenceAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                      title="移除附件"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部业务流转控制卡片：保存草稿 与 提交进入评审 (满足方案 A，移除原部门经理签字) */}
        <div className="border border-slate-200 rounded-xl bg-slate-50/90 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-700">当前流程状态:</span>
              {isDraftMode ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  <Clock className="w-3 h-3 mr-1" />
                  草稿编辑中 (未入库分配正式编号)
                </span>
              ) : activeMoc.currentStage === 1 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                  <Clock className="w-3 h-3 mr-1" />
                  草稿已立项保存 ({activeMoc.id})，待提交评审
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已转入阶段二：各部门评审进行中
                </span>
              )}
            </div>

            {isApplicationLocked && !isSuperUser ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>申请源头已受控锁定 (不可修改)</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving || (!canEdit && !isSuperUser)}
                  className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-colors disabled:opacity-60 ${
                    isSuperUser && isApplicationLocked
                      ? 'bg-indigo-700 hover:bg-indigo-600 text-white border border-indigo-400'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isDraftMode
                      ? '保存草稿 (正式分配单号)'
                      : isSuperUser && isApplicationLocked
                      ? '【超级管理员特权保存】'
                      : '保存草稿修改'}
                  </span>
                </button>

                {(!isApplicationLocked || isSuperUser) && (
                  <button
                    onClick={handleSubmitReview}
                    disabled={saving || (!canEdit && !isSuperUser)}
                    className={`px-4 py-2 rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-colors ${
                      isSuperUser && isApplicationLocked
                        ? 'bg-indigo-800 hover:bg-indigo-700 border border-indigo-400'
                        : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>
                      {isSuperUser && isApplicationLocked
                        ? '【特权重新流转】进入评审'
                        : '提交进入评审 (转入阶段二)'}
                    </span>
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
