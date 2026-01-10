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
import { DocumentTypeIcon } from '../components/DocumentTypeIcon';
import toast from 'react-hot-toast';
import { useIntlayer, useLocale } from 'next-intlayer';

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
  const t = useIntlayer('storagePage');
  const { locale } = useLocale();
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
      toast.error(t.toasts.loadFilesFailed.value);
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
      toast.error(t.toasts.loadCategoriesFailed.value);
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
      toast.success(t.toasts.downloaded.value);
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error(t.toasts.downloadFailed.value);
    }
  };

  const handleShare = (fileId: string) => {
    router.push(`/storage/${fileId}?tab=share`);
    toast.success(t.toasts.shareOpened.value);
  };

  const handleManagePermissions = (fileId: string) => {
    router.push(`/storage/${fileId}?tab=permissions`);
    toast.success(t.toasts.permissionsOpened.value);
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
      toast.success(t.toasts.categoryUpdated.value);
    } catch (error) {
      console.error('Failed to update file category:', error);
      toast.error(t.toasts.categoryUpdateFailed.value);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
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
        return t.statusLabels.completed.value;
      case 'processing':
        return t.statusLabels.processing.value;
      case 'error':
        return t.statusLabels.error.value;
      case 'uploaded':
        return t.statusLabels.uploaded.value;
      case 'parsed':
        return t.statusLabels.parsed.value;
      default:
        return status;
    }
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
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4, lg: 8 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1, color: '#111827', fontWeight: 600, letterSpacing: '-0.01em' }}>
            {t.title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', maxWidth: 600 }}>
            {t.subtitle}
          </Typography>
        </Box>
        {/* Potentially add a primary action button here if needed in future */}
      </Box>

      {/* Main Content Card */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3, 
          border: '1px solid #F3F4F6',
          overflow: 'hidden',
          bgcolor: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px 0 rgba(0, 0, 0, 0.01)'
        }}
      >
        {/* Controls Bar */}
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, borderBottom: '1px solid #F3F4F6', alignItems: 'center' }}>
          <TextField
            placeholder={t.searchPlaceholder.value}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
                width: 320,
                '& .MuiOutlinedInput-root': {
                    bgcolor: '#F9FAFB',
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    '& fieldset': { border: '1px solid transparent', transition: 'all 0.2s' },
                    '&:hover fieldset': { borderColor: '#E5E7EB' },
                    '&.Mui-focused fieldset': { borderColor: '#E5E7EB', borderWidth: 1, boxShadow: '0 0 0 2px rgba(243, 244, 246, 0.5)' },
                },
                '& .MuiOutlinedInput-input': { py: 1.25 }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1, color: '#9CA3AF' }}>
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="text"
            startIcon={<Filter size={16} />}
            onClick={handleOpenFilters}
            sx={{ 
              color: filtersApplied ? '#111827' : '#6B7280',
              bgcolor: filtersApplied ? '#F3F4F6' : 'transparent',
              borderRadius: 2,
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              '&:hover': { bgcolor: '#F9FAFB', color: '#111827' }
            }}
	          >
	            {t.filters.button} {filtersApplied && <Box component="span" sx={{ ml: 1, display: 'inline-flex', width: 6, height: 6, borderRadius: '50%', bgcolor: '#3B82F6' }} />}
	          </Button>
        </Box>

        {/* Files Table */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3, py: 2, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F3F4F6' }}>{t.table.fileName}</TableCell>
                <TableCell sx={{ py: 2, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F3F4F6' }}>{t.table.bank}</TableCell>
                <TableCell sx={{ py: 2, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F3F4F6' }}>{t.table.account}</TableCell>
                <TableCell sx={{ py: 2, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F3F4F6' }}>{t.table.size}</TableCell>
                <TableCell sx={{ py: 2, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F3F4F6' }}>{t.table.status}</TableCell>
                <TableCell sx={{ py: 2, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F3F4F6' }}>{t.table.category}</TableCell>
                <TableCell sx={{ py: 2, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F3F4F6' }}>{t.table.access}</TableCell>
                <TableCell sx={{ py: 2, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F3F4F6' }}>{t.table.createdAt}</TableCell>
                <TableCell align="right" sx={{ pr: 3, py: 2, fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #F3F4F6' }}>{t.table.actions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 12 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 3, bgcolor: '#F9FAFB', borderRadius: '50%' }}>
                         <Search size={32} className="text-gray-300" />
                      </Box>
                      <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>{t.empty.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{t.empty.subtitle}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow
                    key={file.id}
                    sx={{
                      '&:hover': { bgcolor: '#F9FAFB' },
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background-color 0.1s'
                    }}
                  >
                    <TableCell sx={{ pl: 3, py: 2.5, borderBottom: '1px solid #F3F4F6' }}>
                      <Box sx={{ display: 'flex', items: 'center', gap: 2 }}>
                        <Box sx={{ 
                            width: 36, 
                            height: 36, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            borderRadius: '8px', 
                            bgcolor: '#EEF2FF', 
                            color: '#4F46E5',
                            flexShrink: 0
                        }}>
                           <DocumentTypeIcon
                             fileType={file.fileType}
                             fileName={file.fileName}
                             size={20}
                             className="text-indigo-600"
                           />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                           <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                             {file.fileName}
                           </Typography>
                           {file.sharedLinksCount > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Share2 size={12} className="text-blue-500" />
                                <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 500 }}>
                                    {file.sharedLinksCount} {t.sharedLinksShort}
                                </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #F3F4F6' }}>
                        <Typography variant="body2" sx={{ color: '#374151' }}>{file.bankName}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #F3F4F6' }}>
                       <Typography variant="body2" sx={{ color: '#6B7280', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                         {file.metadata?.accountNumber ? `••••${file.metadata.accountNumber.slice(-4)}` : '—'}
                       </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #F3F4F6' }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>{formatFileSize(file.fileSize)}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #F3F4F6' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                         <Box sx={{ 
                             width: 8, 
                             height: 8, 
                             borderRadius: '50%', 
                             bgcolor: getStatusColor(file.status) === 'success' ? '#10B981' : 
                                      getStatusColor(file.status) === 'warning' ? '#F59E0B' : 
                                      getStatusColor(file.status) === 'error' ? '#EF4444' : '#6B7280'
                         }} />
                         <Typography variant="body2" sx={{ color: '#374151' }}>
                             {getStatusLabel(file.status)}
                         </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #F3F4F6' }}>
                      <FormControl size="small" fullWidth variant="standard" sx={{ minWidth: 120 }}>
                        <Select
                          value={file.categoryId || ''}
                          disableUnderline
                          displayEmpty
                          onChange={(e) => handleCategoryChange(file.id, e.target.value as string)}
                          disabled={categoriesLoading || (!file.isOwner && file.permissionType !== 'editor')}
                          sx={{ 
                             fontSize: '0.875rem',
                             color: '#374151',
                             '& .MuiSelect-select': { py: 0.5, display: 'flex', alignItems: 'center', gap: 1, px: 0 },
                             '& .MuiSelect-icon': { color: '#9CA3AF' }
                          }}
                          renderValue={(selected) => {
                            const selectedCategory =
                              categories.find((cat) => cat.id === selected) || file.category;

                            if (!selectedCategory) {
                              return <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{t.categoryCell.choose}</Typography>;
                            }

                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: selectedCategory.color || '#9CA3AF' }} />
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                  {selectedCategory.name}
                                </Typography>
                              </Box>
                            );
                          }}
                        >
                          <MenuItem value="">
                            <Typography variant="body2" color="text.secondary">{t.categoryCell.none}</Typography>
                          </MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cat.color || '#9CA3AF' }} />
                                {cat.name}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #F3F4F6' }}>
                        <Typography variant="caption" sx={{ 
                            px: 1, 
                            py: 0.25, 
                            borderRadius: '4px', 
                            bgcolor: file.isOwner ? '#F3F4F6' : '#EEF2FF', 
                            color: file.isOwner ? '#4B5563' : '#4F46E5', 
                            fontWeight: 500,
                            fontSize: '0.75rem' 
                        }}>
                           {file.isOwner ? t.permission.owner.value : getPermissionLabel(file.permissionType)}
                        </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5, borderBottom: '1px solid #F3F4F6' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ color: '#374151' }}>
                                {new Date(file.createdAt).toLocaleDateString('ru-RU')}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                                {new Date(file.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 3, py: 2.5, borderBottom: '1px solid #F3F4F6' }}>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip title="View">
                          <button
                            onClick={() => handleView(file.id)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Download">
                          <button
                            onClick={() => handleDownload(file.id, file.fileName)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                          >
                            <Download size={16} />
                          </button>
                        </Tooltip>
                        <button
                          onClick={(e) => handleMenuOpen(e, file)}
                           className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <MoreVertical size={16} />
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
            elevation: 0,
            sx: { 
                borderRadius: 2, 
                mt: 1, 
                minWidth: 160,
                border: '1px solid #F3F4F6',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }
        }}
      >
        <MenuItem onClick={() => {
          if (selectedFile) handleView(selectedFile.id);
          handleMenuClose();
        }} sx={{ gap: 1.5, fontSize: '0.875rem', py: 1, color: '#374151' }}>
           <Eye size={16} /> {t.actions.view}
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedFile) handleDownload(selectedFile.id, selectedFile.fileName);
          handleMenuClose();
        }} sx={{ gap: 1.5, fontSize: '0.875rem', py: 1, color: '#374151' }}>
           <Download size={16} /> {t.actions.download}
        </MenuItem>
        {selectedFile?.isOwner && (
          <>
            <MenuItem onClick={() => {
              if (selectedFile) handleShare(selectedFile.id);
              handleMenuClose();
            }} sx={{ gap: 1.5, fontSize: '0.875rem', py: 1, color: '#374151' }}>
               <Share2 size={16} /> {t.actions.share}
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedFile) handleManagePermissions(selectedFile.id);
              handleMenuClose();
            }} sx={{ gap: 1.5, fontSize: '0.875rem', py: 1, color: '#374151' }}>
               <Icon icon="mdi:shield-account-outline" width={16} /> {t.actions.permissions}
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
        slotProps={{ 
            paper: { 
                sx: { 
                    p: 2.5, 
                    width: 320, 
                    borderRadius: 3, 
                    marginTop: 1, 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #F3F4F6',
                    elevation: 0
                } 
            } 
        }}
        elevation={0}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827' }}>
            {t.filters.title}
            </Typography>
            <Button 
                size="small" 
                onClick={handleResetFilters}
                sx={{ 
                    minWidth: 'auto', 
                    p: 0.5, 
                    fontSize: '0.75rem', 
                    color: '#6B7280', 
                    textTransform: 'none',
                    '&:hover': { color: '#111827', bgcolor: 'transparent' } 
                }}
            >
                {t.filters.reset}
            </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControl size="small" fullWidth>
            <Typography variant="caption" sx={{ mb: 0.5, color: '#6B7280', fontWeight: 500 }}>
              {t.filters.status}
            </Typography>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value as string)}
              displayEmpty
              sx={{ 
                  borderRadius: 1.5, 
                  bgcolor: '#F9FAFB',
                  '& fieldset': { border: '1px solid #E5E7EB' },
                  '&:hover fieldset': { border: '1px solid #D1D5DB' },
              }}
            >
              <MenuItem value="">
                <Typography variant="body2" color="text.secondary">{t.filters.all}</Typography>
              </MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {getStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <Typography variant="caption" sx={{ mb: 0.5, color: '#6B7280', fontWeight: 500 }}>
              {t.filters.bank}
            </Typography>
            <Select
              value={filters.bank}
              onChange={(e) => handleFilterChange('bank', e.target.value as string)}
              displayEmpty
               sx={{ 
                  borderRadius: 1.5, 
                  bgcolor: '#F9FAFB',
                  '& fieldset': { border: '1px solid #E5E7EB' },
                  '&:hover fieldset': { border: '1px solid #D1D5DB' },
              }}
            >
              <MenuItem value="">
                 <Typography variant="body2" color="text.secondary">{t.filters.all}</Typography>
              </MenuItem>
              {bankOptions.map((bank) => (
                <MenuItem key={bank} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <Typography variant="caption" sx={{ mb: 0.5, color: '#6B7280', fontWeight: 500 }}>
              {t.filters.category}
            </Typography>
            <Select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value as string)}
              displayEmpty
               sx={{ 
                  borderRadius: 1.5, 
                  bgcolor: '#F9FAFB',
                  '& fieldset': { border: '1px solid #E5E7EB' },
                  '&:hover fieldset': { border: '1px solid #D1D5DB' },
              }}
            >
              <MenuItem value="">
                 <Typography variant="body2" color="text.secondary">{t.filters.all}</Typography>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <Typography variant="caption" sx={{ mb: 0.5, color: '#6B7280', fontWeight: 500 }}>
              {t.filters.accessType}
            </Typography>
            <Select
              value={filters.ownership}
              onChange={(e) => handleFilterChange('ownership', e.target.value as string)}
              displayEmpty
               sx={{ 
                  borderRadius: 1.5, 
                  bgcolor: '#F9FAFB',
                  '& fieldset': { border: '1px solid #E5E7EB' },
                  '&:hover fieldset': { border: '1px solid #D1D5DB' },
              }}
            >
              <MenuItem value="">
                 <Typography variant="body2" color="text.secondary">{t.filters.all}</Typography>
              </MenuItem>
              <MenuItem value="owned">{t.filters.owned}</MenuItem>
              <MenuItem value="shared">{t.filters.shared}</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="contained" 
            onClick={handleCloseFilters} 
            fullWidth
            sx={{ 
                mt: 1,
                borderRadius: 2, 
                textTransform: 'none', 
                bgcolor: '#111827',
                color: 'white',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1F2937', boxShadow: 'none' }
            }}
          >
            {t.filters.apply}
          </Button>
        </Box>
      </Popover>
    </Container>
  );
}
