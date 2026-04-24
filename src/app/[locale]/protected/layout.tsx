"use client";

import { styled, Container, Box } from "@mui/material";
import React, { useState } from "react";
import Header from "@/components/layout/header/Header";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import CustomNotifications from "@/components/shared/CustomNotifications";
import LoadingBackdrop from "@/components/shared/BackdropLoading";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SessionProvider } from "next-auth/react";
import EmailVerificationGuard from "@/components/forms/auth/EmailVerificationGuard";
import StoreSetupGuard from "@/components/forms/auth/StoreSetupGuard";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <EmailVerificationGuard>
      <StoreSetupGuard>
        <MainWrapper className="mainwrapper">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            isMobileSidebarOpen={isMobileSidebarOpen}
            onSidebarClose={() => setMobileSidebarOpen(false)}
          />
          <PageWrapper
            className="page-wrapper"
            sx={
              {
                // background: "linear-gradient(90deg, rgba(42, 72, 160, 1) 0%, rgba(69, 189, 187, 1) 100%)"
              }
            }
          >
            <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
            <Container
              sx={{
                paddingTop: "20px",
                maxWidth: "1200px",
              }}
            >
              <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
              {/* <Footer /> */}
            </Container>
          </PageWrapper>
        </MainWrapper>
      </StoreSetupGuard>
    </EmailVerificationGuard>
  );
}
