/**
 * Tipos generados automáticamente desde Supabase
 * Para regenerar: npx supabase gen types typescript --project-id "tu-project-id" --schema public > types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'ventas' | 'pm' | 'cliente'
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          role: 'admin' | 'ventas' | 'pm' | 'cliente'
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'ventas' | 'pm' | 'cliente'
          full_name?: string | null
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          lead_id: string | null
          start_at: string | null
          location: string | null
          meet_url: string | null
          summary_md: string | null
          summary_pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          start_at?: string | null
          location?: string | null
          meet_url?: string | null
          summary_md?: string | null
          summary_pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          start_at?: string | null
          location?: string | null
          meet_url?: string | null
          summary_md?: string | null
          summary_pdf_url?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          lead_id: string | null
          status: 'draft' | 'presentado' | 'aceptado' | 'rechazado'
          title: string | null
          currency: string
          amount_total: number
          notes: string | null
          pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          status?: 'draft' | 'presentado' | 'aceptado' | 'rechazado'
          title?: string | null
          currency?: string
          amount_total?: number
          notes?: string | null
          pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          status?: 'draft' | 'presentado' | 'aceptado' | 'rechazado'
          title?: string | null
          currency?: string
          amount_total?: number
          notes?: string | null
          pdf_url?: string | null
          created_at?: string
        }
      }
      client_links: {
        Row: {
          id: string
          lead_id: string | null
          client_profile: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id?: string | null
          client_profile?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string | null
          client_profile?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}