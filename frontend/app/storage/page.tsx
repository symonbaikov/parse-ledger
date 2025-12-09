'use client';

import React, { useEffect, useState } from 'react';
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
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  Select,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { alpha } from '@mui/material/styles';
import api from '../lib/api';

interface StorageFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  bankName: string;
  status: string;
  createdAt: string;
  isOwner: boolean;
  permissionType?: string;
  canReshare: boolean;
  sharedLinksCount: number;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
    color?: string;
  } | null;
  metadata?: {
    accountNumber?: string;
    periodStart?: string;
    periodEnd?: string;
  };
}

interface CategoryOption {
  id: string;
  name: string;
  color?: string;
}

/**
 * Storage page - displays all files with sharing and permissions
 */
export default function StoragePage() {
  const router = useRouter();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    loadFiles();
    loadCategories();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/storage/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to load files:', error);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, file: StorageFile) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const handleView = (fileId: string) => {
    router.push(`/storage/${fileId}`);
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await api.get(`/storage/files/${fileId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleShare = (fileId: string) => {
    router.push(`/storage/${fileId}?tab=share`);
  };

  const handleManagePermissions = (fileId: string) => {
    router.push(`/storage/${fileId}?tab=permissions`);
  };

  const handleCategoryChange = async (fileId: string, categoryId: string) => {
    try {
      const response = await api.patch(`/storage/files/${fileId}/category`, {
        categoryId: categoryId || null,
      });

      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? {
                ...file,
                categoryId: response.data?.categoryId ?? null,
                category: response.data?.category ?? null,
              }
            : file,
        ),
      );
    } catch (error) {
      console.error('Failed to update file category:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      completed: 'success',
      processing: 'warning',
      error: 'error',
      uploaded: 'info',
    };
    return colors[status.toLowerCase()] || 'default';
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getPermissionLabel = (permission?: string | null) => {
    switch ((permission || '').toLowerCase()) {
      case 'owner':
        return 'Владелец';
      case 'editor':
        return 'Редактор';
      case 'viewer':
        return 'Просмотр';
      case 'downloader':
        return 'Скачивание';
      default:
        return 'Доступ';
    }
  };

  const filteredFiles = files.filter((file) =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.metadata?.accountNumber?.includes(searchQuery) ||
    file.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Хранилище
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Все загруженные файлы и документы с результатами парсинга
        </Typography>
      </Box>

      {/* Search and filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск по названию, банку или номеру счета..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          sx={{ minWidth: '150px' }}
        >
          Фильтры
        </Button>
      </Box>

      {/* Files table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя файла</TableCell>
              <TableCell>Банк</TableCell>
              <TableCell>Счет</TableCell>
              <TableCell>Размер</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Доступ</TableCell>
              <TableCell>Создано</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : filteredFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Файлы не найдены
                </TableCell>
              </TableRow>
            ) : (
              filteredFiles.map((file) => (
                <TableRow
                  key={file.id}
                  hover
                  sx={
                    file.category?.color
                      ? {
                        backgroundColor: alpha(file.category.color, 0.08),
                        '&:hover': {
                          backgroundColor: alpha(file.category.color, 0.14),
                        },
                      }
                      : undefined
                  }
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {file.fileName}
                      {file.sharedLinksCount > 0 && (
                        <Chip
                          label={`${file.sharedLinksCount} ссылка`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{file.bankName}</TableCell>
                  <TableCell>
                    {file.metadata?.accountNumber || '—'}
                  </TableCell>
                  <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(file.status)}
                      size="small"
                      color={getStatusColor(file.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={file.categoryId || ''}
                        displayEmpty
                        onChange={(e) => handleCategoryChange(file.id, e.target.value as string)}
                        disabled={categoriesLoading || (!file.isOwner && file.permissionType !== 'editor')}
                        renderValue={(selected) => {
                          const selectedCategory =
                            categories.find((cat) => cat.id === selected) || file.category;

                          if (!selectedCategory) {
                            return <Box component="span" sx={{ color: 'text.secondary' }}>Без категории</Box>;
                          }

                          return (
                            <Chip
                              label={selectedCategory.name}
                              size="small"
                              sx={{
                                bgcolor: selectedCategory.color || 'grey.300',
                                color: selectedCategory.color ? 'white' : 'inherit',
                              }}
                            />
                          );
                        }}
                      >
                        <MenuItem value="">
                          <em>Без категории</em>
                        </MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: cat.color || 'grey.400',
                                }}
                              />
                              {cat.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={file.isOwner ? 'Владелец' : getPermissionLabel(file.permissionType)}
                      size="small"
                      color={file.isOwner ? 'success' : 'default'}
                      variant={file.isOwner ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{formatDate(file.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Просмотр">
                      <IconButton
                        size="small"
                        onClick={() => handleView(file.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Скачать">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(file.id, file.fileName)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    {(file.isOwner || file.canReshare) && (
                      <Tooltip title="Поделиться">
                        <IconButton
                          size="small"
                          onClick={() => handleShare(file.id)}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, file)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedFile) handleView(selectedFile.id);
          handleMenuClose();
        }}>
          Просмотр
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedFile) handleDownload(selectedFile.id, selectedFile.fileName);
          handleMenuClose();
        }}>
          Скачать
        </MenuItem>
        {selectedFile?.isOwner && (
          <>
            <MenuItem onClick={() => {
              if (selectedFile) handleShare(selectedFile.id);
              handleMenuClose();
            }}>
              Поделиться
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedFile) handleManagePermissions(selectedFile.id);
              handleMenuClose();
            }}>
              Управление доступом
            </MenuItem>
          </>
        )}
      </Menu>
    </Container>
  );
}
