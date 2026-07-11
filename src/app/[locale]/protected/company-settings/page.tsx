"use client"

import { useEffect } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import CompanySettingsForm from "@/components/forms/company/CompanySettingsForm";
import PageContainer from "@/components/shared/PageContainer";

const CompanySettingsPage = () => {
  const { setBreadcrumbs } = useBreadcrumbContext();

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: "/dashboard" },
      { name: "ตั้งค่าบัญชี", href: "" },
      { name: "ข้อมูลบริษัท", href: "" },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs]);

  return (
    <PageContainer title="ข้อมูลบริษัท" description="จัดการข้อมูลบริษัทของคุณ">
      <CompanySettingsForm />
    </PageContainer>
  );
};

export default CompanySettingsPage;
