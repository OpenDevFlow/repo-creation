function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: #18181b; padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 18px; font-weight: 600; }
    .body { padding: 32px; color: #374151; line-height: 1.6; }
    .body p { margin: 0 0 16px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .card table { width: 100%; border-collapse: collapse; }
    .card td { padding: 6px 0; font-size: 14px; vertical-align: top; }
    .card td:first-child { color: #6b7280; width: 140px; font-weight: 500; }
    .card td:last-child { color: #111827; }
    .btn { display: inline-block; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .btn-green { background: #16a34a; color: #fff; }
    .btn-red { background: #dc2626; color: #fff; }
    .footer { padding: 20px 32px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Repo Request System</h1></div>
    <div class="body">${content}</div>
    <div class="footer">This is an automated message. Do not reply to this email.</div>
  </div>
</body>
</html>`;
}

export function approvalEmail(params: {
  requesterName: string;
  repoName: string;
  repoUrl: string;
  visibility: string;
  adminComment?: string | null;
}): { subject: string; html: string } {
  const comment = params.adminComment
    ? `<p><strong>Admin note:</strong> ${escapeHtml(params.adminComment)}</p>`
    : '';

  return {
    subject: `✅ Repo request approved — ${params.repoName}`,
    html: baseLayout(`
      <p>Hi <strong>${escapeHtml(params.requesterName)}</strong>,</p>
      <p>Your repository request has been <strong>approved</strong> and the repository is ready.</p>
      <div class="card">
        <table>
          <tr><td>Repository</td><td>${escapeHtml(params.repoName)}</td></tr>
          <tr><td>Visibility</td><td>${escapeHtml(params.visibility)}</td></tr>
          <tr><td>URL</td><td><a href="${params.repoUrl}">${params.repoUrl}</a></td></tr>
        </table>
      </div>
      ${comment}
      <p><a href="${params.repoUrl}" class="btn btn-green">Open Repository</a></p>
    `),
  };
}

export function rejectionEmail(params: {
  requesterName: string;
  repoName: string;
  rejectionReason: string;
  adminComment?: string | null;
}): { subject: string; html: string } {
  const comment = params.adminComment
    ? `<p><strong>Additional context:</strong> ${escapeHtml(params.adminComment)}</p>`
    : '';

  return {
    subject: `❌ Repo request rejected — ${params.repoName}`,
    html: baseLayout(`
      <p>Hi <strong>${escapeHtml(params.requesterName)}</strong>,</p>
      <p>Your request for the repository <strong>${escapeHtml(params.repoName)}</strong> has been <strong>rejected</strong>.</p>
      <div class="card">
        <table>
          <tr><td>Repository</td><td>${escapeHtml(params.repoName)}</td></tr>
          <tr><td>Reason</td><td>${escapeHtml(params.rejectionReason)}</td></tr>
        </table>
      </div>
      ${comment}
      <p>If you believe this is incorrect or have additional context, please submit a new request with more details.</p>
    `),
  };
}

export function adminNotificationEmail(params: {
  requesterLogin: string;
  requesterEmail: string;
  repoName: string;
  visibility: string;
  justification: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `📬 New repo request — ${params.repoName}`,
    html: baseLayout(`
      <p>A new repository has been requested.</p>
      <div class="card">
        <table>
          <tr><td>Requester</td><td>@${escapeHtml(params.requesterLogin)} (${escapeHtml(params.requesterEmail)})</td></tr>
          <tr><td>Repository</td><td>${escapeHtml(params.repoName)}</td></tr>
          <tr><td>Visibility</td><td>${escapeHtml(params.visibility)}</td></tr>
          <tr><td>Justification</td><td>${escapeHtml(params.justification)}</td></tr>
        </table>
      </div>
      <p><a href="${params.dashboardUrl}" class="btn btn-green">Review in Dashboard</a></p>
    `),
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
