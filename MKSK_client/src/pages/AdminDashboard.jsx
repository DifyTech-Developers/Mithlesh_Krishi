import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Box, Typography, TextField, Button, Tab, Tabs, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Alert, useTheme, Chip, CircularProgress, Grid, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import * as XLSX from 'xlsx';
import {
  getUserProfile, getAllUsers, deleteUser, deleteAnnouncement,
  getPurchases, updatePurchaseStatus, broadcastAnnouncement, sendPaymentReminders, updateUserRole, createPurchase, getAllProducts, createProduct
} from '../server.api';
import { useLoading } from '../hooks/useLoading';
import { useFeedback } from '../components/Feedback';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [purchaseSearchQuery, setPurchaseSearchQuery] = useState('');
  const [tab, setTab] = useState(3);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    message: '',
    messageHindi: '',
    targetRole: ''
  });
  const [profile, setProfile] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [depositDialog, setDepositDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleDialog, setRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { showFeedback } = useFeedback();
  const theme = useTheme();
  const navigate = useNavigate();
  const [purchaseFilters, setPurchaseFilters] = useState({
    date: '',
    customer: '',
    village: '',
    status: '',
    amountRange: ''
  });
  const [userPurchaseDialog, setUserPurchaseDialog] = useState(false);
  const [selectedUserPurchases, setSelectedUserPurchases] = useState([]);
  const [paymentReminderDialog, setPaymentReminderDialog] = useState(false);
  const [reminderStats, setReminderStats] = useState(null);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [createPurchaseDialog, setCreatePurchaseDialog] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [newPurchase, setNewPurchase] = useState({
    phoneNumber: '',
    name: '',
    village: '',
    depositAmount: '',
    manualTotalAmount: '',
    products: [],
    SN: ''
  });
  const [uniqueVillages, setUniqueVillages] = useState([]);
  const [totalProductAmount, setTotalProductAmount] = useState(0);
  const [productDetailsDialog, setProductDetailsDialog] = useState(false);
  const [selectedPurchaseProducts, setSelectedPurchaseProducts] = useState(null);
  const [bulkUploadDialog, setBulkUploadDialog] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({ success: 0, failed: 0 });
  const [productDialog, setProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    duration: { from: '', to: '' },
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState('');
  const [categories] = useState(['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Others']);

  const primaryColor = theme.palette.admin.main;
  const secondaryColor = theme.palette.background.default;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, usersRes, purchasesRes, productsRes] = await Promise.all([
        getUserProfile(),
        getAllUsers(),
        getPurchases(),
        getAllProducts()
      ]);

      if (profileRes?.data?.role !== 'admin') {
        showFeedback('Access denied. Admin privileges required.', 'error');
        navigate('/');
        return;
      }

      setProfile(profileRes?.data || null);
      setUsers(usersRes?.data || []);
      setPurchases(purchasesRes?.data || []);
      setProducts(productsRes?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showFeedback(error.message || 'Error fetching data', 'error');
      if (error.message.includes('Authentication')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [showFeedback, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const villages = [...new Set(purchases.map(p => p.village).filter(Boolean))];
    setUniqueVillages(villages);
  }, [purchases]);

  useEffect(() => {
    // Calculate total amount whenever selected products change
    const total = selectedProducts.reduce((sum, product) => {
      const productDetails = products.find(p => p._id === product.productId);
      return sum + (productDetails?.price || 0) * product.quantity;
    }, 0);
    setTotalProductAmount(total);
  }, [selectedProducts, products]);

  const handleCreateAnnouncement = async () => {
    try {
      setLoading(true);
      if (!newAnnouncement.message.trim()) {
        showFeedback('Please enter an announcement message', 'error');
        return;
      }
      await broadcastAnnouncement(newAnnouncement);
      setNewAnnouncement({
        message: '',
        messageHindi: '',
        targetRole: ''
      });
      await fetchData();
      showFeedback('Announcement created successfully', 'success');
    } catch (error) {
      console.error('Error creating announcement:', error);
      showFeedback(error.message || 'Error creating announcement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await deleteUser(userId);
      await fetchData();
      setDeleteConfirmDialog(false);
      showFeedback('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showFeedback(error.message || 'Error deleting user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPaymentReminders = async () => {
    try {
      setSendingReminders(true);
      const response = await sendPaymentReminders();
      setReminderStats(response.data);
      setPaymentReminderDialog(true);
      showFeedback('Payment reminders sent successfully', 'success');
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      showFeedback(error.message || 'Error sending payment reminders', 'error');
    } finally {
      setSendingReminders(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      setLoading(true);
      await deleteAnnouncement(id);
      await fetchData();
      showFeedback('Announcement deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showFeedback(error.message || 'Error deleting announcement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePurchase = async () => {
    try {
      if (!depositAmount || isNaN(Number(depositAmount))) {
        showFeedback('Please enter a valid deposit amount', 'error');
        return;
      }

      if (Number(depositAmount) <= 0) {
        showFeedback('Deposit amount must be greater than 0', 'error');
        return;
      }

      if (Number(depositAmount) > (selectedPurchase.totalAmount - selectedPurchase.depositAmount)) {
        showFeedback('Deposit amount cannot exceed remaining amount', 'error');
        return;
      }

      setLoading(true);
      await updatePurchaseStatus(selectedPurchase._id, {
        depositAmount: Number(depositAmount)
        // Remove manual status update as it's now handled automatically
      });
      setDepositDialog(false);
      await fetchData();
      showFeedback('Payment updated successfully', 'success');
    } catch (error) {
      console.error('Error updating purchase:', error);
      showFeedback(error.message || 'Error updating purchase', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async () => {
    try {
      if (!selectedRole) {
        showFeedback('Please select a role', 'error');
        return;
      }

      setLoading(true);
      await updateUserRole(selectedUser._id, selectedRole);
      setRoleDialog(false);
      await fetchData();
      showFeedback('User role updated successfully', 'success');
    } catch (error) {
      console.error('Error updating user role:', error);
      showFeedback(error.message || 'Error updating user role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserPurchases = (user) => {
    const userPurchases = purchases.filter(purchase => purchase.userId?._id === user._id);
    setSelectedUserPurchases(userPurchases);
    setUserPurchaseDialog(true);
  };

  const handleCreatePurchase = async () => {
    try {
      if (!newPurchase.phoneNumber || !newPurchase.name || !newPurchase.village || !newPurchase.SN) {
        showFeedback('Please fill in all required fields (Phone, Name, Village, and SN)', 'error');
        return;
      }

      if (!newPurchase.manualTotalAmount && selectedProducts.length === 0) {
        showFeedback('Please either select products or enter a manual total amount', 'error');
        return;
      }

      const purchaseData = {
        phoneNumber: newPurchase.phoneNumber,
        name: newPurchase.name,
        village: newPurchase.village,
        depositAmount: Number(newPurchase.depositAmount) || 0,
        SN: newPurchase.SN,
        ...(newPurchase.manualTotalAmount
          ? { manualTotalAmount: Number(newPurchase.manualTotalAmount) }
          : { products: selectedProducts }
        )
      };

      await createPurchase(purchaseData);
      showFeedback('Purchase created successfully', 'success');
      setCreatePurchaseDialog(false);
      setNewPurchase({
        phoneNumber: '',
        name: '',
        village: '',
        depositAmount: '',
        manualTotalAmount: '',
        products: [],
        SN: ''
      });
      setSelectedProducts([]);
      await fetchData();
    } catch (error) {
      console.error('Error creating purchase:', error);
      showFeedback(error.message || 'Error creating purchase', 'error');
    }
  };

  const handleShowProductDetails = (purchase) => {
    setSelectedPurchaseProducts(purchase);
    setProductDetailsDialog(true);
  };

  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Validate required fields
        const validData = data.filter(row => {
          const hasRequiredFields = row.PhoneNumber && row.CustomerName && row.Village && row.SN;
          const hasAmount = row.TotalAmount || row.DepositAmount;
          return hasRequiredFields && hasAmount;
        });

        if (validData.length === 0) {
          showFeedback('No valid data found in Excel file. Required fields: PhoneNumber, CustomerName, Village, SN, and either TotalAmount or DepositAmount', 'error');
          return;
        }

        setExcelData(validData);
        setBulkUploadDialog(true);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        showFeedback('Error reading Excel file. Please check the format.', 'error');
      }
    };

    reader.readAsBinaryString(file);
  };

  const processBulkUpload = async () => {
    try {
      setLoading(true);
      let success = 0;
      let failed = 0;

      for (const row of excelData) {
        try {
          const purchaseData = {
            phoneNumber: row.PhoneNumber?.toString(),
            name: row.CustomerName,
            village: row.Village,
            SN: row.SN?.toString(),
            manualTotalAmount: Number(row.TotalAmount) || 0,
            depositAmount: Number(row.DepositAmount) || 0
          };

          await createPurchase(purchaseData);
          success++;
        } catch (error) {
          console.error('Error processing row:', error, row);
          failed++;
        }
      }

      setUploadStatus({ success, failed });
      await fetchData();
      showFeedback(`Processed ${success} purchases successfully. ${failed} failed.`, failed > 0 ? 'warning' : 'success');
      setBulkUploadDialog(false);
      setExcelData([]);
    } catch (error) {
      console.error('Error processing bulk upload:', error);
      showFeedback(error.message || 'Error processing bulk upload', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.price || !newProduct.category) {
        showFeedback('Please fill in all required fields', 'error');
        return;
      }

      setLoading(true);
      await createProduct(newProduct);
      setProductDialog(false);
      setNewProduct({
        name: '',
        duration: { from: '', to: '' },
        description: '',
        price: '',
        category: '',
        stock: '',
        image: '',
        isActive: true
      });
      setImagePreview('');
      await fetchData();
      showFeedback('Product created successfully', 'success');
    } catch (error) {
      showFeedback(error.message || 'Error creating product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase().trim();
    const searchTerms = searchLower.split(' ').filter(term => term.length > 0);

    return searchTerms.some(term =>
      (user.name?.toLowerCase().includes(term)) ||
      (user.phoneNumber?.toLowerCase().includes(term)) ||
      (user.village?.toLowerCase().includes(term)) ||
      (user.role?.toLowerCase().includes(term))
    );
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'farmer':
        return 'success';
      default:
        return 'default';
    }
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

  const filteredPurchases = purchases.filter(purchase => {
    // First apply search query filter
    const searchLower = purchaseSearchQuery.toLowerCase().trim();
    const searchTerms = searchLower.split(' ').filter(term => term.length > 0);

    const matchesSearch = !purchaseSearchQuery || searchTerms.some(term =>
      (purchase.userId?.name?.toLowerCase().includes(term)) ||
      (purchase.village?.toLowerCase().includes(term)) ||
      (purchase.Payment_status?.toLowerCase().includes(term)) ||
      (purchase.products?.some(p => p.productId?.name?.toLowerCase().includes(term)))
    );

    // Then apply other filters
    const matchesDate = !purchaseFilters.date ||
      new Date(purchase.purchaseDate).toLocaleDateString() === purchaseFilters.date;

    const matchesCustomer = !purchaseFilters.customer ||
      purchase.userId?.name?.toLowerCase().includes(purchaseFilters.customer.toLowerCase());

    const matchesVillage = !purchaseFilters.village ||
      purchase.village?.toLowerCase().includes(purchaseFilters.village.toLowerCase());

    const matchesStatus = !purchaseFilters.status ||
      purchase.Payment_status === purchaseFilters.status;

    const matchesAmount = !purchaseFilters.amountRange ||
      (purchaseFilters.amountRange === 'low' && purchase.totalAmount < 1000) ||
      (purchaseFilters.amountRange === 'medium' && purchase.totalAmount >= 1000 && purchase.totalAmount < 5000) ||
      (purchaseFilters.amountRange === 'high' && purchase.totalAmount >= 5000);

    return matchesSearch && matchesDate && matchesCustomer && matchesVillage && matchesStatus && matchesAmount;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, backgroundColor: secondaryColor }}>          <Box sx={{ display: 'flex', width: '100%', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              color: primaryColor,
              '&.Mui-selected': {
                color: primaryColor,
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: primaryColor
            }
          }}
        >
          <Tab label="Profile" value={0} sx={{ display: { xs: 'none', sm: 'flex' } }} />
          <Tab label="Announcements" value={1} sx={{ display: { xs: 'none', sm: 'flex' } }} />
          <Tab label="Users" value={2} sx={{ display: { xs: 'none', sm: 'flex' } }} />
          <Tab label="Purchases" value={3} />
          <Tab label="Products" value={4} sx={{ display: { xs: 'none', sm: 'flex' } }} />
        </Tabs>
      </Box>

        {/* Profile Section */}
        {tab === 0 && profile && (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="h5" sx={{ color: primaryColor, mb: 2, fontWeight: 600 }}>Admin Profile</Typography>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography><strong>Name:</strong> {profile.name}</Typography>
              <Typography><strong>Phone Number:</strong> {profile.phoneNumber}</Typography>
              <Typography><strong>Role:</strong> {profile.role}</Typography>
              <Typography><strong>Village:</strong> {profile.village}</Typography>
            </Paper>
          </Box>
        )}

        {/* Announcements Section */}
        {tab === 1 && (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="h5" sx={{ color: primaryColor, mb: 2, fontWeight: 600 }}>Announcements</Typography>

            {/* Create New Announcement */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Create New Announcement</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Message (English)"
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Message (Hindi)"
                value={newAnnouncement.messageHindi}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, messageHindi: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Target Role</InputLabel>
                <Select
                  value={newAnnouncement.targetRole}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetRole: e.target.value })}
                  label="Target Role"
                >
                  <MenuItem value="">All Users</MenuItem>
                  <MenuItem value="farmer">Farmers Only</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleCreateAnnouncement}
                disabled={loading}
                sx={{ backgroundColor: primaryColor }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Announcement'}
              </Button>
            </Paper>

            {/* Existing Announcements */}
            <Typography variant="h6" sx={{ mb: 2 }}>Existing Announcements</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : announcements?.length > 0 ? (
              announcements.map((announcement) => (
                <Paper key={announcement._id} elevation={2} sx={{ p: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">
                      {announcement.createdBy?.name || 'Admin'} - {new Date(announcement.createdAt).toLocaleDateString()}
                    </Typography>
                    <IconButton
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                      disabled={loading}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {announcement.message}
                  </Typography>
                  {announcement.messageHindi && (
                    <Typography variant="body1" color="text.secondary">
                      {announcement.messageHindi}
                    </Typography>
                  )}
                  {announcement.targetRole && (
                    <Chip
                      label={`Target: ${announcement.targetRole}`}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              ))
            ) : (
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No announcements found</Typography>
              </Paper>
            )}
          </Box>
        )}        {/* Users Section */}
        {tab === 2 && (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="h5" sx={{ color: primaryColor, mb: 2, fontWeight: 600 }}>Users</Typography>

            {/* Search Bar */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search users by name, phone number, village, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: primaryColor,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: primaryColor,
                    },
                  },
                }}
              />
              {searchQuery && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} matching your search
                </Typography>
              )}
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Phone Number</TableCell>
                      <TableCell>Village</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">No users found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.phoneNumber}</TableCell>
                          <TableCell>{user.village}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              color={getRoleColor(user.role)}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleViewUserPurchases(user)}
                              sx={{ color: primaryColor }}
                              title="View Purchases"
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedRole(user.role);
                                setRoleDialog(true);
                              }}
                              sx={{ color: primaryColor }}
                              title="Change Role"
                            >
                              <AdminPanelSettingsIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteConfirmDialog(true);
                              }}
                              sx={{ color: theme.palette.error.main }}
                              title="Delete User"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {/* Purchases Section */}
        {tab === 3 && (
          <Box>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              mb: 3
            }}>
              <Typography variant="h5" sx={{ color: primaryColor, fontWeight: 600, mb: { xs: 2, sm: 0 } }}>Purchases</Typography>

              {/* Action Buttons - Hidden on Mobile */}
              <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  id="bulk-upload-input"
                  onChange={handleBulkUpload}
                />
                <label htmlFor="bulk-upload-input">
                  <Button
                    component="span"
                    variant="contained"
                    sx={{ mr: 2, backgroundColor: theme.palette.info.main }}
                  >
                    Bulk Upload
                  </Button>
                </label>
                <Button
                  variant="contained"
                  onClick={() => setCreatePurchaseDialog(true)}
                  sx={{ mr: 2, backgroundColor: theme.palette.success.main }}
                >
                  Create Purchase
                </Button>
                <Button
                  variant="contained"
                  startIcon={<NotificationsActiveIcon />}
                  onClick={handleSendPaymentReminders}
                  disabled={sendingReminders}
                  sx={{
                    backgroundColor: theme.palette.warning.main,
                    '&:hover': {
                      backgroundColor: theme.palette.warning.dark,
                    },
                  }}
                >
                  {sendingReminders ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Sending Reminders...
                    </>
                  ) : (
                    'Send Payment Reminders'
                  )}
                </Button>
              </Box>
            </Box>

            {/* Enhanced Search Bar */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              {/* Filters first */}


              {/* Search bar after filters */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Search Purchases</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by customer name, village, or SN..."
                  value={purchaseSearchQuery}
                  onChange={(e) => setPurchaseSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: primaryColor,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: primaryColor,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>

            {/* Mobile-friendly purchase list */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              {/* Mobile Payment Status Filter */}
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    value={purchaseFilters.status}
                    onChange={(e) => setPurchaseFilters({ ...purchaseFilters, status: e.target.value })}
                    label="Payment Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : filteredPurchases.length === 0 ? (
                <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No purchases found</Typography>
                </Paper>
              ) : (
                filteredPurchases.map((purchase) => (
                  <Paper
                    key={purchase._id}
                    elevation={3}
                    sx={{
                      p: 2.5,
                      mb: 2.5,
                      borderRadius: 3,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* SN and Status Section */}
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      backgroundColor: theme.palette.background.default,
                      borderRadius: 2,
                      p: 1.5,
                    }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: primaryColor,
                        }}
                      >
                        SN: {purchase.SN || 'N/A'}
                      </Typography>
                      <Chip
                        label={purchase.Payment_status}
                        color={getPaymentStatusColor(purchase.Payment_status)}
                        sx={{
                          fontWeight: 500,
                          borderRadius: '8px',
                          '& .MuiChip-label': {
                            px: 2
                          }
                        }}
                      />
                    </Box>

                    {/* Customer Info Section */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 600,
                        color: primaryColor,
                        mb: 0.5
                      }}>
                        {purchase.userId?.name || 'Unknown Customer'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        🏠 {purchase.village || 'N/A'}
                      </Typography>
                    </Box>

                    {/* Payment Details Section */}
                    <Box sx={{
                      backgroundColor: theme.palette.background.default,
                      borderRadius: 2,
                      p: 1.5,
                      mb: 2
                    }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Total Amount
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            ₹{purchase.totalAmount}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Deposit
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            ₹{purchase.depositAmount}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Date Section */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 2
                      }}
                    >
                      📅 {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </Typography>

                    {/* Action Buttons */}
                    <Box sx={{
                      display: 'flex',
                      gap: 1.5,
                      mt: 1
                    }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setSelectedPurchase(purchase);
                          setDepositDialog(true);
                        }}
                        sx={{
                          py: 1.5,
                          backgroundColor: primaryColor,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          },
                          borderRadius: 2,
                          boxShadow: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Update Payment
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleShowProductDetails(purchase)}
                        sx={{
                          py: 1.5,
                          borderColor: primaryColor,
                          color: primaryColor,
                          '&:hover': {
                            borderColor: theme.palette.primary.dark,
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          },
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>

            {/* Desktop table view */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>SN</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Village</TableCell>
                        <TableCell>Total Amount</TableCell>
                        <TableCell>Deposit</TableCell>
                        <TableCell>Remaining</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                            <CircularProgress size={24} />
                          </TableCell>
                        </TableRow>
                      ) : filteredPurchases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                            <Typography color="text.secondary">No purchases found</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPurchases.map((purchase) => (
                          <TableRow key={purchase._id}>
                            <TableCell>{purchase.SN}</TableCell>
                            <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                            <TableCell>{purchase.name}</TableCell>
                            <TableCell>{purchase.village || 'Not specified'}</TableCell>
                            <TableCell>₹{purchase.totalAmount}</TableCell>
                            <TableCell>₹{purchase.depositAmount}</TableCell>
                            <TableCell>₹{purchase.remainingAmount}</TableCell>
                            <TableCell>
                              <Chip
                                label={purchase.Payment_status}
                                color={getPaymentStatusColor(purchase.Payment_status)}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleShowProductDetails(purchase)}
                                sx={{ color: primaryColor }}
                                title="View Product Details"
                              >
                                <InfoIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => {
                                  setSelectedPurchase(purchase);
                                  setDepositAmount(purchase.depositAmount.toString());
                                  setDepositDialog(true);
                                }}
                                sx={{ color: primaryColor }}
                              >
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Box>
        )}

        {/* Products Section */}
        {tab === 4 && (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ color: primaryColor, fontWeight: 600 }}>Products</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setProductDialog(true)}
                sx={{ backgroundColor: theme.palette.success.main }}
              >
                Add Product
              </Button>
            </Box>

            {/* Products Table */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">No products found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            {product.image?.url ? (
                              <Box
                                component="img"
                                src={product.image.url}
                                alt={product.name}
                                sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 50,
                                  height: 50,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'grey.200',
                                  borderRadius: 1
                                }}
                              >
                                <ImageIcon color="disabled" />
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Chip
                              label={product.isActive ? 'Active' : 'Inactive'}
                              color={product.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => {/* Handle edit */ }}
                              sx={{ color: primaryColor }}
                              title="Edit Product"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {/* Handle delete */ }}
                              sx={{ color: theme.palette.error.main }}
                              title="Delete Product"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      <Dialog
        open={depositDialog}
        onClose={() => setDepositDialog(false)}
        PaperProps={{
          elevation: 2
        }}
      >
        <DialogTitle>Update Payment Details</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" paragraph>
              Current Deposit: ₹{selectedPurchase?.depositAmount || 0}
            </Typography>
            <Typography variant="body2" paragraph>
              Remaining Amount: ₹{selectedPurchase?.remainingAmount || 0}
            </Typography>
            <TextField
              fullWidth
              label="New Deposit Amount"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{
                min: 0,
                max: selectedPurchase?.remainingAmount || 0
              }}
              helperText={`Amount will be added to existing deposit of ₹${selectedPurchase?.depositAmount || 0}`}
            />
            <Typography variant="body2" color="primary">
              Total After This Deposit: ₹{(selectedPurchase?.depositAmount || 0) + Number(depositAmount || 0)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdatePurchase}
            variant="contained"
            sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: theme.palette.admin.dark } }}
          >
            Update Payment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={roleDialog}
        onClose={() => setRoleDialog(false)}
        PaperProps={{
          elevation: 2
        }}
      >
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography paragraph>
              Change role for user "{selectedUser?.name}"
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <MenuItem value="farmer">Farmer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateUserRole}
            variant="contained"
            sx={{ bgcolor: primaryColor, '&:hover': { bgcolor: theme.palette.admin.dark } }}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
        PaperProps={{
          elevation: 2
        }}
      >
        <DialogTitle>Confirm Delete User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography>
              Are you sure you want to delete the user "{selectedUser?.name}"? This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleDeleteUser(selectedUser?._id)}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Purchase Details Dialog */}
      <Dialog
        open={userPurchaseDialog}
        onClose={() => setUserPurchaseDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Purchase History
          {selectedUserPurchases[0]?.name && (
            <Typography variant="subtitle1" color="text.secondary">
              for {selectedUserPurchases[0].name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SN</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Deposit</TableCell>
                  <TableCell>Remaining</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedUserPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No purchases found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedUserPurchases.map((purchase) => (
                    <TableRow key={purchase._id}>
                      <TableCell>{purchase.SN}</TableCell>
                      <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {purchase.products?.map((product, index) => (
                          <Box key={index} sx={{ mb: index !== purchase.products.length - 1 ? 1 : 0 }}>
                            {product.productId?.name} (×{product.quantity})
                          </Box>
                        ))}
                      </TableCell>
                      <TableCell>₹{purchase.totalAmount}</TableCell>
                      <TableCell>₹{purchase.depositAmount}</TableCell>
                      <TableCell>₹{purchase.remainingAmount}</TableCell>
                      <TableCell>
                        <Chip
                          label={purchase.Payment_status}
                          color={getPaymentStatusColor(purchase.Payment_status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserPurchaseDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Reminder Results Dialog */}
      <Dialog
        open={paymentReminderDialog}
        onClose={() => setPaymentReminderDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Payment Reminder Results
        </DialogTitle>
        <DialogContent>
          {reminderStats && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Reminder Statistics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {reminderStats.stats.messagesSent}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Messages Sent
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {reminderStats.stats.messagesFailed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Messages Failed
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {reminderStats.stats.messagesFailed > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Some reminders failed to send. Please check the failed numbers and try again.
                </Alert>
              )}

              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Total Users: {reminderStats.stats.totalUsers}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentReminderDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Purchase Dialog */}
      <Dialog
        open={createPurchaseDialog}
        onClose={() => setCreatePurchaseDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Purchase</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SN"
                value={newPurchase.SN}
                onChange={(e) => setNewPurchase({ ...newPurchase, SN: e.target.value })}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newPurchase.phoneNumber}
                onChange={(e) => setNewPurchase({ ...newPurchase, phoneNumber: e.target.value })}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={newPurchase.name}
                onChange={(e) => setNewPurchase({ ...newPurchase, name: e.target.value })}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Village</InputLabel>
                <Select
                  value={newPurchase.village}
                  onChange={(e) => setNewPurchase({
                    ...newPurchase,
                    village: e.target.value,
                    newVillage: e.target.value === 'OTHER' ? '' : undefined
                  })}
                  label="Village"
                >
                  {uniqueVillages.map(village => (
                    <MenuItem key={village} value={village}>{village}</MenuItem>
                  ))}
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
              {newPurchase.village === "OTHER" && (
                <TextField
                  fullWidth
                  label="Enter New Village"
                  value={newPurchase.newVillage || ""}
                  onChange={(e) => setNewPurchase({
                    ...newPurchase,
                    newVillage: e.target.value
                  })}
                  sx={{ mt: 2 }}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount"
                type="number"
                required
                value={newPurchase.manualTotalAmount}
                onChange={(e) => setNewPurchase({ ...newPurchase, manualTotalAmount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deposit Amount"
                type="number"
                value={newPurchase.depositAmount}
                onChange={(e) => setNewPurchase({ ...newPurchase, depositAmount: e.target.value })}
                inputProps={{
                  max: newPurchase.manualTotalAmount
                }}
                helperText={`Maximum deposit amount: ₹${newPurchase.manualTotalAmount}`}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePurchaseDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePurchase}
            variant="contained"
            sx={{ bgcolor: primaryColor }}
          >
            Create Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Details Dialog */}
      <Dialog
        open={productDetailsDialog}
        onClose={() => setProductDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Purchase Details</DialogTitle>
        <DialogContent>
          {selectedPurchaseProducts && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                SN: {selectedPurchaseProducts.SN}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Customer: {selectedPurchaseProducts.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Phone: {selectedPurchaseProducts.phoneNumber}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Village: {selectedPurchaseProducts.village}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Date: {new Date(selectedPurchaseProducts.purchaseDate).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Status: <Chip
                  label={selectedPurchaseProducts.Payment_status}
                  color={getPaymentStatusColor(selectedPurchaseProducts.Payment_status)}
                  size="small"
                />
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Total Amount: ₹{selectedPurchaseProducts.totalAmount}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Deposit Amount: ₹{selectedPurchaseProducts.depositAmount}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Remaining Amount: ₹{selectedPurchaseProducts.remainingAmount}
              </Typography>

              {selectedPurchaseProducts.products && selectedPurchaseProducts.products.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Products
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedPurchaseProducts.products.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>{product.productId?.name || 'Unknown Product'}</TableCell>
                            <TableCell align="right">{product.quantity}</TableCell>
                            <TableCell align="right">₹{product.priceAtPurchase}</TableCell>
                            <TableCell align="right">₹{product.quantity * product.priceAtPurchase}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog
        open={bulkUploadDialog}
        onClose={() => setBulkUploadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bulk Upload Purchases</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {excelData.length > 0 ? (
              <>
                <Typography variant="body1" paragraph>
                  Found {excelData.length} purchases in the Excel file. Please review the data before uploading.
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Phone Number</TableCell>
                        <TableCell>Village</TableCell>
                        <TableCell>Total Amount</TableCell>
                        <TableCell>Deposit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {excelData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.CustomerName}</TableCell>
                          <TableCell>{row.PhoneNumber}</TableCell>
                          <TableCell>{row.Village}</TableCell>
                          <TableCell>₹{row.TotalAmount || 0}</TableCell>
                          <TableCell>₹{row.DepositAmount || 0}</TableCell>
                        </TableRow>
                      ))}
                      {excelData.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            And {excelData.length - 5} more rows...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {uploadStatus.failed > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {uploadStatus.failed} purchases failed to upload. Please check the data and try again.
                  </Alert>
                )}
                <Typography variant="body2" color="text.secondary" paragraph>
                  Excel file should have columns: CustomerName, PhoneNumber, Village, TotalAmount, DepositAmount
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary">No data found in the Excel file.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={processBulkUpload}
            variant="contained"
            disabled={excelData.length === 0}
            sx={{ bgcolor: primaryColor }}
          >
            Upload {excelData.length} Purchases
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog
        open={productDialog}
        onClose={() => setProductDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration From (days)"
                type="number"
                required
                value={newProduct.duration.from}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  duration: { ...newProduct.duration, from: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration To (days)"
                type="number"
                required
                value={newProduct.duration.to}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  duration: { ...newProduct.duration, to: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                required
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  label="Category"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newProduct.isActive}
                  onChange={(e) => setNewProduct({ ...newProduct, isActive: e.target.value })}
                  label="Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                type="file"
                id="product-image"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <label htmlFor="product-image">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<ImageIcon />}
                  fullWidth
                >
                  Upload Image
                </Button>
              </label>
              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateProduct}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: primaryColor }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;