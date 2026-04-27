"use client";

import {
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import SystemSettings from "@/components/forms/system-settings/SystemSettings";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { RoleName } from "@prisma/client";
import PageContainer from "@/components/shared/PageContainer";

const SystemSettingsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const localActive = useLocale();

  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.roleName !== RoleName.SUPERADMIN) {
      router.push(`/${localActive}/protected/dashboard`);
    }
  }, [session, status, router, localActive]);

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "ตั้งค่าระบบ", href: "" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  if (status === "loading" || (status === "authenticated" && session?.user?.roleName !== RoleName.SUPERADMIN)) {
    return null;
  }

  return (
    <PageContainer title="" description="">
      <Typography variant="h1" mt={2}>
        ตั้งค่าระบบ
      </Typography>
        <SystemSettings />
    </PageContainer>
  );
};

export default SystemSettingsPage;
