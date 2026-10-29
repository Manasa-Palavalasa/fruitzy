import { Box, Container, Typography, Link } from '@mui/material';
import React from 'react';
import { footerBoxSx, linkBoxSx } from './Footer.styles';

const Footer = () => {
  return (
    <Box component="footer" sx={footerBoxSx}>
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          &copy; {new Date().getFullYear()} Fruitzy. All rights reserved.
        </Typography>
        <Box sx={linkBoxSx}>
          <Link href="/" color="inherit" underline="hover">About</Link>
          <Link href="/" color="inherit" underline="hover">Contact</Link>
          <Link href="/" color="inherit" underline="hover">FAQs</Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
