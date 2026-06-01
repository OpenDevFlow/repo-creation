const ERRORS: Record<string, string> = {
  Configuration: 'There is a server configuration problem. Please contact an admin.',
  AccessDenied: 'Access denied. You may not have permission to sign in.',
  Verification: 'The sign-in link has expired or already been used.',
  Default: 'An authentication error occurred. Please try again.',
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const message = ERRORS[searchParams.error ?? 'Default'] ?? ERRORS.Default;

  return (
    <div className="max-w-sm mx-auto py-20 text-center space-y-4">
      <div className="text-4xl">⚠️</div>
      <h1 className="text-xl font-semibold text-zinc-900">Authentication error</h1>
      <p className="text-zinc-600 text-sm">{message}</p>
      <a
        href="/auth/signin"
        className="inline-block mt-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
      >
        Try again
      </a>
    </div>
  );
}
