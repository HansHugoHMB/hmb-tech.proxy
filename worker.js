export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+/, '');

    if (!path) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <title>Proxy HMB</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #0D1C40;
              color: #FFD700;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              font-family: Arial, sans-serif;
              text-align: center;
            }
            h1 {
              font-size: 2rem;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            p {
              font-size: 1rem;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div>
            <h1>Bienvenue sur le proxy HMB</h1>
            <p>Utilisez une URL complète dans le chemin pour accéder à un site distant via iframe.</p>
            <p>Exemple : <code>/hmb-tech.fwh.is/nws.php</code></p>
          </div>
        </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html" },
        status: 200
      });
    }

    // Proxy
    try {
      const targetURL = `https://${path}`;
      const response = await fetch(targetURL);

      const newHeaders = new Headers(response.headers);
      newHeaders.set("X-Frame-Options", "ALLOWALL");
      newHeaders.set("Content-Security-Policy", "frame-ancestors *");

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });

    } catch (err) {
      return new Response("Erreur lors du chargement de la ressource.", { status: 500 });
    }
  }
}