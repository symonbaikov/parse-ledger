'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { EmailOutlined, LockOutlined } from '@mui/icons-material';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import { useIntlayer } from 'next-intlayer';

const parseError = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  fallback;

export default function ProfileSettingsPage() {
  const { user, loading } = useAuth();
  const t = useIntlayer('settingsProfilePage');
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailMessage(null);
    setEmailError(null);

    if (!emailPassword) {
      setEmailError(t.validation.passwordRequiredForEmail.value);
      return;
    }

    try {
      setEmailLoading(true);
      const response = await apiClient.patch('/users/me/email', {
        email,
        currentPassword: emailPassword,
      });

      setEmailMessage(
        response.data?.message || t.emailCard.successFallback.value,
      );
      setEmailPassword('');
    } catch (err: any) {
      setEmailError(parseError(err, t.emailCard.errorFallback.value));
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (passwords.next !== passwords.confirm) {
      setPasswordError(t.validation.passwordMismatch.value);
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await apiClient.patch('/users/me/password', {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });

      setPasswordMessage(
        response.data?.message || t.passwordCard.successFallback.value,
      );
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      setPasswordError(parseError(err, t.passwordCard.errorFallback.value));
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="warning">
          {t.authRequired}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
	        <Box>
	          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
	            {t.title}
	          </Typography>
	          <Typography variant="body1" color="text.secondary">
	            {t.subtitle}
	          </Typography>
	        </Box>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2} component="form" onSubmit={handleEmailSubmit}>
	            <Stack direction="row" spacing={1} alignItems="center">
	              <EmailOutlined color="primary" />
	              <Typography variant="h6" sx={{ fontWeight: 600 }}>
	                {t.emailCard.title}
	              </Typography>
	            </Stack>

            {emailMessage && <Alert severity="success">{emailMessage}</Alert>}
            {emailError && <Alert severity="error">{emailError}</Alert>}

	            <TextField
	              label={t.emailCard.newEmailLabel.value}
	              type="email"
	              value={email}
	              onChange={(e) => setEmail(e.target.value)}
	              fullWidth
	              required
	            />
	            <TextField
	              label={t.emailCard.currentPasswordLabel.value}
	              type="password"
	              value={emailPassword}
	              onChange={(e) => setEmailPassword(e.target.value)}
	              fullWidth
	              required
	              helperText={t.emailCard.currentPasswordHelp.value}
	            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
	              <Button
	                type="submit"
	                variant="contained"
	                disabled={emailLoading}
	              >
	                {emailLoading ? <CircularProgress size={22} color="inherit" /> : t.emailCard.submit}
	              </Button>
	            </Box>
	          </Stack>
	        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px dashed', borderColor: 'divider' }}>
          <Stack spacing={2} component="form" onSubmit={handlePasswordSubmit}>
	            <Stack direction="row" spacing={1} alignItems="center">
	              <LockOutlined color="primary" />
	              <Typography variant="h6" sx={{ fontWeight: 600 }}>
	                {t.passwordCard.title}
	              </Typography>
	            </Stack>

            {passwordMessage && <Alert severity="success">{passwordMessage}</Alert>}
            {passwordError && <Alert severity="error">{passwordError}</Alert>}

	            <TextField
	              label={t.passwordCard.currentPasswordLabel.value}
	              type="password"
	              value={passwords.current}
	              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
	              fullWidth
	              required
	            />
            <Divider />
	            <TextField
	              label={t.passwordCard.newPasswordLabel.value}
	              type="password"
	              value={passwords.next}
	              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
	              fullWidth
	              required
	              helperText={t.passwordCard.newPasswordHelp.value}
	            />
	            <TextField
	              label={t.passwordCard.confirmPasswordLabel.value}
	              type="password"
	              value={passwords.confirm}
	              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
	              fullWidth
	              required
	            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
	              <Button
	                type="submit"
	                variant="contained"
	                color="secondary"
	                disabled={passwordLoading}
	              >
	                {passwordLoading ? <CircularProgress size={22} color="inherit" /> : t.passwordCard.submit}
	              </Button>
	            </Box>
	          </Stack>
	        </Paper>
      </Stack>
    </Container>
  );
}
