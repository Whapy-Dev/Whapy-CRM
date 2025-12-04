import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente Admin (Service Role Key solo en backend)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password, nombre } = await req.json();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("❌ Error en createUser:", error);
      console.log(error);
      throw error;
    }
    if (!data?.user) {
      console.error("❌ No se devolvió user:", data);
      throw new Error("No se devolvió el usuario desde Auth");
    }

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!existingProfile) {
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            email,
            nombre,
            role: "cliente",
            has_access_project: "1",
          },
        ]);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ user: data.user });
  } catch (err: unknown) {
    console.error("❌ Error completo:", err);

    let errorMessage = "Error desconocido";

    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === "object" && err !== null && "message" in err) {
      // Supabase a veces devuelve objetos con message
      // @ts-expect-error: TypeScript no reconoce este tipo temporalmente
      errorMessage = err.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
