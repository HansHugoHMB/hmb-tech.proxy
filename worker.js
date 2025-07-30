export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.pathname.slice(1);

    if (!target.startsWith("http")) {
      return new Response("URL cible invalide", { status: 400 });
    }

    try {
      const res = await fetch(target, {
        headers: {
          "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0",
        },
      });

      const headers = new Headers(res.headers);
      headers.delete("x-frame-options");
      headers.delete("content-security-policy");

      // CORS headers pour fetch JS
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "*");

      const contentType = headers.get("content-type") || "";
      const body = contentType.includes("text") || contentType.includes("html")
        ? await res.text()
        : res.body;

      return new Response(body, {
        status: res.status,
        headers,
      });
    } catch (e) {
      return new Response("Erreur proxy : " + e.message, { status: 502 });
    }
  },
}; 