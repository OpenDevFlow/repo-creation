import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { isOrgAdmin, isOrgMember } from '@/infra/github/client';
import { UnauthorizedError, ForbiddenError } from '@/domain/errors';

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new UnauthorizedError();
  return session;
}

export async function requireOrgMember() {
  const session = await requireSession();
  const member = await isOrgMember(session.user.login);
  if (!member) {
    throw new ForbiddenError('You must be a member of the organization to submit requests.');
  }
  return session;
}

export async function requireOrgAdmin() {
  const session = await requireSession();
  const admin = await isOrgAdmin(session.user.login);
  if (!admin) {
    throw new ForbiddenError('Admin access required.');
  }
  return session;
}
