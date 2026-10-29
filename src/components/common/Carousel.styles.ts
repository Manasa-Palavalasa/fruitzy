import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  carouselContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  slidesWrapper: {
    display: 'flex',
    transition: 'transform 0.5s ease',
  },
  slide: {
    minWidth: '100%',
    height: '250px',
    position: 'relative',
  },
  iconLeft: {
    position: 'absolute',
    top: '50%',
    left: 10,
    transform: 'translateY(-50%)',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iconRight: {
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: 'translateY(-50%)',
    color: 'white', 
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  activeDot: {
    backgroundColor: 'white',
  },
}));

export default useStyles;
