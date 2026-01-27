'use client';

import { AuthLanguageSwitcher } from '@/app/components/AuthLanguageSwitcher';
import { GoogleAuthButton } from '@/app/components/GoogleAuthButton';
import apiClient from '@/app/lib/api';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Link,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useIntlayer, useLocale } from 'next-intlayer';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function safeInternalPath(nextPath: string | null) {
  if (!nextPath) return null;
  if (!nextPath.startsWith('/')) return null;
  if (nextPath.startsWith('//')) return null;
  return nextPath;
}

function extractInviteTokenFromNext(nextPath: string | null) {
  if (!nextPath) return null;
  try {
    const url = new URL(nextPath, 'http://localhost');
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments[0] !== 'invite') return null;
    return segments[1] || null;
  } catch {
    const pathOnly = nextPath.split('?')[0]?.split('#')[0] || '';
    const segments = pathOnly.split('/').filter(Boolean);
    if (segments[0] !== 'invite') return null;
    return segments[1] || null;
  }
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const nextPath = safeInternalPath(searchParams.get('next'));
  const inviteTokenFromNext = extractInviteTokenFromNext(nextPath);
  const inviteToken = searchParams.get('invite') || inviteTokenFromNext;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { locale } = useLocale();
  const t = useIntlayer('loginPage');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const [helloIndex, setHelloIndex] = useState(0);

  const GREETINGS = [
    { text: 'Добро пожаловать', lang: 'ru' },
    { text: 'Қош келдіңіз', lang: 'kk' },
    { text: 'Welcome', lang: 'en' },
  ];

  /*
   * Cycle the greeting every 4 seconds.
   * Runs only once on mount to set up interval.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setHelloIndex(prev => (prev + 1) % GREETINGS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      window.location.href = nextPath || '/';
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.response?.data?.error?.message || t.loginFailed.value,
      );
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <Grid key={locale} container sx={{ minHeight: '100vh' }}>
      {/* Left Side - Form */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <AuthLanguageSwitcher />
        </Box>

        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h4" color="white" fontWeight="bold">
              👋
            </Typography>
          </Box>

          <Box
            sx={{
              height: 60,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={helloIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'absolute' }}
              >
                <Typography
                  component="h1"
                  variant="h4"
                  fontWeight="bold"
                  color="text.primary"
                  align="center"
                >
                  {GREETINGS[helloIndex].text}
                </Typography>
              </motion.div>
            </AnimatePresence>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t.subtitle}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {googleEnabled && (
            <>
              <GoogleAuthButton
                inviteToken={inviteToken}
                nextPath={nextPath}
                onError={setError}
                errorFallback={t.googleLoginFailed.value}
              />
              <Divider sx={{ my: 2, width: '100%' }}>{t.orLabel}</Divider>
            </>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'background.default' },
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t.passwordLabel.value}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'background.default' },
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: 'none',
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t.submit}
            </Button>
            <Box textAlign="center" sx={{ mt: 3 }}>
              <Link
                href={
                  nextPath
                    ? `/register?next=${encodeURIComponent(nextPath)}${
                        inviteToken ? `&invite=${encodeURIComponent(inviteToken)}` : ''
                      }`
                    : '/register'
                }
                variant="body2"
                sx={{ textDecoration: 'none', fontWeight: 500 }}
              >
                {t.noAccount}
              </Link>
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Right Side - Visual */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Abstract Shapes */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut' as const,
          }}
          style={{
            position: 'absolute',
            top: '20%',
            right: '20%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            filter: 'blur(40px)',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut' as const,
          }}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: 300,
            height: 300,
            borderRadius: '30%',
            background: 'rgba(255, 255, 255, 0.05)',
            filter: 'blur(40px)',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', p: 4 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            FinFlow
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.8, maxWidth: 500 }}>
            {t.rightTagline}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
