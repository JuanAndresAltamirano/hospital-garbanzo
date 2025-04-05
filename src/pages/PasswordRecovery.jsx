import { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';

const PasswordRecovery = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/request-reset`, {
        email
      });
      
      setStatus({
        type: 'success',
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

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
          Password Recovery
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
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PasswordRecovery; 