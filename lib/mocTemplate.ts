import { FM0002Item, DeptReviewItem, MocRecord } from '@/types/moc';

export const FM0002_TEMPLATE: Array<{
  category: string;
  description: string;
  leadDept: string;
  evaluatorRole: string;
}> = [
  // 1. 图纸 (研发)
  { category: '图纸', description: '直接申请变更的图纸-见FM-0004', leadDept: '研发', evaluatorRole: '研发工程师' },
  { category: '图纸', description: '相关配套产品的图纸-见FM-0004', leadDept: '研发', evaluatorRole: '研发工程师' },
  { category: '图纸', description: '相关毛坯产品的图纸-见FM-0004', leadDept: '研发', evaluatorRole: '研发工程师' },

  // 2. 产品 (研发)
  { category: '产品', description: '可靠性试验', leadDept: '研发', evaluatorRole: '研发试验员' },
  { category: '产品', description: '功能测试', leadDept: '研发', evaluatorRole: '研发测试员' },
  { category: '产品', description: '技术规范（含包装规范）', leadDept: '研发', evaluatorRole: '研发工程师' },
  { category: '产品', description: '产品说明书', leadDept: '研发', evaluatorRole: '研发工程师' },

  // 3. 过程控制 (制造工程 / 质量)
  { category: '过程控制', description: '生产工序', leadDept: '制造工程', evaluatorRole: 'ME工艺工程师' },
  { category: '过程控制', description: '加工程序', leadDept: '制造工程', evaluatorRole: 'ME编程工程师' },
  { category: '过程控制', description: '工艺参数', leadDept: '制造工程', evaluatorRole: 'ME工艺工程师' },
  { category: '过程控制', description: '作业方法', leadDept: '制造工程', evaluatorRole: 'IE/ME工程师' },
  { category: '过程控制', description: '工装（含图纸）', leadDept: '制造工程', evaluatorRole: '工装工程师' },
  { category: '过程控制', description: '夹具（含图纸）', leadDept: '制造工程', evaluatorRole: '夹具工程师' },
  { category: '过程控制', description: '检验方法（包括检验频度）', leadDept: '质量', evaluatorRole: 'QE质量工程师' },

  // 4. 检验/测量 (质量)
  { category: '检验/测量', description: '量具新增（含校准）', leadDept: '质量', evaluatorRole: '计量工程师' },
  { category: '检验/测量', description: '原检测设备功能增加', leadDept: '质量', evaluatorRole: 'QE工程师' },
  { category: '检验/测量', description: '检测设备新增', leadDept: '质量', evaluatorRole: 'QE工程师' },
  { category: '检验/测量', description: '原检具更新', leadDept: '质量', evaluatorRole: '检具工程师' },
  { category: '检验/测量', description: '新检具开发', leadDept: '质量', evaluatorRole: '检具工程师' },
  { category: '检验/测量', description: 'MSA (测量系统分析)', leadDept: '质量', evaluatorRole: '质量工程师' },
  { category: '检验/测量', description: '全尺寸测量', leadDept: '质量', evaluatorRole: '质量检验员' },

  // 5. 文件 (研发 / 制造工程 / 质量)
  { category: '文件', description: 'DFMEA (设计失效模式及后果分析)', leadDept: '研发', evaluatorRole: '研发工程师' },
  { category: '文件', description: '流程图 (Process Flow Chart)', leadDept: '制造工程', evaluatorRole: 'ME工艺工程师' },
  { category: '文件', description: 'PFMEA (过程失效模式及后果分析)', leadDept: '制造工程', evaluatorRole: 'ME工艺工程师' },
  { category: '文件', description: 'CP (控制计划 Control Plan)', leadDept: '质量', evaluatorRole: 'QE工程师' },
  { category: '文件', description: '作业指导书（SOP）', leadDept: '制造工程', evaluatorRole: '现场ME工程师' },
  { category: '文件', description: '检验指导书（SIP）', leadDept: '质量', evaluatorRole: '现场QE工程师' },

  // 6. SAP (多职能协同)
  { category: 'SAP', description: 'SAP-ITEM (主物料号维护)', leadDept: '研发', evaluatorRole: '主数据专员' },
  { category: 'SAP', description: 'SAP-BOM (工程物料清单维护)', leadDept: '研发', evaluatorRole: 'BOM工程师' },
  { category: 'SAP', description: 'SAP-工艺 (工艺路线 Routing)', leadDept: '制造工程', evaluatorRole: '工艺工程师' },
  { category: 'SAP', description: 'SAP-工时 (标准工时设定)', leadDept: '制造工程', evaluatorRole: 'IE工程师' },
  { category: 'SAP', description: 'SAP-P/M (采购与生产制造视图)', leadDept: 'SCM', evaluatorRole: 'SCM计划员' },
  { category: 'SAP', description: 'SAP-检验数据 (检验计划与QM特性)', leadDept: '质量', evaluatorRole: '质量数据员' },
  { category: 'SAP', description: 'SAP-软管对应套筒 (套筒对照关系维护)', leadDept: '研发', evaluatorRole: '结构工程师' },
  { category: 'SAP', description: 'SAP-A长度 (总成截断长度定义)', leadDept: '研发', evaluatorRole: '结构工程师' },
  { category: 'SAP', description: 'SAP-价格更改 (采购/销售价格更新)', leadDept: '财务', evaluatorRole: '成本会计' },
  { category: 'SAP', description: 'SAP-型号状态 (生命周期状态发布)', leadDept: '研发', evaluatorRole: '项目主管' },

  // 7. 价格 (采购 / 财务)
  { category: '价格', description: '采购价格', leadDept: '采购', evaluatorRole: '采购专员' },
  { category: '价格', description: '成本 (标准制造加工成本)', leadDept: '财务', evaluatorRole: '成本会计' },
  { category: '价格', description: 'TP价格 (转移定价 Transfer Price)', leadDept: '财务', evaluatorRole: '财务主管' },
  { category: '价格', description: '牌价 (市场建议基准售价)', leadDept: '财务', evaluatorRole: '商务财务' },

  // 8. 库存处理 (申请部门)
  { category: '库存处理', description: '自然切换，记录断点信息（含原材料/半成品/成品）', leadDept: '申请部门', evaluatorRole: '计划/工艺' },
  { category: '库存处理', description: '库存不可用，需返工（含原材料/半成品/成品）', leadDept: '申请部门', evaluatorRole: '生产/工艺' },
  { category: '库存处理', description: '库存不可用，需报废（含原材料/半成品/成品）', leadDept: '申请部门', evaluatorRole: '生产/财务' },

  // 9. 在制品 (申请部门 / 生产部门)
  { category: '在制品', description: '停止生产变更前零件（供应商/外协供应商/金工/装配）', leadDept: '申请部门', evaluatorRole: '采购/计划' },
  { category: '在制品', description: '自然切换，记录断点信息（含原材料/半成品/成品）', leadDept: '生产部门', evaluatorRole: '生产主管' },

  // 10. 订单确认 (SCM)
  { category: '订单确认', description: '确认未交货订单', leadDept: 'SCM', evaluatorRole: '交付调度员' },
  { category: '订单确认', description: '确认在手但未输入系统订单', leadDept: 'SCM', evaluatorRole: '计划主管' },

  // 11. 变更通知 (申请部门 / SCM / 需求部门)
  { category: '变更通知', description: '外部客户（按照504H0050 Customer Change Notification Policy执行）', leadDept: '申请部门', evaluatorRole: '项目经理' },
  { category: '变更通知', description: '内部客户 (下游车间)', leadDept: 'SCM', evaluatorRole: '车间计划员' },
  { category: '变更通知', description: '内部通知 (全厂发文)', leadDept: '申请部门', evaluatorRole: '工程师' },
  { category: '变更通知', description: '其他（如有）', leadDept: '需求部门', evaluatorRole: '部门接口人' },

  // 12. 试生产 (申请部门)
  { category: '试生产', description: '是否需要进行小批量试生产，如果需要，明确数量', leadDept: '申请部门', evaluatorRole: '工艺主管' },

  // 13. 跟踪确认 (申请部门)
  { category: '跟踪确认', description: '客户端使用变更后产品的情况跟踪确认', leadDept: '申请部门', evaluatorRole: '现场工程师' },
];

