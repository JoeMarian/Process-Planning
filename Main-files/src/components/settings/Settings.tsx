import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  FormControlLabel,
  Slider,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  FormatSize as FormatSizeIcon,
} from '@mui/icons-material';

interface SettingsData {
  darkMode: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  language: string;
  timeZone: string;
  autoJoinMeetings: boolean;
}

interface SettingsProps {
  onThemeChange: (isDark: boolean) => void;
  isDarkMode: boolean;
}

const Settings: React.FC<SettingsProps> = ({ onThemeChange, isDarkMode }) => {
  const [settings, setSettings] = useState<SettingsData>({
    darkMode: false,
    notifications: true,
    emailNotifications: true,
    language: 'en',
    timeZone: 'UTC',
    autoJoinMeetings: false,
  });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [fontSize, setFontSize] = useState<number>(16);

  useEffect(() => {
    // Load saved font size from localStorage
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(parseFloat(savedFontSize));
      document.documentElement.style.fontSize = `${savedFontSize}px`;
    }
  }, []);

  const handleChange = (setting: keyof SettingsData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked,
    });
  };

  const handleSelectChange = (setting: keyof SettingsData) => (
    event: any
  ) => {
    setSettings({
      ...settings,
      [setting]: event.target.value,
    });
  };

  const handleSave = () => {
    // Save settings to backend/localStorage
    localStorage.setItem('settings', JSON.stringify(settings));
    setShowSaveSuccess(true);
  };

  const handleFontSizeChange = (_event: Event, newValue: number | number[]) => {
    const newSize = newValue as number;
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem('fontSize', newSize.toString());
  };

  const handleThemeChange = () => {
    onThemeChange(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const marks = [
    { value: 12, label: '12px' },
    { value: 14, label: '14px' },
    { value: 16, label: '16px' },
    { value: 18, label: '18px' },
    { value: 20, label: '20px' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 2 }}>
        <List>
          <ListItem>
            <ListItemText
              primary="Dark Mode"
              secondary="Enable dark theme for the application"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.darkMode}
                onChange={handleChange('darkMode')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText
              primary="Push Notifications"
              secondary="Enable push notifications for updates"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.notifications}
                onChange={handleChange('notifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText
              primary="Email Notifications"
              secondary="Receive notifications via email"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.emailNotifications}
                onChange={handleChange('emailNotifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText
              primary="Auto-join Meetings"
              secondary="Automatically join scheduled meetings"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={settings.autoJoinMeetings}
                onChange={handleChange('autoJoinMeetings')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />

          <ListItem>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={settings.language}
                label="Language"
                onChange={handleSelectChange('language')}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
          <Divider />

          <ListItem>
            <FormControl fullWidth>
              <InputLabel>Time Zone</InputLabel>
              <Select
                value={settings.timeZone}
                label="Time Zone"
                onChange={handleSelectChange('timeZone')}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="EST">EST</MenuItem>
                <MenuItem value="PST">PST</MenuItem>
                <MenuItem value="GMT">GMT</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
        </List>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={handleThemeChange}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
                <Typography>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormatSizeIcon />
            Font Size
          </Typography>
          <Box sx={{ px: 2, mt: 4 }}>
            <Slider
              value={fontSize}
              onChange={handleFontSizeChange}
              min={12}
              max={20}
              step={1}
              marks={marks}
              valueLabelDisplay="auto"
              aria-label="Font size"
            />
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setFontSize(16);
              document.documentElement.style.fontSize = '16px';
              localStorage.setItem('fontSize', '16');
            }}
          >
            Reset to Default
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSaveSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 