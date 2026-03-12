"use client"

import React from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

// components
import Profile from './Profile';
import { IconMenu2 } from '@tabler/icons-react';

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const theme = useTheme();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
    padding: '0 25px ! from theme', // or theme.spacing(0, 3)
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(0, 3),
    },
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <IconMenu2 width="22" height="22" />
        </IconButton>

        <Box flexGrow={1} />
        
        <Stack spacing={1} direction="row" alignItems="center">
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  toggleMobileSidebar: PropTypes.func,
};

export default Header;
