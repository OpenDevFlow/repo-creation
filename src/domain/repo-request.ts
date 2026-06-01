export const REPO_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,98}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;

export const VISIBILITY_OPTIONS = ['private', 'internal', 'public'] as const;
export type Visibility = (typeof VISIBILITY_OPTIONS)[number];

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FAILED: 'failed',
} as const;
export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

export interface RepoRequest {
  id: string;
  repoName: string;
  description: string;
  visibility: Visibility;
  teamSlug: string | null;
  justification: string;
  requesterLogin: string;
  requesterEmail: string;
  requesterName: string | null;
  status: RequestStatus;
  repoUrl: string | null;
  rejectionReason: string | null;
  adminComment: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function isValidRepoName(name: string): boolean {
  return REPO_NAME_PATTERN.test(name);
}
