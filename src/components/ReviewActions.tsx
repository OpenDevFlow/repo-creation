'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewActionsProps {
  requestId: string;
  repoName: string;
}

export function ReviewActions({ requestId, repoName }: ReviewActionsProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'approve' | 'reject'>('idle');
  const [adminComment, setAdminComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminComment: adminComment.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? 'Approval failed. Please try again.');
        return;
      }
      router.refresh();
      router.push(`/admin?approved=${encodeURIComponent(repoName)}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      setError('A rejection reason is required.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim(),
          adminComment: adminComment.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? 'Rejection failed. Please try again.');
        return;
      }
      router.refresh();
      router.push('/admin');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {mode === 'idle' && (
        <div className="flex gap-3">
          <button
            onClick={() => setMode('approve')}
            className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => setMode('reject')}
            className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {mode === 'approve' && (
        <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800">
            Approve — this will immediately create the repository.
          </p>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Admin comment (optional)
            </label>
            <textarea
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              rows={2}
              placeholder="Any note to include in the notification email…"
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creating repo…' : 'Confirm Approval'}
            </button>
            <button
              onClick={() => { setMode('idle'); setError(null); }}
              disabled={isSubmitting}
              className="px-4 py-2 text-zinc-600 text-sm hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === 'reject' && (
        <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">Reject request</p>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Rejection reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              required
              placeholder="Explain why this request is being rejected…"
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Admin comment (optional)
            </label>
            <textarea
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              rows={2}
              placeholder="Additional context for the requester…"
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
            <button
              onClick={() => { setMode('idle'); setError(null); }}
              disabled={isSubmitting}
              className="px-4 py-2 text-zinc-600 text-sm hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
