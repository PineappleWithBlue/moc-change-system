'use client';

import React, { useState, useMemo } from 'react';
import { useMoc } from '@/context/MocContext';
import { useRole } from '@/context/RoleContext';
import { useAuth } from '@/context/AuthContext';
import { FM0002Item, EvaluationConclusion, normalizeDeptKey } from '@/types/moc';
import { STAFF_DIRECTORY } from '@/lib/mocTemplate';
import { NotificationModal } from '@/components/NotificationModal';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
  Lock,
  Unlock,
  Mail,
  UserCheck,
} from 'lucide-react';

export const Module2MatrixFM0002: React.FC = () => {
  const { activeMoc, updateMoc } = useMoc();
  const { currentRole, setCurrentRole } = useRole();
  const { currentUser, isSuperUser, canEditFM0002, canReassign } = useAuth();


  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [reassignItem, setReassignItem] = useState<FM0002Item | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 方案 B 邮件通知弹窗状态
  const [notificationData, setNotificationData] = useState<{
    recipientName: string;
    recipientEmail: string;
    recipientRole: string;
    stageTitle: string;
    messageSummary: string;
    tasksCount?: number;
  } | null>(null);

  if (!activeMoc) return null;

  const matrix = activeMoc.fm0002Matrix || [];
  const canEdit = canEditFM0002();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 统计计算
  const stats = useMemo(() => {
    const total = matrix.length;
    const feasible = matrix.filter((i) => i.conclusion === 'FEASIBLE').length;
    const infeasible = matrix.filter((i) => i.conclusion === 'INFEASIBLE').length;
    const notApplicable = matrix.filter((i) => i.conclusion === 'NOT_APPLICABLE').length;
    const pending = matrix.filter((i) => i.conclusion === 'PENDING').length;
    const completed = matrix.filter((i) => i.isCompleted).length;
    const evaluated = matrix.filter((i) => i.conclusion !== 'PENDING').length;
    const completionRate = total > 0 ? Math.round((evaluated / total) * 100) : 0;
    return { total, feasible, infeasible, notApplicable, pending, completed, evaluated, completionRate };
  }, [matrix]);

  // 主导部门列表提取
  const deptList = useMemo(() => {
    const depts = new Set<string>();
    matrix.forEach((item) => {
      depts.add(item.leadDept);
    });
    return Array.from(depts);
  }, [matrix]);

  // 按分类分组
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, FM0002Item[]> = {};
    matrix.forEach((item) => {
      // 部门筛选
      if (selectedDeptFilter !== 'ALL' && item.leadDept !== selectedDeptFilter) {
        return;
      }
      // 关键字检索
      if (
        searchKeyword.trim() &&
        !item.description.toLowerCase().includes(searchKeyword.toLowerCase()) &&
        !item.category.toLowerCase().includes(searchKeyword.toLowerCase())
      ) {
        return;
      }
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [matrix, selectedDeptFilter, searchKeyword]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const expandAll = () => setCollapsedCategories({});
  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    matrix.forEach((i) => (all[i.category] = true));
    setCollapsedCategories(all);
  };

  const handleUpdateItem = (itemId: string, changes: Partial<FM0002Item>) => {
    const updatedMatrix = matrix.map((item) => {
      if (item.id === itemId) {
        return { ...item, ...changes };
      }
      return item;
    });
    updateMoc({
      ...activeMoc,
      fm0002Matrix: updatedMatrix,
    });
  };

  // 更换指派责任人 (Re-assign)
  const handleReassignEvaluator = (newStaffName: string, newStaffId: string) => {
    if (!reassignItem) return;
    handleUpdateItem(reassignItem.id, {
      evaluator: newStaffName,
      evaluatorId: newStaffId,
    });
    showToast(`已将《${reassignItem.description}》指派责任人更换为: ${newStaffName}`);
    setReassignItem(null);
  };

  // 确认并锁定单项评估结论
  const handleConfirmConclusion = (item: FM0002Item) => {
    handleUpdateItem(item.id, {
      isLocked: true,
      actionOwner: item.actionOwner || item.evaluator,
    });
    showToast(`已确认并锁定【${item.description}】的评估结论`);
  };

  // 解锁单项评估以便重新调整
  const handleUnlockConclusion = (item: FM0002Item) => {
    handleUpdateItem(item.id, {
      isLocked: false,
    });
    showToast(`已解锁【${item.description}】，可重新修改评估结论与行动计划`);
  };

  const handleToggleComplete = (itemId: string, currentState: boolean) => {
    const now = new Date().toISOString().split('T')[0];
    handleUpdateItem(itemId, {
      isCompleted: !currentState,
      completedDate: !currentState ? now : undefined,
      completedBy: !currentState ? '责任人已确认' : undefined,
    });
  };

  // 触发邮件通知弹窗 (方案 B: 预留通知按钮)
  const handleOpenNotifyModal = (type: 'all_evaluators' | 'dept_manager', deptName?: string) => {
    if (type === 'all_evaluators') {
      setNotificationData({
        recipientName: 'FM-0002 矩阵各部门责任人',
        recipientEmail: 'moc.evaluators@corp.example.com',
        recipientRole: '各职能协同评估代表',
        stageTitle: 'FM-0002 矩阵评估确认',
        messageSummary: `申请人已正式立项，请各主导部门责任人对 MOC 单据进行 13 大类专业评估并填报结论。`,
        tasksCount: matrix.filter((i) => i.conclusion === 'PENDING').length,
      });
    } else if (deptName) {
      const deptKey = normalizeDeptKey(deptName, activeMoc.application.applicantDept);
      const targetDeptReview = activeMoc.departmentReview.deptReviews.find((d) => d.deptKey === deptKey);
      const managerName = targetDeptReview?.assignedManager || `${deptName}部门经理`;

      setNotificationData({
        recipientName: managerName,
        recipientEmail: `${deptKey.toLowerCase()}.manager@corp.example.com`,
        recipientRole: `${deptName} 部门经理`,
        stageTitle: '部门评审与签字决策',
        messageSummary: `本部门负责的 FM-0002 矩阵各项评估已全部完成，请进入系统查阅评估结论并完成受控电子签名。`,
        tasksCount: matrix.filter(
          (i) => normalizeDeptKey(i.leadDept, activeMoc.application.applicantDept) === deptKey
        ).length,
      });
    }
  };

  const getConclusionBadge = (c: EvaluationConclusion) => {
    switch (c) {
      case 'FEASIBLE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'INFEASIBLE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'NOT_APPLICABLE':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div id="module3" className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* 模块头部 */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            3
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold tracking-wide">
                三、跨部门评估实施确认矩阵 (FM-0002 表单规范)
              </h2>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-blue-800/80 text-blue-200 font-mono">
                13大类 · {matrix.length} 个基线核查项
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              责任人评估完成后联动通知部门经理，全部结论完成后解锁对应部门签署
            </p>
          </div>
        </div>

        {/* 方案 B 预留通知按钮：一键通知各责任人 */}
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <button
            onClick={() => handleOpenNotifyModal('all_evaluators')}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
            title="方案 B: 预留通知按钮，向各部门评估责任人派发待办邮件"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>通知各责任人评估 (邮件)</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Toast 提示 */}
        {toastMsg && (
          <div className="p-3 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 顶部统计卡片与进度条 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-4 text-xs">
              <span className="font-semibold text-slate-700">评估结论完成度:</span>
              <span className="inline-flex items-center text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                可行: {stats.feasible}
              </span>
              <span className="inline-flex items-center text-amber-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-500" />
                待定: {stats.pending}
              </span>
              <span className="inline-flex items-center text-slate-500 font-medium">
                <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
                不适用: {stats.notApplicable}
              </span>
              {stats.infeasible > 0 && (
                <span className="inline-flex items-center text-rose-700 font-medium">
                  不可行: {stats.infeasible}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500">评估结论产出率:</span>
              <span className="font-bold text-blue-700 font-mono text-sm">{stats.completionRate}%</span>
              <span className="text-slate-400">
                ({stats.evaluated}/{stats.total} 项已结论)
              </span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {/* 过滤筛选条 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            <span className="text-slate-500 flex items-center shrink-0 pr-1">
              <Filter className="w-3.5 h-3.5 mr-1" /> 主导部门:
            </span>
            <button
              onClick={() => setSelectedDeptFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedDeptFilter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部 ({matrix.length})
            </button>
            {deptList.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDeptFilter(dept)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedDeptFilter === dept
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept} ({matrix.filter((i) => i.leadDept === dept).length})
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <input
              type="text"
              placeholder="搜索评估内容或大类..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="px-2.5 py-1 rounded border border-slate-300 text-xs focus:outline-none focus:border-blue-500 w-44"
            />
            <button
              onClick={expandAll}
              className="text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 border border-slate-200"
            >
              展开全部
            </button>
            <button
              onClick={collapseAll}
              className="text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-100 border border-slate-200"
            >
              收起全部
            </button>
          </div>
        </div>

        {/* 13大类展开折叠表格列表 */}
        <div className="space-y-3">
          {Object.keys(groupedByCategory).map((catName) => {
            const items = groupedByCategory[catName];
            const isCollapsed = !!collapsedCategories[catName];
            const catEvaluated = items.filter((i) => i.conclusion !== 'PENDING').length;
            const catLeadDept = items[0]?.leadDept || '相关部门';

            return (
              <div
                key={catName}
                className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs transition-all"
              >
                {/* 类别折叠头 */}
                <div className="bg-slate-100/90 hover:bg-slate-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between border-b border-slate-200 transition-colors gap-2">
                  <div
                    onClick={() => toggleCategory(catName)}
                    className="flex items-center space-x-2 cursor-pointer select-none"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="font-bold text-xs text-slate-800 tracking-wide">{catName}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      ({items.length} 个子项 · 主导: {catLeadDept})
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      结论就绪: <span className="font-semibold text-slate-800">{catEvaluated} / {items.length}</span>
                    </span>

                    {/* 方案 B: 类别完成后可通知部门经理 */}
                    {catEvaluated === items.length && (
                      <button
                        onClick={() => handleOpenNotifyModal('dept_manager', catLeadDept)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 flex items-center space-x-1"
                        title="通知该大类所属部门经理进行评审签字"
                      >
                        <Mail className="w-3 h-3 text-blue-600" />
                        <span>通知{catLeadDept}经理 (邮件)</span>
                      </button>
                    )}

                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        catEvaluated === items.length
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {catEvaluated === items.length ? '评估已完成' : '待评估'}
                    </span>
                  </div>
                </div>

                {/* 类别内表格 */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="py-2 px-3 w-[22%]">评估内容说明</th>
                          <th className="py-2 px-2 w-[14%]">主导部门/责任人</th>
                          <th className="py-2 px-2 w-[14%]">评估结论</th>
                          <th className="py-2 px-3 w-[26%]">实施内容 (行动计划)</th>
                          <th className="py-2 px-2 w-[12%]">计划完成</th>
                          <th className="py-2 px-2 w-[12%] text-center">状态确认</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item) => {
                          const isItemLocked = !!item.isLocked;
                          const canEditItem = isSuperUser || canEditFM0002(item.evaluatorId);
                          const canChangeItem = isSuperUser || canReassign() || currentUser.id === item.evaluatorId;
                          const canUnlockItem = isSuperUser || canChangeItem;

                          return (
                            <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                              {/* 评估内容说明 */}
                              <td className="py-2.5 px-3 font-medium text-slate-800 align-top">
                                <div className="flex items-start space-x-1.5">
                                  <span className="text-blue-600 font-mono text-[11px] mt-0.5">•</span>
                                  <span className="leading-snug">{item.description}</span>
                                </div>
                              </td>

                              {/* 主导部门 / 责任人 (支持申请人/当事人更换) */}
                              <td className="py-2.5 px-2 align-top">
                                <div className="font-semibold text-slate-700">{item.leadDept}</div>
                                <div className="text-[11px] text-slate-600 mt-0.5 flex items-center justify-between">
                                  <span className="truncate max-w-[85px]">{item.evaluator}</span>
                                  {canChangeItem && (
                                    <button
                                      onClick={() => setReassignItem(item)}
                                      className="text-[10px] text-blue-600 hover:text-blue-800 px-1 py-0.2 rounded border border-blue-200 bg-blue-50/70 shrink-0 ml-1"
                                      title="更换此项责任人"
                                    >
                                      更换
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* 评估结论与锁定 */}
                              <td className="py-2.5 px-2 align-top">
                                {isItemLocked ? (
                                  <div className="space-y-1">
                                    <span
                                      className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded border font-semibold ${getConclusionBadge(
                                        item.conclusion
                                      )}`}
                                    >
                                      <Lock className="w-3 h-3 mr-1 text-slate-500" />
                                      {item.conclusion === 'FEASIBLE'
                                        ? '可行'
                                        : item.conclusion === 'INFEASIBLE'
                                        ? '不可行'
                                        : item.conclusion === 'NOT_APPLICABLE'
                                        ? '不适用'
                                        : '待定'}
                                    </span>
                                    {canUnlockItem && (
                                      <div className="flex items-center">
                                        <button
                                          onClick={() => handleUnlockConclusion(item)}
                                          className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                                          title="解锁此项重新评估"
                                        >
                                          解锁修改
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <select
                                      disabled={!canEditItem}
                                      value={item.conclusion}
                                      onChange={(e) =>
                                        handleUpdateItem(item.id, {
                                          conclusion: e.target.value as EvaluationConclusion,
                                        })
                                      }
                                      className={`w-full text-[11px] px-2 py-1 rounded border font-semibold focus:outline-none ${
                                        !canEditItem ? 'opacity-80 cursor-not-allowed' : ''
                                      } ${getConclusionBadge(item.conclusion)}`}
                                    >
                                      <option value="FEASIBLE">可行</option>
                                      <option value="INFEASIBLE">不可行</option>
                                      <option value="NOT_APPLICABLE">不适用</option>
                                      <option value="PENDING">待定</option>
                                    </select>

                                    {item.conclusion !== 'PENDING' && canEditItem && (
                                      <button
                                        onClick={() => handleConfirmConclusion(item)}
                                        className="w-full text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center space-x-1 shadow-2xs"
                                        title="确认并锁定此项评估结论"
                                      >
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>确认锁定</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* 实施内容 (行动计划) */}
                              <td className="py-2.5 px-3 align-top">
                                {isItemLocked ? (
                                  <p className="text-[11px] text-slate-700 leading-snug">
                                    {item.actionPlan || <span className="text-slate-400 italic">按规范执行</span>}
                                  </p>
                                ) : (
                                  <textarea
                                    rows={2}
                                    disabled={!canEditItem}
                                    value={item.actionPlan}
                                    onChange={(e) => handleUpdateItem(item.id, { actionPlan: e.target.value })}
                                    placeholder={canEditItem ? '请输入具体实施行动内容、试验要求或文件编号...' : '待责任人填写计划'}
                                    className={`w-full text-[11px] p-1.5 rounded border ${
                                      canEditItem
                                        ? 'border-slate-200 focus:border-blue-500 focus:outline-none bg-white'
                                        : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'
                                    }`}
                                  />
                                )}
                              </td>

                              {/* 计划完成时间 */}
                              <td className="py-2.5 px-2 align-top">
                                {isItemLocked ? (
                                  <span className="text-[11px] text-slate-700 font-mono">
                                    {item.targetDate || '—'}
                                  </span>
                                ) : (
                                  <input
                                    type="date"
                                    disabled={!canEditItem}
                                    value={item.targetDate}
                                    onChange={(e) => handleUpdateItem(item.id, { targetDate: e.target.value })}
                                    className={`w-full text-[10px] px-1.5 py-1 rounded border font-mono ${
                                      canEditItem
                                        ? 'border-slate-200 bg-white'
                                        : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                    }`}
                                  />
                                )}
                                <div className="text-[10px] text-slate-400 mt-0.5">{item.actionOwner}</div>
                              </td>


                              {/* 变更实施确认 (Checkbox) */}
                              <td className="py-2.5 px-2 text-center align-top">
                                <button
                                  onClick={() => handleToggleComplete(item.id, item.isCompleted)}
                                  className={`inline-flex flex-col items-center justify-center p-1 rounded transition-colors ${
                                    item.isCompleted
                                      ? 'text-emerald-600 hover:text-emerald-700'
                                      : 'text-slate-300 hover:text-slate-500'
                                  }`}
                                  title={item.isCompleted ? '已确认完成，点击取消' : '点击确认实施完成'}
                                >
                                  {item.isCompleted ? (
                                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                                  )}
                                  <span className="text-[9px] mt-0.5">
                                    {item.isCompleted ? (
                                      <span className="text-emerald-700 font-semibold">已确认</span>
                                    ) : (
                                      <span className="text-slate-400">待完成</span>
                                    )}
                                  </span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 更换责任人弹窗/抽屉 */}
      {reassignItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900">
                指派/更换责任人: 《{reassignItem.description}》
              </span>
              <button onClick={() => setReassignItem(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              当前主导部门: <strong>{reassignItem.leadDept}</strong>，当前责任人: <strong>{reassignItem.evaluator}</strong>
            </p>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {STAFF_DIRECTORY.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => handleReassignEvaluator(staff.name, staff.id)}
                  className="w-full p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-left border border-slate-200 text-xs flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-800">{staff.name}</span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      {staff.title} ({staff.dept})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{staff.id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 方案 B 邮件通知预览弹窗 */}
      {notificationData && (
        <NotificationModal
          isOpen={!!notificationData}
          onClose={() => setNotificationData(null)}
          onConfirmSend={() => {
            showToast(`已成功向 ${notificationData.recipientName} 发送协同任务待办邮件通知`);
          }}
          recipientName={notificationData.recipientName}
          recipientEmail={notificationData.recipientEmail}
          recipientRole={notificationData.recipientRole}
          mocId={activeMoc.id}
          mocTitle={activeMoc.title}
          stageTitle={notificationData.stageTitle}
          messageSummary={notificationData.messageSummary}
          tasksCount={notificationData.tasksCount}
        />
      )}
    </div>
  );
};
