'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Share as ShareIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import TransactionsView from '../../components/TransactionsView';
import ShareDialog from '../../components/ShareDialog';
import PermissionsPanel from '../../components/PermissionsPanel';

interface StatementCategory {
  id: string;
  name: string;
  color?: string;
}

interface StatementDetails {
  id: string;
  fileName: string;
  bankName: string;
  status: string;
  fileSize: number;
  createdAt: string;
  metadata?: {
    accountNumber?: string;
  };
  category?: StatementCategory | null;
  categoryId?: string | null;
}

interface FileDetails {
  statement: StatementDetails;
  transactions: any[];
  sharedLinks: any[];
  permissions: any[];
  isOwner: boolean;
  userPermission?: string;
}

interface CategoryOption {
  id: string;
  name: string;
  color?: string;
}

/**
 * File details page with transactions, sharing, and permissions
 */
export default function FileDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = params.id as string;
  const initialTab = searchParams.get('tab') || 'transactions';

  const [details, setDetails] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(
    initialTab === 'share' ? 1 : initialTab === 'permissions' ? 2 : 0
  );
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const revokePreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  useEffect(() => {
    loadFileDetails();
    loadCategories();
    loadPreview();
  }, [fileId]);

  useEffect(() => {
    return () => {
      revokePreviewUrl();
    };
  }, []);

  const loadFileDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/storage/files/${fileId}`);
      setDetails(response.data);
    } catch (error) {
      console.error('Failed to load file details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadPreview = async () => {
    try {
      setPreviewLoading(true);
      setPreviewError(null);
      revokePreviewUrl();
      setPreviewUrl(null);

      const response = await api.get(`/storage/files/${fileId}/view`, {
        responseType: 'blob',
      });

      const url = URL.createObjectURL(response.data);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    } catch (error) {
      console.error('Failed to load file preview:', error);
      const message =
        (error as any)?.response?.data?.error?.message ||
        (error as any)?.response?.data?.message ||
        'Не удалось загрузить превью файла';
      setPreviewError(message);
      setPreviewUrl(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!details) return;

    try {
      const response = await api.get(`/storage/files/${fileId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', details.statement.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (!details) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography>Файл не найден</Typography>
      </Container>
    );
  }

  const { statement, transactions, sharedLinks, permissions, isOwner, userPermission } = details;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => router.push('/storage')}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1">
            {statement.fileName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip
              label={statement.bankName}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={statement.status}
              size="small"
              color="success"
            />
            <Chip
              label={isOwner ? 'Владелец' : userPermission || 'Доступ'}
              size="small"
              color={isOwner ? 'success' : 'default'}
              variant={isOwner ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Скачать файл">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Скачать
            </Button>
          </Tooltip>
          {(isOwner || userPermission === 'editor') && (
            <Tooltip title="Поделиться файлом">
              <Button
                variant="contained"
                startIcon={<ShareIcon />}
                onClick={handleShare}
              >
                Поделиться
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* File info + preview */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.1fr 1.4fr',
          },
          gap: 2,
          alignItems: 'stretch',
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(auto-fit, minmax(160px, 1fr))',
              sm: 'repeat(auto-fit, minmax(200px, 1fr))',
            },
            gap: 2,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Размер файла
              </Typography>
              <Typography variant="h6">
                {formatFileSize(statement.fileSize)}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Транзакций
              </Typography>
              <Typography variant="h6">
                {transactions.length}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Загружено
              </Typography>
              <Typography variant="h6">
                {formatDate(statement.createdAt)}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Счет
              </Typography>
              <Typography variant="h6">
                {statement.metadata?.accountNumber || '—'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Предпросмотр файла
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={loadPreview}
                disabled={previewLoading}
              >
                Обновить
              </Button>
              {previewUrl && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => previewUrl && window.open(previewUrl, '_blank')}
                >
                  Открыть в новой вкладке
                </Button>
              )}
            </Box>
          </Box>

          {previewLoading && (
            <Box
              sx={{
                flex: 1,
                minHeight: 260,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {!previewLoading && previewError && (
            <Alert severity="error" sx={{ flex: 1 }}>
              {previewError}
              <Box sx={{ mt: 1 }}>
                <Button size="small" onClick={loadPreview}>
                  Попробовать снова
                </Button>
              </Box>
            </Alert>
          )}

          {!previewLoading && !previewError && previewUrl && (
            <Box
              sx={{
                flex: 1,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                minHeight: 260,
                backgroundColor: 'background.paper',
              }}
            >
              <iframe
                src={previewUrl}
                title="Предпросмотр файла"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </Box>
          )}

          {!previewLoading && !previewError && !previewUrl && (
            <Alert severity="info" sx={{ flex: 1 }}>
              Превью появится после загрузки файла. Если формат не поддерживает онлайн-просмотр, скачайте файл.
            </Alert>
          )}
        </Paper>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Транзакции (${transactions.length})`} />
          <Tab label={`Ссылки (${sharedLinks.length})`} />
          {isOwner && <Tab label={`Права доступа (${permissions.length})`} />}
        </Tabs>
      </Paper>

      {/* Tab panels */}
      <Box>
        {currentTab === 0 && (
          <TransactionsView transactions={transactions} />
        )}
        {currentTab === 1 && (
          <ShareDialog
            open={true}
            onClose={() => {}}
            fileId={fileId}
            sharedLinks={sharedLinks}
            onLinksUpdate={loadFileDetails}
          />
        )}
        {currentTab === 2 && isOwner && (
          <PermissionsPanel
            fileId={fileId}
            permissions={permissions}
            onPermissionsUpdate={loadFileDetails}
          />
        )}
      </Box>
    </Container>
  );
}
