import React from "react"
import { LayoutProps } from "@/types"
import { Box, Container } from "@mui/system"
import Header from "./Header"
import Footer from "./Footer"

const Layout = ({children}:LayoutProps)=>{
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Header />
            <Container sx={{ flex: 1, mt: 4, mb: 4 }}>
                {children}
            </Container>
            <Footer />
        </Box>
    )
}

export default Layout;