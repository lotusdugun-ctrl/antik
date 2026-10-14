import { useRef } from "react";
import { Download, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { localDate, useProgress } from "@/lib/progress";

/**
 * Export and restore, because the store is a localStorage record and nothing
 * else. Clearing site data, switching browsers or replacing a phone silently
 * ends a visit log someone may have spent years filling in, and until there is
 * an account to sync to, a file the user holds is the whole safety net.
 */
export function BackupPanel() {
  const { t } = useI18n();
  const { exportBackup, importBackup } = useProgress();
  const fileInput = useRef<HTMLInputElement>(null);

  function download() {
    const blob = new Blob([exportBackup()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `antik-turkiye-${localDate()}.json`;
    link.click();
    // Revoking straight after `click()` can cancel the download before the
    // browser has read the blob (seen in Safari and Firefox).
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function restore(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset the input so choosing the same file twice fires change again.
    event.target.value = "";
    if (!file) return;
    const ok = importBackup(await file.text());
    if (ok) toast.success(t("backup_imported"));
    else toast.error(t("backup_invalid"));
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
        <Save className="h-5 w-5 text-primary" /> {t("backup_title")}
      </h2>
      <div className="rounded-2xl surface-panel p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">{t("backup_sub")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Download className="h-4 w-4" /> {t("backup_export")}
          </button>
          <button
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold"
          >
            <Upload className="h-4 w-4" /> {t("backup_import")}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            onChange={restore}
            className="hidden"
          />
        </div>
      </div>
    </section>
  );
}
