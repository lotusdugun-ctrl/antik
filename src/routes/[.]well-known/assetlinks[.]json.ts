import { createFileRoute } from "@tanstack/react-router";

/**
 * Digital Asset Links for the Play Store app (a Trusted Web Activity).
 *
 * Android only opens the site full-screen, without a browser bar, when this
 * file names the app's package and the SHA-256 fingerprint of its signing
 * key. Both come from the environment, because the fingerprint only exists
 * once the app has been signed (see docs/PLAY_STORE.md):
 *
 *   TWA_PACKAGE_NAME   e.g. app.antikturkiye.twa
 *   TWA_SHA256         one or more fingerprints, comma-separated
 *                      (the upload key and Play App Signing's key)
 *
 * Unset, it answers 404 — an empty list would claim there is no app.
 */
export const Route = createFileRoute("/.well-known/assetlinks.json")({
  server: {
    handlers: {
      GET: () => {
        const packageName = process.env["TWA_PACKAGE_NAME"];
        const fingerprints = (process.env["TWA_SHA256"] ?? "")
          .split(",")
          .map((f) => f.trim().toUpperCase())
          .filter(Boolean);
        if (!packageName || fingerprints.length === 0) {
          return new Response("Not configured", { status: 404 });
        }
        const body = [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: packageName,
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ];
        return new Response(JSON.stringify(body, null, 2), {
          headers: {
            "content-type": "application/json",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
