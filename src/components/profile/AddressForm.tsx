import React from "react";
import { useFormik } from "formik";
import { Button, Stack, TextField } from "@mui/material";
import { AddressFormProps } from "@/types";
import { addressSchema } from "@/schemas/user";

const AddressForm: React.FC<AddressFormProps> = ({ onSubmit, onCancel }) => {
  const formik = useFormik({
    initialValues: {
      label: "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      country: "",
    },
    validationSchema: addressSchema,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      onSubmit(values);
      setSubmitting(false);
      resetForm();
    },
  });

  const addressFields: Array<keyof typeof formik.values> = [
    "label",
    "address",
    "pincode",
    "city",
    "state",
    "country",
  ];

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={2} sx={{ mt: 1 }}>
        {addressFields.map((field) => (
          <TextField
            key={field}
            name={field}
            label={field[0].toUpperCase() + field.slice(1)}
            fullWidth
            value={formik.values[field]}
            onChange={formik.handleChange}
            error={formik.touched[field] && Boolean(formik.errors[field])}
            helperText={formik.touched[field] && formik.errors[field]}
          />
        ))}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            Add Address
          </Button>
          <Button type="button" variant="outlined" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default AddressForm;
