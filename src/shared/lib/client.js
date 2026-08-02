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
const shouldToast = (error, query) => {
  if (query?.meta?.silent || query?.options?.meta?.silent) return false;
  return error?.response?.status !== 401;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
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