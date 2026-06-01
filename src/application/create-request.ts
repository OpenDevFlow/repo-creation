import { z } from 'zod';
import { prisma } from '@/infra/db/client';
import { sendEmail } from '@/infra/email/client';
import { adminNotificationEmail } from '@/infra/email/templates';
import { isValidRepoName, VISIBILITY_OPTIONS } from '@/domain/repo-request';
import { ConflictError, ValidationError } from '@/domain/errors';

export const createRequestSchema = z.object({
  repoName: z
    .string()
    .min(1, 'Repository name is required')
    .max(100, 'Repository name must be 100 characters or fewer')
    .refine(isValidRepoName, {
      message:
        'Repository name may only contain letters, numbers, hyphens, underscores, and dots, and must start and end with a letter or number.',
    }),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  visibility: z.enum(VISIBILITY_OPTIONS),
  teamSlug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Team slug may only contain lowercase letters, numbers, and hyphens')
    .max(100)
    .optional()
    .nullable(),
  justification: z.string().min(20, 'Justification must be at least 20 characters').max(2000),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

export async function createRequest(
  input: CreateRequestInput,
  requester: { login: string; email: string; name?: string | null },
) {
  const parsed = createRequestSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    throw new ValidationError(firstError.message);
  }

  const { repoName, description, visibility, teamSlug, justification } = parsed.data;

  const existing = await prisma.repoRequest.findFirst({
    where: {
      repoName,
      status: { in: ['pending', 'approved'] },
    },
    select: { id: true, status: true },
  });

  if (existing) {
    const label = existing.status === 'approved' ? 'already been approved' : 'already pending review';
    throw new ConflictError(
      `A request for "${repoName}" has ${label}. Please choose a different name.`,
    );
  }

  const request = await prisma.repoRequest.create({
    data: {
      repoName,
      description,
      visibility,
      teamSlug: teamSlug ?? null,
      justification,
      requesterLogin: requester.login,
      requesterEmail: requester.email,
      requesterName: requester.name ?? null,
      status: 'pending',
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const dashboardUrl = `${process.env.NEXTAUTH_URL}/admin/${request.id}`;
    const template = adminNotificationEmail({
      requesterLogin: requester.login,
      requesterEmail: requester.email,
      repoName,
      visibility,
      justification,
      dashboardUrl,
    });
    // Fire-and-forget — don't block the response on notification delivery
    sendEmail({ to: adminEmail, ...template }).catch((err) => {
      console.error(
        JSON.stringify({
          level: 'error',
          message: 'Admin notification email failed',
          requestId: request.id,
          error: (err as Error).message,
        }),
      );
    });
  }

  return request;
}
