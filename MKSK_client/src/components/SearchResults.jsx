import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  InputBase,
  Paper,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSearch } from '../contexts/SearchContext';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import { searchProducts } from '../server.api';

const SearchResults = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery, filteredResults, setFilteredResults } = useSearch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    let timeoutId;
    
    const performSearch = async () => {
      if (searchQuery.trim()) {
        setLoading(true);
        try {
          const response = await searchProducts(searchQuery);
          setFilteredResults(response.data);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setFilteredResults([]);
      }
    };

    // Debounce search to avoid too many API calls
    timeoutId = setTimeout(performSearch, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery, setFilteredResults]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Paper
            component="form"
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              mr: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <SearchIcon sx={{ p: '10px' }} />
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </Paper>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredResults.length > 0 ? (
          <Grid container spacing={3} sx={{ pt: 2 }}>
            {filteredResults.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image?.url || '/images/no-image.jpg'}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product?.description}
                </Typography>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  ₹{product?.price}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  {product?.duration?.from} - {product?.duration?.to} Days
                </Typography>
              </CardContent>
              </CardContent>
            </Card>
          </Grid>
            ))}
          </Grid>
        ) : searchQuery ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            <Typography>{t('noResults')}</Typography>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default SearchResults;