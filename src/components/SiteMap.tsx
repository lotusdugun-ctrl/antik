import { Suspense, lazy, useEffect, useState } from "react";
import type { Site } from "@/lib/sites";

// Leaflet touches `window` at import time — keep it out of the SSR graph.
const SiteMapInner = lazy(() => import("./SiteMapInner"));

type Props = {
  sites: Site[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  path?: [number, number][];
  /** Overrides the default: cluster when there are many pins and no path. */
  cluster?: boolean;
};

function MapSkeleton({ height }: { height: string }) {
  return (
    <div
      className="animate-pulse rounded-2xl border border-border bg-muted"
      style={{ height }}
      aria-hidden
    />
  );
}

export function SiteMap({ height = "70vh", ...props }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <MapSkeleton height={height} />;

  return (
    <Suspense fallback={<MapSkeleton height={height} />}>
      <SiteMapInner height={height} {...props} />
    </Suspense>
  );
}
