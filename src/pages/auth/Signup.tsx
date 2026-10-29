import React from 'react';
import {
  Box, Button, TextField, Typography, IconButton,
  InputAdornment, Alert, Link, Paper
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSignup } from '@/hooks/useSignup.hooks';
import useStyles from '@/styles/auth/Signup.styles';

export default function SignupPage() {
  const { formik, showPassword, setShowPassword, message } = useSignup();
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h5" className={classes.title} gutterBottom>
          Sign Up
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            name="name"
            label="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            required
          />

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

          <TextField
            fullWidth
            margin="normal"
            name="confirmPassword"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            required
          />

          {message.text && message.type && (
            <Alert severity={message.type} className={classes.alert}>
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
            Sign Up
          </Button>

          <Typography variant="body2" className={classes.link}>
            Already have an account? <Link href="/auth/Login">Login</Link>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
}

