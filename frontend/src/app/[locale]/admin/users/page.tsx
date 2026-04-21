"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  UserCheck, UserX, Shield, Mail, Calendar,
  Loader2, BadgeCheck, Users, ToggleLeft, ToggleRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/Button";

type Tab = "pending" | "all";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  partner_id: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [pendingUsers, setPendingUsers] = useState<UserRow[]>([]);
  const [allUsers, setAllUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPending();
    } else {
      fetchAll();
    }
  }, [activeTab]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/users/pending");
      setPendingUsers(res.data);
    } catch {
      console.error("Fetch pending error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/users/all");
      setAllUsers(res.data);
    } catch {
      console.error("Fetch all users error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await apiClient.post(`/admin/users/${userId}/approve`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı reddetmek istediğinize emin misiniz?")) return;
    setActionLoading(userId);
    try {
      await apiClient.post(`/admin/users/${userId}/reject`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await apiClient.post(`/admin/users/${userId}/toggle-active`);
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: res.data.is_active } : u))
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <div className="flex items-center gap-3 text-emerald-500 mb-3">
          <Shield className="w-5 h-5" fill="currentColor" fillOpacity={0.2} />
          <span className="text-xs font-black uppercase tracking-[0.3em]">Kullanıcı Yönetimi</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          Partner <span className="text-emerald-500 italic">Yönetimi</span>
        </h1>
      </header>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        <TabButton
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
          icon={<UserCheck size={14} />}
          label={`Onay Bekleyenler (${pendingUsers.length})`}
        />
        <TabButton
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          icon={<Users size={14} />}
          label="Tüm Kullanıcılar"
        />
      </div>

      <GlassCard className="border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Kullanıcı
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Rol / Durum
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                  Eylemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr key="loading">
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto opacity-30" />
                    </td>
                  </tr>
                ) : activeTab === "pending" ? (
                  pendingUsers.length === 0 ? (
                    <tr key="empty">
                      <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-medium italic">
                        Onay bekleyen kullanıcı yok.
                      </td>
                    </tr>
                  ) : (
                    pendingUsers.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        mode="pending"
                        isActing={actionLoading === user.id}
                        onApprove={() => handleApprove(user.id)}
                        onReject={() => handleReject(user.id)}
                      />
                    ))
                  )
                ) : allUsers.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-medium italic">
                      Kullanıcı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  allUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      mode="all"
                      isActing={actionLoading === user.id}
                      onToggleActive={() => handleToggleActive(user.id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// --- Sub-components ---

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all ${
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

interface UserRowProps {
  user: UserRow;
  mode: "pending" | "all";
  isActing: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onToggleActive?: () => void;
}

function UserRow({ user, mode, isActing, onApprove, onReject, onToggleActive }: UserRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group hover:bg-gray-50/50 transition-colors"
    >
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-500 text-sm group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors flex-shrink-0">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm leading-tight">{user.full_name}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Mail size={11} /> {user.email}
            </div>
            {user.partner_id && (
              <span className="text-[10px] font-bold text-gray-400">PID: {user.partner_id}</span>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
            {user.role}
          </span>
          {user.is_verified && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <BadgeCheck size={11} /> Doğrulandı
            </span>
          )}
          {mode === "all" && (
            <span
              className={`text-[10px] font-bold ${
                user.is_active ? "text-emerald-500" : "text-red-400"
              }`}
            >
              {user.is_active ? "● Aktif" : "○ Pasif"}
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
          <Calendar size={12} />
          {new Date(user.created_at).toLocaleDateString("tr-TR")}
        </div>
      </td>

      <td className="px-6 py-5 text-right">
        {mode === "pending" ? (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onReject}
              disabled={isActing}
              className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
            >
              <UserX size={16} />
            </button>
            <Button
              size="sm"
              onClick={onApprove}
              disabled={isActing}
              className="gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-100"
            >
              {isActing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <UserCheck size={13} />
              )}
              Onayla
            </Button>
          </div>
        ) : (
          <button
            onClick={onToggleActive}
            disabled={isActing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40 ${
              user.is_active
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            }`}
          >
            {isActing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : user.is_active ? (
              <ToggleRight size={16} />
            ) : (
              <ToggleLeft size={16} />
            )}
            {user.is_active ? "Pasif Yap" : "Aktif Et"}
          </button>
        )}
      </td>
    </motion.tr>
  );
}
