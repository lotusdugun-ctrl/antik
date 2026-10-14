import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "@tanstack/react-router";
import { Check, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useReducer } from "react";
import { Photo } from "@/components/Photo";
import { coverImage, type Site } from "@/lib/sites";
import { useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";

/** Pin footprint in screen pixels; two sites closer than this would overlap. */
const CLUSTER_CELL_PX = 56;

/*
 * Icons are made once per look and kept. react-leaflet calls `setIcon` — which
 * throws the marker's DOM away and builds it again — whenever the `icon` prop
 * is a different object, so a fresh `divIcon` per render rebuilt every pin on
 * the map at each zoom, each visit ticked and each language switch.
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

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center[0], center[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
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
function useClusters(sites: Site[], enabled: boolean) {
  const map = useMap();
  const [version, bump] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!enabled) return;
    map.on("zoomend", bump);
    return () => {
      map.off("zoomend", bump);
    };
  }, [map, enabled]);

  return useMemo(() => {
    if (!enabled) return sites.map((site) => [site] as Site[]);
    const zoom = map.getZoom();
    const cells = new Map<string, Site[]>();
    for (const site of sites) {
      const point = map.project([site.lat, site.lng], zoom);
      const key = `${Math.floor(point.x / CLUSTER_CELL_PX)}:${Math.floor(point.y / CLUSTER_CELL_PX)}`;
      const bucket = cells.get(key);
      if (bucket) bucket.push(site);
      else cells.set(key, [site]);
    }
    return [...cells.values()];
    // `version` is the zoom-change signal; map identity alone never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites, enabled, map, version]);
}

/**
 * One cluster pin. Its own component so the bounds and the click handler are
 * made once per group: react-leaflet rebinds `eventHandlers` whenever it gets
 * a new object, which an inline literal is on every render.
 */
function ClusterMarker({
  group,
  allVisited,
  title,
}: {
  group: Site[];
  allVisited: boolean;
  title: string;
}) {
  const map = useMap();
  const bounds = useMemo(
    () => L.latLngBounds(group.map((s) => [s.lat, s.lng] as [number, number])),
    [group],
  );
  const centre = useMemo(() => bounds.getCenter(), [bounds]);
  const eventHandlers = useMemo(
    () => ({
      click: () =>
        // Zoom to the group. `maxZoom` stops a pile of sites that share
        // one hilltop from throwing the map to street level.
        map.flyToBounds(bounds.pad(0.25), { maxZoom: 13, duration: 0.6 }),
    }),
    [map, bounds],
  );
  return (
    <Marker
      position={centre}
      icon={clusterIcon(group.length, allVisited)}
      title={title}
      eventHandlers={eventHandlers}
    />
  );
}

function SiteMarkers({
  sites,
  cluster,
  renderPopup,
}: {
  sites: Site[];
  cluster: boolean;
  renderPopup: (site: Site) => React.ReactNode;
}) {
  const { t, L: label } = useI18n();
  const { isVisited } = useProgress();
  const groups = useClusters(sites, cluster);

  return (
    <>
      {groups.map((group) => {
        const first = group[0]!;
        if (group.length === 1) {
          return (
            <Marker
              key={first.slug}
              position={[first.lat, first.lng]}
              icon={pinIcon(isVisited(first.slug))}
              // Leaflet's markers are focusable buttons; without a title a
              // screen reader announces each of them as just "button".
              title={label(first.name)}
              alt={label(first.name)}
            >
              <Popup>{renderPopup(first)}</Popup>
            </Marker>
          );
        }

        return (
          <ClusterMarker
            key={`cluster-${first.slug}-${group.length}`}
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
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} zoom={zoom} />
        {path && path.length > 1 && (
          <Polyline
            positions={path}
            pathOptions={{ color: "oklch(0.52 0.13 45)", weight: 4, opacity: 0.85 }}
          />
        )}
        <SiteMarkers sites={sites} cluster={clustered} renderPopup={renderPopup} />
      </MapContainer>
    </div>
  );
}
