import { ThemeContextProvider } from "@/contexts/ThemeContext";
import type { AppProps } from "next/app";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModalProvider } from "@/contexts/ModalProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from "react";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <AuthProvider>
          <ModalProvider>
            <Layout>
              <Component {...pageProps} />
              <ToastContainer position="bottom-right" autoClose={3000} />
            </Layout>
          </ModalProvider>
        </AuthProvider>
      </ThemeContextProvider>
    </QueryClientProvider>
  );
}
