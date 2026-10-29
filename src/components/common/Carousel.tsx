import { Box, IconButton } from '@mui/material';
import Image from 'next/image';
import React from 'react';
import { useState, useEffect } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { itemData } from '../../../static/mockData';
import useStyles from './Carousel.styles';

export default function ImageCarousel() {
  const classes = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? itemData.length - 1 : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === itemData.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <Box className={classes.carouselContainer}>
      <Box
        className={classes.slidesWrapper}
        sx={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {itemData.map((item) => (
          <Box key={item.title} className={classes.slide}>
            <Image
              src={item.img}
              alt={item.title}
              fill
              style={{ objectFit: 'cover' }}
            />
          </Box>
        ))}
      </Box>

      <IconButton
        onClick={prevSlide}
        className={classes.iconLeft}
      >
        <ArrowBackIcon />
      </IconButton>
      <IconButton
        onClick={nextSlide}
        className={classes.iconRight}
      >
        <ArrowForwardIcon />
      </IconButton>

      <Box className={classes.dotsContainer}>
        {itemData.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`${classes.dot} ${index === currentIndex ? classes.activeDot : ''}`}
          />
        ))}
      </Box>
    </Box>
  );
}
