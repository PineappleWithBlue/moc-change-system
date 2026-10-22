import { NextRequest, NextResponse } from 'next/server';
import { getRecordById, updateRecord, deleteRecord } from '@/lib/serverDb';
import { ApiResponse, MocRecord } from '@/types/moc';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const record = await getRecordById(id);

    if (!record) {
      return NextResponse.json(
        {
          code: 404,
          message: `MOC record ${id} not found`,
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const responseData: ApiResponse<MocRecord> = {
      code: 200,
      message: 'OK',
      data: record,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error(`GET /api/moc/${params.id} error:`, error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body: MocRecord = await request.json();

    if (body.id !== id) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Path parameter id and body id mismatch',
          data: null,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const updated = await updateRecord(body);

    const responseData: ApiResponse<MocRecord> = {
      code: 200,
      message: 'Updated successfully',
      data: updated,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error(`PUT /api/moc/${params.id} error:`, error);
    return NextResponse.json(
      {
        code: 500,
        message: error?.message || 'Failed to update record',
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const success = await deleteRecord(id);

    if (!success) {
      return NextResponse.json(
        {
          code: 404,
          message: `MOC record ${id} not found`,
          data: false,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const responseData: ApiResponse<boolean> = {
      code: 200,
      message: 'Deleted successfully',
      data: true,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error(`DELETE /api/moc/${params.id} error:`, error);
    return NextResponse.json(
      {
        code: 500,
        message: error?.message || 'Failed to delete record',
        data: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
