'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import { Copy, MailPlus, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import { useIntlayer } from 'next-intlayer';

type WorkspaceOverview = {
  workspace: { id: string; name: string; ownerId?: string | null; createdAt?: string };
  members: Array<{ id: string; email?: string; name?: string; role: string; joinedAt?: string }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    token: string;
    expiresAt?: string;
    createdAt?: string;
    link?: string;
  }>;
};

export default function WorkspaceSettingsPage() {
  const { user, loading } = useAuth();
  const t = useIntlayer('settingsWorkspacePage');
  const [overview, setOverview] = useState<WorkspaceOverview | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('member');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const isOwnerOrAdmin = useMemo(() => {
    const member = overview?.members.find((m) => m.id === user?.id);
    return member?.role === 'owner' || member?.role === 'admin';
  }, [overview?.members, user?.id]);

  useEffect(() => {
    if (user) {
      loadOverview();
    }
  }, [user]);

  const loadOverview = async () => {
    setFetchError(null);
    try {
      const response = await apiClient.get<WorkspaceOverview>('/workspaces/me');
      setOverview(response.data);
    } catch (err: any) {
      setFetchError(
        err?.response?.data?.message || t.errors.loadOverview.value,
      );
    }
  };

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setInviteLoading(true);
    setInviteLink(null);
    try {
      const response = await apiClient.post('/workspaces/invitations', {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail('');
      setInviteLink(response.data?.invitationLink);
      toast.success(t.toasts.inviteSent.value);
      await loadOverview();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || t.errors.inviteFailed.value;
      toast.error(message);
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

  const roleLabels: Record<string, string> = {
    owner: t.roles.owner.value,
    admin: t.roles.admin.value,
    member: t.roles.member.value,
  };

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
                  <TextField
                    select
                    label={t.roles.roleLabel.value}
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    fullWidth
                    disabled={!isOwnerOrAdmin}
                  >
                    <MenuItem value="member">{t.roles.member}</MenuItem>
                    <MenuItem value="admin">{t.roles.admin}</MenuItem>
                  </TextField>
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
                              {t.pending.validUntil}: {new Date(invite.expiresAt).toLocaleDateString()}
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
