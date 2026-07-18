import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Trash2 } from 'lucide-react';
import PageHeader from '../../shared/components/PageHeader';
import { SecondaryButton } from '../../shared/Button';
import { deleteMyAccount } from '../../features/UserProfile/api/profile';
import { signOut } from '../../features/Auth/authApi';
import { socketManager } from '../../shared/socket/socketManager';
import '@fontsource-variable/inter';

// Typing this exactly is required before the delete button enables — a
// deliberate speed bump for an action that removes the account everywhere.
const CONFIRM_WORD = 'DELETE';

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const result = await deleteMyAccount();
      // Auth is an HttpOnly cookie — clearing localStorage does NOT sign the
      // user out. Only the server can drop the cookie, so hit signout the same
      // way the logout flow does; otherwise the session survives the deletion.
      // Never let a signout failure strand the user on a deleted account:
      // the local teardown below still runs.
      try {
        await signOut('signout');
      } catch (err) {
        console.warn('Signout after account deletion failed', err);
      }
      return result;
    },
    onSuccess: () => {
      socketManager.closeSession();
      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
    onError: (err) => {
      setError(
        err?.response?.data?.error || err?.message || 'Could not delete your account. Please try again.'
      );
    },
  });

  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_WORD && !deleteMutation.isPending;

  return (
    <div className="min-h-[100dvh] bg-white font-inter">
      <PageHeader title="Delete account" />

      <div className="p-4 max-w-md mx-auto">
        <div className="mt-4 flex items-start gap-3 p-4 rounded-lg bg-rose-50 border border-rose-100">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-rose-900">
              This removes your profile from PassOrMatch
            </h2>
            <p className="text-sm text-rose-800/80 mt-1">
              Your profile stops appearing to everyone right away.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm text-gray-600">
          <p>When you delete your account:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Your profile is hidden from matches, requests and circles immediately.</li>
            <li>You&apos;ll be signed out on this device.</li>
            <li>Your matches and conversations are no longer reachable.</li>
          </ul>
          <p className="text-gray-500">
            Your data is kept for 60 days before it is permanently removed, so
            your account can be restored if you change your mind.
          </p>
        </div>

        <label className="block mt-6 text-sm font-medium text-gray-700">
          Type <span className="font-bold text-gray-900">{CONFIRM_WORD}</span> to confirm
          <input
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (error) setError('');
            }}
            placeholder={CONFIRM_WORD}
            autoCapitalize="characters"
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </label>

        {error && (
          <p className="mt-3 text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={!canDelete}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-rose-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition"
          >
            <Trash2 className="w-4 h-4" />
            {deleteMutation.isPending ? 'Deleting…' : 'Delete my account'}
          </button>

          <SecondaryButton onClick={() => navigate(-1)} className="!py-3" to="#">
            Cancel
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
