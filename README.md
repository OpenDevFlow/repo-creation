# Repo Request System

A GitHub Actions workflow that lets org members request new repositories. Admins approve or reject via issue labels — on approval the repo is created automatically and both parties are notified by email.

## How it works

```
Member opens issue  →  Admin applies label  →  Workflow fires
      ↓                        ↓                      ↓
  Request form            approved / rejected    Creates repo + sends email
```

1. **Member** opens an issue using the **Repository Request** template
2. **Admin** reviews the request and applies the `approved` or `rejected` label
3. **On approval** — the workflow:
   - Creates the GitHub repository with the requested visibility
   - Assigns the specified team (if any) with push access
   - Adds the requester as a collaborator
   - Comments the new repo URL on the issue and closes it
   - Sends an approval email to the requester
4. **On rejection** — the workflow comments on the issue, closes it, and sends a rejection email

## Setup

### 1. Add repository secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|---|---|
| `GH_ADMIN_TOKEN` | Personal access token with `repo` and `admin:org` scopes |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) |
| `EMAIL_FROM` | Sender address, e.g. `Repo Requests <noreply@yourcompany.com>` |

### 2. Create the labels

Run the **Setup Labels** workflow once:

**Actions → Setup Labels → Run workflow**

This creates the `repo-request`, `approved`, `rejected`, and `completed` labels.

### 3. Done

Members can now open issues using the **Repository Request** template.

## Request flow

| Label applied | Action |
|---|---|
| `approved` | Repo created → email sent → issue closed as completed |
| `rejected` | Email sent → issue closed as not planned |

> Only org admins can apply decision labels. If someone else applies one, the workflow removes it and posts a warning comment.

## Secrets reference

| Secret | Required | Notes |
|---|---|---|
| `GH_ADMIN_TOKEN` | Yes | PAT scopes: `repo`, `admin:org`, `read:org` |
| `RESEND_API_KEY` | Yes | From resend.com — free tier works |
| `EMAIL_FROM` | Yes | Use `onboarding@resend.dev` on Resend free tier |
