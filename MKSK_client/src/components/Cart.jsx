import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { createPurchase } from '../server.api';
import { useAPI } from '../hooks/useAPI';
import { useSelector } from 'react-redux';

const Cart = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const { callAPI } = useAPI();
  const { user } = useSelector((state) => state.auth);
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [village, setVillage] = useState(user?.village || '');

  const handleCheckout = async () => {
    try {
      const purchaseData = {
        products: items.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        depositAmount: Number(depositAmount) || 0,
        village: village,
        phoneNumber: user.phoneNumber,
        name: user.name
      };

      await callAPI(
        () => createPurchase(purchaseData),
        {
          successMessage: t('checkoutSuccess'),
          errorMessage: t('checkoutError'),
          loadingMessage: t('processingOrder'),
        }
      );
      clearCart();
      setCheckoutDialog(false);
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('cart')}</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {items.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
              {t('cartEmpty')}
            </Typography>
          ) : (
            <>
              <List>
                {items.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem>
                      <Box sx={{ width: '100%' }}>
                        <ListItemText
                          primary={item.name}
                          secondary={`₹${item.price}`}
                        />
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 1
                        }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <TextField
                              size="small"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                updateQuantity(item._id, value);
                              }}
                              inputProps={{
                                min: 1,
                                style: { textAlign: 'center', width: '40px' },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                          <IconButton
                            color="error"
                            onClick={() => removeItem(item)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              <Box sx={{ mt: 2, mb: 4 }}>
                <Typography variant="h6" align="right" gutterBottom>
                  {t('total')}: ₹{total}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setCheckoutDialog(true)}
                  sx={{ mt: 2 }}
                >
                  {t('checkout')}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      <Dialog open={checkoutDialog} onClose={() => setCheckoutDialog(false)}>
        <DialogTitle>{t('checkout')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('total')}: ₹{total}
            </Typography>
            <TextField
              fullWidth
              label={t('village')}
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('depositAmount')}
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              margin="normal"
              helperText={t('depositHelperText')}
              inputProps={{
                min: 0,
                max: total
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('remainingAmount')}: ₹{total - (Number(depositAmount) || 0)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialog(false)}>{t('cancel')}</Button>
          <Button onClick={handleCheckout} variant="contained">{t('confirmPurchase')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Cart;