'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Copy, MailPlus, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import { useIntlayer, useLocale } from 'next-intlayer';
import type { AxiosError } from 'axios';

type WorkspaceOverview = {
  workspace: { id: string; name: string; ownerId?: string | null; createdAt?: string };
  members: Array<{
    id: string;
    email?: string;
    name?: string;
    role: string;
    permissions?: {
      canEditStatements?: boolean;
      canEditCustomTables?: boolean;
      canEditCategories?: boolean;
      canEditDataEntry?: boolean;
      canShareFiles?: boolean;
    } | null;
    joinedAt?: string;
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    permissions?: {
      canEditStatements?: boolean;
      canEditCustomTables?: boolean;
      canEditCategories?: boolean;
      canEditDataEntry?: boolean;
      canShareFiles?: boolean;
    } | null;
    status: string;
    token: string;
    expiresAt?: string;
    createdAt?: string;
    link?: string;
  }>;
};

type InvitePermissions = {
  canEditStatements: boolean;
  canEditCustomTables: boolean;
  canEditCategories: boolean;
  canEditDataEntry: boolean;
  canShareFiles: boolean;
};

export default function WorkspaceSettingsPage() {
  const { user, loading } = useAuth();
  const { locale } = useLocale();
  const t = useIntlayer('settingsWorkspacePage');
  const [overview, setOverview] = useState<WorkspaceOverview | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('member');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [invitePermissions, setInvitePermissions] = useState<InvitePermissions>({
    canEditStatements: true,
    canEditCustomTables: true,
    canEditCategories: true,
    canEditDataEntry: true,
    canShareFiles: false,
  });

  const isOwnerOrAdmin = useMemo(() => {
    const member = overview?.members.find((m) => m.id === user?.id);
    return member?.role === 'owner' || member?.role === 'admin';
  }, [overview?.members, user?.id]);

  const getApiErrorMessage = useCallback((error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError?.response?.data?.message ?? fallback;
  }, []);

  const loadOverview = useCallback(async () => {
    setFetchError(null);
    try {
      const response = await apiClient.get<WorkspaceOverview>('/workspaces/me');
      setOverview(response.data);
    } catch (error: unknown) {
      setFetchError(getApiErrorMessage(error, t.errors.loadOverview.value));
    }
  }, [getApiErrorMessage, t.errors.loadOverview.value]);

  useEffect(() => {
    if (user) {
      void loadOverview();
    }
  }, [loadOverview, user]);

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setInviteLoading(true);
    setInviteLink(null);
    try {
      const response = await apiClient.post('/workspaces/invitations', {
        email: inviteEmail,
        role: inviteRole,
        permissions: inviteRole === 'member' ? invitePermissions : undefined,
      });
      setInviteEmail('');
      setInviteLink(response.data?.invitationLink);
      toast.success(t.toasts.inviteSent.value);
      await loadOverview();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t.errors.inviteFailed.value));
    } finally {
      setInviteLoading(false);
    }
  };

  const copyLink = async (link?: string | null) => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t.toasts.linkCopied.value);
    } catch {
      toast.error(t.errors.copyFailed.value);
    }
  };

  const roleLabels: Record<string, string> = {
    owner: t.roles.owner.value,
    admin: t.roles.admin.value,
    member: t.roles.member.value,
  };

  const resolveLocale = useCallback((value: string) => {
    if (value === 'ru') return 'ru-RU';
    if (value === 'kk') return 'kk-KZ';
    return 'en-US';
  }, []);

  const formatDate = useCallback(
    (iso?: string) => {
      if (!iso) return '';
      return new Date(iso).toLocaleDateString(resolveLocale(locale), { timeZone: 'UTC' });
    },
    [locale, resolveLocale],
  );

  const roleDescriptions = useMemo(() => {
    const toNode = (value: unknown, fallbackText: string): ReactNode => {
      if (value === null || value === undefined) return fallbackText;
      return value as ReactNode;
    };

    const fallback =
      locale === 'kk'
        ? {
            member: 'Деректермен жұмыс істей алады, бірақ қатысушылар мен қолжетімділікті басқара алмайды.',
            admin: 'Қатысушылар мен қолжетімділікті басқарып, шақыру жібере алады.',
          }
        : locale === 'en'
          ? {
              member: 'Can work with data, but can’t manage members or access.',
              admin: 'Can manage members and access, and send invitations.',
            }
          : {
              member: 'Может работать с данными, но не управляет участниками и доступом.',
              admin: 'Может управлять участниками и доступом, отправлять приглашения.',
            };

    const rolesAny = t.roles as unknown as Record<string, unknown>;
    return {
      member: toNode(rolesAny.memberDescription, fallback.member),
      admin: toNode(rolesAny.adminDescription, fallback.admin),
    };
  }, [locale, t.roles]);

  const invitePermissionCopy = useMemo(() => {
    const toNode = (value: unknown, fallbackText: string): ReactNode => {
      if (value === null || value === undefined) return fallbackText;
      return value as ReactNode;
    };

    const fallback =
      locale === 'kk'
        ? {
            title: 'Қолжетімділік құқықтары',
            hint: 'Қатысушы нені өңдей алатынын белгілеңіз. Белгіленбесе — тек көру.',
            labels: {
              canEditStatements: 'Үзінділер',
              canEditCustomTables: 'Кестелер',
              canEditCategories: 'Санаттар',
              canEditDataEntry: 'Деректерді енгізу',
              canShareFiles: 'Файлдарға сілтеме және қолжетімділік',
            },
          }
        : locale === 'en'
          ? {
              title: 'Access permissions',
              hint: 'Select what the member can edit. If unchecked, they can only view.',
              labels: {
                canEditStatements: 'Statements',
                canEditCustomTables: 'Tables',
                canEditCategories: 'Categories',
                canEditDataEntry: 'Data entry',
                canShareFiles: 'File sharing & access',
              },
            }
          : {
              title: 'Права доступа',
              hint: 'Отметьте, что может редактировать участник. Если не отмечено — только просмотр.',
              labels: {
                canEditStatements: 'Выписки',
                canEditCustomTables: 'Таблицы',
                canEditCategories: 'Категории',
                canEditDataEntry: 'Ввод данных',
                canShareFiles: 'Ссылки и доступ к файлам',
              },
            };

    const inviteAny = t.invite as unknown as Record<string, unknown>;
    const permissionsAny = (inviteAny.permissions as unknown as Record<string, unknown>) || {};

    return {
      title: toNode(inviteAny.permissionsTitle, fallback.title),
      hint: toNode(inviteAny.permissionsHint, fallback.hint),
      labels: {
        canEditStatements: toNode(permissionsAny.canEditStatements, fallback.labels.canEditStatements),
        canEditCustomTables: toNode(permissionsAny.canEditCustomTables, fallback.labels.canEditCustomTables),
        canEditCategories: toNode(permissionsAny.canEditCategories, fallback.labels.canEditCategories),
        canEditDataEntry: toNode(permissionsAny.canEditDataEntry, fallback.labels.canEditDataEntry),
        canShareFiles: toNode(permissionsAny.canShareFiles, fallback.labels.canShareFiles),
      } satisfies Record<keyof InvitePermissions, ReactNode>,
    };
  }, [locale, t.invite]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="warning">{t.authRequired}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            {t.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t.subtitle}
          </Typography>
        </Box>

        {fetchError && <Alert severity="error">{fetchError}</Alert>}

        {overview && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Users size={18} />
                    <Typography variant="h6" fontWeight={600}>
                      {t.members.title}
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {overview.members.map((member) => (
                      <Box
                        key={member.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {member.name || member.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                        <Chip
                          label={roleLabels[member.role] || member.role}
                          color={member.role === 'owner' ? 'primary' : member.role === 'admin' ? 'secondary' : 'default'}
                          size="small"
                        />
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2} component="form" onSubmit={handleInvite}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MailPlus size={18} />
                    <Typography variant="h6" fontWeight={600}>
                      {t.invite.title}
                    </Typography>
                  </Stack>
                  {!isOwnerOrAdmin && (
                    <Alert severity="info">
                      {t.invite.onlyAdminHint}
                    </Alert>
                  )}
                  <TextField
                    label="Email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    fullWidth
                    required
                    disabled={!isOwnerOrAdmin}
                  />
                  <FormControl component="fieldset" disabled={!isOwnerOrAdmin}>
                    <FormLabel component="legend">{t.roles.roleLabel}</FormLabel>
                    <Stack spacing={1} sx={{ mt: 0.5 }}>
                      <FormControlLabel
                        sx={{ alignItems: 'flex-start', m: 0 }}
                        control={
                          <Checkbox
                            checked={inviteRole === 'member'}
                            onChange={(_, checked) => {
                              if (checked) setInviteRole('member');
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {t.roles.member}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {roleDescriptions.member}
                            </Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        sx={{ alignItems: 'flex-start', m: 0 }}
                        control={
                          <Checkbox
                            checked={inviteRole === 'admin'}
                            onChange={(_, checked) => {
                              if (checked) setInviteRole('admin');
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {t.roles.admin}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {roleDescriptions.admin}
                            </Typography>
                          </Box>
                        }
                      />
                    </Stack>
                  </FormControl>
                  {inviteRole === 'member' && (
                    <FormControl component="fieldset" disabled={!isOwnerOrAdmin}>
                      <FormLabel component="legend">{invitePermissionCopy.title}</FormLabel>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                        {invitePermissionCopy.hint}
                      </Typography>
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        {(
                          [
                            'canEditStatements',
                            'canEditCustomTables',
                            'canEditCategories',
                            'canEditDataEntry',
                            'canShareFiles',
                          ] as Array<keyof InvitePermissions>
                        ).map((key) => (
                          <FormControlLabel
                            key={key}
                            sx={{ m: 0 }}
                            control={
                              <Checkbox
                                checked={invitePermissions[key]}
                                onChange={(_, checked) => {
                                  setInvitePermissions((prev) => ({ ...prev, [key]: checked }));
                                }}
                              />
                            }
                            label={<Typography variant="body2">{invitePermissionCopy.labels[key]}</Typography>}
                          />
                        ))}
                      </Stack>
                    </FormControl>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Shield size={16} />}
                      disabled={!isOwnerOrAdmin || inviteLoading}
                    >
                      {inviteLoading ? <CircularProgress size={20} color="inherit" /> : t.invite.send}
                    </Button>
                  </Box>
                  {inviteLink && (
                    <Alert
                      severity="success"
                      action={
                        <IconButton color="inherit" size="small" onClick={() => copyLink(inviteLink)}>
                          <Copy size={16} />
                        </IconButton>
                      }
                    >
                      {t.invite.inviteLinkLabel}: {inviteLink}
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {overview && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={600}>
                    {t.pending.title}
                  </Typography>
                  {overview.invitations.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {t.pending.empty}
                    </Typography>
                  )}
                <Stack spacing={1.5}>
                  {overview.invitations.map((invite) => {
                    const link =
                      invite.link ||
                      `${(process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')}/invite/${invite.token}`;
                    return (
                      <Box
                        key={invite.id}
                        sx={{
                          p: 1.5,
                          border: '1px dashed',
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {invite.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t.roles.roleLabel}: {roleLabels[invite.role] || invite.role}
                          </Typography>
                          {invite.expiresAt && (
                            <Typography variant="caption" color="text.secondary">
                              {t.pending.validUntil}: {formatDate(invite.expiresAt)}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Copy size={14} />}
                          onClick={() => copyLink(link)}
                        >
                          {t.pending.copyLink}
                        </Button>
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
