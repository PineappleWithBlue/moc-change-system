'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MocRecord, MocStatus, MocSummaryStats, MocListQuery } from '@/types/moc';
import { mocApi } from '@/services/mocApi';
import { useAuth } from '@/context/AuthContext';
import { createTemporaryDraftMoc } from '@/lib/mocTemplate';

interface MocContextType {
  records: MocRecord[];
  stats: MocSummaryStats;
  activeMocId: string | null;
  activeMoc: MocRecord | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  setActiveMocId: (id: string | null) => void;
  fetchRecords: (query?: MocListQuery) => Promise<void>;
  updateMoc: (updated: MocRecord, autoPersist?: boolean) => Promise<void>;
  saveCurrentMoc: () => Promise<boolean>;
  createNewMoc: (title?: string) => Promise<string>;
  saveDraft: (record?: MocRecord) => Promise<string>;
  submitToReview: (record?: MocRecord) => Promise<string>;
  deleteMoc: (id: string) => Promise<boolean>;
  advanceStage: (id: string) => Promise<void>;
  setStage: (id: string, stage: number, newStatus?: MocStatus) => Promise<void>;
}

const initialStats: MocSummaryStats = {
  total: 0,
  deptReview: 0,
  ehsReview: 0,
  fm0002Review: 0,
  plantApproval: 0,
  implementing: 0,
  closed: 0,
};

const MocContext = createContext<MocContextType | undefined>(undefined);

