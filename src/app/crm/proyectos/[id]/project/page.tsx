"use client";

import { useEffect, useState } from "react";
import ProjectContentPage from "./project.content";
import { useProjectById } from "@/hooks/admin/useProjects";

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
    data: dataProject = [],
    isLoading,
    error,
    refetch,
  } = useProjectById(id || "");
  if (isLoading) {
    return <div>Cargando proyecto...</div>;
  }
  if (error) {
    return <div>Error al cargar el proyecto: {error.message}</div>;
  }
  if (!isLoading && !error && dataProject.length === 0) {
    return <div>Este proyecto no existe.</div>;
  }

  return (
    <div className="space-y-6 p-5">
      {/* Client Component con interactividad */}

      <ProjectContentPage
        // @ts-expect-error: ProjectWithProfiles[] no coincide con Project
        project={dataProject}
        refetch={refetch}
      />
    </div>
  );
}
