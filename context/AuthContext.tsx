'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, AuthSession } from '@/types/auth';
import { RoleType } from '@/types/moc';
import { authService, TEST_ACCOUNTS } from '@/services/authService';

interface AuthContextType {
  currentUser: UserAccount;
  token: string;
  accounts: UserAccount[];
  switchUser: (accountId: string) => void;
  // 核心超级管理员标志
  isSuperUser: boolean;
  // 业务权限判定函数
  canEditApplication: () => boolean;
  canApproveDept: () => boolean;
  canSignDeptReview: (dept: { deptKey: string; assignedManagerId?: string; assignedManager?: string }) => boolean;
  canEvaluateEhs: () => boolean;
  canEditFM0002: (evaluatorId?: string) => boolean;
  canApprovePlant: () => boolean;
  canApprovePsw: () => boolean;
  canApproveFinal: () => boolean;
  canReassign: () => boolean;
  // 兼容老字段
  currentRole: RoleType;
  currentRoleInfo: UserAccount;
  setCurrentRole: (role: RoleType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function userMatchesDept(userDept = '', deptKey = ''): boolean {
  const key = deptKey.toUpperCase();
  const d = userDept.toUpperCase();
  if (key === 'RD' && (d.includes('研发') || d.includes('R&D') || d.includes('RD'))) return true;
  if (key === 'QA' && (d.includes('质量') || d.includes('QUALITY') || d.includes('QA'))) return true;
  if (key === 'PRD' && (d.includes('生产') || d.includes('PRD') || d.includes('车间'))) return true;
  if (key === 'PUR' && (d.includes('采购') || d.includes('PUR'))) return true;
  if (key === 'SCM' && (d.includes('供应链') || d.includes('SCM') || d.includes('计划'))) return true;
  if (key === 'FIN' && (d.includes('财务') || d.includes('FIN') || d.includes('FI'))) return true;
  if (key === 'ME' && (d.includes('制造') || d.includes('ME') || d.includes('工程'))) return true;
  if (key === 'CI' && (d.includes('持续改善') || d.includes('CI') || d.includes('精益'))) return true;
  return false;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>(authService.getCurrentSession());

  useEffect(() => {
    setSession(authService.getCurrentSession());
  }, []);

  const switchUser = (accountId: string) => {
    const newSession = authService.switchAccount(accountId);
    setSession(newSession);
  };

  const setCurrentRole = (role: RoleType) => {
    const target = TEST_ACCOUNTS.find((a) => a.role === role);
    if (target) {
      switchUser(target.id);
    }
  };

  const user = session.user;
  const isSuperUser = user.role === 'SUPER_USER';

  // 岗位业务权限严格判定 (选项 1：严格按部门/工号精准绑定 + SuperUser 全权代签)
  const canEditApplication = () => isSuperUser || user.role === 'APPLICANT';
  
  const canApproveDept = () => isSuperUser || user.role === 'DEPT_MANAGER';

  // 8 大部门评审卡片签署权判定 (高合规精准绑定)
  const canSignDeptReview = (dept: { deptKey: string; assignedManagerId?: string; assignedManager?: string }) => {
    if (isSuperUser) return true;
    if (dept.assignedManagerId && user.id === dept.assignedManagerId) return true;
    if (user.role === 'DEPT_MANAGER' && userMatchesDept(user.department, dept.deptKey)) return true;
    return false;
  };

  const canEvaluateEhs = () => isSuperUser || user.role === 'EHS_SPECIALIST';

  const canEditFM0002 = (evaluatorId?: string) => {
    if (isSuperUser) return true;
    if (evaluatorId && user.id === evaluatorId) return true;
    return user.role === 'CROSS_EVALUATOR' || user.role === 'APPLICANT';
  };

  const canApprovePlant = () => isSuperUser || user.role === 'PLANT_MANAGER';

  const canApprovePsw = () =>
    isSuperUser ||
    user.role === 'QUALITY_MANAGER' ||
    (user.role === 'DEPT_MANAGER' && (user.id === 'EMP-QA-001' || userMatchesDept(user.department, 'QA')));

  const canApproveFinal = () =>
    isSuperUser ||
    user.role === 'QUALITY_MANAGER' ||
    user.role === 'PLANT_MANAGER' ||
    (user.role === 'DEPT_MANAGER' && (user.id === 'EMP-QA-001' || userMatchesDept(user.department, 'QA')));

  const canReassign = () => isSuperUser || user.role === 'APPLICANT';

  return (
    <AuthContext.Provider
      value={{
        currentUser: user,
        token: session.token,
        accounts: TEST_ACCOUNTS,
        switchUser,
        isSuperUser,
        canEditApplication,
        canApproveDept,
        canSignDeptReview,
        canEvaluateEhs,
        canEditFM0002,
        canApprovePlant,
        canApprovePsw,
        canApproveFinal,
        canReassign,
        currentRole: user.role,
        currentRoleInfo: user,
        setCurrentRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 保持对 useRole 的向后兼容性
export const useRole = useAuth;
