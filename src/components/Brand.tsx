import { cn } from "@/lib/utils";

/**
 * The Antik mark: a Roman arch that is also the A of the name. Arches stand
 * in every ancient landscape the app will cover, so the mark is not tied to
 * one country.
 */
export function ArchMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={cn("shrink-0", className)}>
      <path
        fill="currentColor"
        d="M10 100V50a40 40 0 0 1 80 0v50H70V72H30v28Zm20-46h40v-4a20 20 0 0 0-40 0Z"
      />
    </svg>
  );
}

/**
 * Mark, name and edition. The edition is the country in its own language and
 * is the only part that changes between countries.
 */
export function Logo({
  edition,
  className,
  editionClassName,
}: {
  edition?: string;
  className?: string;
  editionClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-[0.3em] leading-none", className)}>
      <ArchMark className="h-[0.86em] w-auto" />
      <span className="font-display text-[1em] tracking-[0.06em]" style={{ lineHeight: 1 }}>
        ANTIK
      </span>
      {edition && (
        <span
          className={cn(
            "ml-[0.25em] self-center font-sans text-[0.42em] font-semibold normal-case tracking-[0.02em] text-muted-foreground",
            editionClassName,
          )}
        >
          {edition}
        </span>
      )}
    </span>
  );
}
