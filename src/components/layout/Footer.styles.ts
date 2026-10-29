import { SxProps, Theme } from '@mui/material';

export const footerBoxSx: SxProps<Theme> = {
  bgcolor: 'primary.main',
  color: 'white',
  py: 3,
  mt: 'auto',
};

export const linkBoxSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  gap: 4,
  mt: 1,
};
