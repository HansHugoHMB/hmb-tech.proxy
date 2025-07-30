export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.pathname.slice(1); // retire le slash initial "/"

    if (!target.startsWith("http")) {
      return new Response("Erreur : URL cible invalide", { status: 400 });
    }

    try {
      const response = await fetch(target, {
        headers: {
          "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0",
        },
      });

      // Récupérer le type de contenu
      const contentType = response.headers.get("content-type") || "";

      // Supprimer les en-têtes bloquants
      const headers = new Headers(response.headers);
      headers.delete("x-frame-options");
      headers.delete("content-security-policy");
      headers.set("Access-Control-Allow-Origin", "*");

      // Lire le corps de la réponse en fonction du type de contenu
      const body = contentType.includes("text") || contentType.includes("html")
        ? await response.text()
        : response.body;

      return new Response(body, {
        status: response.status,
        headers,
      });
    } catch (err) {
      return new Response("Erreur côté proxy : " + err.message, {
        status: 502,
      });
    }
  }
};