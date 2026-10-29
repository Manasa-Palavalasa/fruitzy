import { SxProps, Theme } from '@mui/material';

export const logoTextSx: SxProps<Theme> = {
  fontFamily: 'monospace',
  fontWeight: 700,
  letterSpacing: '.2rem',
  color: 'inherit',
  textDecoration: 'none',
};

export const mobileLogoGridSx: SxProps<Theme> = {
  display: { xs: 'flex', md: 'none' },
};

export const desktopLogoBoxSx: SxProps<Theme> = {
  display: { xs: 'none', md: 'flex' },
  alignItems: 'center',
  mr: 2,
};

export const navPagesBoxSx: SxProps<Theme> = {
  display: { xs: 'none', md: 'flex' },
  gap: 2,
};

export const menuButtonSx: SxProps<Theme> = {
  ml: 1,
};

export const userAvatarBoxSx: SxProps<Theme> = {
  ml: 1,
  display: { xs: 'none', md: 'flex' },
};

export const drawerSx: SxProps<Theme> = {
  display: { xs: 'block', md: 'none' },
};

export const drawerBoxSx: SxProps<Theme> = {
  width: 250,
};
