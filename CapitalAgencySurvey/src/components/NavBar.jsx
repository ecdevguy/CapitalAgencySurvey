import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Logo from '../assets/logo_capital-agency_white.png';
import LogoDark from '../assets/logo_capital-agency.png';

const Navbar = ({isDark, handleDarkModeToggle}) => {

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#e7f0ff',
      },
      primary: {
        main: '#aed1f9',
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#212533',
        paper: '#000410',
      },
      primary: {
        main: '#5afb94',
      },
    },
  });

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
        <img
            src={!isDark ? LogoDark : Logo}
            alt="Logo"
            style={{
              height: '56px',
              marginRight: '16px',
              marginBottom: '16px',
              marginTop: '16px',
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            <Switch checked={isDark} onChange={handleDarkModeToggle} />
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
