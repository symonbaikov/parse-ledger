'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import {
  FileText,
  Database,
  UploadCloud,
  BarChart,
  Tags,
  MessageCircle,
  Shield,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Wallet,
  Plug,
  Edit3,
  Table,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isAdmin, hasPermission } = usePermissions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const navItems = [
    {
      label: 'Выписки',
      path: '/statements',
      icon: <FileText size={20} />,
      permission: 'statement.view',
    },
    {
      label: 'Хранилище',
      path: '/storage',
      icon: <Database size={20} />,
      permission: 'statement.view',
    },
    {
      label: 'Ввод данных',
      path: '/data-entry',
      icon: <Edit3 size={20} />,
      permission: 'statement.upload',
    },
    {
      label: 'Таблицы',
      path: '/custom-tables',
      icon: <Table size={20} />,
      permission: 'statement.view',
    },
    {
      label: 'Отчёты',
      path: '/reports',
      icon: <BarChart size={20} />,
      permission: 'report.view',
    },
    {
      label: 'Категории',
      path: '/categories',
      icon: <Tags size={20} />,
      permission: 'category.view',
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    hasPermission(item.permission),
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Wallet className="h-8 w-8 text-primary mr-2" />
              <span className="text-primary text-xl font-bold tracking-tight">FinFlow</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-2">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      group inline-flex flex-col items-center justify-center px-3 pt-1 border-b-2 text-xs font-medium min-w-[64px] transition-colors duration-200
                      ${isActive 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-secondary hover:text-primary'}
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
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex flex-col items-center max-w-xs text-xs font-medium text-secondary hover:text-primary focus:outline-none"
              >
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                   <User size={16} className="text-gray-500" />
                </div>
                <div className="flex items-center mt-1">
                  <span className="truncate max-w-[80px] hidden sm:block">Профиль</span>
                  <ChevronDown size={12} className="ml-0.5" />
                </div>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                   <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                   </div>
                  <Link
                    href="/settings/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Настройки
                  </Link>
                  <Link
                    href="/integrations"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Plug size={16} className="mr-2" />
                    Интеграции
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Shield size={16} className="mr-2" />
                      Админка
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      toast.success('Вы успешно вышли из системы');
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Выйти
                  </button>
                </div>
              )}
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
            {visibleNavItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium
                  ${pathname === item.path
                    ? 'bg-blue-50 border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'}
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
    </header>
  );
}
