export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Extrait l'URL cible après le domaine du worker
    const targetUrl = url.pathname.slice(1); // supprime le premier slash

    if (!targetUrl.startsWith("http")) {
      return new Response("URL cible invalide", { status: 400 });
    }

    try {
      const proxied = await fetch(targetUrl, {
        headers: {
          'User-Agent': request.headers.get("User-Agent") || "Mozilla/5.0"
        },
      });

      const cleanHeaders = new Headers(proxied.headers);
      cleanHeaders.delete("x-frame-options");
      cleanHeaders.delete("content-security-policy");
      cleanHeaders.set("Access-Control-Allow-Origin", "*");

      return new Response(proxied.body, {
        status: proxied.status,
        headers: cleanHeaders
      });
    } catch (err) {
      return new Response("Erreur de proxy: " + err.message, {
        status: 502,
      });
    }
  },
};