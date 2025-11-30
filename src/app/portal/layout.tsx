"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Calendar,
  LogOut,
  Home,
  FolderOpen,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDatosUser } from "@/hooks/user/datosUser";
import Image from "next/image";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, role, loading: authLoading, signOut } = useAuth();

  const { data: userData, isLoading: isLoadingUserData } = useDatosUser(user);

  const isActive = (path: string) => {
    if (path === "/portal") {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const navLinkClass = (path: string) => {
    return `flex items-center gap-2 px-4 py-3 transition-colors ${
      isActive(path)
        ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-b-2 border-transparent hover:border-blue-600"
    }`;
  };

  // Combinamos ambos loadings
  const loading = authLoading || isLoadingUserData;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/102.png"
                alt="Whapy Icon"
                width={32}
                height={32}
                className="rounded-4xl"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Whapy</h1>
                <p className="text-xs text-gray-500">
                  {role === "admin"
                    ? "Panel de Administración"
                    : "Portal del Cliente"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userData?.email || user?.email || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between gap-1 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              <Link href="/portal" className={navLinkClass("/portal")}>
                <Home className="w-4 h-4" />
                Inicio
              </Link>

              <Link
                href="/portal/projects"
                className={navLinkClass("/portal/projects")}
              >
                <FolderOpen className="w-4 h-4" />
                Mis Proyectos
              </Link>

              <Link
                href="/portal/budgets"
                className={navLinkClass("/portal/budgets")}
              >
                <FileText className="w-4 h-4" />
                Documentos
              </Link>

              <Link
                href="/portal/profile"
                className={navLinkClass("/portal/profile")}
              >
                <User className="w-4 h-4" />
                Mi Perfil
              </Link>
            </div>
            <div className="flex items-center">
              <button className="cursor-pointer" onClick={toggleTheme}>
                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
              </button>
              {role === "admin" && (
                <Link
                  href="/crm"
                  className="flex items-center gap-2 px-4 py-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-b-2 border-transparent hover:border-purple-600 transition-colors ml-auto"
                >
                  <Calendar className="w-4 h-4" />
                  Ir al CRM
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
