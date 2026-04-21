"use client";

import React from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPERADMIN", "EDITOR"]}>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        {/* Main content area offset by sidebar width */}
        <main className="flex-1 ml-72 p-10 max-w-screen-xl">{children}</main>
      </div>
    </RoleGuard>
  );
}
