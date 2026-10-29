import { Grid } from "@mui/material";
import { useState } from "react";
import React from "react";
import Reviews from "./Reviews";
import AddReview from "./AddReview";
import { useAddReviewMutation } from "@/hooks/useReviewMutations.hooks";

export default function ReviewSection({ productId }: { productId: string }) {
    const [page, setPage] = useState(1);

    const mutation = useAddReviewMutation(productId, setPage);

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
                <Reviews productId={productId} page={page} setPage={setPage} />
            </Grid>
            <Grid item xs={12} md={5}>
                <AddReview mutation={mutation} setPage={setPage} />
            </Grid>
        </Grid>
    );
}
