import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createClient();

    const { error } = await supabase.from("videos").insert([
      {
        vimeo_id: body.vimeo_id,
        vimeo_url: body.vimeo_url,
        project_id: body.project_id,
        type_video: body.type_video,
        title: body.title,
        descripcion: body.descripcion,
        duration: body.duration,
      },
    ]);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err }, { status: 400 });
  }
}
