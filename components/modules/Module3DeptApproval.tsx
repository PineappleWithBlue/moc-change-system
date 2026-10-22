'use client';

import React, { useState } from 'react';
import { useMoc } from '@/context/MocContext';
import { useRole } from '@/context/RoleContext';
import { useAuth } from '@/context/AuthContext';
import { DeptReviewItem, normalizeDeptKey } from '@/types/moc';
import { STAFF_DIRECTORY } from '@/lib/mocTemplate';
import { NotificationModal } from '@/components/NotificationModal';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertTriangle,
  UserCheck,
  ArrowRight,
  Stamp,
  Lock,
  Unlock,
  Mail,
  UserPlus,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Module3DeptApproval: React.FC = () => {
  const { activeMoc, updateMoc, setStage } = useMoc();
  const { currentRole, setCurrentRole } = useRole();
  const {
    currentUser,
    accounts,
    switchUser,
    isSuperUser,
    canSignDeptReview,
    canEvaluateEhs,
    canApprovePlant,
    canReassign,
  } = useAuth();

  const [reassignDeptKey, setReassignDeptKey] = useState<string | null>(null);
  const [notificationTarget, setNotificationTarget] = useState<DeptReviewItem | null>(null);
  const [noticeToast, setNoticeToast] = useState<string | null>(null);

  if (!activeMoc) return null;

  const deptReview = activeMoc.departmentReview;
  const ehs = deptReview.ehs;
  const plantApproval = deptReview.plantManagerApproval;

  const isEhsRole = canEvaluateEhs();
  const isPlantManager = canApprovePlant();


  const showToast = (msg: string) => {
    setNoticeToast(msg);
    setTimeout(() => setNoticeToast(null), 3500);
  };

  // 更新 EHS
  const handleUpdateEhs = (changes: Partial<typeof ehs>) => {
    const updated = {
      ...activeMoc,
      departmentReview: {
        ...deptReview,
        ehs: {
          ...ehs,
          ...changes,
        },
      },
    };
    updateMoc(updated);
  };

  const handleEhsSign = (feasible: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const evaluatorName = isSuperUser
      ? `${currentUser.name} (超级管理员特权代签)`
      : '王工 (EHS安全主管)';
    handleUpdateEhs({
      isFeasible: feasible,
      isProcessApplied: true,
      evaluator: evaluatorName,
      evalDate: today,
      remarks: feasible
        ? (ehs.remarks || '符合集团 504H0340A08 EHS管理体系与机械电气作业安全标准，未发现新增危险源与职业健康隐患。')
        : (ehs.remarks || '存在潜在安全防护与化学品排放风险，未通过EHS评审。'),
    });
    showToast(isSuperUser ? '超级管理员已特权代签 EHS 安全评估' : 'EHS 专员已完成安全环保受控签名');
  };

  // 更新 8 部门评审项
  const handleUpdateDeptReview = (deptKey: string, changes: Partial<DeptReviewItem>) => {
    const updatedList = deptReview.deptReviews.map((item) => {
      if (item.deptKey === deptKey) {
        return { ...item, ...changes };
      }
      return item;
    });

    updateMoc({
      ...activeMoc,
      departmentReview: {
        ...deptReview,
        deptReviews: updatedList,
      },
    });
  };

  // 更换指派的部门经理 (Re-assign)
  const handleReassignManager = (deptKey: string, newManagerName: string, newManagerId: string) => {
    handleUpdateDeptReview(deptKey, {
      assignedManager: newManagerName,
      assignedManagerId: newManagerId,
    });
    setReassignDeptKey(null);
    showToast(`已更换 ${deptKey} 部门指派经理为: ${newManagerName} [${newManagerId}]`);
  };

  // 点击受控电子签名 (Click-to-sign, 免手输)
  const handleSignDept = (deptKey: string) => {
    const targetDept = deptReview.deptReviews.find((d) => d.deptKey === deptKey);
    if (!targetDept) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const assignedName = targetDept.assignedManager || `${targetDept.deptName.split(' ')[0]}经理`;
    const signName = isSuperUser
      ? `${currentUser.name} (代签: ${assignedName})`
      : assignedName;

    handleUpdateDeptReview(deptKey, {
      checked: true,
      signature: signName,
      signDate: today,
      signTimestamp: `${today} ${timeStr}`,
      isLocked: true,
      result: targetDept.result || '经专业评审，本部门评估项可行，同意按计划实施。',
    });
    showToast(
      isSuperUser
        ? `【特权代签成功】超级管理员已代签 ${targetDept.deptName}`
        : `${targetDept.deptName} 部门经理 [${signName}] 已成功完成受控电子签名！`
    );
  };

  // 撤销签名 (重新编辑)
  const handleUnlockDept = (deptKey: string) => {
    handleUpdateDeptReview(deptKey, {
      isLocked: false,
      checked: false,
    });
    showToast(`已解除 ${deptKey} 部门评审锁定，可重新填写与签批`);
  };

  // 工厂运营经理最终批准
  const handlePlantManagerSign = (approved: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const approverName = isSuperUser
      ? `${currentUser.name} (超级管理员特权核准)`
      : '赵总 (工厂运营经理)';
    const updated = {
      ...activeMoc,
      departmentReview: {
        ...deptReview,
        plantManagerApproval: {
          isApproved: approved,
          approver: approverName,
          approvalDate: today,
          comments:
            plantApproval.comments ||
            (approved
              ? '经综合评估EHS可行性与各部门专业评审意见，方案严谨，准予工程变更实施并启动PPAP验证。'
              : '多项跨部门意见尚未闭环，驳回重新论证。'),
        },
      },
      status: approved ? ('IMPLEMENTING' as const) : ('REJECTED' as const),
      currentStage: approved ? 5 : 4,
    };
    updateMoc(updated);
    showToast(
      approved
        ? (isSuperUser ? '超级管理员特权核准完成！变更单已进入实施跟踪与PPAP阶段' : '工厂运营经理核准完成！变更单已进入实施跟踪与PPAP阶段')
        : '已退回变更申请'
    );
  };


  // 统计所有部门是否已完成签署
  const signedCount = deptReview.deptReviews.filter((d) => d.checked).length;
  const allDeptsSigned = signedCount === deptReview.deptReviews.length;

  return (
    <div id="module2" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* 模块标题栏 */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            2
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold tracking-wide">二、各部门评审与最终批准</h2>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-blue-800/80 text-blue-200 font-mono">
                平行协同 · 强管控联动
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              FM-0002 矩阵评估完成后联动解锁对应部门经理受控电子签署，8 部门全签批后解锁工厂总监核准
            </p>
          </div>
        </div>

        {/* 状态统计指示 */}
        <div className="flex items-center space-x-3 text-xs mt-2 sm:mt-0">
          <span className="text-slate-300">
            部门签署进度: <strong className="text-blue-300 font-mono">{signedCount} / {deptReview.deptReviews.length}</strong>
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              allDeptsSigned ? 'bg-emerald-800 text-emerald-200' : 'bg-amber-900/80 text-amber-300'
            }`}
          >
            {allDeptsSigned ? '全部门已签批' : '评审进行中'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Toast 提示 */}
        {noticeToast && (
          <div className="p-3 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{noticeToast}</span>
          </div>
        )}

        {/* 1. EHS 专项评估 */}
        <div className="border border-emerald-200 bg-emerald-50/20 rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-emerald-200 mb-3 gap-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-slate-900">EHS 专项安全与合规评估 (王工)</span>
              {ehs.isFeasible === true ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> EHS已核准通过
                </span>
              ) : ehs.isFeasible === false ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                  <XCircle className="w-3 h-3 mr-1" /> 不可行 (驳回)
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  待EHS评估
                </span>
              )}
            </div>

            {!isEhsRole && !isSuperUser && (
              <button
                onClick={() => {
                  const ehsAcc = accounts.find((a) => a.role === 'EHS_SPECIALIST');
                  if (ehsAcc) switchUser(ehsAcc.id);
                  else setCurrentRole('EHS_SPECIALIST');
                }}
                className="text-xs px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center space-x-1"
                title="切换登录为王工"
              >
                <span>一键切换为 王工 签评</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <span className="font-medium text-slate-700">1. EHS 评估是否可行？</span>
              <div className="flex space-x-3">
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="ehsFeasible"
                    disabled={!isEhsRole}
                    checked={ehs.isFeasible === true}
                    onChange={() => handleUpdateEhs({ isFeasible: true })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-800">可行</span>
                </label>
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="ehsFeasible"
                    disabled={!isEhsRole}
                    checked={ehs.isFeasible === false}
                    onChange={() => handleUpdateEhs({ isFeasible: false })}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs font-medium text-slate-800">不可行</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
              <span className="font-medium text-slate-700">2. 是否按照集团EHS流程 (504H0340A08) 实施？</span>
              <div className="flex space-x-3">
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="ehsProcess"
                    disabled={!isEhsRole}
                    checked={ehs.isProcessApplied === true}
                    onChange={() => handleUpdateEhs({ isProcessApplied: true })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-800">是</span>
                </label>
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="ehsProcess"
                    disabled={!isEhsRole}
                    checked={ehs.isProcessApplied === false}
                    onChange={() => handleUpdateEhs({ isProcessApplied: false })}
                    className="text-slate-600 focus:ring-slate-500"
                  />
                  <span className="text-xs font-medium text-slate-800">否</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">EHS 评估意见/安全措施:</label>
              <input
                type="text"
                disabled={!isEhsRole}
                value={ehs.remarks}
                onChange={(e) => handleUpdateEhs({ remarks: e.target.value })}
                placeholder={isEhsRole ? '请填写EHS专业评估意见与防护措施说明...' : '待EHS专员填写意见'}
                className="w-full text-xs px-3 py-2 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col justify-end">
              {isEhsRole ? (
                <button
                  onClick={() => handleEhsSign(true)}
                  className={`px-3 py-2 rounded-lg text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors ${
                    isSuperUser
                      ? 'bg-indigo-700 hover:bg-indigo-600 border border-indigo-400'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  <Stamp className="w-3.5 h-3.5" />
                  <span>{isSuperUser ? '【超级管理员特权代签】EHS生效' : '王工 EHS签名确认 (生效)'}</span>
                </button>
              ) : (
                <div className="text-xs bg-white p-2 rounded border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">评估人: </span>
                    <span className="font-semibold text-slate-800">{ehs.evaluator || '—'}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">{ehs.evalDate || '待评'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. 各部门评审矩阵 (8个关键职能) - 强管控联动 + 选项1精准权限下放 + 点击受控电子签名 */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                各部门评审矩阵 (8个关键职能)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              各职能经理需登录对应账号方可签署；或由超级管理员 (SuperUser) 特权代签
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {deptReview.deptReviews.map((dept) => {
              // 强管控联动：统计本部门在 FM-0002 矩阵中的所有子项
              const deptKey = dept.deptKey;
              const fmItems = activeMoc.fm0002Matrix.filter(
                (item) => normalizeDeptKey(item.leadDept, activeMoc.application.applicantDept) === deptKey
              );
              const totalFm = fmItems.length;
              const completedFm = fmItems.filter((i) => i.conclusion !== 'PENDING').length;
              const isFmReady = totalFm === 0 || completedFm === totalFm;

              const isSigned = dept.checked && dept.isLocked;
              const assignedManagerName = dept.assignedManager || `${dept.deptName.split(' ')[0]}经理`;
              const assignedManagerId = dept.assignedManagerId || '';
              const hasDeptSignPermission = canSignDeptReview(dept);
              const canChangeManager = isSuperUser || canReassign() || currentUser.id === dept.assignedManagerId;

              return (
                <div
                  key={dept.deptKey}
                  className={`p-4 rounded-xl border transition-all ${
                    isSigned
                      ? 'border-emerald-300 bg-emerald-50/15 shadow-2xs'
                      : isFmReady
                      ? 'border-blue-200 bg-blue-50/20'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  {/* 卡片头部：部门名称、指派经理与更换按钮 */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{dept.deptName}</span>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        <span>指派经理:</span>
                        <strong className="text-slate-800 font-semibold">{assignedManagerName}</strong>
                        {!isSigned && canChangeManager && (
                          <button
                            onClick={() => setReassignDeptKey(dept.deptKey)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 ml-1 underline"
                            title="更换指派的部门经理"
                          >
                            更换
                          </button>
                        )}
                      </div>
                    </div>

                    {/* FM-0002 联动进度指示 */}
                    <div>
                      {totalFm > 0 ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                            isFmReady
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          FM-0002: {completedFm}/{totalFm} {isFmReady ? '已完成' : '待评估'}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          无需矩阵项
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 经理更换抽屉下拉 */}
                  {reassignDeptKey === dept.deptKey && (
                    <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between font-semibold text-blue-900 text-[11px]">
                        <span>请选择指派给哪位经理:</span>
                        <button
                          onClick={() => setReassignDeptKey(null)}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                        {STAFF_DIRECTORY.map((staff) => (
                          <button
                            key={staff.id}
                            onClick={() => handleReassignManager(dept.deptKey, staff.name, staff.id)}
                            className="p-1.5 rounded bg-white hover:bg-blue-100 text-left border border-slate-200 text-[11px] truncate"
                          >
                            <strong>{staff.name}</strong> ({staff.dept})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 评审意见输入 */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        {dept.deptName.split(' ')[0]}部门评审结论与指导意见:
                      </label>
                      <input
                        type="text"
                        disabled={isSigned || (!hasDeptSignPermission && !isSuperUser)}
                        value={dept.result}
                        onChange={(e) => handleUpdateDeptReview(dept.deptKey, { result: e.target.value })}
                        placeholder={
                          isSigned
                            ? ''
                            : hasDeptSignPermission
                            ? `请输入 ${assignedManagerName} 的专业评审意见...`
                            : `仅限 ${assignedManagerName} 填写与签批`
                        }
                        className={`w-full text-xs px-2.5 py-1.5 rounded border transition-colors ${
                          isSigned
                            ? 'bg-slate-100 border-slate-200 text-slate-700'
                            : hasDeptSignPermission
                            ? 'bg-white border-slate-300 focus:outline-none focus:border-blue-500'
                            : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    {/* 签名操作区域：严格权限下放 + 点击受控电子签名 与 方案 B 预留通知按钮 */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {isSigned ? (
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={`flex items-center space-x-2 border px-2.5 py-1 rounded-md text-[11px] ${
                              dept.signature.includes('超级管理员')
                                ? 'text-indigo-900 bg-amber-50 border-amber-300'
                                : 'text-emerald-800 bg-emerald-100/70 border-emerald-300'
                            }`}
                          >
                            <Stamp className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>
                              <strong>受控电子签名生效:</strong> {dept.signature} (
                              <span className="font-mono">{dept.signTimestamp || dept.signDate}</span>)
                            </span>
                          </div>
                          {(isSuperUser || hasDeptSignPermission) && (
                            <button
                              onClick={() => handleUnlockDept(dept.deptKey)}
                              className="text-[10px] text-slate-400 hover:text-slate-600 underline shrink-0 ml-2"
                              title="撤销签名重新编辑"
                            >
                              撤销重签
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          {/* 方案 B: 预留通知按钮 */}
                          <button
                            onClick={() => setNotificationTarget(dept)}
                            className="px-2 py-1 rounded text-[11px] bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center space-x-1 transition-colors"
                            title="发送邮件待办通知给该部门经理"
                          >
                            <Mail className="w-3 h-3 text-blue-500" />
                            <span>通知经理 (邮件)</span>
                          </button>

                          {/* 严格权限下放：无权限则置灰拦截，有权限则按联动进度解锁 */}
                          {!hasDeptSignPermission ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                仅限 {assignedManagerName} 签署 (当前无权限)
                              </span>
                              <button
                                onClick={() => {
                                  const targetAcc =
                                    accounts.find((a) => a.id === dept.assignedManagerId) ||
                                    accounts.find(
                                      (a) =>
                                        a.role === 'DEPT_MANAGER' &&
                                        a.department.toUpperCase().includes(dept.deptKey)
                                    );
                                  if (targetAcc) {
                                    switchUser(targetAcc.id);
                                    showToast(`已切换身份为: ${targetAcc.name} [${targetAcc.id}]`);
                                  }
                                }}
                                className="text-[10px] text-blue-600 hover:text-blue-800 underline px-1 py-0.5"
                                title={`一键切换为 ${assignedManagerName}`}
                              >
                                切换为该经理
                              </button>
                            </div>
                          ) : isFmReady ? (
                            <button
                              onClick={() => handleSignDept(dept.deptKey)}
                              className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors ${
                                isSuperUser
                                  ? 'bg-indigo-700 hover:bg-indigo-600 border border-indigo-400'
                                  : 'bg-blue-600 hover:bg-blue-500'
                              }`}
                            >
                              <Stamp className="w-3.5 h-3.5" />
                              <span>{isSuperUser ? '【超级管理员特权代签】' : '点击确认签署 (留下签名)'}</span>
                            </button>
                          ) : isSuperUser ? (
                            <button
                              onClick={() => handleSignDept(dept.deptKey)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors border border-indigo-400"
                              title="超级管理员特权代签 (即使FM-0002尚未完成)"
                            >
                              <Stamp className="w-3.5 h-3.5 text-amber-300" />
                              <span>【特权代签】(FM-0002待完)</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                              <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>尚有 {totalFm - completedFm} 项 FM-0002 待责任人完成，暂不可签署</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. 工厂运营经理【最终批准卡片】 (8 部门全签署后方可解锁，SuperUser 可全权特权核准) */}
        <div
          className={`border-2 rounded-xl p-4 transition-all ${
            allDeptsSigned || isSuperUser
              ? 'border-rose-300 bg-rose-50/20'
              : 'border-slate-200 bg-slate-50/50 opacity-90'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-rose-200/60 mb-3 gap-2">
            <div className="flex items-center space-x-2">
              <Stamp className="w-5 h-5 text-rose-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  工厂运营经理 最终批准卡片 (核心决策人: 赵总)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {allDeptsSigned
                    ? '全部 8 个部门评审均已受控签署完毕，请工厂运营经理核准变更是否正式准予下达实施'
                    : isSuperUser
                    ? `全部 8 个部门尚未全签 (${signedCount} / 8)，但 SuperUser 拥有最高特权可直接核准或代签`
                    : `需等待全部 8 个部门评审签署完毕后解锁核准 (当前已签: ${signedCount} / 8)`}
                </span>
              </div>
            </div>

            {!isPlantManager && !isSuperUser && (
              <button
                onClick={() => {
                  const opsAcc = accounts.find((a) => a.role === 'PLANT_MANAGER');
                  if (opsAcc) switchUser(opsAcc.id);
                  else setCurrentRole('PLANT_MANAGER');
                }}
                className="text-xs px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 transition-colors flex items-center space-x-1"
                title="一键切换角色为赵总"
              >
                <span>一键切换为 赵总 审批</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">工厂运营经理批准决议:</label>
              <textarea
                rows={2}
                disabled={(!isPlantManager && !isSuperUser) || (!allDeptsSigned && !isSuperUser)}
                value={plantApproval.comments}
                onChange={(e) =>
                  updateMoc({
                    ...activeMoc,
                    departmentReview: {
                      ...deptReview,
                      plantManagerApproval: { ...plantApproval, comments: e.target.value },
                    },
                  })
                }
                placeholder={
                  !allDeptsSigned && !isSuperUser
                    ? '待 8 大关键职能部门全部签署后，由工厂运营经理输入决议...'
                    : '经综合评估EHS可行性与各部门专业评审意见，准予工程变更正式实施...'
                }
                className="w-full text-xs p-2.5 rounded-lg border border-rose-200 focus:border-rose-500 focus:outline-none bg-white leading-relaxed"
              />
            </div>

            <div className="flex flex-col justify-end">
              {plantApproval.isApproved === true ? (
                <div className="text-xs bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-emerald-800 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>变更已获最终批准 (准予实施)</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between">
                    <span>批准人: {plantApproval.approver}</span>
                    <span className="font-mono">{plantApproval.approvalDate}</span>
                  </div>
                </div>
              ) : !allDeptsSigned && !isSuperUser ? (
                <div className="text-xs bg-slate-100 p-3 rounded-lg border border-slate-200 text-slate-500 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>尚有 {8 - signedCount} 个职能部门未签署，决策卡片锁定中</span>
                </div>
              ) : isPlantManager || isSuperUser ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePlantManagerSign(true)}
                    className={`flex-1 px-3.5 py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors ${
                      isSuperUser && !allDeptsSigned
                        ? 'bg-indigo-700 hover:bg-indigo-600 border border-indigo-400'
                        : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isSuperUser && !allDeptsSigned
                        ? '【特权强行核准】准予实施'
                        : isSuperUser
                        ? '【超级管理员特权核准】'
                        : '核准通过 (下达实施)'}
                    </span>
                  </button>
                  <button
                    onClick={() => handlePlantManagerSign(false)}
                    className="px-3 py-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs transition-colors"
                  >
                    驳回
                  </button>
                </div>
              ) : (
                <div className="text-xs bg-slate-100 p-2.5 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">核准人: </span>
                    <span className="font-semibold text-slate-800">赵总 (运营总监)</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">待签批</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 方案 B 邮件通知弹窗 */}
      {notificationTarget && (
        <NotificationModal
          isOpen={!!notificationTarget}
          onClose={() => setNotificationTarget(null)}
          onConfirmSend={() => {
            showToast(`已向 ${notificationTarget.assignedManager || '部门经理'} 成功发送协同评审邮件待办通知`);
          }}
          recipientName={notificationTarget.assignedManager || `${notificationTarget.deptName.split(' ')[0]}经理`}
          recipientEmail={`${notificationTarget.deptKey.toLowerCase()}.manager@corp.example.com`}
          recipientRole={`${notificationTarget.deptName} 主管`}
          mocId={activeMoc.id}
          mocTitle={activeMoc.title}
          stageTitle="各部门评审与最终批准"
          messageSummary="请对该变更方案及 FM-0002 矩阵评估结果进行职能专业评审并完成受控电子签名。"
        />
      )}
    </div>
  );
};
