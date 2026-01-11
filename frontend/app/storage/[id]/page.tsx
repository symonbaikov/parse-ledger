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
import { useIntlayer, useLocale } from 'next-intlayer';
import { resolveBankLogo } from '@bank-logos';

type FileAvailabilityStatus = 'both' | 'disk' | 'db' | 'missing';

type FileAvailability = {
  onDisk: boolean;
  inDb: boolean;
  status: FileAvailabilityStatus;
};

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
  fileAvailability?: FileAvailability;
}

interface CategoryOption {
  id: string;
  name: string;
  color?: string;
}

const getBankDisplayName = (bankName: string) => {
  const resolved = resolveBankLogo(bankName);
  if (!resolved) return bankName;
  return resolved.key !== 'other' ? resolved.displayName : bankName;
};

/**
 * File details page with transactions, sharing, and permissions
 */
export default function FileDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = params.id as string;
  const initialTab = searchParams.get('tab') || 'transactions';
  const t = useIntlayer('storageDetailsPage');
  const { locale } = useLocale();

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
    let cancelled = false;

    const run = async () => {
      const loadedDetails = await loadFileDetails();
      if (cancelled) return;

      loadCategories();

      if (loadedDetails?.fileAvailability?.status === 'missing') {
        setPreviewError(t.preview.unavailable.value);
        revokePreviewUrl();
        setPreviewUrl(null);
        setPreviewLoading(false);
        return;
      }

      await loadPreview(loadedDetails?.fileAvailability?.status);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fileId]);

  useEffect(() => {
    return () => {
      revokePreviewUrl();
    };
  }, []);

  const loadFileDetails = async (): Promise<FileDetails | null> => {
    try {
      setLoading(true);
      const response = await api.get(`/storage/files/${fileId}`);
      setDetails(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to load file details:', error);
      setDetails(null);
      return null;
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

  const loadPreview = async (availabilityStatusOverride?: FileAvailabilityStatus) => {
    const availabilityStatus = availabilityStatusOverride ?? details?.fileAvailability?.status;
    if (availabilityStatus === 'missing') {
      setPreviewError(t.preview.unavailable.value);
      revokePreviewUrl();
      setPreviewUrl(null);
      setPreviewLoading(false);
      return;
    }

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
      const statusCode = (error as any)?.response?.status;
      const backendMessage =
        (error as any)?.response?.data?.error?.message || (error as any)?.response?.data?.message;

      const message =
        statusCode === 404
          ? t.preview.unavailable.value
          : backendMessage || t.toasts.previewFailed.value;
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
    return date.toLocaleDateString(locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
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

  const getPermissionLabel = (permission?: string | null) => {
    switch ((permission || '').toLowerCase()) {
      case 'owner':
        return t.permission.owner.value;
      case 'editor':
        return t.permission.editor.value;
      case 'viewer':
        return t.permission.viewer.value;
      case 'downloader':
        return t.permission.downloader.value;
      default:
        return t.permission.access.value;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return t.status.completed.value;
      case 'processing':
        return t.status.processing.value;
      case 'error':
        return t.status.error.value;
      case 'uploaded':
        return t.status.uploaded.value;
      default:
        return status;
    }
  };

  const getAvailabilityLabel = (status: FileAvailabilityStatus) => {
    switch (status) {
      case 'both':
        return t.availability.labels.both;
      case 'disk':
        return t.availability.labels.disk;
      case 'db':
        return t.availability.labels.db;
      case 'missing':
        return t.availability.labels.missing;
      default:
        return status;
    }
  };

  const getAvailabilityTooltip = (status: FileAvailabilityStatus) => {
    switch (status) {
      case 'both':
        return t.availability.tooltips.both.value;
      case 'disk':
        return t.availability.tooltips.disk.value;
      case 'db':
        return t.availability.tooltips.db.value;
      case 'missing':
        return t.availability.tooltips.missing.value;
      default:
        return status;
    }
  };

  const renderAvailabilityChip = (availability?: FileAvailability) => {
    if (!availability) return null;

    const status = availability.status;
    const color: 'success' | 'info' | 'error' =
      status === 'missing' ? 'error' : status === 'both' ? 'success' : 'info';

    return (
      <Tooltip title={getAvailabilityTooltip(status)}>
        <Chip
          label={getAvailabilityLabel(status)}
          size="small"
          color={color}
          variant={status === 'both' ? 'filled' : 'outlined'}
        />
      </Tooltip>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography>{t.loading}</Typography>
      </Container>
    );
  }

  if (!details) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography>{t.notFound}</Typography>
      </Container>
    );
  }

  const { statement, transactions, sharedLinks, permissions, isOwner, userPermission, fileAvailability } = details;

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
              label={getBankDisplayName(statement.bankName)}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={getStatusLabel(statement.status)}
              size="small"
              color="success"
            />
            {renderAvailabilityChip(fileAvailability)}
            <Chip
              label={isOwner ? t.permission.owner.value : getPermissionLabel(userPermission)}
              size="small"
              color={isOwner ? 'success' : 'default'}
              variant={isOwner ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={t.actions.downloadTooltip.value}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              {t.actions.download}
            </Button>
          </Tooltip>
          {(isOwner || userPermission === 'editor') && (
            <Tooltip title={t.actions.shareTooltip.value}>
              <Button
                variant="contained"
                startIcon={<ShareIcon />}
                onClick={handleShare}
              >
                {t.actions.share}
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
                {t.cards.size}
              </Typography>
              <Typography variant="h6">
                {formatFileSize(statement.fileSize)}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {t.cards.transactions}
              </Typography>
              <Typography variant="h6">
                {transactions.length}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {t.cards.uploadedAt}
              </Typography>
              <Typography variant="h6">
                {formatDate(statement.createdAt)}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {t.cards.account}
              </Typography>
              <Typography variant="h6">
                {statement.metadata?.accountNumber || t.cards.dash.value}
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
              {t.preview.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => loadPreview()}
                disabled={previewLoading}
              >
                {t.preview.refresh}
              </Button>
              {previewUrl && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => previewUrl && window.open(previewUrl, '_blank')}
                >
                  {t.preview.openNewTab}
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
                <Button size="small" onClick={() => loadPreview()}>
                  {t.preview.retry}
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
                title={t.preview.iframeTitle.value}
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
              {t.preview.empty}
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
          <Tab label={`${t.tabs.transactions.value} (${transactions.length})`} />
          <Tab label={`${t.tabs.links.value} (${sharedLinks.length})`} />
          {isOwner && <Tab label={`${t.tabs.permissions.value} (${permissions.length})`} />}
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
