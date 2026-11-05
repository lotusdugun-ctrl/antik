import { Link } from "@tanstack/react-router";
import { Box, Lock } from "lucide-react";
import { Photo } from "@/components/Photo";
import { useI18n } from "@/lib/i18n";
import { isFreeModel, PAYWALL } from "@/lib/pass";
import { posterFor } from "@/lib/posters";
import type { Reconstruction } from "@/lib/reconstructions";
import { coverImage, getSite } from "@/lib/sites";
import { cn } from "@/lib/utils";

type Item = Pick<Reconstruction, "id" | "siteSlug" | "title" | "period">;

/** The render of a 3D building, or the site's photograph until it has one. */
export function ModelArt({
  id,
  siteSlug,
  sizes,
  className,
  eager,
}: {
  id: string;
  siteSlug: string;
  sizes: string;
  className?: string;
  eager?: boolean;
}) {
  const poster = posterFor(id);
  const site = getSite(siteSlug);
  if (poster) {
    return (
      <img
        src={poster}
        alt=""
        width={1280}
        height={800}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    );
  }
  if (!site) return <div className={cn("bg-card", className)} />;
  return (
    <Photo
      src={coverImage(site)}
      alt=""
      sizes={sizes}
      fallbackWidth={500}
      loading={eager ? "eager" : "lazy"}
      className={className ?? ""}
    />
  );
}

/** Free for everyone, or behind the Pass. The Pass label only shows once the lock is live. */
export function AccessChip({ id, className }: { id: string; className?: string }) {
  const { t } = useI18n();
  if (isFreeModel(id)) {
    return (
      <span
        className={cn(
          "inline-flex h-7 items-center rounded px-2.5 text-[13px] font-extrabold text-obsidian bg-ivory",
          className,
        )}
      >
        {t("pass_free")}
      </span>
    );
  }
  if (!PAYWALL) return null;
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded bg-primary px-2.5 text-[13px] font-extrabold text-primary-foreground",
        className,
      )}
    >
      <Lock className="h-3.5 w-3.5" strokeWidth={2.4} /> {t("pass_chip")}
    </span>
  );
}

/** A 3D building as a card: render on top, name and place below. */
export function ModelCard({ item, className }: { item: Item; className?: string }) {
  const { L } = useI18n();
  const site = getSite(item.siteSlug);
  return (
    <Link
      to="/rekonstruksiyon/$id"
      params={{ id: item.id }}
      className={cn(
        "group block overflow-hidden rounded-lg bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <ModelArt
          id={item.id}
          siteSlug={item.siteSlug}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <AccessChip id={item.id} className="absolute left-3 top-3" />
      </div>
      <div className="px-4 pb-4 pt-3.5">
        <h3 className="text-[17px] font-bold leading-tight">{L(item.title)}</h3>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          {site ? L(site.name) : item.siteSlug} · {L(item.period)}
        </p>
      </div>
    </Link>
  );
}

/** Large free card used on the home page and the 3D list. */
export function FreeModelCard({ item }: { item: Item }) {
  const { t, L } = useI18n();
  const site = getSite(item.siteSlug);
  return (
    <Link
      to="/rekonstruksiyon/$id"
      params={{ id: item.id }}
      className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-lg bg-card p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[420px] sm:p-7"
    >
      <ModelArt
        id={item.id}
        siteSlug={item.siteSlug}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/95" />
      <AccessChip id={item.id} className="absolute left-5 top-5" />
      <div className="relative">
        <h3 className="type-display text-[44px] sm:text-[60px]">{L(item.title)}</h3>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {site ? L(site.name) : item.siteSlug} · {L(item.period)}
          </span>
          <span className="inline-flex h-11 items-center gap-2 rounded-md bg-ivory px-4 text-[15px] font-bold text-obsidian">
            <Box className="h-4 w-4" /> {t("enter_3d")}
          </span>
        </div>
      </div>
    </Link>
  );
}
