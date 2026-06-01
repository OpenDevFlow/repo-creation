import { NextRequest, NextResponse } from 'next/server';
import { requireOrgAdmin } from '@/lib/session';
import { rejectRequest } from '@/application/reject-request';
import { AppError } from '@/domain/errors';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireOrgAdmin();
    const body = await req.json();

    await rejectRequest(
      params.id,
      session.user.login,
      body.rejectionReason,
      body.adminComment ?? null,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'Unhandled error in reject endpoint',
        requestId: params.id,
        error: String(err),
      }),
    );
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    );
  }
}
