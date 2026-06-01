import { z } from 'zod';
import { prisma } from '@/infra/db/client';
import { sendEmail } from '@/infra/email/client';
import { rejectionEmail } from '@/infra/email/templates';
import { NotFoundError, ConflictError, ValidationError } from '@/domain/errors';

export const rejectRequestSchema = z.object({
  rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(1000),
  adminComment: z.string().max(1000).optional().nullable(),
});

export async function rejectRequest(
  requestId: string,
  adminLogin: string,
  rejectionReason: string,
  adminComment?: string | null,
) {
  const parsed = rejectRequestSchema.safeParse({ rejectionReason, adminComment });
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const request = await prisma.repoRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new NotFoundError('Request');

  if (request.status !== 'pending') {
    throw new ConflictError(`Request is already ${request.status} and cannot be rejected.`);
  }

  await prisma.repoRequest.update({
    where: { id: requestId },
    data: {
      status: 'rejected',
      rejectionReason: parsed.data.rejectionReason,
      adminComment: parsed.data.adminComment ?? null,
      reviewedBy: adminLogin,
      reviewedAt: new Date(),
    },
  });

  const template = rejectionEmail({
    requesterName: request.requesterName ?? request.requesterLogin,
    repoName: request.repoName,
    rejectionReason: parsed.data.rejectionReason,
    adminComment: parsed.data.adminComment,
  });

  await sendEmail({ to: request.requesterEmail, ...template });
}
