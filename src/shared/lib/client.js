// src/shared/lib/client.js
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '../api/getErrorMessage';

// Global fallback toast for any query/mutation that doesn't handle its own
// error UI. A screen that already shows an inline error or calls toast.error
// itself isn't double-toasted for the same failure — see the `meta.silent`
// check below, opt in per call with `{ meta: { silent: true } }`.
// 401s are excluded here: authInterceptors.js's response interceptor already
// forces a logout + redirect for those, and stacking a toast on top of a
// screen that's about to unmount is not useful.
//
// ["my-profile"] 404s are ALSO excluded, but narrowly — not a blanket "hide
// all 404s" rule, since a 404 on e.g. a deleted post really is worth
// surfacing. A brand-new user (just registered, no profile row created yet)
// or anyone landing on / before completing signup gets a 404 here as the
// NORMAL, expected first response — RequireProfileIncomplete/DefaultHomeRoute
// already treat it as "show the wizard" / "go to login", not an error. The
// toast was firing anyway underneath that correct handling, showing "Profile
// not found" to someone who was never supposed to see an error at all.
const isExpectedNoProfileYet = (error, query) => {
  const key = query?.queryKey || query?.options?.queryKey;
  return key?.[0] === 'my-profile' && error?.response?.status === 404;
};

const shouldToast = (error, query) => {
  if (query?.meta?.silent || query?.options?.meta?.silent) return false;
  if (isExpectedNoProfileYet(error, query)) return false;
  return error?.response?.status !== 401;
};

// A 401/403 will never succeed on retry — there's no token to appear between
// attempts — so retrying one only adds a wasted round-trip of latency before
// the user sees anything. Matters most for a first-time/logged-out visitor
// hitting the home screen: their profile fetch 401s immediately, and without
// this they'd sit through a retry before ProtectedRoute/DefaultHomeRoute
// redirects them to /login. Everything else keeps the default single retry.
const shouldRetryQuery = (failureCount, error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403) return false;
  return failureCount < 1;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (shouldToast(error, query)) toast.error(getErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _context, mutation) => {
      if (shouldToast(error, mutation)) toast.error(getErrorMessage(error));
    },
  }),
});