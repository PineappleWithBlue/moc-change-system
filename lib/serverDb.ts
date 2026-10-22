import fs from 'fs';
import path from 'path';
import { MocRecord } from '@/types/moc';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'moc-database.json');

// 确保数据目录与数据库文件存在
function ensureDbFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    // 初始为空数组，无任何演示假数据
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export async function readAllRecords(): Promise<MocRecord[]> {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to read from moc-database.json:', error);
    return [];
  }
}

export async function saveAllRecords(records: MocRecord[]): Promise<void> {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to moc-database.json:', error);
    throw error;
  }
}

export async function getRecordById(id: string): Promise<MocRecord | null> {
  const records = await readAllRecords();
  return records.find((r) => r.id === id) || null;
}

export async function createRecord(record: MocRecord): Promise<MocRecord> {
  const records = await readAllRecords();
  records.unshift(record);
  await saveAllRecords(records);
  return record;
}

export async function updateRecord(record: MocRecord): Promise<MocRecord> {
  const records = await readAllRecords();
  const index = records.findIndex((r) => r.id === record.id);
  if (index === -1) {
    throw new Error(`Record with id ${record.id} not found`);
  }
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updated = { ...record, updatedAt: now };
  records[index] = updated;
  await saveAllRecords(records);
  return updated;
}

export async function deleteRecord(id: string): Promise<boolean> {
  const records = await readAllRecords();
  const filtered = records.filter((r) => r.id !== id);
  if (filtered.length === records.length) {
    return false;
  }
  await saveAllRecords(filtered);
  return true;
}