export function createBlankFM0002Matrix(): FM0002Item[] {
  return FM0002_TEMPLATE.map((tpl, index) => ({
    id: `item-${index + 1}`,
    category: tpl.category,
    description: tpl.description,
    leadDept: tpl.leadDept,
    evaluator: tpl.evaluatorRole,
    conclusion: 'PENDING',
    actionPlan: '',
    actionOwner: '',
    targetDate: '',
    isCompleted: false,
  }));
}

export interface StaffMember {
  id: string;
  name: string;
  dept: string;
  title: string;
  email: string;
}

export const STAFF_DIRECTORY: StaffMember[] = [
  { id: 'EMP-RD-101', name: '张工', dept: '研发部', title: '产品主管工程师', email: 'zhang.eng@corp.com' },
  { id: 'EMP-RD-001', name: '李经理', dept: '研发部', title: '研发部门经理', email: 'li.manager@corp.com' },
  { id: 'EMP-RD-003', name: '研发试验员', dept: '研发部', title: '可靠性与试验工程师', email: 'rd.test@corp.com' },
  { id: 'EMP-RD-004', name: 'BOM专员', dept: '研发部', title: '产品BOM主数据专员', email: 'rd.bom@corp.com' },
  { id: 'EMP-ME-001', name: '刘主管', dept: '制造工程部', title: '制造工艺与工装主管', email: 'liu.me@corp.com' },
  { id: 'EMP-ME-002', name: 'ME工艺工程师', dept: '制造工程部', title: '现场工艺与编程工程师', email: 'me.process@corp.com' },
  { id: 'EMP-QA-001', name: '周经理', dept: '质量部', title: '质量管理体系总监', email: 'zhou.qa@corp.com' },
  { id: 'EMP-QA-102', name: '陈代表', dept: '质量部', title: '客户质量工程师(CQE)', email: 'chen.qa@corp.com' },
  { id: 'EMP-QA-103', name: '计量工程师', dept: '质量部', title: '量具与MSA校准工程师', email: 'qa.msa@corp.com' },
  { id: 'EMP-EHS-201', name: '王工', dept: 'EHS部', title: '安全环保管理专员', email: 'wang.ehs@corp.com' },
  { id: 'EMP-SCM-001', name: '郑主管', dept: '供应链/计划部', title: '物料计划与交付主管', email: 'zheng.scm@corp.com' },
  { id: 'EMP-PUR-001', name: '孙主管', dept: '采购部', title: '战略采购与供应商管理主管', email: 'sun.pur@corp.com' },
  { id: 'EMP-PRD-001', name: '吴主管', dept: '生产部', title: '装配与制造车间主任', email: 'wu.prd@corp.com' },
  { id: 'EMP-FIN-001', name: '陈主管', dept: '财务部', title: '成本会计与转移定价主管', email: 'chen.fin@corp.com' },
  { id: 'EMP-CI-001', name: '黄专员', dept: '持续改善部', title: '精益与CI持续改善专家', email: 'huang.ci@corp.com' },
  { id: 'EMP-OPS-001', name: '赵总', dept: '工厂运营部', title: '工厂运营副总/运营经理', email: 'zhao.ops@corp.com' },
];

