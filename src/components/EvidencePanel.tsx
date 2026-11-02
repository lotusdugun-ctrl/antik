import { BookOpenCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { evidenceFor, type Basis } from "@/lib/evidence";

const BADGE: Record<Basis, { tr: string; en: string; cls: string }> = {
  kaynak: { tr: "Kaynakta", en: "Sourced", cls: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300" },
  fotograf: { tr: "Bugünkü yapıda", en: "Seen today", cls: "bg-sky-600/15 text-sky-700 dark:text-sky-300" },
  tahmin: { tr: "Canlandırma", en: "Reconstructed", cls: "bg-amber-600/15 text-amber-700 dark:text-amber-300" },
};

/** "How do we know?": what in the HD reconstruction is sourced, seen, or our guess. */
export function EvidencePanel({ id }: { id: string }) {
  const { L, lang } = useI18n();
  const ev = evidenceFor(id);
  if (!ev) return null;
  const tr = lang === "tr";
  return (
    <details className="mt-6 rounded-2xl surface-panel p-4">
      <summary className="flex cursor-pointer items-center gap-2 font-display text-lg font-semibold">
        <BookOpenCheck className="h-5 w-5 text-primary" /> {tr ? "Bunu nereden biliyoruz?" : "How do we know?"}
      </summary>
      <ul className="mt-3 space-y-2">
        {ev.claims.map((c, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className={`h-fit shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${BADGE[c.basis].cls}`}>
              {tr ? BADGE[c.basis].tr : BADGE[c.basis].en}
            </span>
            <span>{L(c.text)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs font-semibold text-muted-foreground">{tr ? "Kaynaklar" : "Sources"}</p>
      <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
        {ev.sources.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </details>
  );
}
