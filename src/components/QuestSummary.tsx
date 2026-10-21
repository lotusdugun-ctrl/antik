import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { QUEST_EVENT, QUEST_KEY, questTotals, readQuests } from "@/lib/quests";
import { RS, fill } from "@/lib/recon-strings";

/**
 * The 3D models' discovery quests, counted on the profile page: how many are
 * done and how many models' badges are earned. Nothing until the first one.
 */
export function QuestSummary() {
  const { L } = useI18n();
  const [totals, setTotals] = useState({ quests: 0, badges: 0 });
  useEffect(() => {
    const read = () => setTotals(questTotals(readQuests()));
    read();
    const onStorage = (event: StorageEvent) => {
      if (event.key === QUEST_KEY) read();
    };
    window.addEventListener(QUEST_EVENT, read);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(QUEST_EVENT, read);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  if (totals.quests === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
        <Trophy className="h-5 w-5 text-gold" /> {L(RS.questsProfile)}
      </h2>
      <p className="rounded-2xl surface-panel p-5 text-sm" data-quest-summary>
        {fill(L(RS.questsProfileLine), { q: totals.quests, b: totals.badges })}
      </p>
    </section>
  );
}