export const INITIAL_DEPT_REVIEWS: DeptReviewItem[] = [
  { deptKey: 'RD', deptName: '研发 (R&D)', assignedManager: '李经理', assignedManagerId: 'EMP-RD-001', checked: false, result: '', signature: '', signDate: '' },
  { deptKey: 'QA', deptName: '质量 (Quality)', assignedManager: '周经理', assignedManagerId: 'EMP-QA-001', checked: false, result: '', signature: '', signDate: '' },
  { deptKey: 'PRD', deptName: '生产 (Production)', assignedManager: '吴主管', assignedManagerId: 'EMP-PRD-001', checked: false, result: '', signature: '', signDate: '' },
  { deptKey: 'PUR', deptName: '采购 (Procurement)', assignedManager: '孙主管', assignedManagerId: 'EMP-PUR-001', checked: false, result: '', signature: '', signDate: '' },
  { deptKey: 'SCM', deptName: 'SCM (供应链管理)', assignedManager: '郑主管', assignedManagerId: 'EMP-SCM-001', checked: false, result: '', signature: '', signDate: '' },
  { deptKey: 'FIN', deptName: '财务 (Finance)', assignedManager: '陈主管', assignedManagerId: 'EMP-FIN-001', checked: false, result: '', signature: '', signDate: '' },
  { deptKey: 'ME', deptName: '制造工程 (ME)', assignedManager: '刘主管', assignedManagerId: 'EMP-ME-001', checked: false, result: '', signature: '', signDate: '' },
  { deptKey: 'CI', deptName: 'CI (持续改善)', assignedManager: '黄专员', assignedManagerId: 'EMP-CI-001', checked: false, result: '', signature: '', signDate: '' },
];

export function createEmptyMoc(
  newId: string,
  title?: string,
  applicant = '张工',
  applicantDept = '研发部 (R&D)'
): MocRecord {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  return {
    id: newId,
    title: title || `新工程变更提报 (${newId})`,
    status: 'DRAFT',
    currentStage: 1,
    createdAt: now,
    updatedAt: now,
    application: {
      changeReason: '',
      applicantDept,
      applicant,
      applyDate: today,
      currentState: {
        description: '',
        parameters: [],
        attachments: [],
      },
      proposedState: {
        description: '',
        parameters: [],
        attachments: [],
      },
      referenceAttachments: [],
      deptManagerConfirmed: null,
      deptManagerComment: '',
      deptManagerSign: '',
      deptManagerSignDate: '',
    },
    fm0002Matrix: createBlankFM0002Matrix(),
    departmentReview: {
      ehs: {
        isFeasible: null,
        isProcessApplied: null,
        evaluator: '',
        evalDate: '',
        remarks: '',
      },
      deptReviews: INITIAL_DEPT_REVIEWS,
      plantManagerApproval: {
        isApproved: null,
        approver: '',
        approvalDate: '',
        comments: '',
      },
    },
    implementation: {
      customerNotice: null,
      internalNotice: null,
      noticePolicyRef: '504H0050 Customer Change Notification Policy',
      isPpapApproved: null,
      pswSigner: '',
      pswSignDate: '',
      pswDocumentName: '',
      pilotRunStatus: 'PENDING',
      pilotQuantity: 0,
      pilotPassRate: 0,
      pilotInspector: '',
      pilotDate: '',
      pilotRemarks: '',
      executionApproval: {
        isApproved: null,
        approver: '',
        approvalDate: '',
        comments: '',
      },
    },
  };
}

