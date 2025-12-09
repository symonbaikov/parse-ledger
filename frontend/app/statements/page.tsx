'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Avatar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Delete,
  CloudUpload,
  Refresh,
  PictureAsPdf,
  Description,
  Download,
  Visibility,
  Close,
} from '@mui/icons-material';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';

interface Statement {
  id: string;
  fileName: string;
  status: string;
  totalTransactions: number;
  createdAt: string;
  processedAt?: string;
  bankName: string;
  fileType: string;
}

export default function StatementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadStatements();
    }
  }, [user]);

  const loadStatements = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/statements');
      const statementsData = response.data.data || response.data;
      // Ensure fileType is included (handle both camelCase and snake_case)
      const statementsWithFileType = Array.isArray(statementsData)
        ? statementsData.map((stmt: Statement & { file_type?: string }) => ({
            ...stmt,
            fileType: stmt.fileType || stmt.file_type || 'pdf', // fallback to pdf if not present
          }))
        : statementsData;
      setStatements(statementsWithFileType);
    } catch (error) {
      console.error('Failed to load statements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async (id: string) => {
    try {
      await apiClient.post(`/statements/${id}/reprocess`);
      await loadStatements();
    } catch (error) {
      console.error('Failed to reprocess statement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту выписку?')) {
      return;
    }

    try {
      await apiClient.delete(`/statements/${id}`);
      await loadStatements();
    } catch (error) {
      console.error('Failed to delete statement:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
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
      case 'uploaded':
        return 'Загружено';
      default:
        return status;
    }
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf':
        return <PictureAsPdf />;
      default:
        return <Description />;
    }
  };

  const handleDownloadFile = async (id: string, fileName: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/statements/${id}/file`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const [fileViewUrl, setFileViewUrl] = useState<string | null>(null);

  const handleViewFile = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/statements/${id}/view`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setFileViewUrl(url);
        setViewingFile(id);
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };

  const handleCloseView = () => {
    if (fileViewUrl) {
      window.URL.revokeObjectURL(fileViewUrl);
      setFileViewUrl(null);
    }
    setViewingFile(null);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Банковские выписки
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Управление загруженными выписками и их статусами
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => router.push('/upload')}
          size="large"
          sx={{ px: 4 }}
        >
          Загрузить выписку
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, boxShadow: 3 }}>
          <TableContainer sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }} width="80">Превью</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Имя файла</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Статус</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Банк</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Транзакции</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Создано</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Обработано</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" color="text.secondary">
                          Нет загруженных выписок
                        </Typography>
                        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => router.push('/upload')}>
                          Загрузить первую выписку
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  statements.map(statement => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={statement.id}>
                      <TableCell>
                        <Tooltip title="Нажмите для просмотра">
                          <Avatar
                            sx={{
                              bgcolor: statement.fileType === 'pdf' ? 'error.light' : 'primary.light',
                              cursor: 'pointer',
                              width: 40,
                              height: 40,
                            }}
                            onClick={() => handleViewFile(statement.id)}
                          >
                            {getFileIcon(statement.fileType)}
                          </Avatar>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {statement.fileName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(statement.status)}
                          color={
                            getStatusColor(statement.status) as
                              | 'success'
                              | 'warning'
                              | 'error'
                              | 'default'
                          }
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>{statement.bankName}</TableCell>
                      <TableCell>{statement.totalTransactions}</TableCell>
                      <TableCell>{new Date(statement.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {statement.processedAt
                          ? new Date(statement.processedAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Просмотреть">
                            <IconButton size="small" onClick={() => handleViewFile(statement.id)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Скачать">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadFile(statement.id, statement.fileName)}
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Редактировать">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/statements/${statement.id}/edit`)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {statement.status === 'error' && (
                            <Tooltip title="Повторить обработку">
                              <IconButton size="small" onClick={() => handleReprocess(statement.id)}>
                                <Refresh fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Удалить">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(statement.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialog for viewing file */}
      <Dialog open={!!viewingFile} onClose={handleCloseView} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {viewingFile && statements.find(s => s.id === viewingFile)?.fileName}
            </Typography>
            <IconButton onClick={handleCloseView}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {fileViewUrl && (
            <Box sx={{ width: '100%', height: '70vh' }}>
              <iframe
                src={fileViewUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="Предпросмотр файла"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {viewingFile && (
            <>
              <Button
                startIcon={<Download />}
                onClick={() => {
                  const statement = statements.find(s => s.id === viewingFile);
                  if (statement) {
                    handleDownloadFile(viewingFile, statement.fileName);
                  }
                }}
              >
                Скачать
              </Button>
              <Button onClick={handleCloseView}>Закрыть</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
