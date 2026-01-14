'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  ArrowLeft,
  BarChart,
  ChevronDown,
  Database,
  Edit3,
  FileText,
  Languages,
  LogOut,
  Menu,
  MessageCircle,
  Plug,
  Settings,
  Shield,
  Table,
  Tags,
  UploadCloud,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useIntlayer, useLocale } from 'next-intlayer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

type AppLanguage = 'ru' | 'en' | 'kk';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isAdmin, hasPermission } = usePermissions();
  const { locale, availableLocales, setLocale } = useLocale();
  const { nav, userMenu, languageModal, languages: languageNames } = useIntlayer('navigation');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [languageDraft, setLanguageDraft] = useState<AppLanguage>('ru');
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  const languages = useMemo(
    () =>
      [
        {
          code: 'ru' as const,
          label: languageNames.ru.value,
          note: languageModal.defaultLanguageNote.value,
        },
        { code: 'en' as const, label: languageNames.en.value },
        { code: 'kk' as const, label: languageNames.kk.value },
      ].filter(l => availableLocales.map(String).includes(l.code)) satisfies Array<{
        code: AppLanguage;
        label: string;
        note?: string;
      }>,
    [availableLocales, languageModal.defaultLanguageNote, languageNames],
  );

  const languageLabel = useMemo(() => {
    const normalizedLocale = (locale as AppLanguage) || 'ru';
    return languages.find(l => l.code === normalizedLocale)?.label ?? languageNames.ru.value;
  }, [locale, languages, languageNames.ru.value]);

  const normalizedLocale = (locale as AppLanguage) || 'ru';

  if (!user) {
    return null;
  }

  const navItems = [
    {
      label: nav.statements,
      path: '/statements',
      icon: <FileText size={20} />,
      permission: 'statement.view',
    },
    {
      label: nav.storage,
      path: '/storage',
      icon: <Database size={20} />,
      permission: 'statement.view',
    },
    {
      label: nav.dataEntry,
      path: '/data-entry',
      icon: <Edit3 size={20} />,
      permission: 'statement.upload',
    },
    {
      label: nav.tables,
      path: '/custom-tables',
      icon: <Table size={20} />,
      permission: 'statement.view',
    },
    {
      label: nav.reports,
      path: '/reports',
      icon: <BarChart size={20} />,
      permission: 'report.view',
    },
    {
      label: nav.categories,
      path: '/categories',
      icon: <Tags size={20} />,
      permission: 'category.view',
    },
  ];

  const visibleNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Wallet className="h-8 w-8 text-primary mr-2" />
              <span className="text-primary text-xl font-bold tracking-tight">FinFlow</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-2">
              {visibleNavItems.map(item => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      group inline-flex flex-col items-center justify-center px-3 pt-1 border-b-2 text-xs font-medium min-w-[64px] transition-colors duration-200
                      ${
                        isActive
                          ? 'border-primary text-primary'
                          : 'border-transparent text-secondary hover:text-primary'
                      }
                    `}
                  >
                    <span className="mb-1 group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </span>
                    <span className="hidden lg:block">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* User Menu */}
            <div className="relative ml-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center max-w-xs text-xs font-medium text-secondary hover:text-primary focus:outline-none">
                    <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="truncate max-w-[90px] hidden sm:block">
                        {userMenu.profile}
                      </span>
                      <ChevronDown size={12} className="ml-0.5" />
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-[320px] p-2">
                  <DropdownMenuLabel className="px-3 py-3">
                    <div className="text-base font-semibold text-gray-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-sm font-normal text-gray-500 truncate">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile">
                      <Settings size={18} className="text-gray-600" />
                      <span className="text-base">{userMenu.settings}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/workspace">
                      <Users size={18} className="text-gray-600" />
                      <span className="text-base">{userMenu.workspace}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/integrations">
                      <Plug size={18} className="text-gray-600" />
                      <span className="text-base">{userMenu.integrations}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onSelect={() => {
                      setLanguageDraft(normalizedLocale);
                      setLanguagePickerOpen(false);
                      setLanguageModalOpen(true);
                    }}
                  >
                    <Languages size={18} className="text-gray-600" />
                    <span className="text-base">{userMenu.language}</span>
                    <DropdownMenuShortcut className="text-sm">{languageLabel}</DropdownMenuShortcut>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield size={18} className="text-gray-600" />
                        <span className="text-base">{userMenu.admin}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      logout();
                      toast.success(userMenu.logoutSuccess.value);
                    }}
                    className="text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <LogOut size={18} />
                    <span className="text-base">{userMenu.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="pt-2 pb-3 space-y-1">
            {visibleNavItems.map(item => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium
                  ${
                    pathname === item.path
                      ? 'bg-blue-50 border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {languageModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            role="button"
            tabIndex={0}
            onClick={() => {
              setLanguageModalOpen(false);
              setLanguagePickerOpen(false);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setLanguageModalOpen(false);
                setLanguagePickerOpen(false);
              }
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">{languageModal.sectionLabel}</div>
                  <div className="text-lg font-semibold text-gray-900">{languageModal.title}</div>
                </div>
                {languagePickerOpen && (
                  <button
                    onClick={() => setLanguagePickerOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    title={languageModal.back.value}
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="h-[260px] flex flex-col">
                {!languagePickerOpen ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
                      <div className="text-xs text-gray-500">
                        {languageModal.currentLanguageLabel}
                      </div>
                      <div className="mt-1 text-base font-semibold text-gray-900">
                        {languages.find(l => l.code === languageDraft)?.label ??
                          languageNames.ru.value}
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => setLanguagePickerOpen(true)}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm"
                        >
                          {languageModal.changeLanguage}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">{languageModal.footerHint}</div>
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-gray-500 mb-2">
                      {languageModal.availableLanguagesLabel}
                    </div>
                    <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2">
                      <div className="space-y-2">
                        {languages
                          .filter(l => l.code !== languageDraft)
                          .map(lang => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                setLanguageDraft(lang.code);
                                setLanguagePickerOpen(false);
                              }}
                              className="w-full flex items-center justify-between rounded-lg px-3 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex flex-col items-start">
                                <span className="text-sm font-medium text-gray-900">
                                  {lang.label}
                                </span>
                                {lang.note && (
                                  <span className="text-xs text-gray-500">{lang.note}</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {languageModal.chooseAction}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">{languageModal.scrollHint}</div>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
              <button
                onClick={() => {
                  setLanguageModalOpen(false);
                  setLanguagePickerOpen(false);
                }}
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-white transition-colors text-sm"
              >
                {languageModal.cancel}
              </button>
              <button
                onClick={() => {
                  setLocale(languageDraft);
                  setLanguageModalOpen(false);
                  setLanguagePickerOpen(false);
                  const selectedLabel =
                    languages.find(l => l.code === languageDraft)?.label ?? languageNames.ru.value;
                  toast.success(`${languageModal.savedToastPrefix.value}: ${selectedLabel}`);
                  setTimeout(() => {
                    window.location.reload();
                  }, 50);
                }}
                className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors text-sm"
              >
                {languageModal.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
