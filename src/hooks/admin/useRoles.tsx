"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type Roles = {
  id: string;
  rol: string;
};

export type UserProfile = {
  id: string;
  nombre: string;
  email: string;
  roles: Roles;
};

const supabase = createClient();

export function useRoles() {
  return useQuery<Roles[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("roles").select(
        `
          *
        `
      );

      if (error) throw error;
      return data as unknown as Roles[];
    },
  });
}
export function useUserRolProfiles() {
  return useQuery<UserProfile[]>({
    queryKey: ["userRolProfiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          nombre,
          email,
          id,
          roles(rol)
        `
        )
        .eq("role", "admin");

      if (error) throw error;
      return data as unknown as UserProfile[];
    },
  });
}
