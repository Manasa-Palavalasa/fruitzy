import { Typography, Divider, Card, CardContent, Rating, Box, Pagination } from "@mui/material";
import { productRatingType, ReviewsProps } from "@/types";
import { useGetReviews } from "@/hooks/useReviewQueries.hooks";
import React from "react";

export default function Reviews({ productId, page, setPage }: ReviewsProps) {
    const { data, isLoading } = useGetReviews(productId, page);

    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ ml: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>Customer Reviews</Typography>
            <Divider />
            {!data || data.reviews.length === 0 ? (
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Be the first to give a rating!
                </Typography>
            ) : (
                <>
                    {data.reviews.map((r: productRatingType, i: number) => (
                        <Card key={i} sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                    {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(r.createdAt))}
                                </Typography>
                                <Rating value={r.rating} readOnly />
                                <Typography
                                    variant="body2"
                                    mt={1}
                                    sx={{
                                        wordBreak: "break-word",
                                        whiteSpace: "pre-line",
                                        overflowWrap: "break-word",
                                    }}
                                >
                                    {r.review}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                        <Pagination
                            count={data.totalPages}
                            page={page}
                            onChange={(_, value) => setPage(value)}
                            color="primary"
                        />
                    </Box>
                </>
            )}
        </Box>
    );
}
