import { useRef, useState } from "react";
import { Camera, Calendar, ImageIcon, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { localDate, useProgress } from "@/lib/progress";
import { readImageFile } from "@/lib/visit-photo";

export function VisitEditor({ slug, siteName }: { slug: string; siteName: string }) {
  const { t } = useI18n();
  const { getVisit, saveVisit, removeVisit } = useProgress();
  const entry = getVisit(slug);
  const [date, setDate] = useState(entry?.date ?? localDate());
  const [note, setNote] = useState(entry?.note ?? "");
  const [photo, setPhoto] = useState(entry?.photo);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty =
    date !== (entry?.date ?? "") || note !== (entry?.note ?? "") || photo !== entry?.photo;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.message(t("visit_photo"));
      return;
    }
    readImageFile(file)
      .then((dataUrl) => setPhoto(dataUrl))
      .catch(() => toast.message(t("visit_photo")));
    e.target.value = "";
  }

  function onSave() {
    saveVisit(slug, { date, note: note.trim() || undefined, photo });
    toast.success(t("visit_saved"), { description: siteName });
  }

  return (
    <div className="rounded-2xl surface-panel p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block min-w-0 flex-1">
          <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> {t("visit_date")}
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block min-w-0 flex-1">
          <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Camera className="h-3.5 w-3.5" /> {photo ? t("visit_photo_change") : t("visit_photo")}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-medium hover:border-primary"
            >
              <ImageIcon className="h-4 w-4" />
              {photo ? t("visit_photo_change") : t("visit_photo")}
            </button>
            {photo && (
              <button
                onClick={() => setPhoto(undefined)}
                aria-label={t("visit_photo_remove")}
                className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />
          </div>
        </label>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("visit_note_placeholder")}
        rows={2}
        className="mt-3 w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {photo && <img src={photo} alt={siteName} className="h-16 w-24 rounded-lg object-cover" />}
        <div className="ml-auto flex gap-2">
          {entry && (
            <button
              onClick={() => {
                removeVisit(slug);
                setNote("");
                setPhoto(undefined);
                toast.message(t("visit_delete"));
              }}
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-destructive"
            >
              <X className="h-3.5 w-3.5" /> {t("visit_delete")}
            </button>
          )}
          <button
            onClick={onSave}
            disabled={!dirty}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" /> {t("visit_save")}
          </button>
        </div>
      </div>
    </div>
  );
}
