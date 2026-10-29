import React from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Typography, Container,
  Avatar, Button, Tooltip, MenuItem, Badge, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Menu, Grid
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AdbIcon from '@mui/icons-material/Adb';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { getCart } from '@/services/cart';
import {
  logoTextSx,
  mobileLogoGridSx,
  desktopLogoBoxSx,
  menuButtonSx,
  navPagesBoxSx,
  userAvatarBoxSx,
  drawerSx,
  drawerBoxSx
} from './Header.styles';

const pages = [
  { icon: <StorefrontIcon fontSize="small" />, label: 'Products', path: '/products' },
];

function Header() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const { token, role, logout } = useAuth();
  const router = useRouter();
  const { data: cart } = useQuery({ queryKey: ['cart'], queryFn: getCart, enabled: Boolean(token) && role === 'user' });
  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const settings = React.useMemo(() => {
    if (role === 'admin') {
      return [
        { label: 'Manage Users', path: '/admin/users', icon: <ManageAccountsIcon /> },
        { label: 'Manage Products', path: '/admin/products', icon: <Inventory2Icon /> },
        { label: 'Content Studio', path: '/admin/content', icon: <ViewListIcon /> },
        { label: 'View Orders', path: '/admin/orders', icon: <ViewListIcon /> },
        { label: 'Logout', action: 'logout', icon: <LogoutIcon /> },
      ];
    } else if (role === 'user') {
      return [
        { label: 'Profile', path: '/user/profile', icon: <PersonIcon /> },
        { label: 'Cart', path: '/cart', icon: <ShoppingCartIcon /> },
        { label: 'Logout', action: 'logout', icon: <LogoutIcon /> },
      ];
    } else {
      return [{ label: 'Logout', action: 'logout', icon: <LogoutIcon /> }];
    }
  }, [role]);

  const toggleDrawer = (open: boolean) => () => setMobileDrawerOpen(open);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleSettingClick = (setting: { action?: string; path?: string }) => {
    if (setting.action === 'logout') logout();
    else if (setting.path) router.push(setting.path);
    setMobileDrawerOpen(false);
    handleCloseUserMenu();
  };

  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="xl">
        <Toolbar>
          <Grid container alignItems="center" sx={mobileLogoGridSx}>
            <Grid item xs={2}>
              <IconButton color="inherit" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item xs={10} container justifyContent="center" alignItems="center">
              <AdbIcon />
              <Typography variant="h6" noWrap component="a" href="/" sx={logoTextSx}>
                Fruitzy
              </Typography>
            </Grid>
          </Grid>

          <Box sx={desktopLogoBoxSx}>
            <AdbIcon sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap component="a" href="/" sx={logoTextSx}>
              Fruitzy
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, mx: 2 }}>
            {role === 'admin' && (
              <Typography variant="h6" noWrap component="a" href="/admin" sx={logoTextSx}>
                Admin
              </Typography>
            )}
          </Box>

          <Box sx={navPagesBoxSx}>
            {pages.map((page) => (
              <Button key={page.label} onClick={() => router.push(page.path)} startIcon={page.icon} sx={{ color: 'white' }}>
                {page.label}
              </Button>
            ))}
          </Box>

          {role === 'user' && (
            <IconButton color="inherit" aria-label={`Cart, ${cartItemCount} items`} onClick={() => router.push('/cart')} sx={menuButtonSx}>
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          )}

          {token && role ? (
            <Box sx={userAvatarBoxSx}>
              <Tooltip title="Open settings">
                <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
                  <Avatar alt="User" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting.label} onClick={() => handleSettingClick(setting)}>
                    <ListItemIcon>{setting.icon}</ListItemIcon>
                    <Typography>{setting.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" onClick={() => router.push('/auth/Login')}>
              Login
            </Button>
          )}
        </Toolbar>
      </Container>

      <Drawer anchor="left" open={mobileDrawerOpen} onClose={toggleDrawer(false)} sx={drawerSx}>
        <Box sx={drawerBoxSx} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {pages.map((page) => (
              <ListItem key={page.label} disablePadding>
                <ListItemButton onClick={() => router.push(page.path)}>
                  <ListItemIcon>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {token && role && settings.map((setting) => (
              <ListItem key={setting.label} disablePadding>
                <ListItemButton onClick={() => handleSettingClick(setting)}>
                  <ListItemIcon>{setting.icon}</ListItemIcon>
                  <ListItemText primary={setting.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default Header;


