export type Document = {
  id: string;
  user_id: string;
  project_id?: string | null;
  lead_id?: string | null;
  title: string;
  document_url: string;
  category_document: string;
  type_document: string;
  created_at: string;
};

export type Video = {
  id: string;
  user_id?: string | null;
  meeting_id?: string | null;
  project_id?: string | null;
  vimeo_id: string;
  vimeo_url: string;
  title: string;
  status: string;
  descripcion: string;
  duration?: string | null;
  created_at: string;
  type_video: string;
};

export type Meeting = {
  meeting_id: string;
  project_id: string;
  lead_id?: string | null;
  user_id: string;
  title: string;
  start_at: string;
  location: string;
  meet_url: string;
  summary_md: string;
  summary_pdf_url: string;
  type_meeting: string;
  created_at: string;
  estado: string;
  duration?: string | null;
  type: string;
  videos?: Video[] | null;
};

export type Project = {
  id: string;
  lead_id?: string | null;
  user_id: string;
  title: string;
  descripcion: string;
  created_at: string;
  status: "En progreso" | "Terminado" | "Cancelado" | "Pausado";
  progress: number;
  documents?: Document[] | null;
  videos?: Video[] | null;
  consumo?: string;
  presupuesto?: {
    id: string;
    monto: number;
    estado: string;
    divisa: string;
    created_at: string;
    presupuestos_employees?: {
      profiles: {
        id: string;
        nombre: string;
      };
    }[];
  } | null;
};

export type Pasos = {
  id: string;
  paso_titulo_1: string;
  paso_detalle_1: string;
  paso_titulo_2: string;
  paso_detalle_2: string;
  paso_titulo_3: string;
  paso_detalle_3: string;
};

export type Client = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  ciudad: string;
  codigoPostal: string;
  created_at: string;
  projects?: Project[] | null;
  type: string;
  genero: string;
  fechaNacimiento: string;
  pais: string;
  detalles?: string | null;
  estado: string;
  videos?: Video[] | null;
  pasos?: Pasos[] | null;
};

export type InsertData = {
  project_id: string;
  title: string;
  document_url: string;
  category_document: string;
  type_document: string;
  user_id?: string;
  lead_id?: string;
};
export type InsertMeetingData = {
  project_id: string;
  title: string;
  start_at: string;
  location: string;
  meet_url: string;
  summary_md: string;
  summary_pdf_url: string;
  type_meeting: string;
  estado: string;
  duration: string;
  lead_id?: string;
  user_id?: string;
};
