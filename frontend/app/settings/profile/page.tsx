'use client';

import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select } from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { useAuth } from '@/app/hooks/useAuth';
import apiClient from '@/app/lib/api';
import { cn } from '@/app/lib/utils';
import type { AxiosError } from 'axios';
import { KeyRound, Loader2, LogOut, Mail, Shield, UserRound } from 'lucide-react';
import { useIntlayer, useLocale } from 'next-intlayer';
import { useRouter } from 'next/navigation';
import { type ComponentType, useEffect, useMemo, useState } from 'react';

type AppLocale = 'ru' | 'en' | 'kk';
type ApiErrorResponse = { message?: string; error?: { message?: string } };

const sections = ['profile', 'sessions', 'email', 'password'] as const;
type SectionId = (typeof sections)[number];

const normalizeLocale = (value: unknown): AppLocale => {
  if (value === 'ru' || value === 'en' || value === 'kk') return value;
  return 'ru';
};

const normalizeSection = (value: string | null | undefined): SectionId => {
  if (!value) return 'profile';
  if ((sections as readonly string[]).includes(value)) return value as SectionId;
  return 'profile';
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return (
    axiosError?.response?.data?.message || axiosError?.response?.data?.error?.message || fallback
  );
};

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { locale, setLocale } = useLocale();
  const t = useIntlayer('settingsProfilePage');
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [profileName, setProfileName] = useState('');
  const [profileLocale, setProfileLocale] = useState<AppLocale>('ru');
  const [profileTimeZone, setProfileTimeZone] = useState<string>('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.name) {
      setProfileName(user.name);
    }
    setProfileLocale(normalizeLocale(user?.locale ?? locale));
    setProfileTimeZone(user?.timeZone || '');
  }, [locale, user]);

  useEffect(() => {
    setActiveSection(normalizeSection(window.location.hash?.replace('#', '')));
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', `#${activeSection}`);
  }, [activeSection]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileMessage(null);
    setProfileError(null);
    try {
      setProfileLoading(true);
      const response = await apiClient.patch('/users/me/preferences', {
        name: profileName,
        locale: profileLocale,
        timeZone: profileTimeZone ? profileTimeZone : null,
      });
      setProfileMessage(response.data?.message || t.profileCard.successFallback.value);

      if (normalizeLocale(locale) !== profileLocale) {
        setLocale(profileLocale);
        setTimeout(() => window.location.reload(), 50);
      }
    } catch (error: unknown) {
      setProfileError(getApiErrorMessage(error, t.profileCard.errorFallback.value));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await apiClient.post('/auth/logout-all');
    } catch (error) {
      console.error('Logout-all error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailMessage(null);
    setEmailError(null);

    if (!emailPassword) {
      setEmailError(t.validation.passwordRequiredForEmail.value);
      return;
    }

    try {
      setEmailLoading(true);
      const response = await apiClient.patch('/users/me/email', {
        email,
        currentPassword: emailPassword,
      });

      setEmailMessage(response.data?.message || t.emailCard.successFallback.value);
      setEmailPassword('');
    } catch (error: unknown) {
      setEmailError(getApiErrorMessage(error, t.emailCard.errorFallback.value));
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (passwords.next !== passwords.confirm) {
      setPasswordError(t.validation.passwordMismatch.value);
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await apiClient.patch('/users/me/password', {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });

      setPasswordMessage(response.data?.message || t.passwordCard.successFallback.value);
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (error: unknown) {
      setPasswordError(getApiErrorMessage(error, t.passwordCard.errorFallback.value));
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Alert className="max-w-xl" variant="default">
          {t.authRequired.value}
        </Alert>
      </div>
    );
  }

  const sectionMeta: Record<
    SectionId,
    { title: string; description?: string; icon: ComponentType<{ className?: string }> }
  > = {
    profile: { title: t.profileCard.title.value, icon: UserRound },
    sessions: {
      title: t.sessionsCard.title.value,
      description: t.sessionsCard.logoutAllHelp.value,
      icon: Shield,
    },
    email: { title: t.emailCard.title.value, icon: Mail },
    password: { title: t.passwordCard.title.value, icon: KeyRound },
  };

  const renderSection = () => {
    if (activeSection === 'profile') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              {t.profileCard.title.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleProfileSubmit}>
              {profileMessage && <Alert variant="success">{profileMessage}</Alert>}
              {profileError && <Alert variant="error">{profileError}</Alert>}

              <div className="space-y-2">
                <Label htmlFor="profile-name">{t.profileCard.nameLabel.value}</Label>
                <Input
                  id="profile-name"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-locale">{t.profileCard.languageLabel.value}</Label>
                  <Select
                    id="profile-locale"
                    value={profileLocale}
                    onChange={e => setProfileLocale(normalizeLocale(e.target.value))}
                  >
                    <option value="ru">{t.profileCard.languages.ru.value}</option>
                    <option value="en">{t.profileCard.languages.en.value}</option>
                    <option value="kk">{t.profileCard.languages.kk.value}</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-timezone">{t.profileCard.timeZoneLabel.value}</Label>
                  <Select
                    id="profile-timezone"
                    value={profileTimeZone}
                    onChange={e => setProfileTimeZone(e.target.value)}
                  >
                    <option value="">{t.profileCard.timeZones.auto.value}</option>
                    <option value="UTC">{t.profileCard.timeZones.utc.value}</option>
                    <option value="Europe/Moscow">
                      {t.profileCard.timeZones.europeMoscow.value}
                    </option>
                    <option value="Asia/Almaty">{t.profileCard.timeZones.asiaAlmaty.value}</option>
                  </Select>
                  <p className="text-xs text-gray-500">{t.profileCard.timeZoneHelp.value}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t.profileCard.submit.value}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      );
    }

    if (activeSection === 'sessions') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t.sessionsCard.title.value}
            </CardTitle>
            <CardDescription>{t.sessionsCard.logoutAllHelp.value}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {t.sessionsCard.lastLoginLabel.value}:
              </span>{' '}
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
            </div>

            <div className="flex justify-end">
              <Button variant="destructive" onClick={handleLogoutAll}>
                <LogOut className="h-4 w-4" />
                {t.sessionsCard.logoutAllButton.value}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeSection === 'email') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {t.emailCard.title.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleEmailSubmit}>
              {emailMessage && <Alert variant="success">{emailMessage}</Alert>}
              {emailError && <Alert variant="error">{emailError}</Alert>}

              <div className="space-y-2">
                <Label htmlFor="email-next">{t.emailCard.newEmailLabel.value}</Label>
                <Input
                  id="email-next"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-password">{t.emailCard.currentPasswordLabel.value}</Label>
                <Input
                  id="email-password"
                  type="password"
                  value={emailPassword}
                  onChange={e => setEmailPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">{t.emailCard.currentPasswordHelp.value}</p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={emailLoading}>
                  {emailLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t.emailCard.submit.value}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {t.passwordCard.title.value}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handlePasswordSubmit}>
            {passwordMessage && <Alert variant="success">{passwordMessage}</Alert>}
            {passwordError && <Alert variant="error">{passwordError}</Alert>}

            <div className="space-y-2">
              <Label htmlFor="password-current">{t.passwordCard.currentPasswordLabel.value}</Label>
              <Input
                id="password-current"
                type="password"
                value={passwords.current}
                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                required
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="password-next">{t.passwordCard.newPasswordLabel.value}</Label>
              <Input
                id="password-next"
                type="password"
                value={passwords.next}
                onChange={e => setPasswords({ ...passwords, next: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">{t.passwordCard.newPasswordHelp.value}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-confirm">{t.passwordCard.confirmPasswordLabel.value}</Label>
              <Input
                id="password-confirm"
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="secondary" disabled={passwordLoading}>
                {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.passwordCard.submit.value}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6">
        <div className="text-2xl font-semibold text-primary">{t.title.value}</div>
        <div className="mt-1 text-sm text-gray-600">{t.subtitle.value}</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">{t.navigation.title.value}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {sections.map(id => {
                  const Icon = sectionMeta[id].icon;
                  const isActive = id === activeSection;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveSection(id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors',
                        isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{sectionMeta[id].title}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="lg:hidden">
            <div className="space-y-2">
              <Label htmlFor="profile-section">{t.navigation.sectionLabel.value}</Label>
              <Select
                id="profile-section"
                value={activeSection}
                onChange={e => setActiveSection(normalizeSection(e.target.value))}
              >
                {sections.map(id => (
                  <option key={id} value={id}>
                    {sectionMeta[id].title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {renderSection()}
        </main>
      </div>
    </div>
  );
}
