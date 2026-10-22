'use client';

import React, { useState } from 'react';
import { useMoc } from '@/context/MocContext';
import { Header } from '@/components/Header';
import { DashboardList } from '@/components/DashboardList';
import { MocDetailView } from '@/components/MocDetailView';
import { PrintReportModal } from '@/components/PrintReportModal';

export default function HomePage() {
  const { activeMocId, activeMoc } = useMoc();
  const [printModalOpen, setPrintModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 顶部全局导航栏与协作角色切换器 */}
      <Header onOpenPrintModal={() => setPrintModalOpen(true)} />

      {/* 主工作区 */}
      <main className="flex-1">
        {activeMocId && activeMoc ? (
          <MocDetailView onOpenPrintModal={() => setPrintModalOpen(true)} />
        ) : (
          <DashboardList />
        )}
      </main>

      {/* 纸质标准表单打印预览弹窗 */}
      <PrintReportModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
      />

      {/* 底部受控受审工业页脚 */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-4 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">企业级工程变更体系</span>
            <span>·</span>
            <span>受控程序文件: 504H0008 / 504H0340A08 / 504H0050</span>
          </div>
          <div className="text-[11px] font-mono">
            MOC Change Management Platform © 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
