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
import { Icon } from '@iconify/react';
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
    icon?: string;
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
  icon?: string;
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
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="700" sx={{ mb: 1, color: '#191919' }}>
          Хранилище
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управляйте загруженными файлами и документами
        </Typography>
      </Box>

      {/* Main Content Card */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 0, 
          borderRadius: 3, 
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          bgcolor: 'white'
        }}
      >
        {/* Controls Bar */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, borderBottom: '1px solid #e0e0e0', alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Поиск по файлам, банкам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} className="text-gray-500" />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 50, // Pill shape
                bgcolor: '#F8F9FA',
                '& fieldset': { border: 'none' }, // Remove default border
                '&:hover fieldset': { border: '1px solid #e0e0e0' },
                '&.Mui-focused fieldset': { border: '1px solid #0a66c2' }, // LinkedIn blue on focus
                pl: 1
              }
            }}
          />
          <Button
            variant={filtersApplied ? 'contained' : 'outlined'}
            startIcon={<Filter size={18} />}
            onClick={handleOpenFilters}
            size="medium"
            sx={{ 
              borderRadius: 50, 
              textTransform: 'none', 
              minWidth: 120,
              borderColor: filtersApplied ? 'primary.main' : '#666',
              color: filtersApplied ? 'white' : '#666',
              '&:hover': {
                 borderColor: filtersApplied ? 'primary.dark' : '#333',
                 bgcolor: filtersApplied ? 'primary.dark' : 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Фильтры
          </Button>
        </Box>

        {/* Files Table */}
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #e0e0e0', py: 2 }}>Имя файла</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #e0e0e0', py: 2 }}>Банк</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #e0e0e0', py: 2 }}>Счет</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #e0e0e0', py: 2 }}>Размер</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #e0e0e0', py: 2 }}>Статус</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #e0e0e0', py: 2 }}>Категория</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #e0e0e0', py: 2 }}>Доступ</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #e0e0e0', py: 2 }}>Создано</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#666', borderBottom: '1px solid #e0e0e0', py: 2 }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Загрузка данных...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ p: 2, bgcolor: '#F3F2EF', borderRadius: '50%' }}>
                         <Search size={24} className="text-gray-400" />
                      </Box>
                      <Typography color="text.secondary">Файлы не найдены</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    sx={{
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                      borderBottom: '1px solid #f0f0f0' // Very subtle divider
                    }}
                  >
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 0.5, bgcolor: '#eef3f8', borderRadius: 1, color: '#0a66c2' }}>
                           <Icon icon="mdi:file-document-outline" width={20} />
                        </Box>
                        <Box>
                           <Typography variant="body2" fontWeight="600" color="text.primary">
                             {file.fileName}
                           </Typography>
                             {file.sharedLinksCount > 0 && (
                            <Typography variant="caption" color="primary">
                               {file.sharedLinksCount} shared links
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Typography variant="body2">{file.bankName}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                       <Typography variant="body2" color="text.secondary">
                         {file.metadata?.accountNumber || '—'}
                       </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Typography variant="body2" color="text.secondary">{formatFileSize(file.fileSize)}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <Chip
                        label={getStatusLabel(file.status)}
                        size="small"
                        sx={{ 
                            height: 24, 
                            fontWeight: 500,
                            bgcolor: file.status === 'processed' ? '#e6f7e9' : '#f0f0f0',
                            color: file.status === 'processed' ? '#1b5e20' : '#444'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <FormControl size="small" fullWidth variant="standard" sx={{ minWidth: 120 }}>
                        <Select
                          value={file.categoryId || ''}
                          disableUnderline
                          displayEmpty
                          onChange={(e) => handleCategoryChange(file.id, e.target.value as string)}
                          disabled={categoriesLoading || (!file.isOwner && file.permissionType !== 'editor')}
                          sx={{ 
                             fontSize: '0.875rem',
                             '& .MuiSelect-select': { py: 0.5, display: 'flex', alignItems: 'center', gap: 1 } 
                          }}
                          renderValue={(selected) => {
                            const selectedCategory =
                              categories.find((cat) => cat.id === selected) || file.category;

                            if (!selectedCategory) {
                              return <span style={{ color: '#999' }}>Выбрать</span>;
                            }

                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {selectedCategory.icon && <Icon icon={selectedCategory.icon} width={16} color={selectedCategory.color || '#666'} />}
                                <Typography variant="body2" sx={{ color: selectedCategory.color || 'inherit' }}>
                                  {selectedCategory.name}
                                </Typography>
                              </Box>
                            );
                          }}
                        >
                          <MenuItem value="">
                            <em>Без категории</em>
                          </MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icon icon={cat.icon || 'mdi:tag'} width={16} color={cat.color || '#666'} />
                                {cat.name}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Typography variant="caption" sx={{ px: 1, py: 0.5, bgcolor: '#f3f2ef', borderRadius: 1, color: '#666', fontWeight: 500 }}>
                           {file.isOwner ? 'Владелец' : getPermissionLabel(file.permissionType)}
                        </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>
                        <Typography variant="body2" color="text.secondary">
                            {new Date(file.createdAt).toLocaleDateString('ru-RU')}
                        </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip title="View">
                          <button
                            onClick={() => handleView(file.id)}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Download">
                          <button
                            onClick={() => handleDownload(file.id, file.fileName)}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <Download size={18} />
                          </button>
                        </Tooltip>
                        <button
                          onClick={(e) => handleMenuOpen(e, file)}
                           className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
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
      </Paper>

      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
            elevation: 3,
            sx: { borderRadius: 3, mt: 1, minWidth: 150 }
        }}
      >
        <MenuItem onClick={() => {
          if (selectedFile) handleView(selectedFile.id);
          handleMenuClose();
        }} sx={{ gap: 1.5, fontSize: '0.9rem', py: 1 }}>
           <Eye size={16} /> Просмотр
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedFile) handleDownload(selectedFile.id, selectedFile.fileName);
          handleMenuClose();
        }} sx={{ gap: 1.5, fontSize: '0.9rem', py: 1 }}>
           <Download size={16} /> Скачать
        </MenuItem>
        {selectedFile?.isOwner && (
          <>
            <MenuItem onClick={() => {
              if (selectedFile) handleShare(selectedFile.id);
              handleMenuClose();
            }} sx={{ gap: 1.5, fontSize: '0.9rem', py: 1 }}>
               <Share2 size={16} /> Поделиться
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedFile) handleManagePermissions(selectedFile.id);
              handleMenuClose();
            }} sx={{ gap: 1.5, fontSize: '0.9rem', py: 1 }}>
               <Icon icon="mdi:shield-account-outline" width={16} /> Доступ
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
        slotProps={{ paper: { sx: { p: 2, width: 320, borderRadius: 3, marginTop: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } } }}
      >
        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
          Фильтры
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Reuse existing filter logic controls here, just styled if needed */}
          <FormControl size="small" fullWidth>
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>
              Статус
            </Typography>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value as string)}
              displayEmpty
              sx={{ borderRadius: 2 }}
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
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>
              Банк
            </Typography>
            <Select
              value={filters.bank}
              onChange={(e) => handleFilterChange('bank', e.target.value as string)}
              displayEmpty
               sx={{ borderRadius: 2 }}
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
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>
              Категория
            </Typography>
            <Select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value as string)}
              displayEmpty
               sx={{ borderRadius: 2 }}
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
            <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 500 }}>
              Тип доступа
            </Typography>
            <Select
              value={filters.ownership}
              onChange={(e) => handleFilterChange('ownership', e.target.value as string)}
              displayEmpty
               sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">
                <em>Все</em>
              </MenuItem>
              <MenuItem value="owned">Мои файлы</MenuItem>
              <MenuItem value="shared">Доступные мне</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Button variant="text" color="inherit" onClick={handleResetFilters} sx={{ textTransform: 'none' }}>
              Сбросить
            </Button>
            <Button variant="contained" onClick={handleCloseFilters} sx={{ borderRadius: 50, textTransform: 'none', px: 3, boxShadow: 'none' }}>
              Применить
            </Button>
          </Box>
        </Box>
      </Popover>
    </Container>
  );
}
