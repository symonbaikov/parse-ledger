'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Alert,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import api from '../lib/api';

interface SharedLink {
  id: string;
  token: string;
  permission: string;
  expiresAt: string | null;
  allowAnonymous: boolean;
  description: string | null;
  status: string;
  accessCount: number;
  createdAt: string;
}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  fileId: string;
  sharedLinks: SharedLink[];
  onLinksUpdate: () => void;
}

/**
 * Dialog for creating and managing shared links
 */
export default function ShareDialog({
  open,
  onClose,
  fileId,
  sharedLinks,
  onLinksUpdate,
}: ShareDialogProps) {
  const [permission, setPermission] = useState('view');
  const [expiresAt, setExpiresAt] = useState('');
  const [password, setPassword] = useState('');
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCreateLink = async () => {
    try {
      setCreating(true);
      const response = await api.post(`/storage/files/${fileId}/share`, {
        permission,
        expiresAt: expiresAt || undefined,
        password: password || undefined,
        allowAnonymous,
        description: description || undefined,
      });

      // Copy link to clipboard
      const shareUrl = response.data.shareUrl;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToken(response.data.token);

      // Reset form
      setPermission('view');
      setExpiresAt('');
      setPassword('');
      setDescription('');

      // Reload links
      onLinksUpdate();
    } catch (error) {
      console.error('Failed to create shared link:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async (token: string) => {
    const shareUrl = `${window.location.origin}/shared/${token}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await api.delete(`/storage/shares/${linkId}`);
      onLinksUpdate();
    } catch (error) {
      console.error('Failed to delete shared link:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      {/* Create new link section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Создать новую ссылку
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Уровень доступа</InputLabel>
            <Select
              value={permission}
              label="Уровень доступа"
              onChange={e => setPermission(e.target.value)}
            >
              <MenuItem value="view">Только просмотр</MenuItem>
              <MenuItem value="download">Просмотр и скачивание</MenuItem>
              <MenuItem value="edit">Полный доступ</MenuItem>
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

          <TextField
            fullWidth
            label="Пароль (опционально)"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            helperText="Добавьте пароль для дополнительной защиты"
          />

          <TextField
            fullWidth
            label="Описание (опционально)"
            multiline
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            helperText="Добавьте заметку о том, для кого эта ссылка"
          />

          <FormControlLabel
            control={
              <Switch
                checked={allowAnonymous}
                onChange={e => setAllowAnonymous(e.target.checked)}
              />
            }
            label="Разрешить доступ по ссылке без авторизации"
          />

          <Button
            variant="contained"
            onClick={handleCreateLink}
            disabled={creating}
            startIcon={<LinkIcon />}
          >
            Создать ссылку
          </Button>

          {copiedToken && (
            <Alert severity="success">Ссылка создана и скопирована в буфер обмена!</Alert>
          )}
        </Box>
      </Paper>

      {/* Existing links */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Активные ссылки ({sharedLinks.length})
        </Typography>

        {sharedLinks.length === 0 ? (
          <Typography color="text.secondary">Пока нет активных ссылок для этого файла</Typography>
        ) : (
          <List>
            {sharedLinks.map(link => (
              <ListItem
                key={link.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <Chip label={link.permission} size="small" color="primary" />
                      <Chip
                        label={link.status}
                        size="small"
                        color={link.status === 'active' ? 'success' : 'error'}
                      />
                      {link.expiresAt && (
                        <Chip
                          label={`До ${formatDate(link.expiresAt)}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      {link.description && (
                        <Typography variant="body2" color="text.secondary">
                          {link.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Создана: {formatDate(link.createdAt)} • Переходов: {link.accessCount}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Копировать ссылку">
                    <IconButton
                      edge="end"
                      onClick={() => handleCopyLink(link.token)}
                      color={copiedToken === link.token ? 'success' : 'default'}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton edge="end" onClick={() => handleDeleteLink(link.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
