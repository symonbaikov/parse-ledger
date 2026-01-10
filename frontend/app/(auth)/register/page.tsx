'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
  useTheme,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import apiClient from '@/app/lib/api';
import { useIntlayer } from 'next-intlayer';

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();
  const t = useIntlayer('registerPage');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/register', formData);

      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      window.location.href = '/';
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || t.registerFailed.value,
      );
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left Side - Form */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h4" color="white" fontWeight="bold">
              F
            </Typography>
          </Box>

          <Typography component="h1" variant="h4" gutterBottom fontWeight="bold" color="text.primary">
            {t.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t.subtitle}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
	            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
	              label={t.fullNameLabel.value}
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'background.default' }
              }}
            />
	            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'background.default' }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
	              name="password"
	              label={t.passwordLabel.value}
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
	              helperText={t.passwordHelper.value}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'background.default' }
              }}
            />
	            <TextField
              margin="normal"
              fullWidth
              id="company"
	              label={t.companyLabel.value}
              name="company"
              value={formData.company}
              onChange={handleChange}
              InputProps={{
                sx: { borderRadius: 2, bgcolor: 'background.default' }
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ py: 1.5, borderRadius: 2, fontSize: '1rem', textTransform: 'none', boxShadow: 'none' }}
              disabled={loading}
	            >
	              {loading ? <CircularProgress size={24} color="inherit" /> : t.submit}
	            </Button>
	            <Box textAlign="center" sx={{ mt: 3 }}>
	              <Link href="/login" variant="body2" sx={{ textDecoration: 'none', fontWeight: 500 }}>
	                {t.haveAccount}
	              </Link>
	            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Right Side - Visual */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Abstract Shapes */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
          style={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            width: 350,
            height: 350,
            borderRadius: '40%',
            background: 'rgba(255, 255, 255, 0.05)',
            filter: 'blur(40px)',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            filter: 'blur(40px)',
          }}
        />

	        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', p: 4 }}>
	          <Typography variant="h2" fontWeight="bold" gutterBottom>
	            {t.rightTitle}
	          </Typography>
	          <Typography variant="h5" sx={{ opacity: 0.8, maxWidth: 500 }}>
	            {t.rightTagline}
	          </Typography>
	        </Box>
      </Grid>
    </Grid>
  );
}
