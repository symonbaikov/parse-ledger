'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  Description,
  CloudUpload,
  Assessment,
  Category,
  AdminPanelSettings,
  Logout,
  AccountCircle,
  Menu as MenuIcon,
  Folder as StorageIcon,
  Telegram,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isAdmin, hasPermission } = usePermissions();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (!user) {
    return null;
  }

  const navItems = [
    {
      label: 'Выписки',
      path: '/statements',
      icon: <Description />,
      permission: 'statement.view',
    },
    {
      label: 'Хранилище',
      path: '/storage',
      icon: <StorageIcon />,
      permission: 'statement.view',
    },
    {
      label: 'Загрузка',
      path: '/upload',
      icon: <CloudUpload />,
      permission: 'statement.upload',
    },
    {
      label: 'Отчёты',
      path: '/reports',
      icon: <Assessment />,
      permission: 'report.view',
    },
    {
      label: 'Категории',
      path: '/categories',
      icon: <Category />,
      permission: 'category.view',
    },
    {
      label: 'Telegram',
      path: '/settings/telegram',
      icon: <Telegram />,
      permission: 'telegram.view',
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    hasPermission(item.permission),
  );

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        FinFlow
      </Typography>
      <List>
        {visibleNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={pathname === item.path}
              sx={{
                textAlign: 'left',
                color: pathname === item.path ? 'primary.main' : 'inherit',
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {isAdmin && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/admin"
              selected={pathname?.startsWith('/admin')}
              sx={{
                textAlign: 'left',
                color: pathname?.startsWith('/admin')
                  ? 'primary.main'
                  : 'inherit',
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname?.startsWith('/admin')
                    ? 'primary.main'
                    : 'inherit',
                }}
              >
                <AdminPanelSettings />
              </ListItemIcon>
              <ListItemText primary="Админ-панель" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              component={Link}
              href="/"
              sx={{
                flexGrow: { xs: 1, md: 0 },
                mr: 4,
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                letterSpacing: '.1rem',
              }}
            >
              FinFlow
            </Typography>

            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {visibleNavItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    component={Link}
                    href={item.path}
                    sx={{
                      textTransform: 'none',
                      fontWeight: pathname === item.path ? 700 : 400,
                      opacity: pathname === item.path ? 1 : 0.8,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

                {isAdmin && (
                  <Button
                    color="inherit"
                    startIcon={<AdminPanelSettings />}
                    component={Link}
                    href="/admin"
                    sx={{
                      textTransform: 'none',
                      fontWeight: pathname?.startsWith('/admin') ? 700 : 400,
                      opacity: pathname?.startsWith('/admin') ? 1 : 0.8,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    Админ-панель
                  </Button>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                {user.name}
              </Typography>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                onClick={handleMenu}
                aria-label="account menu"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem
                  onClick={handleClose}
                  component={Link}
                  href="/settings/profile"
                >
                  <Settings sx={{ mr: 1 }} />
                  Настройки
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Выйти
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
}
