import { Box, Typography, Divider, Rating, Button, TextField } from "@mui/material";
import { useFormik } from "formik";
import { AddReviewProps } from "@/types";
import { ReviewSchema } from "@/schemas/user";
import React from "react";

export default function AddReview({ mutation, setPage }: AddReviewProps) {
    const formik = useFormik({
        initialValues: {
            rating: 0,
            review: "",
        },
        validationSchema: ReviewSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                await mutation.mutateAsync(values);
                resetForm();
                setPage(1);
            } catch (error) {
                console.error("Failed to submit review:", error);
            }
        },
    });

    const { values, errors, touched, handleChange, handleSubmit, setFieldValue, isSubmitting, handleBlur } = formik;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", p: 4, height: "100%" }}>
            <Typography variant="h5" gutterBottom>Leave a Review</Typography>
            <Divider sx={{ mb: 2 }} />
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 500 }}>
                    <Typography>Rate this product:</Typography>
                    <Rating
                        name="rating"
                        value={values.rating}
                        onChange={(_, value) => setFieldValue("rating", value ?? 0)}
                    />
                    {errors.rating && touched.rating && (
                        <Typography color="error" variant="caption">{errors.rating}</Typography>
                    )}
                    <Typography sx={{ fontWeight: 500, mb: 1 }}>Write a review:</Typography>
                    <TextField
                        fullWidth
                        name="review"
                        label="Your review"
                        multiline
                        rows={4}
                        variant="filled"
                        value={values.review}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Share your experience..."
                        error={!!(errors.review && touched.review)}
                        helperText={touched.review && errors.review}
                        sx={{
                            backgroundColor: "#fafafa",
                            borderRadius: 2,
                            mb: 2,
                            "& .MuiFilledInput-root": {
                                borderRadius: 2,
                                fontSize: 16,
                            },
                            "& .MuiInputLabel-root": {
                                fontWeight: 500,
                            },
                        }}
                    />
                    <Button variant="contained" type="submit" sx={{ alignSelf: "flex-start" }} disabled={isSubmitting}>
                        Submit Review
                    </Button>
                </Box>
            </form>
        </Box>
    );
}
