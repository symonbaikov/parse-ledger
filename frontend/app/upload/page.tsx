'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';

interface GoogleSheet {
  id: string;
  sheetName: string;
  sheetId: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [googleSheetId, setGoogleSheetId] = useState('');
  const [googleSheets, setGoogleSheets] = useState<GoogleSheet[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    Record<string, 'uploading' | 'success' | 'error'>
  >({});

  // Load Google Sheets on mount
  useEffect(() => {
    if (user) {
      loadGoogleSheets();
    }
  }, [user]);

  const loadGoogleSheets = async () => {
    try {
      const response = await apiClient.get('/google-sheets');
      setGoogleSheets(response.data);
    } catch (err) {
      console.error('Failed to load Google Sheets:', err);
    }
  };

  const startGoogleOauth = async () => {
    try {
      setOauthLoading(true);
      const response = await apiClient.get('/google-sheets/oauth/url');
      const url = response.data?.url;
      if (url) {
        window.location.href = url;
      } else {
      setError('Не удалось получить ссылку для авторизации Google');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось начать авторизацию Google');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'image/jpeg',
        'image/png',
      ];
      return validTypes.includes(file.type);
    });

    const totalFiles = files.length + validFiles.length;
    if (totalFiles > 2) {
      setError('Максимум 2 файла можно загрузить за раз');
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setError('');
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Пожалуйста, выберите хотя бы один файл');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    // Only append googleSheetId if it's selected
    if (googleSheetId) {
      formData.append('googleSheetId', googleSheetId);
    }

    try {
      const response = await apiClient.post('/statements/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setFiles([]);
      setTimeout(() => {
        router.push('/statements');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Не удалось загрузить файлы. Попробуйте снова.',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Загрузка банковских выписок
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          После загрузки файлы будут автоматически обработаны: извлечены транзакции, классифицированы и синхронизированы с Google Sheets (если подключен). 
          Результаты обработки можно посмотреть на странице <strong>Выписки</strong>.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Файлы успешно загружены! Идёт обработка... Вы будете перенаправлены на страницу выписок.
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Google Таблица (опционально)</InputLabel>
            <Select
              value={googleSheetId}
              onChange={(e) => setGoogleSheetId(e.target.value)}
              label="Google Таблица (опционально)"
            >
              <MenuItem value="">
                <em>Без синхронизации с Google Таблицами</em>
              </MenuItem>
              {googleSheets.map((sheet) => (
                <MenuItem key={sheet.id} value={sheet.id}>
                  {sheet.sheetName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Выберите Google Таблицу для автоматической синхронизации транзакций. Если не выбрана, данные будут сохранены только в системе.
          </Typography>
          {googleSheets.length === 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Нет подключенных таблиц.
              </Typography>
              <Button variant="outlined" size="small" onClick={startGoogleOauth} disabled={oauthLoading}>
                {oauthLoading ? 'Открытие...' : 'Подключить Google Таблицы'}
              </Button>
            </Box>
          )}
        </Box>

        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            mb: 3,
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'action.hover',
            },
          }}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload">
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Перетащите файлы сюда или нажмите, чтобы выбрать
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Поддерживаемые форматы: PDF, XLSX, XLS, CSV, JPG, PNG (до 2 файлов, каждый до 10 МБ)
            </Typography>
          </label>
        </Box>

        {files.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Выбранные файлы ({files.length}/2):
            </Typography>
            <List>
              {files.map((file, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} МБ`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          sx={{ mt: 2 }}
        >
          {uploading ? 'Загрузка...' : 'Загрузить файлы'}
        </Button>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Что происходит после загрузки?
          </Typography>
          <Typography variant="body2" component="div">
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>Файл сохраняется в системе</li>
              <li>Автоматически определяется банк и формат выписки</li>
              <li>Извлекаются все транзакции</li>
              <li>Транзакции автоматически классифицируются по категориям</li>
              <li>Если выбран Google Sheet, данные синхронизируются</li>
              <li>Результаты можно посмотреть на странице <strong>Выписки</strong></li>
            </ol>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
