export type RoleType =
  | 'SUPER_USER'       // 系统超级管理员 (全权管控、无限制操作、任意代签)
  | 'APPLICANT'        // 申请人 (张工 - 研发部)
  | 'DEPT_MANAGER'     // 各职能部门经理 (8大部门主管)
  | 'EHS_SPECIALIST'   // EHS专员 (王工)
  | 'CROSS_EVALUATOR'  // 跨部门评估人 (质量代表 / 制造工程 / SCM / 采购 / 财务)
  | 'PLANT_MANAGER'    // 工厂运营经理 (赵总 - 核心决策人)
  | 'QUALITY_MANAGER'; // 质量经理 (周经理 - PSW/PPAP审批人)


export interface UserRoleInfo {
  role: RoleType;
  name: string;
  department: string;
  title: string;
  badgeColor: string;
  avatarText: string;
}

export type MocStatus =
  | 'DRAFT'              // 草稿提报中
  | 'DEPT_REVIEW'         // 部门初审中
  | 'EHS_REVIEW'          // EHS 评估中
  | 'FM0002_EVALUATION'   // 跨部门评估与计划制定中
  | 'PLANT_APPROVAL'      // 待工厂运营经理批准
  | 'IMPLEMENTING'        // 变更实施跟踪与PPAP中
  | 'PILOT_RUN'           // 试生产验证中
  | 'CLOSED'              // 已结案归档
  | 'REJECTED';           // 已退回/终止

export type EvaluationConclusion =
  | 'FEASIBLE'       // 可行
  | 'INFEASIBLE'     // 不可行
  | 'NOT_APPLICABLE' // 不适用
  | 'PENDING';       // 待定

export interface AttachmentItem {
  id: string;
  name: string;
  type: 'drawing' | 'image' | 'document' | 'report';
  size: string;
  uploadTime: string;
  url?: string;
}

export interface StateDetail {
  description: string;
  parameters: Array<{ label: string; value: string }>;
  attachments: AttachmentItem[];
  imageUrl?: string;
  notes?: string;
}

export interface FM0002Item {
  id: string;
  category: string;             // 13大类
  description: string;          // 细分评估内容说明
  leadDept: string;             // 评估主导部门
  evaluator: string;            // 责任人
  evaluatorId?: string;         // 责任人工号
  conclusion: EvaluationConclusion; // 可行/不可行/不适用/待定
  actionPlan: string;           // 实施内容
  actionOwner: string;          // 实施责任人
  targetDate: string;           // 计划完成时间
  isCompleted: boolean;         // 变更实施的确认
  completedDate?: string;       // 确认完成时间
  completedBy?: string;         // 确认人
  isLocked?: boolean;           // 评估结论确认后只读锁定
  notifiedAt?: string;          // 责任人通知发送时间
}

export interface DeptReviewItem {
  deptKey: string;              // RD, QA, PRD, PUR, SCM, FIN, ME, CI
  deptName: string;
  assignedManager?: string;     // 指派的部门经理姓名
  assignedManagerId?: string;   // 指派的部门经理工号
  checked: boolean;
  result: string;
  signature: string;
  signDate: string;
  signTimestamp?: string;       // 受控电子签名精确时间戳
  comments?: string;
  isLocked?: boolean;           // 签署完成后只读锁定
  notifiedAt?: string;          // 通知部门经理时间戳
}

/**
 * 将 FM-0002 的主导部门名称规范化映射到 8 大职能评审矩阵的 deptKey
 */
export function normalizeDeptKey(deptName = '', applicantDept = ''): string {
  const s = deptName.toUpperCase();
  if (s.includes('研发') || s.includes('RD') || s.includes('R&D')) return 'RD';
  if (s.includes('质量') || s.includes('QA') || s.includes('品质') || s.includes('检验') || s.includes('QC')) return 'QA';
  if (s.includes('生产') || s.includes('PRD') || s.includes('车间')) return 'PRD';
  if (s.includes('采购') || s.includes('PUR')) return 'PUR';
  if (s.includes('SCM') || s.includes('计划') || s.includes('供应链')) return 'SCM';
  if (s.includes('财务') || s.includes('FIN') || s.includes('FI')) return 'FIN';
  if (s.includes('制造') || s.includes('ME') || s.includes('工程') || s.includes('MME')) return 'ME';
  if (s.includes('CI') || s.includes('持续改善')) return 'CI';
  if (s.includes('申请部门')) {
    return normalizeDeptKey(applicantDept, 'RD');
  }
  return 'RD';
}

export interface MocRecord {
  id: string;                    // MOC-RD-2026-0001
  title: string;                 // 变更主题简述
  status: MocStatus;             // 当前流转状态
  currentStage: number;          // 1 ~ 6
  createdAt: string;
  updatedAt: string;
  isDraft?: boolean;             // 标识是否为未持久化的内存草稿

  // 模块一：变更申请主表 (图1 表一)
  application: {
    changeReason: string;        // 更改原因 (目的)
    applicantDept: string;      // 申请更改部门
    applicant: string;          // 申请人
    applyDate: string;          // 申请日期
    currentState: StateDetail;  // 现有状态
    proposedState: StateDetail; // 更改后状态
    referenceAttachments?: AttachmentItem[]; // Reference Item 参考项/参考物料与附件
    // 部门经理确认 (向下兼容)
    deptManagerConfirmed?: boolean | null;
    deptManagerComment?: string;
    deptManagerSign?: string;
    deptManagerSignDate?: string;
  };

  // 模块二：跨部门评估实施确认矩阵 (图2 FM-0002)
  fm0002Matrix: FM0002Item[];

  // 模块三：各部门评审与最终批准 (图1 表二)
  departmentReview: {
    // EHS 评估
    ehs: {
      isFeasible: boolean | null;          // EHS评估是否可行？
      isProcessApplied: boolean | null;    // 是否按照集团EHS管理流程 (504H0340A08) 实施？
      evaluator: string;
      evalDate: string;
      remarks: string;
    };
    // 8个部门评审矩阵
    deptReviews: DeptReviewItem[];
    // 工厂运营经理最终批准
    plantManagerApproval: {
      isApproved: boolean | null;          // 最终批准：是 / 否
      approver: string;
      approvalDate: string;
      comments: string;
    };
  };

  // 模块四：变更实施与闭环跟踪 (图1 表三、表四)
  implementation: {
    // 变更通知
    customerNotice: boolean | null;        // 客户通知
    internalNotice: boolean | null;        // 内部通知
    noticePolicyRef: string;               // 504H0050 Customer Change Notification Policy
    noticeDate?: string;

    // PPAP 验证
    isPpapApproved: boolean | null;        // PPAP是否批准 (PSW签署)？
    pswSigner: string;
    pswSignDate: string;
    pswDocumentName: string;
    pswReportUrl?: string;

    // 试生产验证
    pilotRunStatus: 'NOT_APPLICABLE' | 'COMPLETED' | 'FAILED' | 'PENDING';
    pilotQuantity: number;
    pilotPassRate: number;                 // 百分比，如 99.8
    pilotInspector: string;
    pilotDate: string;
    pilotRemarks: string;

    // 表四：变更实施批准 (最终归档)
    executionApproval: {
      isApproved: boolean | null;          // 变更实施是否批准？
      approver: string;
      approvalDate: string;
      comments: string;
    };
  };
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface MocListQuery {
  keyword?: string;
  status?: string;
  dept?: string;
}

export interface MocSummaryStats {
  total: number;
  deptReview: number;
  ehsReview: number;
  fm0002Review: number;
  plantApproval: number;
  implementing: number;
  closed: number;
}

