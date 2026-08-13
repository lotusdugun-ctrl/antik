import { createFileRoute } from "@tanstack/react-router";

/**
 * Served from a route rather than `public/` for one reason: the `Sitemap:`
 * directive has to be an absolute URL, and only the request knows the origin.
 * A committed file would have to hard-code a domain and would be wrong on
 * preview deployments.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const { origin } = new URL(request.url);
        const body = [
          "User-agent: *",
          "Allow: /",
          // Personal, device-local, and nothing a search result could offer.
          "Disallow: /profil",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
