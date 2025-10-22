import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  console.log("🟢 Endpoint /api/create-client llamado");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("🧩 Variables de entorno:", { url, hasKey: !!key });

  if (!url || !key) {
    return NextResponse.json(
      { error: "Faltan variables de entorno" },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(url, key);

  try {
    const body = await req.json();
    console.log("📩 Payload recibido:", body);

    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { nombre: name || "" },
    });

    if (error) {
      console.error("❌ Error creando usuario:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Usuario creado correctamente:", data.user.id);

    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (err: any) {
    console.error("💥 Error crítico:", err);
    return NextResponse.json(
      { error: err.message || "Error inesperado en el servidor" },
      { status: 500 }
    );
  }
}
