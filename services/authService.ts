import { UserAccount, AuthSession } from '@/types/auth';
import { AUTH_TOKEN_KEY, CURRENT_USER_KEY } from '@/lib/apiClient';

// 测试环境企业账号列表 (覆盖超级管理员、申请人、8大职能部门主管、EHS、跨部门评估人与工厂运营总监)
export const TEST_ACCOUNTS: UserAccount[] = [
  {
    id: 'EMP-ADMIN-001',
    name: '系统超级管理员 (SuperUser)',
    email: 'admin.superuser@corp.example.com',
    department: '质量与数字化管理委员会 (PMO / IT)',
    role: 'SUPER_USER',
    title: '超级管理员 / 全流程无阻断特权管控',
    avatarText: '超',
    badgeColor: 'bg-indigo-900 text-amber-300 border-amber-400',
  },
  {
    id: 'EMP-RD-101',
    name: '张工',
    email: 'zhang.engineer@corp.example.com',
    department: '研发部 (R&D)',
    role: 'APPLICANT',
    title: '产品主管工程师 / 变更主导提报人',
    avatarText: '张',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  // 8 大职能部门经理 (严格按部门/工号精准绑定签批)
  {
    id: 'EMP-RD-001',
    name: '李经理',
    email: 'li.manager@corp.example.com',
    department: '研发部 (R&D)',
    role: 'DEPT_MANAGER',
    title: '研发部门经理',
    avatarText: '李',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 'EMP-QA-001',
    name: '周经理',
    email: 'zhou.quality@corp.example.com',
    department: '质量部 (Quality)',
    role: 'QUALITY_MANAGER',
    title: '质量保证经理 / 部门签批 & PSW核决人',
    avatarText: '周',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    id: 'EMP-PRD-001',
    name: '吴主管',
    email: 'wu.prd@corp.example.com',
    department: '生产部 (PRD)',
    role: 'DEPT_MANAGER',
    title: '生产车间主任 / 生产部主管',
    avatarText: '吴',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'EMP-PUR-001',
    name: '孙主管',
    email: 'sun.pur@corp.example.com',
    department: '采购部 (PUR)',
    role: 'DEPT_MANAGER',
    title: '战略采购主管 / 采购部经理',
    avatarText: '孙',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'EMP-SCM-001',
    name: '郑主管',
    email: 'zheng.scm@corp.example.com',
    department: '供应链部 (SCM)',
    role: 'DEPT_MANAGER',
    title: '计划与物料主管 / SCM经理',
    avatarText: '郑',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  {
    id: 'EMP-FIN-001',
    name: '陈主管',
    email: 'chen.fin@corp.example.com',
    department: '财务部 (FIN)',
    role: 'DEPT_MANAGER',
    title: '成本与税务主管 / 财务部经理',
    avatarText: '陈',
    badgeColor: 'bg-slate-200 text-slate-800 border-slate-400',
  },
  {
    id: 'EMP-ME-001',
    name: '刘主管',
    email: 'liu.me@corp.example.com',
    department: '制造工程部 (ME)',
    role: 'DEPT_MANAGER',
    title: '制造工程主管 / ME经理',
    avatarText: '刘',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  {
    id: 'EMP-CI-001',
    name: '黄专员',
    email: 'huang.ci@corp.example.com',
    department: '持续改善部 (CI)',
    role: 'DEPT_MANAGER',
    title: '精益改善主管 / CI负责人',
    avatarText: '黄',
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-300',
  },
  {
    id: 'EMP-EHS-201',
    name: '王工',
    email: 'wang.ehs@corp.example.com',
    department: 'EHS部 (环境健康安全)',
    role: 'EHS_SPECIALIST',
    title: 'EHS安全主管工程师',
    avatarText: '王',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'EMP-ME-301',
    name: '陈代表 / 跨部门团队',
    email: 'chen.evaluator@corp.example.com',
    department: '跨部门评审组 (ME/QE/SCM/采购/财务)',
    role: 'CROSS_EVALUATOR',
    title: '工程与职能评审专员',
    avatarText: '评',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'EMP-OPS-001',
    name: '赵总',
    email: 'zhao.director@corp.example.com',
    department: '工厂运营部 (Operations)',
    role: 'PLANT_MANAGER',
    title: '工厂运营总监 / 核心决策人',
    avatarText: '赵',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
];


function toBase64(str: string): string {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
    return btoa(encodeURIComponent(str));
  } catch {
    return 'token_hash';
  }
}

/**
 * 模拟生成带身份签名的 JWT Bearer Token (测试环境使用)
 * 正式环境将通过 Azure Entra ID MSAL 获取真实的 Bearer ID Token
 */
function createMockJwtToken(account: UserAccount): string {
  const header = toBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64(
    JSON.stringify({
      sub: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      department: account.department,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7天有效
    })
  );
  const signature = toBase64(`sig_${account.id}_${Date.now()}`);
  return `${header}.${payload}.${signature}`;
}

export const authService = {
  getTestAccounts(): UserAccount[] {
    return TEST_ACCOUNTS;
  },

  getCurrentSession(): AuthSession {
    if (typeof window === 'undefined') {
      const defaultUser = TEST_ACCOUNTS[0];
      return {
        user: defaultUser,
        token: createMockJwtToken(defaultUser),
        expiresAt: Date.now() + 86400000,
      };
    }

    try {
      const savedUserStr = localStorage.getItem(CURRENT_USER_KEY);
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);

      if (savedUserStr && savedToken) {
        const user = JSON.parse(savedUserStr);
        return {
          user,
          token: savedToken,
          expiresAt: Date.now() + 86400000,
        };
      }
    } catch (e) {
      console.error('Failed to parse auth session:', e);
    }

    // 默认以申请人张工身份登录
    const defaultUser = TEST_ACCOUNTS[0];
    const token = createMockJwtToken(defaultUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    return {
      user: defaultUser,
      token,
      expiresAt: Date.now() + 86400000,
    };
  },

  switchAccount(accountId: string): AuthSession {
    const account = TEST_ACCOUNTS.find((a) => a.id === accountId) || TEST_ACCOUNTS[0];
    const token = createMockJwtToken(account);

    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(account));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }

    return {
      user: account,
      token,
      expiresAt: Date.now() + 86400000,
    };
  },

  /**
   * 【预留 Azure Entra ID SSO 扩展点】
   * 未来接入 Azure AD 时，在此实现 msalInstance.acquireTokenSilent / acquireTokenPopup
   */
  async loginWithAzureSSO(): Promise<AuthSession> {
    console.warn('Azure Entra ID SSO will be configured for production environment');
    return this.getCurrentSession();
  },
};
