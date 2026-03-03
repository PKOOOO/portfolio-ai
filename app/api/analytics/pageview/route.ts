import { writeClient } from "@/sanity/lib/writeClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, referrer, sessionId, userAgent } = body;

    if (!path) {
      return Response.json({ error: "path is required" }, { status: 400 });
    }

    const ua = (userAgent || "").toLowerCase();
    let deviceType = "desktop";
    if (/mobile|android|iphone|ipod/.test(ua)) deviceType = "mobile";
    else if (/tablet|ipad/.test(ua)) deviceType = "tablet";

    await writeClient.create({
      _type: "pageView",
      path,
      referrer: referrer || null,
      userAgent: userAgent || null,
      deviceType,
      sessionId: sessionId || null,
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Analytics] Page view tracking error:", error);
    return Response.json(
      { error: "Failed to track page view" },
      { status: 500 },
    );
  }
}
