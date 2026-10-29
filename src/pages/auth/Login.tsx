import {
  Box, Button, TextField, Typography, IconButton,
  InputAdornment, Alert, Link, Paper
} from '@mui/material';
import React from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLogin } from '@/hooks/useLogin.hooks';
import useStyles from '@/styles/auth/LoginPage.styles';

export default function LoginPage() {
  const { formik, showPassword, setShowPassword, message } = useLogin();
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h5" className={classes.title} gutterBottom>
          Login
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(prev => !prev)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            required
          />

          {message.text && (
            <Alert severity={message.type as 'error'} className={classes.alert}>
              {message.text}
            </Alert>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            className={classes.submitButton}
            disabled={formik.isSubmitting}
          >
            Login
          </Button>

          <Typography variant="body2" className={classes.link}>
            Don’t have an account? <Link href="/auth/Signup">Sign Up</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}

