import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  AddShoppingCart,
  RemoveShoppingCart,
  WhatsApp,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, addItem, removeItem } = useCart();
  
  const isInCart = items.some(item => item._id === product._id);

  const handleCartAction = () => {
    if (isInCart) {
      removeItem(product);
    } else {
      addItem(product);
    }
  };

  const handleWhatsAppInquiry = () => {
    const message = `Hi, I'm interested in ${product.name}. Please provide more information.`;
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            paddingTop: '60%',
            overflow: 'hidden',
            borderTopLeftRadius: 1,
            borderTopRightRadius: 1,
          }}
        >
          <CardMedia
            component="img"
            image={product.image?.url || '/images/no-image.jpg'}
            alt={product.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {product.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" color="primary">
              ₹{product.price}
            </Typography>
            <Chip
              label={product.inStock ? t('inStock') : t('outOfStock')}
              color={product.inStock ? 'success' : 'error'}
              size="small"
              sx={{
                '& .MuiChip-label': {
                  fontWeight: 500,
                },
              }}
            />
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box>
            {isAuthenticated && product.inStock && (
              <Zoom in={true}>
                <Tooltip title={isInCart ? t('removeFromCart') : t('addToCart')}>
                  <IconButton
                    color={isInCart ? 'secondary' : 'primary'}
                    onClick={handleCartAction}
                    sx={{
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {isInCart ? <RemoveShoppingCart /> : <AddShoppingCart />}
                  </IconButton>
                </Tooltip>
              </Zoom>
            )}
          </Box>
          <Tooltip title={t('inquireWhatsApp')}>
            <IconButton
              color="success"
              onClick={handleWhatsAppInquiry}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <WhatsApp />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default ProductCard;