'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormState {
  repoName: string;
  description: string;
  visibility: 'private' | 'internal' | 'public';
  teamSlug: string;
  justification: string;
}

const INITIAL_STATE: FormState = {
  repoName: '',
  description: '',
  visibility: 'private',
  teamSlug: '',
  justification: '',
};

export function RequestForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          teamSlug: form.teamSlug.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/request?submitted=true'), 1000);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
        <div className="text-2xl mb-2">✅</div>
        <h2 className="text-lg font-semibold text-green-800">Request submitted!</h2>
        <p className="text-green-700 text-sm mt-1">
          An admin will review your request shortly. You&apos;ll receive an email when it&apos;s
          decided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Repository name" required hint="Letters, numbers, hyphens, underscores, and dots only">
        <input
          name="repoName"
          value={form.repoName}
          onChange={handleChange}
          required
          pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]{0,98}[a-zA-Z0-9]|[a-zA-Z0-9]"
          placeholder="my-new-repo"
          className={inputClass}
        />
      </Field>

      <Field label="Description" required>
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          minLength={10}
          maxLength={500}
          placeholder="Short description of the repository's purpose"
          className={inputClass}
        />
      </Field>

      <Field label="Visibility" required>
        <select name="visibility" value={form.visibility} onChange={handleChange} className={inputClass}>
          <option value="private">Private — visible to org members you invite</option>
          <option value="internal">Internal — visible to all org members</option>
          <option value="public">Public — visible to everyone</option>
        </select>
      </Field>

      <Field label="Team slug" hint="Optional — the team that should get push access (e.g. backend-team)">
        <input
          name="teamSlug"
          value={form.teamSlug}
          onChange={handleChange}
          pattern="[a-z0-9\-]*"
          placeholder="backend-team"
          className={inputClass}
        />
      </Field>

      <Field label="Business justification" required hint="Why does this repository need to be created? Minimum 20 characters.">
        <textarea
          name="justification"
          value={form.justification}
          onChange={handleChange}
          required
          minLength={20}
          maxLength={2000}
          rows={4}
          placeholder="Describe the project, its purpose, and why a new repository is needed..."
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 text-white rounded-lg font-medium text-sm hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting…' : 'Submit request'}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent placeholder:text-zinc-400';

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
