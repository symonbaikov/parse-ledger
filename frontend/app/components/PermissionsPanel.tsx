'use client';

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  PersonAdd as AddPersonIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import api from '../lib/api';

interface Permission {
  id: string;
  user: {
    id: string;
    email: string;
  };
  grantedBy: {
    id: string;
    email: string;
  };
  permissionType: string;
  canReshare: boolean;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface PermissionsPanelProps {
  fileId: string;
  permissions: Permission[];
  onPermissionsUpdate: () => void;
}

/**
 * Panel for managing file permissions and access control
 */
export default function PermissionsPanel({
  fileId,
  permissions,
  onPermissionsUpdate,
}: PermissionsPanelProps) {
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Grant form state
  const [userEmail, setUserEmail] = useState('');
  const [permissionType, setPermissionType] = useState('viewer');
  const [canReshare, setCanReshare] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGrantPermission = async () => {
    try {
      setGranting(true);
      setError(null);

      // First, find user by email (you may need to add an endpoint for this)
      // For now, we'll assume you have the userId
      // In production, you'd want to add a user search endpoint

      await api.post(`/storage/files/${fileId}/permissions`, {
        userId: userEmail, // This should be userId, not email
        permissionType,
        canReshare,
        expiresAt: expiresAt || undefined,
      });

      // Reset form
      setUserEmail('');
      setPermissionType('viewer');
      setCanReshare(false);
      setExpiresAt('');
      setGrantDialogOpen(false);

      // Reload permissions
      onPermissionsUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось предоставить доступ');
    } finally {
      setGranting(false);
    }
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return;

    try {
      setGranting(true);
      setError(null);

      await api.put(`/storage/permissions/${selectedPermission.id}`, {
        permissionType,
        canReshare,
        expiresAt: expiresAt || null,
      });

      setEditDialogOpen(false);
      setSelectedPermission(null);
      onPermissionsUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось обновить права');
    } finally {
      setGranting(false);
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    if (!confirm('Вы уверены, что хотите отозвать права доступа?')) {
      return;
    }

    try {
      await api.delete(`/storage/permissions/${permissionId}`);
      onPermissionsUpdate();
    } catch (error) {
      console.error('Failed to revoke permission:', error);
    }
  };

  const handleEditClick = (permission: Permission) => {
    setSelectedPermission(permission);
    setPermissionType(permission.permissionType);
    setCanReshare(permission.canReshare);
    setExpiresAt(permission.expiresAt || '');
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPermissionLabel = (type: string): string => {
    const labels: Record<string, string> = {
      owner: 'Владелец',
      editor: 'Редактор',
      viewer: 'Просмотр',
      downloader: 'Скачивание',
    };
    return labels[type] || type;
  };

  const getPermissionColor = (type: string) => {
    const colors: Record<string, 'success' | 'primary' | 'default' | 'info'> = {
      owner: 'success',
      editor: 'primary',
      viewer: 'default',
      downloader: 'info',
    };
    return colors[type] || 'default';
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Права доступа ({permissions.length})</Typography>
          <Button
            variant="contained"
            startIcon={<AddPersonIcon />}
            onClick={() => setGrantDialogOpen(true)}
          >
            Предоставить доступ
          </Button>
        </Box>

        {permissions.length === 0 ? (
          <Alert severity="info">Пока никому не предоставлен доступ к этому файлу</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Пользователь</TableCell>
                  <TableCell>Права</TableCell>
                  <TableCell>Может поделиться</TableCell>
                  <TableCell>Срок действия</TableCell>
                  <TableCell>Предоставил</TableCell>
                  <TableCell>Создано</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map(permission => (
                  <TableRow key={permission.id}>
                    <TableCell>{permission.user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getPermissionLabel(permission.permissionType)}
                        size="small"
                        color={getPermissionColor(permission.permissionType)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={permission.canReshare ? 'Да' : 'Нет'}
                        size="small"
                        color={permission.canReshare ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {permission.expiresAt ? (
                        <Chip
                          label={formatDate(permission.expiresAt)}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        'Бессрочно'
                      )}
                    </TableCell>
                    <TableCell>{permission.grantedBy.email}</TableCell>
                    <TableCell>{formatDate(permission.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Редактировать">
                        <IconButton size="small" onClick={() => handleEditClick(permission)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Отозвать">
                        <IconButton
                          size="small"
                          onClick={() => handleRevokePermission(permission.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Grant Permission Dialog */}
      <Dialog
        open={grantDialogOpen}
        onClose={() => setGrantDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Предоставить доступ</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              label="Email или ID пользователя"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              helperText="Введите email пользователя, которому хотите предоставить доступ"
            />

            <FormControl fullWidth>
              <InputLabel>Уровень доступа</InputLabel>
              <Select
                value={permissionType}
                label="Уровень доступа"
                onChange={e => setPermissionType(e.target.value)}
              >
                <MenuItem value="viewer">Просмотр</MenuItem>
                <MenuItem value="downloader">Просмотр и скачивание</MenuItem>
                <MenuItem value="editor">Редактирование</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Срок действия (опционально)"
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Оставьте пустым для бессрочного доступа"
            />

            <FormControlLabel
              control={
                <Switch checked={canReshare} onChange={e => setCanReshare(e.target.checked)} />
              }
              label="Разрешить делиться с другими"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGrantDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleGrantPermission}
            disabled={!userEmail || granting}
          >
            Предоставить доступ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Редактировать права доступа</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <FormControl fullWidth>
              <InputLabel>Уровень доступа</InputLabel>
              <Select
                value={permissionType}
                label="Уровень доступа"
                onChange={e => setPermissionType(e.target.value)}
              >
                <MenuItem value="viewer">Просмотр</MenuItem>
                <MenuItem value="downloader">Просмотр и скачивание</MenuItem>
                <MenuItem value="editor">Редактирование</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Срок действия (опционально)"
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <FormControlLabel
              control={
                <Switch checked={canReshare} onChange={e => setCanReshare(e.target.checked)} />
              }
              label="Разрешить делиться с другими"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleUpdatePermission} disabled={granting}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
