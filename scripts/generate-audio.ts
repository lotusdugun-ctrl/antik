/**
 * Render the audio guide's script to studio-quality MP3s.
 *
 *   OPENAI_API_KEY=…      bun scripts/generate-audio.ts efes aspendos
 *   ELEVENLABS_API_KEY=…  bun scripts/generate-audio.ts --all --recon
 *
 * Arguments: site slugs, `--all` for every site, `--recon` for every 3D
 * reconstruction tour, `--lang tr|en` to do one language, `--force` to redo
 * files that already exist. Files go to `public/audio/<key>/<lang>/<id>.mp3`
 * and `src/lib/audio-manifest.ts` is rewritten to point at everything on disk,
 * so the player picks them up with no other change.
 *
 * The script is the one the device voice reads — `narration.ts` — so a
 * recording never says anything the page does not.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { guideForSite } from "@/lib/guide-sources";
import type { Lang } from "@/lib/i18n";
import { reconstructionGuide, type Guide } from "@/lib/narration";
import { reconstructions } from "@/lib/reconstructions";
import { sites } from "@/lib/sites";

const args = process.argv.slice(2);
const force = args.includes("--force");
const langArg = args[args.indexOf("--lang") + 1];
const langs: Lang[] = args.includes("--lang") ? [langArg === "en" ? "en" : "tr"] : ["tr", "en"];

const guides: Guide[] = [];
const slugs = args.includes("--all")
  ? sites.map((s) => s.slug)
  : args.filter((a) => !a.startsWith("--") && a !== langArg);
for (const slug of slugs) {
  const guide = guideForSite(slug);
  if (!guide) throw new Error(`Unknown site: ${slug}`);
  guides.push(guide);
}
if (args.includes("--recon")) guides.push(...reconstructions.map(reconstructionGuide));

const openai = process.env.OPENAI_API_KEY;
const eleven = process.env.ELEVENLABS_API_KEY;

async function synthesise(text: string, lang: Lang): Promise<ArrayBuffer> {
  if (eleven) {
    // Multilingual v2 reads Turkish natively; set your own voice id if you like.
    const voice = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: { "xi-api-key": eleven, "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    return res.arrayBuffer();
  }
  if (openai) {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { authorization: `Bearer ${openai}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts",
        voice: process.env.OPENAI_TTS_VOICE ?? "alloy",
        input: text,
        instructions:
          lang === "tr"
            ? "Sıcak, sakin bir müze rehberi gibi, doğal Türkçe telaffuzla oku."
            : "Read like a warm, unhurried museum guide.",
        response_format: "mp3",
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    return res.arrayBuffer();
  }
  throw new Error("Set OPENAI_API_KEY or ELEVENLABS_API_KEY.");
}

const root = join(import.meta.dir, "..");
const folder = (key: string) => key.replace(":", "-");

for (const guide of guides) {
  for (const lang of langs) {
    const dir = join(root, "public/audio", folder(guide.key), lang);
    mkdirSync(dir, { recursive: true });
    for (const chapter of guide.chapters) {
      const file = join(dir, `${chapter.id}.mp3`);
      if (existsSync(file) && !force) continue;
      process.stdout.write(`${guide.key} ${lang} ${chapter.id}… `);
      writeFileSync(file, Buffer.from(await synthesise(chapter.text[lang], lang)));
      console.log("ok");
    }
  }
}

// Rebuild the manifest from what is on disk, so it can never point at a file
// that is not there.
const manifest: Record<string, Partial<Record<Lang, Record<string, string>>>> = {};
const audioRoot = join(root, "public/audio");
if (existsSync(audioRoot)) {
  for (const dirName of readdirSync(audioRoot).sort()) {
    const key = dirName.replace(/^(site|recon)-/, "$1:");
    for (const lang of ["tr", "en"] as const) {
      const dir = join(audioRoot, dirName, lang);
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir).sort()) {
        if (!file.endsWith(".mp3")) continue;
        ((manifest[key] ??= {})[lang] ??= {})[file.slice(0, -4)] =
          `/audio/${dirName}/${lang}/${file}`;
      }
    }
  }
}
const manifestPath = join(root, "src/lib/audio-manifest.ts");
const source = readFileSync(manifestPath, "utf8").replace(
  /export const recordedAudio: RecordedAudio = [\s\S]*?;\n/,
  `export const recordedAudio: RecordedAudio = ${JSON.stringify(manifest, null, 2)};\n`,
);
writeFileSync(manifestPath, source);
console.log(`Manifest: ${Object.keys(manifest).length} guides.`);
