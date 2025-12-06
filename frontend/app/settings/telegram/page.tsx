'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircleOutline,
  ErrorOutline,
  Send,
  Telegram as TelegramIcon,
  AccessTime,
} from '@mui/icons-material';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import { usePermissions } from '@/app/hooks/usePermissions';

type ReportStatus = 'pending' | 'sent' | 'failed';
type ReportType = 'daily' | 'monthly' | 'custom';

interface TelegramReport {
  id: string;
  chatId: string;
  reportType: ReportType;
  reportDate: string;
  status: ReportStatus;
  sentAt?: string | null;
  createdAt: string;
}

export default function TelegramSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission } = usePermissions();

  const [chatId, setChatId] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<TelegramReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [sendingDaily, setSendingDaily] = useState(false);
  const [sendingMonthly, setSendingMonthly] = useState(false);

  useEffect(() => {
    if (user) {
      setChatId(user.telegramChatId || '');
      setTelegramId(user.telegramId || '');
    }
  }, [user]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      const response = await apiClient.get('/telegram/reports');
      setReports(response.data.data || response.data || []);
    } catch (err) {
      console.error('Failed to load telegram reports', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const connectTelegram = async () => {
    if (!chatId) {
      setError('Укажите chatId, полученный от бота');
      return;
    }

    try {
      setLoading(true);
      setStatusMessage(null);
      setError(null);
      await apiClient.post('/telegram/connect', { chatId, telegramId: telegramId || undefined });
      setStatusMessage('Telegram успешно подключен. Проверьте бота и команду /report.');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось подключить Telegram';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const sendReport = async (type: ReportType) => {
    const setSending = type === 'daily' ? setSendingDaily : setSendingMonthly;
    setSending(true);
    setError(null);
    setStatusMessage(null);

    try {
      await apiClient.post('/telegram/send-report', {
        reportType: type,
        chatId: chatId || undefined,
      });
      setStatusMessage('Отчёт отправлен в Telegram. Проверьте чат.');
      await loadReports();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось отправить отчёт';
      setError(message);
    } finally {
      setSending(false);
    }
  };

  const canView = useMemo(() => hasPermission('telegram.view'), [hasPermission]);

  if (authLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Alert severity="warning">Войдите в систему, чтобы настроить Telegram.</Alert>
      </Container>
    );
  }

  if (!canView) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Alert severity="warning">У вас нет прав для просмотра Telegram настроек.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Telegram настройки
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Подключите чат к боту, отправляйте отчёты и просматривайте историю отправок.
          </Typography>
        </Box>

        {(statusMessage || error) && (
          <Box>
            {statusMessage && <Alert severity="success" sx={{ mb: 1 }}>{statusMessage}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        )}

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Подключение</Typography>
              <Typography variant="body2" color="text.secondary">
                1) В Telegram откройте бота и отправьте команду /start, чтобы увидеть свой Telegram ID.
                2) Введите ниже chatId из Telegram (ID чата, обычно совпадает с вашим user ID для личных чатов).
                3) Нажмите «Сохранить», затем выполните /report в боте.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Telegram chatId"
                placeholder="Например, 123456789"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
              />
              <TextField
                fullWidth
                label="Telegram ID"
                placeholder="ID из команды /start"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                helperText="Необязательно, но ускоряет привязку"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                startIcon={<CheckCircleOutline />}
                onClick={connectTelegram}
                disabled={loading}
              >
                Сохранить подключение
              </Button>
              {user?.telegramId && (
                <Chip
                  icon={<TelegramIcon />}
                  color="success"
                  label={`Связан ID: ${user.telegramId}`}
                  variant="outlined"
                />
              )}
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Быстрая отправка отчёта</Typography>
              <Typography variant="body2" color="text.secondary">
                Ежедневные отчёты отправляются автоматически в 08:00 UTC, месячные — 1 числа в 09:00 UTC.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Send />}
                onClick={() => sendReport('daily')}
                disabled={sendingDaily || !chatId}
              >
                Отправить за сегодня
              </Button>
              <Button
                variant="outlined"
                startIcon={<AccessTime />}
                onClick={() => sendReport('monthly')}
                disabled={sendingMonthly || !chatId}
              >
                Отправить за месяц
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>История отправок</Typography>
              <Typography variant="body2" color="text.secondary">
                Последние попытки отправки отчётов через Telegram бот.
              </Typography>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Тип</TableCell>
                    <TableCell>Дата отчёта</TableCell>
                    <TableCell>Чат</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Отправлено</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length === 0 && !loadingReports && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          История пока пуста.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {reports.map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {report.reportType}
                      </TableCell>
                      <TableCell>{formatDate(report.reportDate)}</TableCell>
                      <TableCell>{report.chatId}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={getStatusColor(report.status)}
                          label={statusLabel(report.status)}
                        />
                      </TableCell>
                      <TableCell>{formatDate(report.sentAt || report.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Paper>

        <Divider />
        <Paper elevation={0} sx={{ p: 3, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Как узнать chatId?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Откройте бота в Telegram, отправьте /start и скопируйте ID из ответа. Для личных чатов chatId совпадает с этим ID. Для групповых чатов понадобится chatId группы (отправьте сообщение и запросите через @userinfobot).
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
}

function formatDate(dateString?: string | null) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU');
}

function getStatusColor(status: ReportStatus) {
  switch (status) {
    case 'sent':
      return 'success';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
}

function statusLabel(status: ReportStatus) {
  switch (status) {
    case 'sent':
      return 'Отправлено';
    case 'failed':
      return 'Ошибка';
    default:
      return 'В очереди';
  }
}
