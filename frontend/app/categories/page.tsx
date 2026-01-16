'use client';

import { useAuth } from '@/app/hooks/useAuth';
import apiClient from '@/app/lib/api';
import { Icon } from '@iconify/react';
import { Add, Check, Delete, Edit, MoreVert, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useIntlayer } from 'next-intlayer';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  parentId?: string;
}

const resolveIconUrl = (iconValue?: string) => {
  if (!iconValue) return null;
  if (iconValue.startsWith('http')) return iconValue;
  if (iconValue.startsWith('/uploads')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const base = apiUrl.replace(/\/api\/v1$/, '') || '';
    return `${base}${iconValue}`;
  }
  return null;
};

const PREDEFINED_ICONS = [
  'mdi:home',
  'mdi:food',
  'mdi:car',
  'mdi:shopping',
  'mdi:cart',
  'mdi:medical-bag',
  'mdi:school',
  'mdi:briefcase',
  'mdi:airplane',
  'mdi:gift',
  'mdi:gamepad-variant',
  'mdi:dumbbell',
  'mdi:bank',
  'mdi:cash',
  'mdi:chart-line',
  'mdi:credit-card',
  'mdi:shield-check',
  'mdi:cog',
  'mdi:wrench',
  'mdi:tag',
  'mdi:coffee',
  'mdi:monitor',
  'mdi:phone',
  'mdi:music',
  'mdi:camera',
  'mdi:book',
  'mdi:heart',
  'mdi:star',
  'mdi:flag',
  'mdi:bell',
];

const PREDEFINED_COLORS = [
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#9E9E9E',
  '#607D8B',
];

