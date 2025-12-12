"use client";

import { useUpload } from "@/context/UploadContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Bell,
  Calendar,
  Calendar1Icon,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// FUNCIÓN que define permisos por rol
const getPermissions = (roleAdmin: string | null) => {
  // Diseñador y Programador → acceso exclusivo a proyectos
  if (roleAdmin === "Diseñador" || roleAdmin === "Desarrollador") {
    return { accessAll: false, canUsers: false, onlyProjects: true };
  }

  if (roleAdmin === "CEO" || roleAdmin === "COO" || roleAdmin === "QA") {
    return { accessAll: true, canUsers: true, onlyProjects: false };
  }

  if (roleAdmin === "Sales manager") {
    return { accessAll: false, canUsers: true, onlyProjects: false };
  }

  return { accessAll: false, canUsers: false, onlyProjects: false };
};

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, roleAdmin, name, loading, signOut } = useAuth();

  const permissions = getPermissions(roleAdmin);

  useEffect(() => {
    if (permissions.onlyProjects && pathname !== "/crm/proyectos") {
      router.replace("/crm/proyectos");
    }
  }, [permissions.onlyProjects, pathname, router]);
  if (loading) return null;

  const navigation = [
    {
      name: "Dashboard",
      href: "/crm",
      icon: LayoutDashboard,
      permission: permissions.accessAll,
    },

    {
      name: "Reuniones",
      href: "/crm/meetings",
      icon: Calendar,
      permission: permissions.accessAll,
    },
    {
      name: "Usuarios",
      href: "/crm/usuarios",
      icon: Users,
      permission: permissions.canUsers,
    },
    {
      name: "Proyectos",
      href: "/crm/proyectos",
      icon: FileText,
      permission: permissions.accessAll || permissions.onlyProjects,
    },
    {
      name: "Historial de Actividad",
      href: "/crm/actividad",
      icon: Calendar1Icon,
      permission: permissions.accessAll,
    },
    {
      name: "Accesos",
      href: "/crm/accesos",
      icon: Users,
      permission: permissions.accessAll,
    },
    {
      name: "PNL",
      href: "/crm/pnl",
      icon: LayoutDashboard,
      permission: permissions.accessAll,
    },
    {
      name: "CRM",
      href: "/crm/crm",
      icon: MessageCircle,
      permission: permissions.accessAll,
    },
  ].map((item) => ({
    ...item,
    current: pathname === item.href,
  }));

  // FILTRADO según permisos
  const filteredNavigation = navigation.filter((item) => item.permission);
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
          {filteredNavigation.map((item) => {
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
                {user?.email?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  {name || "Usuario"}
                </p>
                <p className="text-xs text-gray-500">
                  {roleAdmin || "Sin rol"}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  Configuración
                </button>
                <button
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
        <header className="bg-white border-b h-16 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold">
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
