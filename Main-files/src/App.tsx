import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Tasks from './components/dashboard/Tasks';
import Chat from './components/chat/Chat';
import Calendar from './components/calendar/Calendar';
import Meeting from './components/meeting/Meeting';
import Settings from './components/settings/Settings';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
    },
  });

  useEffect(() => {
    // Load saved font size from localStorage
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      document.documentElement.style.fontSize = `${savedFontSize}px`;
    }
  }, []);

  const handleThemeChange = (isDark: boolean) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout onThemeChange={handleThemeChange} isDarkMode={isDarkMode}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/meeting" element={<Meeting />} />
            <Route path="/settings" element={
              <Settings 
                onThemeChange={handleThemeChange}
                isDarkMode={isDarkMode}
              />
            } />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
