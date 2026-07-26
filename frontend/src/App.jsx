import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthPage from './components/auth/AuthPage';
import DashboardPage from './pages/DashboardPage';

function MainApp() {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <AuthPage />;
  }

  return <DashboardPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
