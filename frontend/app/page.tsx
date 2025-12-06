'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Button, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/statements');
    }
  }, [user, loading, router]);

  if (loading || user) {
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #1A237E 30%, #009688 90%)',
        color: 'white',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2 }}
        >
          FinFlow
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
          Professional Bank Statements Processing System
        </Typography>
        <Typography variant="body1" sx={{ mb: 6, fontSize: '1.2rem', opacity: 0.8 }}>
          Automate your financial workflow with precision and speed.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
          <Button
            variant="contained"
            component={Link}
            href="/login"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
              px: 4,
              py: 1.5,
            }}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            component={Link}
            href="/register"
            size="large"
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' },
              px: 4,
              py: 1.5,
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
