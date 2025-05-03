import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  InputBase, 
  Box,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Tooltip,
  Divider,
  ListItemIcon,
  Paper,
  Popper,
  ClickAwayListener,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Mic as MicIcon,
  ShoppingCart as CartIcon,
  Language as LanguageIcon,
  AccountCircle,
  MicOff as MicOffIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { filterProducts } from '../store/slices/productsSlice';
import { useFeedback } from '../components/Feedback';
import Cart from './Cart';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useThemeMode } from '../theme/ThemeProvider';
import { useCart } from '../contexts/CartContext';
import { useSearch } from '../contexts/SearchContext';
import SearchResults from './SearchResults';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const SearchIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'inherit',
}));

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { showFeedback } = useFeedback();
  const { mode, toggleTheme } = useThemeMode();
  const { items: cartItems } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();

  const handleVoiceSearch = () => {
    if (!browserSupportsSpeechRecognition) {
      showFeedback(t('voiceSearchError'), 'error');
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      if (transcript) {
        setSearchQuery(transcript);
        dispatch(filterProducts(transcript));
      }
    } else {
      resetTranscript();
      SpeechRecognition.startListening({
        language: i18n.language === 'hi' ? 'hi-IN' : 'en-US',
      });
    }
  };

  const handleLanguageChange = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    dispatch(filterProducts(query));
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      dispatch(filterProducts(searchQuery));
    }
  };

  const handleSearchInputClick = () => {
    setSearchDialogOpen(true);
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' }, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            MKSK
          </Typography>

          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onClick={handleSearchInputClick}
              readOnly
              sx={{ cursor: 'pointer' }}
            />
          </Search>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={mode === 'dark' ? t('lightMode') : t('darkMode')}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{ mr: 1 }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Button
            color="inherit"
            startIcon={<LanguageIcon />}
            onClick={handleLanguageChange}
            className="language-switcher"
          >
            {i18n.language.toUpperCase()}
          </Button>

          {isAuthenticated ? (
            <>
              {user?.role !== 'admin' && (
                <Tooltip title={t('cart')}>
                  <IconButton 
                    color="inherit" 
                    onClick={() => setCartOpen(true)}
                  >
                    <Badge 
                      badgeContent={cartItems.length} 
                      color="secondary"
                    >
                      <CartIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title={user?.name || t('account')}>
                <IconButton
                  onClick={handleMenu}
                  color="inherit"
                  sx={{ ml: 1 }}
                >
                  {user?.avatar ? (
                    <Avatar 
                      src={user.avatar} 
                      alt={user.name}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1" noWrap>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user?.role === 'admin' ? t('adminRole') : t('farmerRole')}
                  </Typography>
                </Box>
                
                <Divider />

                <MenuItem onClick={() => {
                  handleClose();
                  navigate('/profile');
                }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  {t('profile')}
                </MenuItem>

                {user?.role === 'admin' && (
                  <MenuItem onClick={() => {
                    handleClose();
                    navigate('/admin');
                  }}>
                    <ListItemIcon>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    {t('dashboard')}
                  </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  {t('logout')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              {t('login')}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <SearchResults
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
      />

      <Cart 
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
};

export default Navbar;