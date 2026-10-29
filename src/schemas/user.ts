import * as Yup from 'yup';
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const addressSchema = Yup.object({
  label: Yup.string().required("Label is required"),
  address: Yup.string().required("Address is required"),
  pincode: Yup.string()
    .matches(/^\d{5,6}$/, "Pincode must be 5 or 6 digits")
    .required("Pincode is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string()
    .test(
      "is-valid-state",
      "Please select a valid Indian state",
      value => !!value && INDIAN_STATES.map(s => s.toLowerCase()).includes(value.toLowerCase())
    )
    .required("State is required"),
  country: Yup.string().required("Country is required"),
});


export const ReviewSchema = Yup.object({
    rating: Yup.number().min(1, "Please provide a rating").required("Required"),
    review: Yup.string().min(5, "Too short!").required("Required"),
});