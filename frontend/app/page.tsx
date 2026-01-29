'use client';

import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useWorkspace } from './contexts/WorkspaceContext';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();

  useEffect(() => {
    if (!authLoading && !workspaceLoading) {
      if (!user) {
        router.push('/login');
      } else if (currentWorkspace) {
        router.push('/reports');
      } else {
        router.push('/workspaces');
      }
    }
  }, [user, authLoading, currentWorkspace, workspaceLoading, router]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
