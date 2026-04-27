"use client";

import AlertDialog from "@/components/shared/AlertDialog";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AlertDialog/>
      {children}
    </>
  );
}
