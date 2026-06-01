import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { isOrgAdmin } from '@/infra/github/client';
import { prisma } from '@/infra/db/client';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
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
        <p className="text-zinc-600 text-sm">
          You need to be an organization admin to access this page.
        </p>
      </div>
    );
  }

  const requests = await prisma.repoRequest.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      repoName: true,
      visibility: true,
      requesterLogin: true,
      requesterName: true,
      status: true,
      repoUrl: true,
      createdAt: true,
      reviewedAt: true,
    },
  });

  const pending = requests.filter((r) => r.status === 'pending');
  const resolved = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Admin dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {pending.length} pending · {resolved.length} resolved
        </p>
      </div>

      <Section title="Pending review" count={pending.length}>
        {pending.length === 0 ? (
          <EmptyState message="No pending requests." />
        ) : (
          <RequestTable rows={pending} />
        )}
      </Section>

      <Section title="Resolved" count={resolved.length}>
        {resolved.length === 0 ? (
          <EmptyState message="No resolved requests yet." />
        ) : (
          <RequestTable rows={resolved} />
        )}
      </Section>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-700 mb-3">
        {title}{' '}
        <span className="text-zinc-400 font-normal text-sm">({count})</span>
      </h2>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl px-6 py-10 text-center text-sm text-zinc-400">
      {message}
    </div>
  );
}

type RequestRow = {
  id: string;
  repoName: string;
  visibility: string;
  requesterLogin: string;
  requesterName: string | null;
  status: string;
  repoUrl: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
};

function RequestTable({ rows }: { rows: RequestRow[] }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Repository</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Requester</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Visibility</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-zinc-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-zinc-900">
                {row.repoUrl ? (
                  <a href={row.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {row.repoName}
                  </a>
                ) : (
                  row.repoName
                )}
              </td>
              <td className="px-4 py-3 text-zinc-700">@{row.requesterLogin}</td>
              <td className="px-4 py-3 text-zinc-500 capitalize">{row.visibility}</td>
              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3 text-zinc-400 text-xs">
                {(row.reviewedAt ?? row.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/${row.id}`}
                  className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-2 transition-colors"
                >
                  Review →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
