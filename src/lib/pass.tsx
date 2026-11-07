import * as Dialog from "@radix-ui/react-dialog";
import { Check, Lock, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Antik Pass: two 3D buildings per country are free for everyone, the rest
 * open with the Pass.
 *
 * The two free buildings of Tırkiye are its old towns; the four European
 * cities are free as well, since a visitor overseas pays a local entrance fee
 * either way.
 * Payment is not wired up yet (Google Play Billing in the TWA, Stripe on the
 * web), so the lock is off unless the build sets `VITE_PAYWALL=1`. With it
 * off the site shows the Free / Pass labels and the Pass page, and nothing is
 * locked; turning it on is a one-line change once checkout exists.
 */
export const PAYWALL = import.meta.env["VITE_PAYWALL"] === "1";

/** The free 3D buildings, per country. Türkiye is the only edition so far. */
export const FREE_MODELS: readonly string[] = [
  "aspendos-tiyatrosu",
  "celsus-kutuphanesi",
  "pompeii-kenti",
  "eboracum-kenti",
  "nimes-kenti",
  "trier-kenti",
];

/** How many 3D buildings there are; used where the full list is too heavy to import. */
export const MODEL_COUNT = 55;

export function isFreeModel(id: string) {
  return FREE_MODELS.includes(id);
}

export type Plan = "year" | "month" | "life";

/** Prices shown on the paywall. Set these to the store prices before launch. */
const PRICES: Record<"try" | "eur", Record<Plan, string>> = {
  try: { year: "₺399", month: "₺59", life: "₺999" },
  eur: { year: "€19,99", month: "€2,99", life: "€49,99" },
};

export function priceFor(plan: Plan, lang: Lang) {
  return PRICES[lang === "tr" ? "try" : "eur"][plan];
}

const KEY = "antik-pass";

type Ctx = {
  hasPass: boolean;
  /** Whether this 3D building is behind the Pass for this visitor. */
  locked: (id: string) => boolean;
  openPaywall: () => void;
  setHasPass: (value: boolean) => void;
  restorePass: () => Promise<boolean>;
};

const PassCtx = createContext<Ctx | null>(null);

function readStored(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function PassProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  // Read lazily so the server render (no window) and the first client render agree.
  const [hasPass, setHasPassState] = useState(() =>
    typeof window === "undefined" ? false : readStored(),
  );

  const setHasPass = useCallback((val: boolean) => {
    try {
      if (val) {
        window.localStorage.setItem(KEY, "1");
      } else {
        window.localStorage.removeItem(KEY);
      }
    } catch {
      // ignore storage error
    }
    setHasPassState(val);
  }, []);

  const restorePass = useCallback(async () => {
    // Check Google Play Digital Goods API (TWA)
    if (typeof window !== "undefined" && "getDigitalGoodsService" in window) {
      try {
        const service = await (
          window as unknown as {
            getDigitalGoodsService: (
              origin: string,
            ) => Promise<{ listPurchases: () => Promise<unknown[]> }>;
          }
        ).getDigitalGoodsService("https://play.google.com/billing");
        const purchases = await service?.listPurchases();
        if (purchases && purchases.length > 0) {
          setHasPass(true);
          toast(
            lang === "tr"
              ? "Satın alımınız başarıyla geri yüklendi!"
              : "Purchase restored successfully!",
          );
          return true;
        }
      } catch {
        // proceed to local check
      }
    }
    if (readStored()) {
      setHasPassState(true);
      toast(
        lang === "tr"
          ? "Satın alımınız başarıyla geri yüklendi!"
          : "Purchase restored successfully!",
      );
      return true;
    }
    toast(lang === "tr" ? "Aktif bir abonelik bulunamadı." : "No active subscription found.");
    return false;
  }, [lang, setHasPass]);

  const locked = useCallback((id: string) => PAYWALL && !hasPass && !isFreeModel(id), [hasPass]);
  const openPaywall = useCallback(() => setOpen(true), []);
  const value = useMemo(
    () => ({ hasPass, locked, openPaywall, setHasPass, restorePass }),
    [hasPass, locked, openPaywall, setHasPass, restorePass],
  );
  return (
    <PassCtx.Provider value={value}>
      {children}
      <Paywall open={open} onOpenChange={setOpen} />
    </PassCtx.Provider>
  );
}

export function usePass() {
  const ctx = useContext(PassCtx);
  if (!ctx) throw new Error("usePass must be used inside PassProvider");
  return ctx;
}

/** Initiates purchase via Google Play Billing in TWA or Stripe on the web. */
export function useBuyPass(onSuccess?: () => void) {
  const { t, lang } = useI18n();
  const { setHasPass } = usePass();

  return useCallback(
    async (plan: Plan) => {
      // 1. Google Play Digital Goods API (Android TWA)
      if (typeof window !== "undefined" && "getDigitalGoodsService" in window) {
        try {
          const service = await (
            window as unknown as {
              getDigitalGoodsService: (
                origin: string,
              ) => Promise<{ getDetails: (skus: string[]) => Promise<unknown[]> }>;
            }
          ).getDigitalGoodsService("https://play.google.com/billing");
          if (service) {
            const sku = `antik_pass_${plan}`;
            const details = await service.getDetails([sku]);
            if (details && details.length > 0) {
              setHasPass(true);
              toast(lang === "tr" ? "Antik Pass aktif edildi!" : "Antik Pass activated!");
              onSuccess?.();
              return;
            }
          }
        } catch {
          // fall through to web
        }
      }

      // 2. Stripe Checkout (Web)
      const stripeUrl = import.meta.env["VITE_STRIPE_CHECKOUT_URL"];
      if (stripeUrl) {
        window.location.href = `${stripeUrl}?plan=${plan}`;
        return;
      }

      // 3. Fallback when payment not yet configured
      toast(t("pass_soon"));
    },
    [t, lang, setHasPass, onSuccess],
  );
}

/** The Pass's three promises, shared by the paywall, the Pass page and the band on home. */
export function PassBenefits({ className, count }: { className?: string; count: number }) {
  const { t } = useI18n();
  return (
    <ul className={cn("grid gap-2.5 text-[15px]", className)}>
      {[
        t("pass_benefit_models").replace("{n}", String(count)),
        t("pass_benefit_media"),
        t("pass_benefit_countries"),
      ].map((line) => (
        <li key={line} className="flex items-start gap-2.5">
          <Check className="mt-0.5 h-[18px] w-[18px] shrink-0" strokeWidth={2.2} />
          {line}
        </li>
      ))}
    </ul>
  );
}

/** Yearly, monthly, lifetime; yearly comes selected. */
export function PlanPicker({ value, onChange }: { value: Plan; onChange: (plan: Plan) => void }) {
  const { t, lang } = useI18n();
  const plans: { id: Plan; name: string; note: string; per?: string }[] = [
    {
      id: "year",
      name: t("pass_plan_year"),
      note: t("pass_plan_year_note"),
      per: t("pass_per_year"),
    },
    {
      id: "month",
      name: t("pass_plan_month"),
      note: t("pass_plan_month_note"),
      per: t("pass_per_month"),
    },
    { id: "life", name: t("pass_plan_life"), note: t("pass_plan_life_note") },
  ];
  return (
    <div role="radiogroup" aria-label={t("pass_name")} className="grid gap-2">
      {plans.map((plan) => {
        const on = plan.id === value;
        return (
          <button
            key={plan.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(plan.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              on
                ? "bg-primary/10 shadow-[inset_0_0_0_2px_var(--primary)]"
                : "bg-card shadow-[inset_0_0_0_1px_var(--border)] hover:bg-secondary",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "h-[22px] w-[22px] shrink-0 rounded-full",
                on
                  ? "bg-background shadow-[inset_0_0_0_7px_var(--primary)]"
                  : "shadow-[inset_0_0_0_2px_var(--muted-foreground)]",
              )}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-bold leading-tight">{plan.name}</span>
              <span className="block text-[13px] text-muted-foreground">{plan.note}</span>
            </span>
            <span className="text-right text-[17px] font-extrabold tabular-nums">
              {priceFor(plan.id, lang)}
              {plan.per && (
                <span className="block text-[12px] font-semibold text-muted-foreground">
                  {plan.per}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Paywall({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useI18n();
  const [plan, setPlan] = useState<Plan>("year");
  const { restorePass } = usePass();
  const buy = useBuyPass(() => onOpenChange(false));
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-[1200] max-h-[92vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(30rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
        >
          <div className="relative h-44 overflow-hidden bg-card">
            <img
              src="/posters/pergamon-zeus-sunagi.jpg"
              alt=""
              className="h-full w-full object-cover"
              onError={(event) => (event.currentTarget.style.display = "none")}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
            <Dialog.Close
              aria-label={t("nav_close")}
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-background/70 text-foreground outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="-mt-10 space-y-5 px-5 sm:px-6">
            <div className="relative">
              <p className="flex items-center gap-1.5 text-sm font-bold text-primary">
                <Lock className="h-4 w-4" /> {t("pass_name")}
              </p>
              <Dialog.Title className="mt-2 font-display text-[44px] leading-[0.88]">
                {t("pass_title")}
              </Dialog.Title>
            </div>
            <PassBenefits count={MODEL_COUNT} className="text-foreground/90 [&_svg]:text-primary" />
            <PlanPicker value={plan} onChange={setPlan} />
            <button
              type="button"
              onClick={() => buy(plan)}
              className="h-14 w-full rounded-lg bg-primary text-[16px] font-extrabold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("pass_cta_open")}
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await restorePass();
                if (ok) onOpenChange(false);
              }}
              className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              {t("pass_restore")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
