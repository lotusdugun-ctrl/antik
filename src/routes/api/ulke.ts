import { createFileRoute } from "@tanstack/react-router";

/**
 * GET /api/ulke — the visitor's country as Vercel's edge sees it, so the app
 * can open in a fitting language when the device's own language gives no
 * answer. Only the two-letter code, nothing stored. Empty when unknown.
 */
export const Route = createFileRoute("/api/ulke")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const raw = request.headers.get("x-vercel-ip-country") ?? "";
        const country = /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : "";
        return Response.json(
          { country },
          { headers: { "cache-control": "private, no-store", vary: "x-vercel-ip-country" } },
        );
      },
    },
  },
});
