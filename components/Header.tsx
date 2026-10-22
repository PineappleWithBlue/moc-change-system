'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMoc } from '@/context/MocContext';
import {
  Factory,
  ChevronDown,
  UserCheck,
  Printer,
  PlusCircle,
  LayoutDashboard,
  Shield,
  KeyRound,
  Mail,
  Building,
} from 'lucide-react';

interface HeaderProps {
  onOpenPrintModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPrintModal }) => {
  const { currentUser, accounts, switchUser } = useAuth();
  const { activeMoc, activeMocId, setActiveMocId, createNewMoc, saving } = useMoc();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleAccountSelect = (accountId: string) => {
    switchUser(accountId);
    setAccountMenuOpen(false);
    const target = accounts.find((a) => a.id === accountId);
    if (target) {
      showNotice(`已切换登录身份: ${target.name} [工号 ${target.id}] - ${target.department}`);
    }
  };

  const handleNewMoc = async () => {
    try {
      await createNewMoc();
      showNotice('已开启新工程变更申请草稿，请选择申请部门并填报内容');
    } catch (e: any) {
      showNotice('新建失败: ' + (e?.message || '网络异常'));
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧：Logo 与系统标题 */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveMocId(null)}
              className="flex items-center space-x-2.5 text-left group focus:outline-none shrink-0"
              title="返回工程变更台账"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-inner group-hover:bg-blue-500 transition-colors">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base tracking-wide text-white group-hover:text-blue-200 transition-colors">
                工程变更管理系统
              </span>
            </button>

            {/* 面包屑导航 (详情页时紧凑显示，无长文本挤压) */}
            {activeMoc && (
              <div className="hidden sm:flex items-center pl-3 border-l border-slate-700 text-xs space-x-1.5 shrink-0">
                <button
                  onClick={() => setActiveMocId(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  台账
                </button>
                <span className="text-slate-600">/</span>
                <span
                  className={`font-mono font-semibold px-2 py-0.5 rounded border ${
                    activeMoc.isDraft || activeMoc.id === 'DRAFT_TEMP'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                      : 'bg-blue-950/70 text-blue-300 border-blue-800/60'
                  }`}
                >
                  {activeMoc.isDraft || activeMoc.id === 'DRAFT_TEMP' ? '待生成草稿' : activeMoc.id}
                </span>
              </div>
            )}
          </div>

          {/* 右侧操作按钮群与用户身份 */}
          <div className="flex items-center space-x-2.5">
            {/* 场景按钮：详情页时提供返回台账与打印，首页时提供新建 */}
            {activeMoc ? (
              <>
                {onOpenPrintModal && (
                  <button
                    onClick={onOpenPrintModal}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 border border-slate-700 transition-colors shrink-0"
                    title="预览/打印高保真纸质受控表单"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">纸质表单预览</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveMocId(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 border border-slate-700 transition-colors shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                  <span>返回台账</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleNewMoc}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white flex items-center space-x-1.5 transition-colors shadow-xs shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>新建工程变更</span>
              </button>
            )}

          {/* 右侧：测试环境身份切换 (模拟 Azure SSO 登录工号) */}
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className={`flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg border text-left transition-all ${
                currentUser.role === 'SUPER_USER'
                  ? 'bg-indigo-950/80 hover:bg-indigo-900 border-amber-500/60 shadow-xs ring-1 ring-amber-400/40'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ring-2 ${
                  currentUser.role === 'SUPER_USER'
                    ? 'bg-amber-500 text-slate-950 ring-amber-300'
                    : 'bg-blue-600 text-white ring-blue-400/50'
                }`}
              >
                {currentUser.avatarText}
              </div>
              <div className="text-left hidden sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs font-semibold ${currentUser.role === 'SUPER_USER' ? 'text-amber-200' : 'text-slate-100'}`}>
                    {currentUser.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                      currentUser.role === 'SUPER_USER'
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-700 text-slate-200 border-slate-600'
                    }`}
                  >
                    {currentUser.role === 'SUPER_USER' ? 'SuperUser' : currentUser.id}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{currentUser.department}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* 测试账号切换下拉面板 */}
            {accountMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAccountMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-88 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-700 text-xs text-slate-400 flex items-center justify-between">
                    <span className="font-semibold text-slate-200 flex items-center space-x-1">
                      <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                      <span>测试环境登录账号 (Azure SSO 模拟)</span>
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-mono">严格权限下放</span>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-700/50">
                    {accounts.map((acc) => {
                      const isSelected = currentUser.id === acc.id;
                      const isSuper = acc.role === 'SUPER_USER';
                      return (
                        <button
                          key={acc.id}
                          onClick={() => handleAccountSelect(acc.id)}
                          className={`w-full px-3 py-2.5 flex items-start space-x-3 text-left transition-colors ${
                            isSelected
                              ? isSuper
                                ? 'bg-amber-500/20 text-amber-200'
                                : 'bg-blue-600/20 text-blue-200'
                              : isSuper
                              ? 'bg-indigo-950/50 hover:bg-indigo-900/60'
                              : 'hover:bg-slate-750 hover:bg-slate-700/50'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                              isSuper
                                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                                : isSelected
                                ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {acc.avatarText}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-semibold ${
                                  isSuper ? 'text-amber-300 font-bold' : 'text-slate-100'
                                }`}
                              >
                                {acc.name}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
                                  isSuper
                                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                                    : 'text-slate-400 border-slate-600'
                                }`}
                              >
                                {acc.id}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {acc.title} · {acc.department}
                            </p>
                          </div>
                          {isSelected && (
                            <UserCheck
                              className={`w-4 h-4 shrink-0 mt-1 ${isSuper ? 'text-amber-400' : 'text-blue-400'}`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-3 py-2 border-t border-slate-700 bg-slate-850 text-[10px] text-slate-400 leading-tight">
                    💡 正式环境将对接 Azure Entra ID SSO；当前测试环境自动注入对应身份 Bearer Token 进行接口鉴权。
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>

      {/* 顶部操作提示 Toast */}
      {actionNotice && (
        <div className="bg-blue-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow transition-all flex items-center justify-center space-x-1">
          <span>{actionNotice}</span>
        </div>
      )}
    </header>
  );
};
