import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getUserProfile, updateUserProfile, getUserPurchases } from '../server.api';
import { updateProfile } from '../store/slices/authSlice';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    village: user?.village || '',
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserPurchases();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      setFormData({
        name: response.data.name,
        phoneNumber: response.data.phoneNumber,
        village: response.data.village,
      });
      console.log('User profile fetched:', response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const response = await getUserPurchases();
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUserProfile(formData);
      dispatch(updateProfile(response.data));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={user?.avatar}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {user?.name}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {user?.village}
              </Typography>
              <Typography color="text.secondary">
                {user?.phoneNumber}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details and Purchases */}
        <Grid item xs={12} md={8}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label={t('profile')} />
              <Tab label={t('myPurchases')} />
            </Tabs>
          </Box>

          {/* Profile Settings */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleUpdateProfile}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('name')}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('phone')}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('village')}
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" fullWidth>
                    {t('updateProfile')}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </TabPanel>

          {/* Purchase History */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('date')}</TableCell>
                    <TableCell>{t('products')}</TableCell>
                    <TableCell align="right">{t('total')}</TableCell>
                    <TableCell align="right">{t('deposit')}</TableCell>
                    <TableCell align="right">{t('remaining')}</TableCell>
                    <TableCell>{t('status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase._id}>
                      <TableCell>
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {purchase.products.map(p => (
                          <Box key={p.productId._id} sx={{ mb: 1 }}>
                            {p.productId.name} x {p.quantity}
                          </Box>
                        ))}
                      </TableCell>
                      <TableCell align="right">
                        ₹{purchase.totalAmount}
                      </TableCell>
                      <TableCell align="right">
                        ₹{purchase.depositAmount}
                      </TableCell>
                      <TableCell align="right">
                        ₹{purchase.remainingAmount}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={purchase.Payment_status}
                          color={getPaymentStatusColor(purchase.Payment_status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;