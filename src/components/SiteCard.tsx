import { Link } from "@tanstack/react-router";
import { Check, Heart, MapPin, Sparkles } from "lucide-react";
import { Photo } from "@/components/Photo";
import { coverImage, type Site } from "@/lib/sites";
import { useI18n } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function SiteCard({
  site,
  distance,
  className,
}: {
  site: Site;
  distance?: number;
  className?: string;
}) {
  const { t, L } = useI18n();
  const { isVisited, isFavorite, toggleFavorite } = useProgress();
  const visited = isVisited(site.slug);

  return (
    <article
      className={cn("group relative overflow-hidden rounded-2xl surface-panel lift", className)}
    >
      <Link to="/kent/$slug" params={{ slug: site.slug }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Photo
            src={coverImage(site)}
            alt={L(site.name)}
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            fallbackWidth={330}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 hero-scrim" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {site.unesco === "listed" && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-foreground">
                {t("unesco")}
              </span>
            )}
            {site.fee === 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
                {t("free")}
              </span>
            )}
          </div>
          {visited && (
            <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-success text-success-foreground shadow-md">
              <Check className="h-4 w-4" />
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h2 className="font-display text-lg font-semibold leading-tight text-white">
              {L(site.name)}
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/90">
              <MapPin className="h-3 w-3" />
              {L(site.province)}
              {typeof distance === "number" && <span>· {distance} km</span>}
            </p>
          </div>
        </div>
        <div className="p-4">
          <p className="line-clamp-2 text-sm text-muted-foreground">{L(site.summary)}</p>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {site.civilizations.slice(0, 3).join(" · ")}
          </p>
        </div>
      </Link>
      <button
        onClick={() => toggleFavorite(site.slug)}
        aria-label={isFavorite(site.slug) ? t("favorited") : t("favorite")}
        className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border border-border bg-card/90 backdrop-blur transition-transform hover:scale-110"
      >
        <Heart
          className={cn(
            "h-4 w-4",
            isFavorite(site.slug) ? "fill-destructive text-destructive" : "text-muted-foreground",
          )}
        />
      </button>
    </article>
  );
}
