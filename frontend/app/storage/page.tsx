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
  Popover,
  Divider,
} from '@mui/material';
import {
  Eye,
  Download,
  Share2,
  MoreVertical,
  Search,
  Filter,
} from 'lucide-react';
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
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    bank: '',
    categoryId: '',
    ownership: '',
  });

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
      parsed: 'success',
      validated: 'info',
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
      case 'parsed':
        return 'Распарсено';
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

  const bankOptions = Array.from(new Set(files.map((f) => f.bankName).filter(Boolean)));
  const statusOptions = Array.from(new Set(files.map((f) => f.status).filter(Boolean)));

  const filteredFiles = files.filter((file) => {
    const normalizedBank = (file.bankName || '').toLowerCase();
    const normalizedCategoryName = (file.category?.name || '').toLowerCase();
    const normalizedAccount = (file.metadata?.accountNumber || '').toLowerCase();

    const matchesSearch =
      file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      normalizedBank.includes(searchQuery.toLowerCase()) ||
      normalizedAccount.includes(searchQuery.toLowerCase()) ||
      normalizedCategoryName.includes(searchQuery.toLowerCase());

    const matchesStatus = !filters.status || file.status === filters.status;
    const matchesBank = !filters.bank || file.bankName === filters.bank;
    const matchesCategory = !filters.categoryId || file.categoryId === filters.categoryId;
    const matchesOwnership =
      !filters.ownership ||
      (filters.ownership === 'owned' ? file.isOwner : !file.isOwner);

    return matchesSearch && matchesStatus && matchesBank && matchesCategory && matchesOwnership;
  });

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenFilters = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilters = () => {
    setFilterAnchorEl(null);
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      bank: '',
      categoryId: '',
      ownership: '',
    });
  };

  const filtersApplied =
    !!filters.status || !!filters.bank || !!filters.categoryId || !!filters.ownership;

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
                <Search size={20} className="text-gray-400" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant={filtersApplied ? 'contained' : 'outlined'}
          startIcon={<Filter size={20} />}
          sx={{ minWidth: '150px' }}
          onClick={handleOpenFilters}
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
                <TableCell colSpan={9} align="center">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : filteredFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
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
                    <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity">
                      <Tooltip title="Просмотр">
                        <button
                          onClick={() => handleView(file.id)}
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </Tooltip>
                      <Tooltip title="Скачать">
                        <button
                          onClick={() => handleDownload(file.id, file.fileName)}
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                        >
                          <Download size={18} />
                        </button>
                      </Tooltip>
                      {(file.isOwner || file.canReshare) && (
                        <Tooltip title="Поделиться">
                          <button
                            onClick={() => handleShare(file.id)}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                          >
                            <Share2 size={18} />
                          </button>
                        </Tooltip>
                      )}
                      <button
                        onClick={(e) => handleMenuOpen(e, file)}
                         className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
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

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilters}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 2, width: 320 } } }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Фильтры
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl size="small" fullWidth>
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
              Статус
            </Typography>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value as string)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Все</em>
              </MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {getStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
              Банк
            </Typography>
            <Select
              value={filters.bank}
              onChange={(e) => handleFilterChange('bank', e.target.value as string)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Все</em>
              </MenuItem>
              {bankOptions.map((bank) => (
                <MenuItem key={bank} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
              Категория
            </Typography>
            <Select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value as string)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Все</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
              Тип доступа
            </Typography>
            <Select
              value={filters.ownership}
              onChange={(e) => handleFilterChange('ownership', e.target.value as string)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Все</em>
              </MenuItem>
              <MenuItem value="owned">Мои файлы</MenuItem>
              <MenuItem value="shared">Доступные мне</MenuItem>
            </Select>
          </FormControl>

          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Button variant="text" color="inherit" onClick={handleResetFilters}>
              Сбросить
            </Button>
            <Button variant="contained" onClick={handleCloseFilters}>
              Применить
            </Button>
          </Box>
        </Box>
      </Popover>
    </Container>
  );
}
