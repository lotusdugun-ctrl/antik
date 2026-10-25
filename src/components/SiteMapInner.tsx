import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import L from "leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";
// MapLibre finds its worker next to its own module, which bundling breaks:
// hand it the worker file's built URL instead.
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { Link } from "@tanstack/react-router";
import { Check, ExternalLink } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Photo } from "@/components/Photo";
import { coverImage, type Site } from "@/lib/sites";
import { useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";

/*
 * The base map comes from OpenFreeMap: free, no key, and its terms allow
 * use in a published app (OpenStreetMap's own tile server does not). Its
 * tiles are vector, drawn with MapLibre over WebGL; a device without WebGL
 * gets OpenStreetMap's raster tiles instead, which at that rarity is the
 * light use OSM's tile policy accepts.
 */
const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const MAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function baseLayer(): L.Layer {
  if (hasWebGL()) {
    setWorkerUrl(maplibreWorkerUrl);
    return maplibreGL({
      style: OPENFREEMAP_STYLE,
      attributionControl: { customAttribution: MAP_ATTRIBUTION },
    });
  }
  return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });
}

/** Pin footprint in screen pixels; two sites closer than this would overlap. */
const CLUSTER_CELL_PX = 56;

/*
 * Icons are made once per look and kept. Leaflet's `setIcon` throws the
 * marker's DOM away and builds it again, and the markers below only call it
 * when the icon is a different object — so with a fresh `divIcon` per render
 * every pin on the map would be rebuilt at each zoom, each visit ticked and
 * each language switch.
 */
const clusterIcons = new Map<string, L.DivIcon>();
const pinIcons = new Map<boolean, L.DivIcon>();

function clusterIcon(count: number, allVisited: boolean) {
  const key = `${count}:${allVisited}`;
  let icon = clusterIcons.get(key);
  if (!icon) {
    icon = makeClusterIcon(count, allVisited);
    clusterIcons.set(key, icon);
  }
  return icon;
}

function pinIcon(visited: boolean) {
  let icon = pinIcons.get(visited);
  if (!icon) {
    icon = makePinIcon(visited);
    pinIcons.set(visited, icon);
  }
  return icon;
}

function makeClusterIcon(count: number, allVisited: boolean) {
  // Grow with the count, but slowly — a 40-site cluster should not be a blob.
  const size = Math.round(34 + Math.min(count, 40) * 0.45);
  return L.divIcon({
    className: "",
    html: `<span style="
      display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:50%;
      background:${allVisited ? "oklch(0.56 0.1 155)" : "oklch(0.52 0.13 45)"};
      border:3px solid rgba(255,255,255,0.92);
      box-shadow:0 4px 12px rgba(0,0,0,0.35);
      color:#fff;font:600 ${size > 44 ? 14 : 12}px/1 ui-sans-serif,system-ui,sans-serif;
    ">${count}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makePinIcon(visited: boolean) {
  return L.divIcon({
    className: "",
    html: `<span style="
      display:grid;place-items:center;width:26px;height:26px;border-radius:50% 50% 50% 8px;
      transform:rotate(-45deg);
      background:${visited ? "oklch(0.56 0.1 155)" : "oklch(0.52 0.13 45)"};
      border:2px solid rgba(255,255,255,0.9);
      box-shadow:0 4px 10px rgba(0,0,0,0.3);
    "><span style="width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.95)"></span></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
}

/** Two coordinate lists with the same points, whatever their identity. */
function samePath(a: [number, number][] | undefined, b: [number, number][] | undefined) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every((p, i) => p[0] === b[i]![0] && p[1] === b[i]![1]);
}

/**
 * Groups sites that would land on top of each other at the current zoom.
 *
 * Clustering happens in projected pixel space rather than by latitude and
 * longitude, because overlap is a screen problem: a degree of longitude is a
 * different number of pixels at every zoom level, and the Aegean coast holds
 * twenty-one sites (Antalya 11, Muğla 10) inside a couple of hundred pixels at
 * country zoom. Bucketing by pixel cell means the grouping loosens as the user
 * zooms in and dissolves on its own once the pins have room.
 */
