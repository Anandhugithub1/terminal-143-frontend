/* eslint-disable no-unused-vars */

// 📁 src/shared/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';


export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Don’t refetch on every window focus (only when stale)
        refetchOnWindowFocus: false,
        // Don’t automatically retry failed queries more than once
        retry: 1,
        // Consider data “fresh” for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep unused cache in memory for 10 minutes before garbage‑collecting
        cacheTime: 10 * 60 * 1000,
        // Only retry failures when network is back online
        retryOnMount: false,
        // Show error UI on mount if previous fetch errored
        refetchOnMount: false,
      },
      mutations: {
        // Don’t retry mutation failures by default
        retry: 0,
        // Use optimistic updates in onMutate if you need instant UI feedback
        onError: (error, variables, context) => {
          // optionally roll back context… 
        },
        // Optionally refetch relevant queries on success
        onSuccess: (data, variables, context) => {
          // e.g. queryClient.invalidateQueries(['profiles'])
        },
      },
    },
  });
  