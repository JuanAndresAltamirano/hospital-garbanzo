import { useState } from 'react';
import { Box, Typography, Tab, Tabs } from '@mui/material';
import ChangePassword from '../ChangePassword';

const SettingsManager = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Settings
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Change Password" />
        {/* Add more tabs here as needed */}
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && <ChangePassword />}
        {/* Add more tab panels here as needed */}
      </Box>
    </Box>
  );
};

export default SettingsManager; 