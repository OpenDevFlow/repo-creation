import { Octokit } from '@octokit/rest';
import { GithubApiError } from '@/domain/errors';

function getAdminOctokit(): Octokit {
  const token = process.env.GH_ADMIN_TOKEN;
  if (!token) throw new Error('GH_ADMIN_TOKEN is not configured');
  return new Octokit({ auth: token });
}

export async function isOrgMember(login: string): Promise<boolean> {
  const octokit = getAdminOctokit();
  const org = process.env.GITHUB_ORG!;
  try {
    await octokit.rest.orgs.checkMembershipForUser({ org, username: login });
    return true;
  } catch {
    return false;
  }
}

export async function isOrgAdmin(login: string): Promise<boolean> {
  const octokit = getAdminOctokit();
  const org = process.env.GITHUB_ORG!;
  try {
    const { data } = await octokit.rest.orgs.getMembershipForUser({ org, username: login });
    return data.role === 'admin';
  } catch {
    return false;
  }
}

export interface CreateRepoOptions {
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'internal';
  teamSlug?: string | null;
}

export interface CreatedRepo {
  url: string;
  fullName: string;
}

export async function createOrgRepo(options: CreateRepoOptions): Promise<CreatedRepo> {
  const octokit = getAdminOctokit();
  const org = process.env.GITHUB_ORG!;

  let repo: Awaited<ReturnType<typeof octokit.rest.repos.createInOrg>>['data'];

  try {
    const response = await octokit.rest.repos.createInOrg({
      org,
      name: options.name,
      description: options.description,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      visibility: options.visibility as any,
      auto_init: true,
      has_issues: true,
      has_projects: false,
      has_wiki: false,
    });
    repo = response.data;
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    const message = (err as { message?: string }).message ?? 'Unknown error';

    if (status === 422) {
      throw new GithubApiError(
        `Repository "${options.name}" already exists in the organization.`,
        message,
      );
    }
    throw new GithubApiError(`GitHub repo creation failed: ${message}`, message);
  }

  if (options.teamSlug) {
    try {
      await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
        org,
        team_slug: options.teamSlug,
        owner: org,
        repo: options.name,
        permission: 'push',
      });
    } catch (err: unknown) {
      // Non-fatal: log and continue — repo was created successfully
      console.warn(
        JSON.stringify({
          level: 'warn',
          message: 'Team assignment failed after repo creation',
          team: options.teamSlug,
          repo: options.name,
          error: (err as Error).message,
        }),
      );
    }
  }

  return { url: repo.html_url, fullName: repo.full_name };
}
