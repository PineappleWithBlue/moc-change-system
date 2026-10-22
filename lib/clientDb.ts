import { MocRecord, MocSummaryStats, MocListQuery } from '@/types/moc';
import { INITIAL_MOC_RECORDS } from '@/lib/mocSeedData';
import { createEmptyMoc, generateMocId } from '@/lib/mocTemplate';

const MOC_STORAGE_KEY = 'MOC_CLIENT_DATABASE_V1';

function getInitialRecords(): MocRecord[] {
  return JSON.parse(JSON.stringify(INITIAL_MOC_RECORDS));
}

export function readAllRecords(): MocRecord[] {
  if (typeof window === 'undefined') {
    return getInitialRecords();
  }
  try {
    const raw = localStorage.getItem(MOC_STORAGE_KEY);
    if (!raw) {
      const init = getInitialRecords();
      localStorage.setItem(MOC_STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : getInitialRecords();
  } catch (error) {
    console.error('Failed to read MOC records from localStorage:', error);
    return getInitialRecords();
  }
}

export function saveAllRecords(records: MocRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MOC_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save MOC records to localStorage:', error);
  }
}

export function calculateStats(records: MocRecord[]): MocSummaryStats {
  return {
    total: records.length,
    deptReview: records.filter((r) => r.status === 'DEPT_REVIEW' || r.status === 'DRAFT').length,
    ehsReview: records.filter((r) => r.status === 'EHS_REVIEW').length,
    fm0002Review: records.filter((r) => r.status === 'FM0002_EVALUATION').length,
    plantApproval: records.filter((r) => r.status === 'PLANT_APPROVAL').length,
    implementing: records.filter((r) => r.status === 'IMPLEMENTING' || r.status === 'PILOT_RUN').length,
    closed: records.filter((r) => r.status === 'CLOSED').length,
  };
}

export function queryRecords(query: MocListQuery = {}): { list: MocRecord[]; stats: MocSummaryStats } {
  const records = readAllRecords();
  const stats = calculateStats(records);
  const keyword = (query.keyword || '').toLowerCase().trim();
  const status = query.status || 'ALL';

  let filtered = records;
  if (keyword) {
    filtered = filtered.filter(
      (r) =>
        r.id.toLowerCase().includes(keyword) ||
        r.title.toLowerCase().includes(keyword) ||
        r.application.applicant.toLowerCase().includes(keyword) ||
        r.application.applicantDept.toLowerCase().includes(keyword)
    );
  }

  if (status !== 'ALL') {
    if (status === 'ACTIVE') {
      filtered = filtered.filter((r) => r.status !== 'CLOSED');
    } else {
      filtered = filtered.filter((r) => r.status === status);
    }
  }

  return { list: filtered, stats };
}

export function getRecordById(id: string): MocRecord | null {
  const records = readAllRecords();
  return records.find((r) => r.id === id) || null;
}

export function createRecord(payload: {
  title?: string;
  applicant?: string;
  applicantDept?: string;
  initialRecord?: Partial<MocRecord>;
}): MocRecord {
  const records = readAllRecords();
  const currentYear = new Date().getFullYear();
  const count = records.length + 1;
  const finalDept = payload.applicantDept || payload.initialRecord?.application?.applicantDept || '研发部 (RD)';
  const newId = generateMocId(finalDept, count, currentYear);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  let newMoc: MocRecord;
  const base = createEmptyMoc(newId, payload.title, payload.applicant, finalDept);
  if (payload.initialRecord) {
    newMoc = {
      ...base,
      ...payload.initialRecord,
      id: newId,
      title: payload.title || payload.initialRecord.title || `新工程变更提报 (${newId})`,
      isDraft: false,
      createdAt: now,
      updatedAt: now,
      application: {
        ...base.application,
        ...(payload.initialRecord.application || {}),
        applicantDept: finalDept,
        applicant: payload.applicant || payload.initialRecord.application?.applicant || '张工',
      },
    };
  } else {
    newMoc = base;
  }

  records.unshift(newMoc);
  saveAllRecords(records);
  return newMoc;
}

export function updateRecord(record: MocRecord): MocRecord {
  const records = readAllRecords();
  const index = records.findIndex((r) => r.id === record.id);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updated = { ...record, updatedAt: now };

  if (index === -1) {
    records.unshift(updated);
  } else {
    records[index] = updated;
  }

  saveAllRecords(records);
  return updated;
}

export function deleteRecord(id: string): boolean {
  const records = readAllRecords();
  const filtered = records.filter((r) => r.id !== id);
  saveAllRecords(filtered);
  return true;
}

export function resetToDefault(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(MOC_STORAGE_KEY);
    readAllRecords();
  }
}
