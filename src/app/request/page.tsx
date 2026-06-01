import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { isOrgMember } from '@/infra/github/client';
import { RequestForm } from '@/components/RequestForm';

export default async function RequestPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/request');
  }

  const member = await isOrgMember(session.user.login);

  if (!member) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-xl font-semibold text-zinc-900 mb-2">Access denied</h1>
        <p className="text-zinc-600 text-sm">
          You must be a member of the{' '}
          <strong>{process.env.GITHUB_ORG}</strong> organization to submit repository requests.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Request a repository</h1>
        <p className="text-zinc-600 mt-1 text-sm">
          Fill in the details below. An admin will review your request and you&apos;ll receive an
          email when a decision is made.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <RequestForm />
      </div>
    </div>
  );
}
