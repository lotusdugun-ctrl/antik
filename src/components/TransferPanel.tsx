import { Check, Copy, Share2, Smartphone, X } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { useProgress, type ProgressState } from "@/lib/progress";
import { decodeTransfer, encodeTransfer, TRANSFER_KEY, transferLink } from "@/lib/transfer";

/**
 * Carry progress to another phone or computer with a link or a QR code; no
 * account, no server (see `transfer.ts`). Opening such a link lands here and
 * asks before merging anything.
 */
export function TransferPanel() {
  const { t, lang } = useI18n();
  const { state, ready, mergeIn } = useProgress();
  const [link, setLink] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<ProgressState | null>(null);
  const [copied, setCopied] = useState(false);
  /** Shows the link as text, for when the QR code or the clipboard let us down. */
  const [showText, setShowText] = useState(false);

  // An arriving link: read it once the local record has loaded.
  useEffect(() => {
    if (!ready) return;
    const match = window.location.hash.match(new RegExp(`#${TRANSFER_KEY}=([^&]+)`));
    if (!match) return;
    void decodeTransfer(match[1]!).then((decoded) => {
      if (decoded) setIncoming(decoded);
      else toast.error(t("transfer_invalid"));
    });
  }, [ready, t]);

  function clearHash() {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  async function create() {
    let url: string;
    try {
      // `CompressionStream` is missing from older Safari and Firefox.
      const code = await encodeTransfer(state);
      url = transferLink(window.location.origin, code, lang);
    } catch {
      toast.error(t("transfer_failed"));
      return;
    }
    setLink(url);
    track("Transfer link");
    try {
      // Long links make dense codes; error correction "L" keeps them scannable.
      setQr(await QRCode.toDataURL(url, { errorCorrectionLevel: "L", margin: 1, width: 320 }));
    } catch {
      // A long visit log can exceed what a QR code holds. The link itself
      // still works, so offer that rather than nothing.
      setQr(null);
      setShowText(true);
      toast.message(t("transfer_qr_failed"));
    }
  }

  async function copy() {
    if (!link) return;
    try {
      // Missing on plain-http pages and refused without a recent tap.
      await navigator.clipboard.writeText(link);
    } catch {
      setShowText(true);
      toast.error(t("transfer_copy_failed"));
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (!link) return;
    if (navigator.share)
      await navigator.share({ title: t("transfer_title"), url: link }).catch(() => {});
    else await copy();
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
        <Smartphone className="h-5 w-5 text-primary" /> {t("transfer_title")}
      </h2>

      {incoming && (
        <div className="mb-4 rounded-2xl border-2 border-primary bg-card p-5">
          <p className="font-semibold">{t("transfer_arrived")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {incoming.visited.length} {t("passport_card_visited")} ·{" "}
            {Object.keys(incoming.stamps).length} {t("passport_stamps")} · {incoming.xp} XP
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                mergeIn(incoming);
                setIncoming(null);
                clearHash();
                toast.success(t("transfer_merged"));
              }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Check className="h-4 w-4" /> {t("transfer_merge")}
            </button>
            <button
              onClick={() => {
                setIncoming(null);
                clearHash();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold"
            >
              <X className="h-4 w-4" /> {t("nav_close")}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl surface-panel p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">{t("transfer_sub")}</p>
        {!link ? (
          <button
            onClick={create}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Smartphone className="h-4 w-4" /> {t("transfer_create")}
          </button>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            {qr && (
              <img
                src={qr}
                alt={t("transfer_qr_alt")}
                width={160}
                height={160}
                className="h-40 w-40 rounded-xl border border-border bg-white p-1"
              />
            )}
            <div className="min-w-0 space-y-2">
              <p className="text-xs text-muted-foreground">{t("transfer_hint")}</p>
              {showText && (
                <input
                  readOnly
                  value={link}
                  aria-label={t("transfer_title")}
                  onFocus={(e) => e.currentTarget.select()}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {t("transfer_copy")}
                </button>
                <button
                  onClick={share}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"
                >
                  <Share2 className="h-4 w-4" /> {t("transfer_share")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
