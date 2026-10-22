import { NextRequest, NextResponse } from 'next/server';
import { readAllRecords, createRecord } from '@/lib/serverDb';
import { createEmptyMoc, generateMocId } from '@/lib/mocTemplate';
import { ApiResponse, MocRecord, MocSummaryStats } from '@/types/moc';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword')?.toLowerCase() || '';
    const status = searchParams.get('status') || 'ALL';

    const records = await readAllRecords();

    // 计算统计指标
    const stats: MocSummaryStats = {
      total: records.length,
      deptReview: records.filter((r) => r.status === 'DEPT_REVIEW' || r.status === 'DRAFT').length,
      ehsReview: records.filter((r) => r.status === 'EHS_REVIEW').length,
      fm0002Review: records.filter((r) => r.status === 'FM0002_EVALUATION').length,
      plantApproval: records.filter((r) => r.status === 'PLANT_APPROVAL').length,
      implementing: records.filter((r) => r.status === 'IMPLEMENTING' || r.status === 'PILOT_RUN').length,
      closed: records.filter((r) => r.status === 'CLOSED').length,
    };

    // 过滤列表
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

    const responseData: ApiResponse<{ list: MocRecord[]; stats: MocSummaryStats }> = {
      code: 200,
      message: 'OK',
      data: {
        list: filtered,
        stats,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('GET /api/moc error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: error?.message || 'Internal Server Error',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title, applicant, applicantDept, initialRecord } = body;

    const records = await readAllRecords();
    const currentYear = new Date().getFullYear();
    const count = records.length + 1;
    const finalDept = applicantDept || initialRecord?.application?.applicantDept || '';
    const newId = generateMocId(finalDept, count, currentYear);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let newMoc: MocRecord;
    if (initialRecord) {
      newMoc = {
        ...createEmptyMoc(newId, title, applicant, finalDept),
        ...initialRecord,
        id: newId,
        title: title || initialRecord.title || `新工程变更提报 (${newId})`,
        isDraft: false,
        createdAt: now,
        updatedAt: now,
        application: {
          ...initialRecord.application,
          applicantDept: finalDept || initialRecord.application?.applicantDept || '研发部 (RD)',
          applicant: applicant || initialRecord.application?.applicant || '张工',
        },
      };
    } else {
      newMoc = createEmptyMoc(newId, title, applicant, finalDept);
    }

    await createRecord(newMoc);

    const responseData: ApiResponse<MocRecord> = {
      code: 201,
      message: 'Created',
      data: newMoc,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/moc error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: error?.message || 'Failed to create MOC',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
