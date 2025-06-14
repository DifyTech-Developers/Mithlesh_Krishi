import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Rating, Paper, Divider } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import { getAllProducts } from '../server.api';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import { setProducts } from '../store/slices/productsSlice';
import { useNavigate } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const heroImages = [
  '/images/HERO1.jpg',
  '/images/HERO2.jpg',
  '/images/HERO3.jpg',
];

const testimonials = [
  {
    name: 'Rajesh Kumar',
    rating: 5,
    comment: 'Best agricultural products and excellent service!',
  },
  {
    name: 'Amit Singh',
    rating: 4,
    comment: 'Great variety of seeds and fertilizers.',
  },
  // Add more testimonials
];

const Home = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.filteredItems || []);
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, announcementsRes] = await Promise.all([
          getAllProducts(),
        ]);
        dispatch(setProducts(productsRes.data));
        setAnnouncements(announcementsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const UserLoginViaLocalhost = () => {
      const user = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const parsedUser = JSON.parse(user);
      if (parsedUser && isLoggedIn) {
        dispatch(loginSuccess(parsedUser));
      }
    };
    UserLoginViaLocalhost();
  }, [dispatch]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.role === 'admin') {
      navigate('/admin')
    }
  }, [])

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ height: '60vh', width: '100%', mb: 4 }}>
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="hero-swiper"
        >
          {heroImages.map((image, index) => (
            <SwiperSlide key={index}>
              <Box
                component="img"
                src={image}
                alt={`Hero ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '60vh',
                  objectFit: 'cover',
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Announcements Section */}
      <Container sx={{ mt: 6 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          {t('announcements')}
        </Typography>
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} key={announcement._id}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    {announcement.createdBy?.name || 'Admin'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(announcement.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" paragraph>
                  {announcement.message}
                </Typography>
                {announcement.messageHindi && (
                  <Typography variant="body1" color="text.secondary">
                    {announcement.messageHindi}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Products Section */}
      <Container>
        <Typography variant="h4" sx={{ mb: 4 }}>
          {t('products')}
        </Typography>
        <Grid container spacing={3}>
          {products.map((product) => (
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
                    {product.description}
                  </Typography>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      ₹{product.price}
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
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 6, mt: 6 }}>
        <Container>
          <Typography variant="h4" sx={{ mb: 4 }}>
            {t('testimonials')}
          </Typography>
          <Grid container spacing={3}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                    <Typography variant="body1" paragraph>
                      "{testimonial.comment}"
                    </Typography>
                    <Typography variant="subtitle2" color="primary">
                      - {testimonial.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;