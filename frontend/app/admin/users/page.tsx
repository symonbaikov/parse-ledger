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
  FormControlLabel,
  Checkbox,
  FormGroup,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import apiClient from '../../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  permissions: string[] | null;
  createdAt: string;
}

const ALL_PERMISSIONS = [
  { value: 'statement.view', label: 'Просмотр выписок' },
  { value: 'statement.upload', label: 'Загрузка выписок' },
  { value: 'statement.delete', label: 'Удаление выписок' },
  { value: 'statement.edit', label: 'Редактирование выписок' },
  { value: 'transaction.view', label: 'Просмотр транзакций' },
  { value: 'transaction.edit', label: 'Редактирование транзакций' },
  { value: 'transaction.delete', label: 'Удаление транзакций' },
  { value: 'transaction.bulk_update', label: 'Массовое обновление транзакций' },
  { value: 'category.view', label: 'Просмотр категорий' },
  { value: 'category.create', label: 'Создание категорий' },
  { value: 'category.edit', label: 'Редактирование категорий' },
  { value: 'category.delete', label: 'Удаление категорий' },
  { value: 'branch.view', label: 'Просмотр филиалов' },
  { value: 'branch.create', label: 'Создание филиалов' },
  { value: 'branch.edit', label: 'Редактирование филиалов' },
  { value: 'branch.delete', label: 'Удаление филиалов' },
  { value: 'wallet.view', label: 'Просмотр кошельков' },
  { value: 'wallet.create', label: 'Создание кошельков' },
  { value: 'wallet.edit', label: 'Редактирование кошельков' },
  { value: 'wallet.delete', label: 'Удаление кошельков' },
  { value: 'report.view', label: 'Просмотр отчётов' },
  { value: 'report.export', label: 'Экспорт отчётов' },
  { value: 'google_sheet.view', label: 'Просмотр Google Sheets' },
  { value: 'google_sheet.connect', label: 'Подключение Google Sheets' },
  { value: 'google_sheet.sync', label: 'Синхронизация Google Sheets' },
];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: User[] }>('/users');
      setUsers(response.data.data || []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = async (user: User) => {
    try {
      const response = await apiClient.get(`/users/${user.id}/permissions`);
      setSelectedPermissions(response.data.customPermissions || []);
      setEditingUser(user);
      setPermissionsDialogOpen(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Ошибка загрузки прав');
    }
  };

  const handleSavePermissions = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      await apiClient.put(`/users/${editingUser.id}/permissions`, {
        permissions: selectedPermissions,
      });
      setPermissionsDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Ошибка сохранения прав');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      await apiClient.post(`/users/${editingUser.id}/permissions/reset`);
      setPermissionsDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Ошибка сброса прав');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiClient.put(`/users/${userId}`, { role: newRole });
      loadUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Ошибка обновления роли');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await apiClient.put(`/users/${user.id}`, { isActive: !user.isActive });
      loadUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Ошибка обновления статуса');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Управление пользователями
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              label="Поиск"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button variant="outlined" onClick={loadUsers} disabled={loading}>
              Обновить
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Права</TableCell>
                    <TableCell>Дата регистрации</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          >
                            <MenuItem value="admin">Администратор</MenuItem>
                            <MenuItem value="user">Пользователь</MenuItem>
                            <MenuItem value="viewer">Наблюдатель</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Активен' : 'Неактивен'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                          onClick={() => handleToggleActive(user)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.permissions?.length || 'По умолчанию'}
                          color={user.permissions?.length ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditPermissions(user)}
                          title="Управление правами"
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      <Dialog
        open={permissionsDialogOpen}
        onClose={() => {
          setPermissionsDialogOpen(false);
          setEditingUser(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Управление правами: {editingUser?.name} ({editingUser?.email})
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Роль: <strong>{editingUser?.role}</strong>. Выберите дополнительные права доступа:
            </Typography>
            <FormGroup>
              {ALL_PERMISSIONS.map((perm) => (
                <FormControlLabel
                  key={perm.value}
                  control={
                    <Checkbox
                      checked={selectedPermissions.includes(perm.value)}
                      onChange={() => handleTogglePermission(perm.value)}
                    />
                  }
                  label={perm.label}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetPermissions} disabled={saving} color="warning">
            Сбросить к умолчаниям
          </Button>
          <Button
            onClick={() => {
              setPermissionsDialogOpen(false);
              setEditingUser(null);
            }}
            disabled={saving}
          >
            Отмена
          </Button>
          <Button onClick={handleSavePermissions} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}







