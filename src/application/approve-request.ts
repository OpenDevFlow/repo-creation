import { prisma } from '@/infra/db/client';
import { createOrgRepo } from '@/infra/github/client';
import { sendEmail } from '@/infra/email/client';
import { approvalEmail } from '@/infra/email/templates';
import { NotFoundError, ConflictError } from '@/domain/errors';

export async function approveRequest(
  requestId: string,
  adminLogin: string,
  adminComment?: string | null,
) {
  const request = await prisma.repoRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new NotFoundError('Request');

  if (request.status !== 'pending') {
    throw new ConflictError(`Request is already ${request.status} and cannot be approved again.`);
  }

  let repoUrl: string;

  try {
    const created = await createOrgRepo({
      name: request.repoName,
      description: request.description,
      visibility: request.visibility as 'public' | 'private' | 'internal',
      teamSlug: request.teamSlug,
    });
    repoUrl = created.url;
  } catch (err) {
    await prisma.repoRequest.update({
      where: { id: requestId },
      data: {
        status: 'failed',
        reviewedBy: adminLogin,
        reviewedAt: new Date(),
        adminComment: adminComment ?? null,
      },
    });
    throw err;
  }

  await prisma.repoRequest.update({
    where: { id: requestId },
    data: {
      status: 'approved',
      repoUrl,
      reviewedBy: adminLogin,
      reviewedAt: new Date(),
      adminComment: adminComment ?? null,
    },
  });

  const template = approvalEmail({
    requesterName: request.requesterName ?? request.requesterLogin,
    repoName: request.repoName,
    repoUrl,
    visibility: request.visibility,
    adminComment,
  });

  await sendEmail({ to: request.requesterEmail, ...template });

  return { repoUrl };
}
