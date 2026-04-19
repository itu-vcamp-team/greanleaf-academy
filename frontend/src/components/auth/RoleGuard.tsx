"use client";

import React from "react";
import { useUserRole, UserRole } from "@/context/UserRoleContext";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // SUPERADMIN has access to everything
  if (role === "SUPERADMIN") return <>{children}</>;

  if (!allowedRoles.includes(role)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass p-10 text-center space-y-6 border-red-500/10"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Erişim Kısıtlı</h2>
            <p className="text-gray-500 text-sm font-medium">
              Bu sayfayı görüntülemek için yeterli yetkiniz bulunmamaktadır. 
              Lütfen yetkili bir hesapla giriş yapın veya destek ekibiyle iletişime geçin.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Link href="/">
              <Button className="w-full rounded-xl">Ana Sayfaya Dön</Button>
            </Link>
            <Link href="/auth/register" className="text-xs font-bold text-primary hover:underline">
              Partner Başvurusunda Bulun
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