function useClusters(map: L.Map, sites: Site[], enabled: boolean) {
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    if (!enabled) return;
    const onZoom = () => setZoom(map.getZoom());
    onZoom();
    map.on("zoomend", onZoom);
    return () => {
      map.off("zoomend", onZoom);
    };
  }, [map, enabled]);

  return useMemo(() => {
    if (!enabled) return sites.map((site) => [site] as Site[]);
    const cells = new Map<string, Site[]>();
    for (const site of sites) {
      const point = map.project([site.lat, site.lng], zoom);
      const key = `${Math.floor(point.x / CLUSTER_CELL_PX)}:${Math.floor(point.y / CLUSTER_CELL_PX)}`;
      const bucket = cells.get(key);
      if (bucket) bucket.push(site);
      else cells.set(key, [site]);
    }
    return [...cells.values()];
  }, [sites, enabled, map, zoom]);
}

/**
 * A Leaflet marker owned by a React component: added on mount, removed on
 * unmount, and kept in step with its position, icon and title in between.
 * Returns the marker once it exists, for the popup and the click handler.
 */
function useMarker(
  map: L.Map,
  position: L.LatLngExpression,
  icon: L.DivIcon,
  title: string,
): L.Marker | null {
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const latLng = L.latLng(position);

  useEffect(() => {
    // Leaflet's markers are focusable buttons; without a title a screen
    // reader announces each of them as just "button".
    const made = L.marker(latLng, { icon, title, alt: title }).addTo(map);
    setMarker(made);
    return () => {
      made.remove();
    };
    // Created once; the effects below follow later changes in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (marker && !marker.getLatLng().equals(latLng)) marker.setLatLng(latLng);
  }, [marker, latLng.lat, latLng.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // The icons are cached per look, so identity is the change test.
    if (marker && marker.options.icon !== icon) marker.setIcon(icon);
  }, [marker, icon]);

  useEffect(() => {
    if (!marker) return;
    // Leaflet reads these when it builds the icon; set them for the next
    // `setIcon` and on the element that is there now (a language switch).
    marker.options.title = title;
    marker.options.alt = title;
    const el = marker.getElement();
    if (el) {
      el.title = title;
      el.setAttribute("alt", title);
      el.setAttribute("aria-label", title);
    }
  }, [marker, title]);

  return marker;
}

/**
 * One site pin with its popup. The popup's content is React — router links,
 * the visited toggle — rendered through a portal into the element Leaflet
 * shows, so it keeps the app's context and its links stay in-app navigation.
 * It is only rendered while the popup is open: three hundred closed popups
 * would otherwise each be loading a photo.
 */
function PinMarker({
  map,
  site,
  icon,
  title,
  children,
}: {
  map: L.Map;
  site: Site;
  icon: L.DivIcon;
  title: string;
  children: ReactNode;
}) {
  const marker = useMarker(map, [site.lat, site.lng], icon, title);
  const [content] = useState(() => document.createElement("div"));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!marker) return;
    marker.bindPopup(content);
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    marker.on("popupopen", onOpen);
    marker.on("popupclose", onClose);
    return () => {
      marker.off("popupopen", onOpen);
      marker.off("popupclose", onClose);
      marker.unbindPopup();
    };
  }, [marker, content]);

  // Leaflet measured the popup before React filled it: size and pan again.
  useLayoutEffect(() => {
    if (open) marker?.getPopup()?.update();
  });

  return open ? createPortal(children, content) : null;
}

/**
 * One cluster pin. Clicking it zooms to the group; `maxZoom` stops a pile of
 * sites that share one hilltop from throwing the map to street level.
 */
function ClusterMarker({
  map,
  group,
  allVisited,
  title,
}: {
  map: L.Map;
  group: Site[];
  allVisited: boolean;
  title: string;
}) {
  const bounds = useMemo(
    () => L.latLngBounds(group.map((s) => [s.lat, s.lng] as [number, number])),
    [group],
  );
  const centre = useMemo(() => bounds.getCenter(), [bounds]);
  const marker = useMarker(map, centre, clusterIcon(group.length, allVisited), title);

  useEffect(() => {
    if (!marker) return;
    const onClick = () => map.flyToBounds(bounds.pad(0.25), { maxZoom: 13, duration: 0.6 });
    marker.on("click", onClick);
    return () => {
      marker.off("click", onClick);
    };
  }, [marker, map, bounds]);

  return null;
}

