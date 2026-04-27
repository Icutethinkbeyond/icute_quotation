"use client";

import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Container } from "@mui/material";
// import { storeService } from "@/services/ApiServices/StoreAPI";
// import StoreSetupStepper from "@/components/forms/settings/StoreSetupStepper";
import SetupWizard from "@/components/layout/SetupWizard";
// import { Store } from "@/interfaces/Store";
// import { useStoreContext } from "@/contexts/StoreContext";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { RoleName } from "@prisma/client";
import { useRouter } from "next/navigation";

interface StoreSetupGuardProps {
  children: React.ReactNode;
}

interface SetupStatus {
  canActivate: boolean;
  hasEmployees: boolean;
  hasServices: boolean;
  employeeCount: number;
  serviceCount: number;
  isActivated: boolean;
  storeName: string;
  missingSteps: string[];
  setupComplete: boolean;
}

export default function StoreSetupGuard({ children }: StoreSetupGuardProps) {

  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  // const [storeData, setStoreData] = useState<Store | null>(null);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  // const { setStoreSetupStatus, setStoreForm, setStoreStatusHeader } =
  //   useStoreContext();
  const pathname = usePathname();

  // const checkStatus = async () => {
  //   setLoading(true);
  //   const res = await storeService.getStoreStatus();

  //   if (res.success) {
  //     setStoreData(res.data);
  //   }

  //   // Check setup status for employees and services
  //   try {
  //     const statusRes = await fetch("/api/store/setup-status", { cache: "no-store", });
  //     const statusData = await statusRes.json();

  //     // console.log(statusData);
  //     if (statusData.success) {
  //       setStoreStatusHeader({
  //         activated: statusData.data.isActivated,
  //         autoQueue: statusData.data.autoQueue,
  //       });
  //       setStoreForm((prevState) => ({
  //         ...prevState,
  //         activated: statusData.data.isActivated,
  //       }));
  //       setSetupStatus(statusData.data);
  //       // Also update the global context so MenuItemsStore can use it
  //       setStoreSetupStatus(statusData.data);

  //       // Clear dismissal if setup is now complete (so wizard can show success message)
  //       if (statusData.data.setupComplete) {
  //         sessionStorage.removeItem("setup_wizard_dismissed");
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching setup status:", error);
  //   }

  //   setLoading(false);
  // };

  // useEffect(() => {
  //   if (
  //     status === "authenticated" &&
  //     session?.user?.roleName !== RoleName.ADMIN
  //   ) {
  //     checkStatus();
  //   } else {
  //     setLoading(false);
  //   }
  // }, []);


  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show initial store setup stepper if setup is incomplete (setupStep < 6)
  // if (storeData && storeData.setupStep < 6) {
  //   return (
  //     <Container maxWidth="md">
  //       <StoreSetupStepper
  //         storeData={storeData}
  //         initialStep={storeData.setupStep || 1}
  //         onComplete={() => checkStatus()}
  //       />
  //     </Container>
  //   );
  // }

  // After initial setup (setupStep >= 6), show SetupWizard only if employees or services are missing
  // Don't auto-show wizard if setup is already complete
  // Don't show wizard on employees or services pages (user is already there)
  // const isEmployeeOrServicePage = pathname?.includes("/employees") || pathname?.includes("/services");
  // if (
  //   storeData &&
  //   (storeData.setupStep ?? 0) >= 6 &&
  //   setupStatus &&
  //   !setupStatus.setupComplete &&
  //   !isEmployeeOrServicePage
  // ) {
  //   return (
  //     <>
  //       {children}
  //       <SetupWizard
  //         open={true}
  //         onClose={() => checkStatus()}
  //         onSetupComplete={() => checkStatus()}
  //       />
  //     </>
  //   );
  // }

  return <>{children}</>;
}
