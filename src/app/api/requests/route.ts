import { NextRequest, NextResponse } from 'next/server';
import { requireOrgMember, requireOrgAdmin } from '@/lib/session';
import { createRequest } from '@/application/create-request';
import { prisma } from '@/infra/db/client';
import { AppError } from '@/domain/errors';

export async function POST(req: NextRequest) {
  try {
    const session = await requireOrgMember();
    const body = await req.json();

    const request = await createRequest(body, {
      login: session.user.login,
      email: session.user.email,
      name: session.user.name,
    });

    return NextResponse.json(request, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET() {
  try {
    await requireOrgAdmin();

    const requests = await prisma.repoRequest.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        repoName: true,
        description: true,
        visibility: true,
        teamSlug: true,
        requesterLogin: true,
        requesterEmail: true,
        requesterName: true,
        status: true,
        repoUrl: true,
        rejectionReason: true,
        reviewedBy: true,
        reviewedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(requests);
  } catch (err) {
    return errorResponse(err);
  }
}

function errorResponse(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.statusCode },
    );
  }
  console.error(JSON.stringify({ level: 'error', message: 'Unhandled error in /api/requests', error: String(err) }));
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
    { status: 500 },
  );
}
