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
import AlertDialog from "@/components/shared/AlertDialog";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "sidebarCollapsed",
})<{ sidebarCollapsed?: boolean }>(({ sidebarCollapsed = true }) => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
  marginLeft: sidebarCollapsed ? "80px" : "270px",
  transition: "margin-left 0.3s ease-in-out",
}));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      <EmailVerificationGuard>
        {/* <StoreSetupGuard> */}
        <MainWrapper className="mainwrapper">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            isMobileSidebarOpen={isMobileSidebarOpen}
            onSidebarClose={() => setMobileSidebarOpen(false)}
            onToggleSidebar={handleToggleSidebar}
          />
          <PageWrapper
            sidebarCollapsed={sidebarCollapsed}
            className="page-wrapper"
          >
            <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
            <Container
              sx={{
                paddingTop: "20px",
                maxWidth: "1200px",
                transition: "max-width 0.3s ease-in-out",
              }}
            >
              <AlertDialog />
              <Box sx={{ minHeight: "calc(100vh - 170px)", transition: "all 0.3s ease-in-out" }}>{children}</Box>
              {/* <Footer /> */}
            </Container>
          </PageWrapper>
        </MainWrapper>
        {/* </StoreSetupGuard> */}
      </EmailVerificationGuard>
    </>
  );
}
