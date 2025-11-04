// /app/api/videos/delete/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId es requerido" },
        { status: 400 }
      );
    }

    const vimeoResponse = await fetch(
      `https://api.vimeo.com/videos/${videoId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!vimeoResponse.ok) {
      const errorData = await vimeoResponse.json().catch(() => ({}));
      console.error("Error eliminando video de Vimeo:", errorData);
      return NextResponse.json(
        { error: "No se pudo eliminar el video de Vimeo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando video:", error);
    return NextResponse.json(
      { error: "Error eliminando video" },
      { status: 500 }
    );
  }
}
