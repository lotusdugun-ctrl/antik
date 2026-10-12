import { Flag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { REPORT_ISSUE_URL } from "@/lib/sites";

/**
 * "This is wrong" — a prefilled issue on the public repository. It carries the
 * page and what it is about, nothing about the reader; GitHub asks them to
 * sign in, and what they write is theirs to publish.
 */
export function ReportIssue({ subject, className = "" }: { subject: string; className?: string }) {
  const { t } = useI18n();
  function href() {
    const page = typeof window === "undefined" ? "" : window.location.href;
    const params = new URLSearchParams({
      title: `${t("report_title_prefix")}: ${subject}`,
      body: `${t("report_body")}\n\n${page}\n`,
      labels: "veri-duzeltme",
    });
    return `${REPORT_ISSUE_URL}?${params.toString()}`;
  }
  return (
    <a
      href={REPORT_ISSUE_URL}
      onClick={(e) => {
        e.preventDefault();
        window.open(href(), "_blank", "noopener,noreferrer");
      }}
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline ${className}`}
    >
      <Flag className="h-3.5 w-3.5" /> {t("report_issue")}
    </a>
  );
}
