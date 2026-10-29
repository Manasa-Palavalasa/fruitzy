import { useCheckout } from "@/hooks/Checkout.hooks";
import {
  Box, Paper, Typography, RadioGroup, FormControlLabel, Radio,
  FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Alert,
} from "@mui/material";
import React from "react";

const CheckoutPage = () => {
  const {addresses,isAddressesLoading,isAddressesError,selectedAddressId,setSelectedAddressId,paymentMethod,setPaymentMethod,successMessage,errorMessage,handlePlaceOrder,isPlacingOrder,router} = useCheckout();

  if (isAddressesLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!addresses || isAddressesError) {
    return <Typography textAlign="center" mt={5}>Loading Failed</Typography>;
  }

  return (
    <Box maxWidth="sm" mx="auto" mt={4}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Checkout</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>Test checkout: no payment is collected. All orders remain payment pending.</Alert>

        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <Typography variant="h6" gutterBottom>Select Address</Typography>

        {addresses.length > 0 ? (
          <RadioGroup value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
            {addresses.map((addr) => (
              <FormControlLabel
                key={addr._id}
                value={addr._id}
                control={<Radio />}
                label={
                  <>
                    <Typography variant="body1" fontWeight={600}>{addr.label}</Typography>
                    <Typography variant="body2">
                      {addr.address}, {addr.city}, {addr.state} - {addr.pincode}, {addr.country}
                    </Typography>
                  </>
                }
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        ) : (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              Need to have at least one Address
            </Alert>
            <Button variant="contained" onClick={() => router.push("/user/profile")}>
              Add Address
            </Button>
          </Box>
        )}

        <Box mt={3}>
          <FormControl fullWidth>
            <InputLabel>Select Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Select Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="cod">Cash on Delivery</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
              <MenuItem value="card">Card</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box mt={4}>
          <Button
            variant="contained"
            fullWidth
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? "Placing Order..." : "Place Order"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CheckoutPage;
