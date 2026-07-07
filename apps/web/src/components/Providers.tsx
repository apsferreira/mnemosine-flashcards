'use client';

/**
 * Next.js App Router — Client Providers
 *
 * Server Components (default in App Router) cannot use React context.
 * This wrapper marks the boundary between server and client trees.
 *
 * Key concept: 'use client' turns this subtree into a client component,
 * enabling useState, useEffect, context — just like regular React.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component so each request gets its own instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
