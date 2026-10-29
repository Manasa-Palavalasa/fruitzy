import { makeStyles } from '@mui/styles';
import { alpha, Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    border: `1px solid ${alpha(theme.palette.grey[500], 0.4)}`,
    boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
    },
    width: '100%',
    transition: 'background-color 0.3s, box-shadow 0.3s',
  },
  searchIconWrapper: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
  },
}));

export default useStyles;
