"use client";

import React from "react";
import CustomNotification from "@/components/shared/CustomNotifications";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomNotification/>
      {children}
    </>
  );
}
