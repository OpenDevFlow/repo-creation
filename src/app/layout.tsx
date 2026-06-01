import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Repo Request',
  description: 'Request a new GitHub repository for your organization.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between">
              <a href="/" className="font-semibold text-lg tracking-tight">
                Repo Requests
              </a>
              <nav className="flex items-center gap-6 text-sm">
                {session ? (
                  <>
                    <a href="/request" className="text-zinc-300 hover:text-white transition-colors">
                      New Request
                    </a>
                    <a href="/admin" className="text-zinc-300 hover:text-white transition-colors">
                      Admin
                    </a>
                    <div className="flex items-center gap-3">
                      {session.user.image && (
                        <img
                          src={session.user.image}
                          alt={session.user.login}
                          className="w-7 h-7 rounded-full"
                        />
                      )}
                      <span className="text-zinc-400">@{session.user.login}</span>
                      <a
                        href="/api/auth/signout"
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        Sign out
                      </a>
                    </div>
                  </>
                ) : (
                  <a
                    href="/api/auth/signin"
                    className="bg-white text-zinc-900 px-4 py-1.5 rounded-md font-medium text-sm hover:bg-zinc-100 transition-colors"
                  >
                    Sign in with GitHub
                  </a>
                )}
              </nav>
            </header>
            <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
