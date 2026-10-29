import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  root: {
    maxWidth: 400,
    margin: '40px auto',
  },
  paper: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
  alert: {
    marginTop: 16,
  },
  link: {
    marginTop: 16,
  },
}));

export default useStyles;