export const STAGES_CONFIG = [
  {
    stage: 1,
    title: '变更提报与初审',
    subTitle: '申请表填写与部门经理签署',
    iconName: 'FileText',
    responsibleRole: 'APPLICANT / DEPT_MANAGER',
  },
  {
    stage: 2,
    title: 'EHS 评估',
    subTitle: '安全环保评估与流程合规',
    iconName: 'ShieldAlert',
    responsibleRole: 'EHS_SPECIALIST',
  },
  {
    stage: 3,
    title: '跨部门评估 (FM-0002)',
    subTitle: '13类矩阵评估与实施行动计划',
    iconName: 'Layers',
    responsibleRole: 'CROSS_EVALUATOR',
  },
  {
    stage: 4,
    title: '变更批准 (工厂决策)',
    subTitle: '工厂运营经理最终核准',
    iconName: 'CheckCheck',
    responsibleRole: 'PLANT_MANAGER',
  },
  {
    stage: 5,
    title: '实施跟踪与 PPAP',
    subTitle: '通知发布、实施进度与PSW签署',
    iconName: 'Wrench',
    responsibleRole: 'QUALITY_MANAGER / CROSS_EVALUATOR',
  },
  {
    stage: 6,
    title: '试生产与最终归档',
    subTitle: '小批量试生产与表四最终批准',
    iconName: 'Archive',
    responsibleRole: 'QUALITY_MANAGER / DEPT_MANAGER',
  },
];

/**
 * 部门名称映射标准缩写代号：
 * 研发RD、计划SCM、生产PRD、采购PUR、质量QA、检验QC、财务FI、制造MME
 */
export function getDepartmentCode(deptStr = ''): string {
  const s = deptStr.toUpperCase();
  if (s.includes('研发') || s.includes('RD') || s.includes('R&D')) return 'RD';
  if (s.includes('计划') || s.includes('SCM') || s.includes('供应链')) return 'SCM';
  if (s.includes('生产') || s.includes('PRD') || s.includes('车间')) return 'PRD';
  if (s.includes('采购') || s.includes('PUR')) return 'PUR';
  if (s.includes('质量') || s.includes('QA') || s.includes('品质')) return 'QA';
  if (s.includes('检验') || s.includes('QC') || s.includes('质检')) return 'QC';
  if (s.includes('财务') || s.includes('FI') || s.includes('FIN')) return 'FI';
  if (s.includes('制造') || s.includes('MME') || s.includes('ME') || s.includes('工程')) return 'MME';
  return 'RD';
}

/**
 * 生成规范工程变更单号：MOC-[DEPT]-[YEAR]-[0001]
 * 既包含工程变更专属缩写 MOC，又满足部门代号与 4 位流水号规范
 */
export function generateMocId(deptStr: string, serialNumber: number, year = new Date().getFullYear()): string {
  const deptCode = getDepartmentCode(deptStr);
  const padSerial = String(serialNumber).padStart(4, '0');
  return `MOC-${deptCode}-${year}-${padSerial}`;
}

export const DEPARTMENT_OPTIONS = [
  { value: '研发部 (RD)', label: '研发部 (RD)', code: 'RD' },
  { value: '计划/供应链部 (SCM)', label: '计划/供应链部 (SCM)', code: 'SCM' },
  { value: '生产部 (PRD)', label: '生产部 (PRD)', code: 'PRD' },
  { value: '采购部 (PUR)', label: '采购部 (PUR)', code: 'PUR' },
  { value: '质量部 (QA)', label: '质量部 (QA)', code: 'QA' },
  { value: '检验部 (QC)', label: '检验部 (QC)', code: 'QC' },
  { value: '财务部 (FI)', label: '财务部 (FI)', code: 'FI' },
  { value: '制造技术部 (MME)', label: '制造技术部 (MME)', code: 'MME' },
];

/**
 * 创建纯内存中的新建临时草稿，不分配正式流水单号，不写入持久化数据库
 */
export function createTemporaryDraftMoc(
  title?: string,
  applicant = '张工',
  applicantDept = '研发部 (RD)'
): MocRecord {
  const draft = createEmptyMoc('DRAFT_TEMP', title || '新建工程变更申请', applicant, applicantDept);
  draft.isDraft = true;
  return draft;
}