function SiteMarkers({
  map,
  sites,
  cluster,
  renderPopup,
}: {
  map: L.Map;
  sites: Site[];
  cluster: boolean;
  renderPopup: (site: Site) => ReactNode;
}) {
  const { t, L: label } = useI18n();
  const { isVisited } = useProgress();
  const groups = useClusters(map, sites, cluster);

  return (
    <>
      {groups.map((group) => {
        const first = group[0]!;
        if (group.length === 1) {
          return (
            <PinMarker
              key={first.slug}
              map={map}
              site={first}
              icon={pinIcon(isVisited(first.slug))}
              title={label(first.name)}
            >
              {renderPopup(first)}
            </PinMarker>
          );
        }

        return (
          <ClusterMarker
            key={`cluster-${first.slug}-${group.length}`}
            map={map}
            group={group}
            allVisited={group.every((s) => isVisited(s.slug))}
            title={`${group.length} ${t("civs_places")}: ${group
              .slice(0, 3)
              .map((s) => label(s.name))
              .join(", ")}${group.length > 3 ? "…" : ""}`}
          />
        );
      })}
    </>
  );
}

/** The route line, replaced when the points change and removed with the map. */
function RouteLine({ map, path }: { map: L.Map; path: [number, number][] }) {
  const stable = useRef(path);
  if (!samePath(stable.current, path)) stable.current = path;
  const points = stable.current;

  useEffect(() => {
    const line = L.polyline(points, {
      color: "oklch(0.52 0.13 45)",
      weight: 4,
      opacity: 0.85,
    }).addTo(map);
    return () => {
      line.remove();
    };
  }, [map, points]);

  return null;
}

export default function SiteMapInner({
  sites,
  center = [39.2, 33.5],
  zoom = 6,
  height = "70vh",
  path,
  cluster,
}: {
  sites: Site[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  path?: [number, number][];
  cluster?: boolean;
}) {
  const { t, L: tr } = useI18n();
  const { isVisited, toggleVisited } = useProgress();
  const hostRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  // The map itself: made once on mount, torn down (with every layer on it)
  // on unmount. The view it starts at is the first `center` and `zoom`.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const made = L.map(host, { center, zoom, scrollWheelZoom: true });
    baseLayer().addTo(made);
    setMap(made);
    return () => {
      setMap(null);
      made.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A new centre or zoom (a region page, a route) glides there.
  const lastView = useRef<string | null>(null);
  useEffect(() => {
    if (!map) return;
    const key = `${center[0]},${center[1]},${zoom}`;
    if (lastView.current !== null && lastView.current !== key) {
      map.flyTo(center, zoom, { duration: 0.8 });
    }
    lastView.current = key;
  }, [map, center[0], center[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // An itinerary is a numbered sequence — collapsing its stops would hide the
  // very thing the map is drawing — so a path always shows every pin.
  const clustered = cluster ?? (!path && sites.length > 12);

  const renderPopup = (site: Site) => {
    const visited = isVisited(site.slug);
    return (
      <div className="overflow-hidden rounded-[var(--radius)]">
        <Photo
          src={coverImage(site)}
          alt={tr(site.name)}
          sizes="256px"
          fallbackWidth={330}
          className="h-28 w-full object-cover"
        />
        <div className="space-y-2 p-3">
          <div>
            <h4 className="font-display text-base font-semibold leading-tight">{tr(site.name)}</h4>
            <p className="text-xs text-muted-foreground">
              {tr(site.province)} · {site.civilizations[0]}
            </p>
          </div>
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {tr(site.summary)}
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => toggleVisited(site.slug)}
              className={
                visited
                  ? "flex flex-1 items-center justify-center gap-1 rounded-lg bg-success px-2 py-1.5 text-xs font-semibold text-success-foreground"
                  : "flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground"
              }
            >
              {visited && <Check className="h-3 w-3" />}
              {visited ? t("visited_done") : t("visited")}
            </button>
            <Link
              to="/kent/$slug"
              params={{ slug: site.slug }}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-foreground"
            >
              {t("detail_page")}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border" style={{ height }}>
      <div ref={hostRef} style={{ height: "100%", width: "100%" }} />
      {map && (
        <>
          {path && path.length > 1 && <RouteLine map={map} path={path} />}
          <SiteMarkers map={map} sites={sites} cluster={clustered} renderPopup={renderPopup} />
        </>
      )}
    </div>
  );
}
