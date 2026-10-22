import { RoleType } from './moc';

export interface UserAccount {
  id: string;               // 员工工号，如 "EMP-1001"
  name: string;             // 员工姓名
  email: string;            // 企业邮箱
  department: string;       // 所属部门
  role: RoleType;           // 权限角色
  title: string;            // 岗位职称
  avatarText: string;
  badgeColor: string;
}

export interface AuthSession {
  user: UserAccount;
  token: string;            // Bearer Token
  expiresAt: number;        // 过期时间戳
}

// 预留 Azure Entra ID SSO 声明对象
export interface AzureIdTokenClaims {
  oid?: string;             // Azure 用户唯一对象ID
  preferred_username?: string;
  name?: string;
  roles?: string[];
  tid?: string;             // 租户ID
}
