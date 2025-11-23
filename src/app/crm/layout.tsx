"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Calendar1Icon,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useUpload } from "@/context/UploadContext";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, role, name, loading, signOut } = useAuth();

  if (loading) return null;
  const navigation = [
    { name: "Dashboard", href: "/crm", icon: LayoutDashboard },
    { name: "Leads (uncompleted)", href: "/crm/leads", icon: Users },
    { name: "Presupuestos", href: "/crm/budgets", icon: FileText },
    { name: "Reuniones", href: "/crm/meetings", icon: Calendar },
    { name: "Usuarios", href: "/crm/usuarios", icon: Users },
    { name: "Proyectos", href: "/crm/proyectos", icon: FileText },
    {
      name: "Historial de Actividad",
      href: "/crm/actividad",
      icon: Calendar1Icon,
    },
  ].map((item) => ({
    ...item,
    current: pathname === item.href,
  }));
  function GlobalUploadWidget() {
    const { isUploading, progress, message } = useUpload();

    if (!isUploading) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-white shadow-xl p-4 rounded-xl w-64 border">
        <p className="text-sm">{message}</p>
        <div className="w-full bg-gray-200 h-2 rounded mt-2">
          <div
            className="h-2 bg-blue-600 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Image
              src="/102.png"
              alt="Whapy Icon"
              width={32}
              height={32}
              className="rounded-4xl"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Whapy CRM</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.current
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.email?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  {name || "Usuario"}
                </p>
                <p className="text-xs text-gray-500">{role || "Sin rol"}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4" />
                  Configuración
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-900">
            {navigation.find((item) => item.current)?.name || "Dashboard"}
          </h2>

          <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
          <GlobalUploadWidget />
        </main>
      </div>
    </div>
  );
}
