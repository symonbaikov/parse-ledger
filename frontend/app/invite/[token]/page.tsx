'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ShieldCheck } from 'lucide-react';
import apiClient from '@/app/lib/api';

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const tokenParam = params?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  const [form, setForm] = useState({ name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.post('/workspaces/invitations/accept', {
        token,
        name: form.name || undefined,
        password: form.password || undefined,
      });
      setSuccess(
        response.data?.message || 'Приглашение принято. Теперь можно войти в систему.',
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось принять приглашение');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Некорректная ссылка приглашения</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <ShieldCheck size={24} />
              <Typography variant="h5" fontWeight={700}>
                Присоединиться к рабочему пространству
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Если у вас уже есть аккаунт на этот email, заполнение имени и пароля не обязательно.
              Новым пользователям потребуется задать пароль.
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Имя"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Пароль"
                  type="password"
                  helperText="Минимум 8 символов (только для новых аккаунтов)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  fullWidth
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/login')}
                    disabled={loading}
                  >
                    Войти
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    Принять приглашение
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
