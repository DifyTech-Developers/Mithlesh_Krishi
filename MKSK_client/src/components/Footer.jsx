import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Instagram, WhatsApp, Phone, LocationOn, Email } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', py: 6, mt: 'auto' }}>
      <Container>
        <Grid container spacing={4}>
          {/* Contact Details */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('contact')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Link href="tel:+919876543210" color="inherit" underline="hover">
                  +91 9713693909
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Link href="mailto:contact@mksk.com" color="inherit" underline="hover">
                 ankushgupta997769@gmail.com
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Location */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('location')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <LocationOn />
              <Typography>
               Near HDFC Bank,
                <br />
               Nawanagr ,Darima,
                <br />
                Surguja, Chhattisgarh - 497001
              </Typography>
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('followUs')}
            </Typography>
            <Box>
              <IconButton 
                color="inherit" 
                component="a" 
                href="https://facebook.com" 
                target="_blank"
                aria-label="Facebook"
              >
                <Facebook />
              </IconButton>
              <IconButton 
                color="inherit" 
                component="a" 
                href="https://instagram.com" 
                target="_blank"
                aria-label="Instagram"
              >
                <Instagram />
              </IconButton>
              <IconButton 
                color="inherit" 
                component="a" 
                href="https://wa.me/919876543210" 
                target="_blank"
                aria-label="WhatsApp"
              >
                <WhatsApp />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            mt: 4, 
            pt: 2, 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
          }}
        >
          {t('copyright')}
          <p >Website designed & developed by <a href="https://difytek.com" target="_blank">DifyTek</a></p>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;