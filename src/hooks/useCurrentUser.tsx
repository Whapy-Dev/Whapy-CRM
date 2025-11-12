"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      console.log("🟦 Iniciando fetchUser inicial...");
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("Error obteniendo usuario:", error);
      setUser(data?.user || null);
      setLoading(false);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
