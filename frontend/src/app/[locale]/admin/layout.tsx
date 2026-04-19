"use client";

import React from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Navbar } from "@/components/ui/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <RoleGuard allowedRoles={["ADMIN", "SUPERADMIN", "EDITOR"]}>
        <main className="pt-24 px-6 pb-20 max-w-7xl mx-auto">
          {children}
        </main>
      </RoleGuard>
    </div>
  );
}