export default function CategoriesPage() {
  const t = useIntlayer('categoriesPage');
  const theme = useTheme();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconInputRef = useRef<HTMLInputElement | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Menu state for "..." actions
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTargetCategory, setMenuTargetCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#2196F3',
    icon: 'mdi:tag',
    parentId: '',
  });

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || cat.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, category: Category) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuTargetCategory(category);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuTargetCategory(null);
  };

  const onEditFromMenu = () => {
    if (menuTargetCategory) {
      handleOpenDialog(menuTargetCategory);
    }
    handleMenuClose();
  };

  const onDeleteFromMenu = () => {
    if (menuTargetCategory) {
      handleDelete(menuTargetCategory.id);
    }
    handleMenuClose();
  };

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error(t.toasts.loadFailed.value);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color || '#2196F3',
        icon: category.icon || 'mdi:tag',
        parentId: category.parentId || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        type: 'expense',
        color: '#2196F3',
        icon: 'mdi:tag',
        parentId: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    if (iconInputRef.current) {
      iconInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        parentId: formData.parentId || undefined,
      };

      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory.id}`, data);
        toast.success(t.toasts.updated.value);
      } else {
        await apiClient.post('/categories', data);
        toast.success(t.toasts.created.value);
      }

      await loadCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(t.toasts.saveFailed.value);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete.value)) {
      return;
    }

    try {
      await apiClient.delete(`/categories/${id}`);
      await loadCategories();
      toast.success(t.toasts.deleted.value);
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error(t.toasts.deleteFailed.value);
    }
  };

  const triggerIconUpload = () => {
    iconInputRef.current?.click();
  };

  const handleIconFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('icon', file);
    setUploadingIcon(true);
    try {
      const response = await apiClient.post('/data-entry/custom-fields/icon', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = response.data?.url || response.data;
      if (url) {
        setFormData(prev => ({ ...prev, icon: url }));
        toast.success(t.toasts.iconUploaded.value);
      }
    } catch (error) {
      console.error('Failed to upload icon:', error);
      toast.error(t.toasts.iconUploadFailed.value);
    } finally {
      setUploadingIcon(false);
      if (iconInputRef.current) {
        iconInputRef.current.value = '';
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {t.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t.subtitle}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2, px: 3, py: 1 }}
          >
            {t.add}
          </Button>
        </Box>

        {/* Search and Filter Controls */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder={t.dialog.placeholderName.value} // "Search categories..." would be better but reusing existing string or generic
            size="small"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={(_, newValue) => newValue && setFilterType(newValue)}
            size="small"
            aria-label="category filter"
          >
            <ToggleButton value="all" sx={{ px: 2 }}>
              {t.type.label}
            </ToggleButton>
            <ToggleButton value="income" sx={{ px: 2 }}>
              {t.type.income}
            </ToggleButton>
            <ToggleButton value="expense" sx={{ px: 2 }}>
              {t.type.expense}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {loading ? (
        <Typography>{t.loading}</Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredCategories.map(category => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={category.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2,
                    '&:last-child': { pb: 2 },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(category.color || '#2196F3', 0.1),
                      color: category.color || '#2196F3',
                      flexShrink: 0,
                    }}
                  >
                    {resolveIconUrl(category.icon) ? (
                      <Box
                        component="img"
                        src={resolveIconUrl(category.icon) as string}
                        alt=""
                        sx={{ width: 24, height: 24, objectFit: 'contain' }}
                      />
                    ) : (
                      <Icon icon={category.icon || 'mdi:tag'} width={24} height={24} />
                    )}
                  </Box>
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="600"
                      lineHeight={1.2}
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 0.5,
                      }}
                      title={category.name}
                    >
                      {category.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: category.type === 'income' ? 'success.main' : 'error.main',
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {category.type === 'income' ? t.type.income : t.type.expense}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0 }}>
                    <IconButton
                      size="small"
                      onClick={e => handleMenuOpen(e, category)}
                      sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menu for Edit/Delete actions */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={onEditFromMenu}>
          <Edit fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          {t.actions.edit}
        </MenuItem>
        <MenuItem onClick={onDeleteFromMenu} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          {t.actions.delete}
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingCategory ? t.dialog.editTitle : t.dialog.createTitle}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Name and Type */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t.dialog.nameLabel.value}
                placeholder={t.dialog.placeholderName.value}
                fullWidth
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>{t.type.label}</InputLabel>
                <Select
                  value={formData.type}
                  label={t.type.label.value}
                  onChange={e =>
                    setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })
                  }
                >
                  <MenuItem value="income">{t.type.income}</MenuItem>
                  <MenuItem value="expense">{t.type.expense}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Icon Picker */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t.dialog.chooseIcon}
              </Typography>
              <input
                type="file"
                accept="image/*"
                ref={iconInputRef}
                style={{ display: 'none' }}
                onChange={handleIconFileChange}
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                  gap: 1,
                  maxHeight: 200,
                  overflowY: 'auto',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {PREDEFINED_ICONS.map(iconName => (
                  <Box
                    key={iconName}
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor:
                        formData.icon === iconName ? alpha(formData.color, 0.2) : 'transparent',
                      color: formData.icon === iconName ? formData.color : 'text.secondary',
                      border:
                        formData.icon === iconName
                          ? `2px solid ${formData.color}`
                          : '1px solid transparent',
                      '&:hover': {
                        bgcolor: alpha(formData.color || theme.palette.primary.main, 0.1),
                        color: formData.color || theme.palette.primary.main,
                      },
                    }}
                  >
                    <Icon icon={iconName} width={24} height={24} />
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: 1.5,
                  gap: 2,
                }}
              >
                {resolveIconUrl(formData.icon) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t.dialog.uploadedIcon}
                    </Typography>
                    <Box
                      component="img"
                      src={resolveIconUrl(formData.icon) || formData.icon}
                      alt=""
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        objectFit: 'contain',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  </Box>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={triggerIconUpload}
                  disabled={uploadingIcon}
                  sx={{ ml: 'auto' }}
                >
                  {uploadingIcon ? t.dialog.uploading : t.dialog.uploadIcon}
                </Button>
              </Box>
            </Box>

            {/* Color Picker (Preset colors) */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t.dialog.chooseColor}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PREDEFINED_COLORS.map(color => (
                  <Box
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: color,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: formData.color === color ? 3 : 0,
                      transform: formData.color === color ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s',
                      border: formData.color === color ? '2px solid white' : 'none',
                      outline: formData.color === color ? `2px solid ${color}` : 'none',
                    }}
                  >
                    {formData.color === color && <Check sx={{ color: 'white', fontSize: 20 }} />}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Preview Section */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t.dialog.preview}
              </Typography>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(formData.color || '#2196F3', 0.1),
                  color: formData.color || '#2196F3',
                }}
              >
                {resolveIconUrl(formData.icon) ? (
                  <Box
                    component="img"
                    src={resolveIconUrl(formData.icon) as string}
                    alt=""
                    sx={{ width: 28, height: 28, objectFit: 'contain' }}
                  />
                ) : (
                  <Icon icon={formData.icon || 'mdi:tag'} width={28} height={28} />
                )}
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {formData.name || t.dialog.placeholderName}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            {t.dialog.cancel}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
            {t.dialog.save}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
