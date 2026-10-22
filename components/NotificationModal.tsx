'use client';

import React, { useState } from 'react';
import { Mail, Send, X, Check, CheckCircle2, User, Building, ExternalLink } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSend: () => void;
  recipientName: string;
  recipientEmail: string;
  recipientRole: string;
  mocId: string;
  mocTitle: string;
  stageTitle: string;
  messageSummary: string;
  tasksCount?: number;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onConfirmSend,
  recipientName,
  recipientEmail,
  recipientRole,
  mocId,
  mocTitle,
  stageTitle,
  messageSummary,
  tasksCount,
}) => {
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onConfirmSend();
        onClose();
      }, 1000);
    }, 600);
  };

  const subject = `【MOC工程变更协同待办】单号: ${mocId} - ${stageTitle}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden transform transition-all">
        {/* 顶部标题栏 */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold tracking-wide">发送协同待办通知邮件 (方案 B)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 邮件预览体 */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2 font-mono">
            <div className="flex items-center text-slate-500">
              <span className="w-16 font-semibold shrink-0">收件人:</span>
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {recipientName} ({recipientRole}) &lt;{recipientEmail}&gt;
              </span>
            </div>
            <div className="flex items-center text-slate-500">
              <span className="w-16 font-semibold shrink-0">抄 送:</span>
              <span className="text-slate-700">MOC管理办公室 (moc.pmo@corp.example.com)</span>
            </div>
            <div className="flex items-center text-slate-500">
              <span className="w-16 font-semibold shrink-0">主 题:</span>
              <span className="text-slate-900 font-bold">{subject}</span>
            </div>
          </div>

          {/* 邮件正文卡片 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  M
                </div>
                <span className="font-bold text-xs text-slate-800">工程变更协同系统 (Notification)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date().toISOString().replace('T', ' ').substring(0, 19)}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <p>
                尊敬的 <strong>{recipientName}</strong> 您好：
              </p>
              <p className="text-slate-600">
                工程变更单 <strong>{mocId}</strong> 当前已推进至 <strong>{stageTitle}</strong>，需要您或您团队进行协同处理。
              </p>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">变更单号:</span>
                  <span className="font-bold text-blue-700 font-mono">{mocId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">变更主题:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[280px]">{mocTitle}</span>
                </div>
                {tasksCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">相关任务项:</span>
                    <span className="font-semibold text-amber-700">{tasksCount} 项待办</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">待办要求:</span>
                  <span className="text-slate-800 font-medium">{messageSummary}</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs cursor-pointer hover:bg-blue-500">
                  <span>直达工作台办理</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            💡 本通知为方案 B 显式预留通知机制，测试环境触发后将记录协同通知时间戳，正式环境可无缝直连 Exchange / SendGrid 邮件引擎。
          </p>
        </div>

        {/* 底部按钮 */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white text-xs font-semibold transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSend}
            disabled={sending || sentSuccess}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-emerald-600 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            {sentSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>已成功派发通知</span>
              </>
            ) : sending ? (
              <span>发送中...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>确认发送通知邮件</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
