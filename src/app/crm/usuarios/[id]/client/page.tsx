"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";
import { useProfileById } from "@/hooks/admin/useProfiles";
import ClientContentPage from "./client.content";

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: dataProfile = [],
    isLoading,
    error,
    refetch,
  } = useProfileById(id);
  if (isLoading) {
    return <div>Cargando documentos...</div>;
  }
  if (error) {
    return <div>Error al cargar los documentos: {error.message}</div>;
  }
  if (!isLoading && !error && dataProfile.length === 0) {
    return <div>Este usuario no existe.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/crm/usuarios"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Usuarios
      </Link>

      {/* Client Component con interactividad */}
      <ClientContentPage client={dataProfile[0]} refetchProfile={refetch} />
    </div>
  );
}