export const MocProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<MocRecord[]>([]);
  const [stats, setStats] = useState<MocSummaryStats>(initialStats);
  const [activeMocId, _setActiveMocId] = useState<string | null>(null);
  const [activeDraft, setActiveDraft] = useState<MocRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 从后端 API 拉取真实变更台账
  const fetchRecords = useCallback(async (query?: MocListQuery) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mocApi.getMocList(query);
      setRecords(data.list);
      setStats(data.stats);
    } catch (err: any) {
      console.error('Failed to fetch MOC records from API:', err);
      setError(err?.message || '无法连接后台获取数据');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // 包装 setActiveMocId：若离开未保存的草稿，自动丢弃草稿，零污染数据库
  const setActiveMocId = (id: string | null) => {
    if (activeMocId === 'DRAFT_TEMP' && id !== 'DRAFT_TEMP') {
      setActiveDraft(null);
    }
    _setActiveMocId(id);
  };

  // 当前激活的 MOC 单据（草稿态返回 activeDraft，已入库单据从 records 匹配）
  const activeMoc =
    activeMocId === 'DRAFT_TEMP'
      ? activeDraft
      : records.find((r) => r.id === activeMocId) || null;

  // 更新变更单 (针对草稿仅更新前端内存，针对已入库单据视 autoPersist 决定是否同步后端)
  const updateMoc = async (updated: MocRecord, autoPersist = true) => {
    if (updated.isDraft || updated.id === 'DRAFT_TEMP' || activeMocId === 'DRAFT_TEMP') {
      setActiveDraft(updated);
      return;
    }

    // 立即更新前端本地列表，保障交互极速响应
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

    if (autoPersist) {
      setSaving(true);
      try {
        const saved = await mocApi.updateMoc(updated);
        setRecords((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
      } catch (err: any) {
        console.error('Failed to persist MOC to backend:', err);
        setError(err?.message || '保存变更单失败');
      } finally {
        setSaving(false);
      }
    }
  };

  // 显式手动保存当前单据
  const saveCurrentMoc = async (): Promise<boolean> => {
    if (!activeMoc) return false;
    try {
      await saveDraft(activeMoc);
      return true;
    } catch (err) {
      return false;
    }
  };

  /**
   * 点击新建工程变更单（工业级方案2）：
   * 在前端内存中初始化纯草稿，单号标记为待生成，不调用后端写库，不产生任何跳号与脏记录
   */
  const createNewMoc = async (title?: string): Promise<string> => {
    const draft = createTemporaryDraftMoc(title, currentUser.name, currentUser.department);
    setActiveDraft(draft);
    _setActiveMocId('DRAFT_TEMP');
    return 'DRAFT_TEMP';
  };

  /**
   * 保存草稿（方案A之一）：
   * 若为未入库草稿，根据所选部门原子化分配 MOC-[DEPT]-YYYY-XXXX 正式单号并持久化入库，状态为 DRAFT；
   * 若为已入库单据，则同步更新保存。
   */
  const saveDraft = async (customRecord?: MocRecord): Promise<string> => {
    const target = customRecord || activeMoc;
    if (!target) throw new Error('无活跃变更单');

    setSaving(true);
    setError(null);
    try {
      if (target.isDraft || target.id === 'DRAFT_TEMP' || activeMocId === 'DRAFT_TEMP') {
        // 第一次正式入库：原子占号并持久化
        const newRecord = await mocApi.createMoc({
          title: target.title,
          applicant: target.application.applicant,
          applicantDept: target.application.applicantDept,
          initialRecord: {
            ...target,
            status: 'DRAFT',
            currentStage: 1,
          },
        });

        setRecords((prev) => [newRecord, ...prev]);
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          deptReview: prev.deptReview + 1,
        }));
        setActiveDraft(null);
        _setActiveMocId(newRecord.id);
        return newRecord.id;
      } else {
        // 已有正式编号：直接更新
        const saved = await mocApi.updateMoc(target);
        setRecords((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
        return saved.id;
      }
    } catch (err: any) {
      console.error('Failed to save draft MOC:', err);
      setError(err?.message || '保存草稿失败');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  /**
   * 提交进入评审（方案A之二）：
   * 分配单号（若未分配）并将流程正式推入阶段二（二、各部门评审），状态变更为 DEPT_REVIEW。
   */
  const submitToReview = async (customRecord?: MocRecord): Promise<string> => {
    const target = customRecord || activeMoc;
    if (!target) throw new Error('无活跃变更单');

    setSaving(true);
    setError(null);
    try {
      if (target.isDraft || target.id === 'DRAFT_TEMP' || activeMocId === 'DRAFT_TEMP') {
        const newRecord = await mocApi.createMoc({
          title: target.title,
          applicant: target.application.applicant,
          applicantDept: target.application.applicantDept,
          initialRecord: {
            ...target,
            status: 'DEPT_REVIEW',
            currentStage: 2,
          },
        });

        setRecords((prev) => [newRecord, ...prev]);
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          deptReview: prev.deptReview + 1,
        }));
        setActiveDraft(null);
        _setActiveMocId(newRecord.id);
        return newRecord.id;
      } else {
        const updated: MocRecord = {
          ...target,
          status: 'DEPT_REVIEW',
          currentStage: 2,
        };
        const saved = await mocApi.updateMoc(updated);
        setRecords((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
        return saved.id;
      }
    } catch (err: any) {
      console.error('Failed to submit MOC to review:', err);
      setError(err?.message || '提交进入评审失败');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // 删除变更单
  const deleteMoc = async (id: string): Promise<boolean> => {
    if (id === 'DRAFT_TEMP') {
      setActiveDraft(null);
      _setActiveMocId(null);
      return true;
    }

    setSaving(true);
    setError(null);
    try {
      const success = await mocApi.deleteMoc(id);
      if (success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        if (activeMocId === id) {
          _setActiveMocId(null);
        }
        await fetchRecords();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to delete MOC:', err);
      setError(err?.message || '删除变更单失败');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // 设定业务阶段
  const setStage = async (id: string, stage: number, newStatus?: MocStatus) => {
    const moc = activeMocId === id ? activeMoc : records.find((r) => r.id === id);
    if (!moc) return;

    let derivedStatus: MocStatus = moc.status;
    if (newStatus) {
      derivedStatus = newStatus;
    } else {
      switch (stage) {
        case 1:
          derivedStatus = 'DEPT_REVIEW';
          break;
        case 2:
          derivedStatus = 'EHS_REVIEW';
          break;
        case 3:
          derivedStatus = 'FM0002_EVALUATION';
          break;
        case 4:
          derivedStatus = 'PLANT_APPROVAL';
          break;
        case 5:
          derivedStatus = 'IMPLEMENTING';
          break;
        case 6:
          derivedStatus = 'PILOT_RUN';
          break;
        default:
          break;
      }
    }

    const updated = {
      ...moc,
      currentStage: stage,
      status: derivedStatus,
    };

    await updateMoc(updated, true);
  };

  // 推进到下一阶段
  const advanceStage = async (id: string) => {
    const moc = activeMocId === id ? activeMoc : records.find((r) => r.id === id);
    if (!moc) return;
    const nextStage = Math.min(6, moc.currentStage + 1);
    await setStage(id, nextStage);
  };

  return (
    <MocContext.Provider
      value={{
        records,
        stats,
        activeMocId,
        activeMoc,
        loading,
        saving,
        error,
        setActiveMocId,
        fetchRecords,
        updateMoc,
        saveCurrentMoc,
        createNewMoc,
        saveDraft,
        submitToReview,
        deleteMoc,
        advanceStage,
        setStage,
      }}
    >
      {children}
    </MocContext.Provider>
  );
};

export const useMoc = (): MocContextType => {
  const context = useContext(MocContext);
  if (!context) {
    throw new Error('useMoc must be used within a MocProvider');
  }
  return context;
};
