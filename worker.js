export default {
  async fetch(request) {
    const targetURL = "https://hmb-tech.fwh.is/nws.php";
    const response = await fetch(targetURL);

    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-Frame-Options", "ALLOWALL");
    newHeaders.set("Content-Security-Policy", "frame-ancestors *");

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  }
};
