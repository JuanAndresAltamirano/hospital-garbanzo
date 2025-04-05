import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'New passwords do not match.'
      });
      return;
    }

    if (newPassword.length < 8) {
      setStatus({
        type: 'error',
        message: 'New password must be at least 8 characters long.'
      });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setStatus({
        type: 'success',
        message: 'Password successfully changed.'
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'An error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        borderRadius: 2,
        boxShadow: 1,
        bgcolor: 'background.paper',
        maxWidth: 400,
        mx: 'auto'
      }}
    >
      <Typography component="h2" variant="h6">
        Change Password
      </Typography>
      
      {status.message && (
        <Alert severity={status.type} sx={{ width: '100%' }}>
          {status.message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          name="currentPassword"
          label="Current Password"
          type="password"
          id="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={loading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="newPassword"
          label="New Password"
          type="password"
          id="newPassword"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </Box>
    </Box>
  );
};

export default ChangePassword; 