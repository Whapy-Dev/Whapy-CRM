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
      user_metadata: { nombre },
    });

    if (error) {
      console.error("❌ Error en createUser:", error);
      throw error;
    }
    if (!data?.user) {
      console.error("❌ No se devolvió user:", data);
      throw new Error("No se devolvió el usuario desde Auth");
    }

    // Insertar en profiles
    const { error: insertError } = await supabaseAdmin.from("profiles").insert([
      {
        id: data.user.id,
        email: email,
        nombre: nombre,
        role: "cliente",
      },
    ]);

    if (insertError) throw insertError;

    return NextResponse.json({ user: data.user });
  } catch (err: any) {
    console.error("❌ Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
