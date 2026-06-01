import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session) redirect(searchParams.callbackUrl ?? '/request');

  const callbackUrl = searchParams.callbackUrl ?? '/request';

  return (
    <div className="max-w-sm mx-auto py-20 text-center space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Sign in</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Use your GitHub account to access the repo request system.
        </p>
      </div>
      <a
        href={`/api/auth/signin/github?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
        Continue with GitHub
      </a>
    </div>
  );
}
