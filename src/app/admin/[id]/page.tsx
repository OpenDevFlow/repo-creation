import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isOrgAdmin } from '@/infra/github/client';
import { prisma } from '@/infra/db/client';
import { StatusBadge } from '@/components/StatusBadge';
import { ReviewActions } from '@/components/ReviewActions';

export const dynamic = 'force-dynamic';

export default async function AdminRequestPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin');
  }

  const admin = await isOrgAdmin(session.user.login);
  if (!admin) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-semibold mb-2">Admin access required</h1>
      </div>
    );
  }

  const request = await prisma.repoRequest.findUnique({ where: { id: params.id } });
  if (!request) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          ← Back to dashboard
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 font-mono">{request.repoName}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Requested by @{request.requesterLogin} on{' '}
            {request.createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
        <DetailRow label="Description">{request.description}</DetailRow>
        <DetailRow label="Visibility">
          <span className="capitalize">{request.visibility}</span>
        </DetailRow>
        {request.teamSlug && <DetailRow label="Team">{request.teamSlug}</DetailRow>}
        <DetailRow label="Requester email">{request.requesterEmail}</DetailRow>
        <DetailRow label="Justification">
          <span className="whitespace-pre-wrap">{request.justification}</span>
        </DetailRow>
      </div>

      {request.status === 'pending' && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Decision</h2>
          <ReviewActions requestId={request.id} repoName={request.repoName} />
        </div>
      )}

      {request.status !== 'pending' && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-zinc-700">Resolution</h2>
          <DetailRow label="Reviewed by">@{request.reviewedBy}</DetailRow>
          {request.reviewedAt && (
            <DetailRow label="Reviewed at">
              {request.reviewedAt.toLocaleString()}
            </DetailRow>
          )}
          {request.repoUrl && (
            <DetailRow label="Repository URL">
              <a
                href={request.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {request.repoUrl}
              </a>
            </DetailRow>
          )}
          {request.rejectionReason && (
            <DetailRow label="Rejection reason">{request.rejectionReason}</DetailRow>
          )}
          {request.adminComment && (
            <DetailRow label="Admin comment">{request.adminComment}</DetailRow>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 text-sm">
      <span className="text-zinc-500 font-medium">{label}</span>
      <span className="text-zinc-900">{children}</span>
    </div>
  );
}
