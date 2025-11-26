"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use, useEffect, useState } from "react";
import { useProfileById } from "@/hooks/admin/useProfiles";
import ClientContentPage from "./client.content";

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((res) => {
      setId(res.id);
    });
  }, [params]);

  const {
    data: dataProfile = [],
    isLoading,
    error,
    refetch,
  } = useProfileById(id || "");
  if (isLoading) {
    return <div>Cargando perfil...</div>;
  }
  if (error) {
    return <div>Error al cargar el perfil: {error.message}</div>;
  }
  if (!isLoading && !error && dataProfile.length === 0) {
    return <div>Este usuario no existe.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/crm/usuarios"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-4 ml-4"
      >
        <ArrowLeft className="w-6 h-6" />
      </Link>

      {/* Client Component con interactividad */}
      <ClientContentPage client={dataProfile[0]} refetchProfile={refetch} />
    </div>
  );
}
