import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { userId } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Borrar del Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) {
    console.log("Auth delete error:", authError);
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // 2. Borrar de tu tabla "profiles"
  const { error: dbError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);
  if (dbError) {
    console.log("Profiles delete error:", dbError);
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
