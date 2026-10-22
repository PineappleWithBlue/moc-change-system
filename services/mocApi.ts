import { MocRecord, MocListQuery, MocSummaryStats } from '@/types/moc';
import * as clientDb from '@/lib/clientDb';

export interface MocListResponse {
  list: MocRecord[];
  stats: MocSummaryStats;
}

export const mocApi = {
  /**
   * 获取 MOC 变更列表与各状态统计指标
   */
  async getMocList(query: MocListQuery = {}): Promise<MocListResponse> {
    return clientDb.queryRecords(query);
  },

  /**
   * 根据 ID 查询变更单完整详情
   */
  async getMocDetail(id: string): Promise<MocRecord> {
    const record = clientDb.getRecordById(id);
    if (!record) {
      throw new Error(`变更单 ${id} 不存在`);
    }
    return record;
  },

  /**
   * 新建工程变更单
   */
  async createMoc(payload: {
    title?: string;
    applicant?: string;
    applicantDept?: string;
    initialRecord?: Partial<MocRecord>;
  }): Promise<MocRecord> {
    return clientDb.createRecord(payload);
  },

  /**
   * 更新/保存变更单
   */
  async updateMoc(record: MocRecord): Promise<MocRecord> {
    return clientDb.updateRecord(record);
  },

  /**
   * 删除变更单
   */
  async deleteMoc(id: string): Promise<boolean> {
    return clientDb.deleteRecord(id);
  },

  /**
   * 重置回演示初始预置数据
   */
  async resetDemoData(): Promise<void> {
    clientDb.resetToDefault();
  },
};
