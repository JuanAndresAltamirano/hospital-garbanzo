import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';

const PasswordReset = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus({
        type: 'error',
        message: 'Invalid or missing reset token.'
      });
      return;
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-reset-token`, {
          token
        });
        setTokenValid(true);
      } catch (error) {
        setStatus({
          type: 'error',
          message: 'Invalid or expired reset token.'
        });
        setTokenValid(false);
      }
    };

    verifyToken();
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match.'
      });
      return;
    }

    if (password.length < 8) {
      setStatus({
        type: 'error',
        message: 'Password must be at least 8 characters long.'
      });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        token,
        password
      });

      setStatus({
        type: 'success',
        message: 'Password has been successfully reset. You will be redirected to login.'
      });

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'An error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid && status.type === 'error') {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Alert severity="error">{status.message}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 3,
          borderRadius: 2,
          boxShadow: 1,
          bgcolor: 'background.paper'
        }}
      >
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        
        {status.message && (
          <Alert severity={status.type} sx={{ width: '100%' }}>
            {status.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PasswordReset; 