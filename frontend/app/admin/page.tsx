'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { Refresh, Delete, Error as ErrorIcon } from '@mui/icons-material';
import Link from 'next/link';
import apiClient from '../lib/api';

interface Statement {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  bankName: string;
  totalTransactions: number;
  createdAt: string;
  processedAt: string | null;
  errorMessage: string | null;
}

interface AuditLog {
  id: string;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [statementsLoading, setStatementsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (tab === 0) {
      loadStatements();
    } else if (tab === 2) {
      loadAuditLogs();
    }
  }, [tab]);

  const loadStatements = async () => {
    setStatementsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: Statement[] }>('/statements?limit=100');
      setStatements(response.data.data || []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Ошибка загрузки выписок');
    } finally {
      setStatementsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setStatementsLoading(true);
    setError(null);
    try {
      // TODO: Implement audit logs endpoint
      // const response = await apiClient.get<AuditLog[]>('/audit-logs');
      // setAuditLogs(response.data);
      setAuditLogs([]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Ошибка загрузки аудит-лога');
    } finally {
      setStatementsLoading(false);
    }
  };

  const handleReprocess = async (statementId: string) => {
    try {
      await apiClient.post(`/statements/${statementId}/reprocess`);
      loadStatements();
    } catch {
      setError('Ошибка повторной обработки');
    }
  };

  const handleDelete = async (statementId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту выписку?')) {
      return;
    }
    try {
      await apiClient.delete(`/statements/${statementId}`);
      loadStatements();
    } catch {
      setError('Ошибка удаления выписки');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'processing':
        return 'Обрабатывается';
      case 'error':
        return 'Ошибка';
      default:
        return status;
    }
  };

  const filteredStatements = statements.filter(
    s =>
      s.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.bankName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Административная панель
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Журнал выписок" />
          <Tab label="Управление пользователями" />
          <Tab label="Аудит-лог" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {error && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: 'error.light',
                color: 'error.contrastText',
                borderRadius: 1,
              }}
            >
              {error}
            </Box>
          )}

          {tab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <TextField
                  label="Поиск"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <Button variant="outlined" startIcon={<Refresh />} onClick={loadStatements}>
                  Обновить
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Файл</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>Банк</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Операций</TableCell>
                      <TableCell>Дата загрузки</TableCell>
                      <TableCell>Дата обработки</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStatements.map(statement => (
                      <TableRow key={statement.id}>
                        <TableCell>{statement.fileName}</TableCell>
                        <TableCell>{statement.fileType.toUpperCase()}</TableCell>
                        <TableCell>{statement.bankName}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(statement.status)}
                            color={
                              getStatusColor(statement.status) as
                                | 'success'
                                | 'info'
                                | 'error'
                                | 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{statement.totalTransactions || 0}</TableCell>
                        <TableCell>
                          {new Date(statement.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell>
                          {statement.processedAt
                            ? new Date(statement.processedAt).toLocaleDateString('ru-RU')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedStatement(statement);
                              setDialogOpen(true);
                            }}
                            disabled={!statement.errorMessage}
                          >
                            <ErrorIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleReprocess(statement.id)}
                            disabled={statement.status === 'processing' || statementsLoading}
                          >
                            <Refresh />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(statement.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tab === 1 && (
            <Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Перейдите на страницу управления пользователями для настройки прав доступа.
              </Typography>
              <Button variant="contained" component={Link} href="/admin/users">
                Управление пользователями
              </Button>
            </Box>
          )}

          {tab === 2 && (
            <Box>
              {auditLogs.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  Аудит-лог будет доступен после реализации соответствующего endpoint
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Действие</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Дата</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditLogs.map(log => (
                        <TableRow key={log.id}>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.description || '-'}</TableCell>
                          <TableCell>{new Date(log.createdAt).toLocaleString('ru-RU')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Детали ошибки</DialogTitle>
        <DialogContent>
          {selectedStatement?.errorMessage && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedStatement.errorMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
