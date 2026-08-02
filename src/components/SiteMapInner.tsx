import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "@tanstack/react-router";
import { Check, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { coverImage, type Site } from "@/lib/sites";
import { useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";

function pinIcon(visited: boolean) {
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

export default function SiteMapInner({
  sites,
  center = [39.2, 33.5],
  zoom = 6,
  height = "70vh",
  path,
}: {
  sites: Site[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  path?: [number, number][];
}) {
  const { t, L: tr } = useI18n();
  const { isVisited, toggleVisited } = useProgress();

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
        {sites.map((site) => {
          const visited = isVisited(site.slug);
          return (
            <Marker key={site.slug} position={[site.lat, site.lng]} icon={pinIcon(visited)}>
              <Popup>
                <div className="overflow-hidden rounded-[var(--radius)]">
                  <img
                    src={coverImage(site)}
                    alt={tr(site.name)}
                    loading="lazy"
                    width={1200}
                    height={800}
                    className="h-28 w-full object-cover"
                  />
                  <div className="space-y-2 p-3">
                    <div>
                      <h4 className="font-display text-base font-semibold leading-tight">
                        {tr(site.name)}
                      </h4>
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
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
