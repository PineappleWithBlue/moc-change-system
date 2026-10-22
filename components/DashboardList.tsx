'use client';

import React, { useState, useMemo } from 'react';
import { useMoc } from '@/context/MocContext';
import { useAuth } from '@/context/AuthContext';
import { MocStatus } from '@/types/moc';
import {
  Factory,
  Search,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Layers,
  ChevronRight,
  Filter,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

export const DashboardList: React.FC = () => {
  const { records, stats, setActiveMocId, createNewMoc, deleteMoc, loading, error, fetchRecords } = useMoc();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // 过滤后的列表
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      // 关键字搜索
      const matchSearch =
        searchTerm.trim() === '' ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.application.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.application.applicantDept.toLowerCase().includes(searchTerm.toLowerCase());

      // 状态筛选
      if (statusFilter === 'ALL') return matchSearch;
      if (statusFilter === 'ACTIVE') return matchSearch && item.status !== 'CLOSED';
      if (statusFilter === 'CLOSED') return matchSearch && item.status === 'CLOSED';
      return matchSearch && item.status === statusFilter;
    });
  }, [records, searchTerm, statusFilter]);

  const getStatusBadge = (status: MocStatus) => {
    switch (status) {
      case 'DRAFT':
        return { text: '草稿提报', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'DEPT_REVIEW':
        return { text: '各部门评审中', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'EHS_REVIEW':
        return { text: 'EHS评估中', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'FM0002_EVALUATION':
        return { text: '跨部门评估中', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'PLANT_APPROVAL':
        return { text: '待工厂核准', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'IMPLEMENTING':
        return { text: '实施与PPAP中', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'PILOT_RUN':
        return { text: '试生产验证中', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'CLOSED':
        return { text: '已结案归档', color: 'bg-emerald-600 text-white border-emerald-700' };
      case 'REJECTED':
        return { text: '已驳回', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { text: '流转中', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 顶部欢迎卡片 */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-700">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">工程变更管理控制台</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              工程变更闭环管理：变更提报 ➔ 各部门评审 ➔ 跨部门13大类矩阵实施计划 ➔ 实施跟踪与通知 ➔ PPAP/PSW验证 ➔ 试生产与最终归档。
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchRecords()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="刷新台账列表"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <button
              onClick={() => createNewMoc()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>新建工程变更单</span>
            </button>
          </div>
        </div>
      </div>

      {/* 错误提示条 */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>数据请求提示: {error}</span>
          </div>
          <button
            onClick={() => fetchRecords()}
            className="text-xs text-rose-700 font-semibold underline hover:text-rose-900"
          >
            点击重试
          </button>
        </div>
      )}

      {/* 核心指标统计卡片群 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-1 ring-blue-500'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] text-slate-400 font-medium">变更总台账</div>
          <div className="text-xl font-bold font-mono mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-1">全周期记录</div>
        </button>

        <button
          onClick={() => setStatusFilter('DEPT_REVIEW')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'DEPT_REVIEW'
              ? 'bg-purple-900 text-white border-purple-800 shadow-md ring-1 ring-purple-400'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] text-purple-600 font-medium">待初审</div>
          <div className="text-xl font-bold font-mono text-purple-700 mt-1">{stats.deptReview}</div>
          <div className="text-[10px] text-slate-400 mt-1">部门经理签批</div>
        </button>

        <button
          onClick={() => setStatusFilter('EHS_REVIEW')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'EHS_REVIEW'
              ? 'bg-emerald-900 text-white border-emerald-800 shadow-md ring-1 ring-emerald-400'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] text-emerald-600 font-medium">EHS 评估</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">{stats.ehsReview}</div>
          <div className="text-[10px] text-slate-400 mt-1">安全合规审核</div>
        </button>

        <button
          onClick={() => setStatusFilter('FM0002_EVALUATION')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'FM0002_EVALUATION'
              ? 'bg-amber-900 text-white border-amber-800 shadow-md ring-1 ring-amber-400'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] text-amber-600 font-medium">跨部门评估</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">{stats.fm0002Review}</div>
          <div className="text-[10px] text-slate-400 mt-1">FM-0002 矩阵</div>
        </button>

        <button
          onClick={() => setStatusFilter('PLANT_APPROVAL')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'PLANT_APPROVAL'
              ? 'bg-rose-900 text-white border-rose-800 shadow-md ring-1 ring-rose-400'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] text-rose-600 font-medium">待工厂核准</div>
          <div className="text-xl font-bold font-mono text-rose-700 mt-1">{stats.plantApproval}</div>
          <div className="text-[10px] text-slate-400 mt-1">运营经理赵总</div>
        </button>

        <button
          onClick={() => setStatusFilter('IMPLEMENTING')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'IMPLEMENTING'
              ? 'bg-blue-900 text-white border-blue-800 shadow-md ring-1 ring-blue-400'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] text-blue-600 font-medium">实施与验证</div>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">{stats.implementing}</div>
          <div className="text-[10px] text-slate-400 mt-1">PPAP / 试产</div>
        </button>

        <button
          onClick={() => setStatusFilter('CLOSED')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'CLOSED'
              ? 'bg-emerald-950 text-white border-emerald-900 shadow-md ring-1 ring-emerald-400'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-[11px] text-slate-500 font-medium">已结案归档</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">{stats.closed}</div>
          <div className="text-[10px] text-slate-400 mt-1">闭环达成</div>
        </button>
      </div>

      {/* 搜索与过滤工具栏 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜索变更管理编号、标题、申请人或部门..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> 状态筛选:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">全部状态 ({records.length})</option>
            <option value="ACTIVE">流转进行中</option>
            <option value="DEPT_REVIEW">待部门初审</option>
            <option value="EHS_REVIEW">EHS评估中</option>
            <option value="FM0002_EVALUATION">跨部门评估中</option>
            <option value="PLANT_APPROVAL">待工厂批准</option>
            <option value="IMPLEMENTING">实施跟踪与PPAP</option>
            <option value="CLOSED">已结案归档</option>
          </select>
        </div>
      </div>

      {/* 加载中状态 */}
      {loading && records.length === 0 && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-3 bg-slate-100 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* 变更台账清单卡片列表 */}
      {!loading && filteredRecords.length > 0 && (
        <div className="space-y-3">
          {filteredRecords.map((item) => {
            const badge = getStatusBadge(item.status);
            const stagePct = Math.round((item.currentStage / 6) * 100);

            return (
              <div
                key={item.id}
                onClick={() => setActiveMocId(item.id)}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-[320px]">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                        {item.id}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${badge.color}`}>
                        {badge.text}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        更新于: {item.updatedAt}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {item.application.changeReason || '未填写更改原因说明'}
                    </p>
                  </div>

                  {/* 阶段进度条 */}
                  <div className="w-48 shrink-0 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">业务闭环进度:</span>
                      <span className="font-bold text-blue-700 font-mono">
                        第 {item.currentStage}/6 阶段 ({stagePct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.status === 'CLOSED' ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${stagePct}%` }}
                      />
                    </div>
                  </div>

                  {/* 操作按键 */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确认删除工程变更单 ${item.id} 吗？`)) {
                          deleteMoc(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="删除记录"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 卡片底栏信息 */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center space-x-4">
                    <span>
                      申请人: <strong className="text-slate-700">{item.application.applicant}</strong> ({item.application.applicantDept})
                    </span>
                    <span>申请日期: <strong className="font-mono text-slate-700">{item.application.applyDate}</strong></span>
                    {item.departmentReview.plantManagerApproval.isApproved && (
                      <span className="text-emerald-700 font-semibold">✓ 工厂运营经理已核准</span>
                    )}
                    {item.implementation.isPpapApproved && (
                      <span className="text-cyan-700 font-semibold">✓ PPAP/PSW已签署</span>
                    )}
                  </div>

                  <div className="text-blue-600 font-semibold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>进入工作台办理</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 真实空状态展示 (无任何假数据) */}
      {!loading && filteredRecords.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-800">台账中暂无工程变更记录</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              当前测试环境数据库已就绪。点击下方按钮即可发起首张工程变更申请，系统将自动基于 FM-0002 工业标准创建包含 13 大类空白评估框架的正式单据。
            </p>
          </div>
          <button
            onClick={() => createNewMoc()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>发起首份工程变更申请 (MOC)</span>
          </button>
        </div>
      )}
    </div>
  );
};
