import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AthleteDashboard from './components/AthleteDashboard';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import PerformanceInsights from './components/PerformanceInsights';
import HealthManagement from './components/HealthManagement';
import CareerSupport from './components/CareerSupport';
import FinancialManagement from './components/FinancialManagement';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Sports Management Platform
              </Typography>
              <Button color="inherit" component={Link} to="/performance">
                Performance
              </Button>
              <Button color="inherit" component={Link} to="/health">
                Health
              </Button>
              <Button color="inherit" component={Link} to="/career">
                Career
              </Button>
              <Button color="inherit" component={Link} to="/financial">
                Financial
              </Button>
            </Toolbar>
          </AppBar>
          <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<AthleteDashboard />} />
              <Route path="/performance" element={<PerformanceInsights />} />
              <Route path="/health" element={<HealthManagement />} />
              <Route path="/career" element={<CareerSupport />} />
              <Route path="/financial" element={<FinancialManagement />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
