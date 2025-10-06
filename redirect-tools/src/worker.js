export default {
  async fetch(request) {
    const target = new URL(request.url);
    target.hostname = "tools.dev66.net";
    return Response.redirect(target.toString(), 302);
  }
};
