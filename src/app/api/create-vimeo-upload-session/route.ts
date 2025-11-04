import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, descripcion, size } = await req.json();

    const response = await fetch("https://api.vimeo.com/me/videos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        upload: { approach: "tus", size },
        name: title,
        description: descripcion,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.upload?.upload_link) {
      console.error("Vimeo error:", data);
      return NextResponse.json(
        { error: data.error || "Error creando sesión en Vimeo" },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      upload_link: data.upload.upload_link,
      uri: data.uri,
    });
  } catch (error) {
    console.error("Error creando sesión:", error);
    return NextResponse.json(
      { error: "Error creando sesión en Vimeo" },
      { status: 500 }
    );
  }
}
