import type { AuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

declare module 'next-auth' {
  interface Session {
    user: {
      login: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    login?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email read:org',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.login = token.login ?? token.email?.split('@')[0] ?? 'unknown';
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};
