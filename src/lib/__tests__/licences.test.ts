import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { recordedAudio, recordingFor, textHash, voiceCreditsByLang } from "@/lib/audio-manifest";
import { privacyPolicy, termsOfUse, CONTACT_EMAIL, OPERATOR } from "@/lib/legal";
import { commonsFileName, creditFor, photoCredits } from "@/lib/photo-credits";

/*
 * The app is published commercially (Google Play, Iova LTD). Every third-party
 * work it shows must carry a licence that allows that, and the credit the
 * licence asks for.
 */
const root = join(import.meta.dir, "..", "..", "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "__tests__" ? [] : sourceFiles(path);
    return /\.(ts|tsx|json)$/.test(name) && !name.startsWith("photo-credits") ? [path] : [];
  });
}

/** Free licences that allow commercial use, with attribution where they ask for it. */
const ALLOWED = /^(CC0|Public domain|CC BY(-SA)? [1-4]\.[05]( [a-z]{2})?|FAL|Attribution)$/;

describe("photographs", () => {
  test("every credit carries a commercial-use licence (no NC, ND or unknown)", () => {
    const bad = Object.entries(photoCredits).filter(
      ([, c]) => !ALLOWED.test(c.license) || /NC|ND|unknown|rights reserved/i.test(c.license),
    );
    expect(bad).toEqual([]);
    // Anything but the public domain links its licence, so the credit can name it.
    const unlinked = Object.entries(photoCredits).filter(
      ([, c]) => !/^(CC0|Public domain)$/.test(c.license) && !c.licenseUrl,
    );
    expect(unlinked).toEqual([]);
    for (const c of Object.values(photoCredits)) expect(c.author.trim().length).toBeGreaterThan(0);
  });

  test("every Commons photo anywhere in the code has a credit on file", () => {
    const uncredited: string[] = [];
    const pattern =
      /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/[^\s"'`]+/g;
    for (const file of sourceFiles(join(root, "src"))) {
      for (const url of readFileSync(file, "utf-8").match(pattern) ?? []) {
        if (!commonsFileName(url) || !creditFor(url)) uncredited.push(`${file}: ${url}`);
      }
    }
    expect(uncredited).toEqual([]);
  });

  test("every photo the <Photo> component shows is credited on its page", () => {
    // Photo registers what it shows, and the footer lists those credits.
    const photo = readFileSync(join(root, "src", "components", "Photo.tsx"), "utf-8");
    expect(photo).toContain("registerShownPhoto(src)");
    const shell = readFileSync(join(root, "src", "components", "AppShell.tsx"), "utf-8");
    expect(shell).toContain("<PageCredits />");
  });
});

describe("recorded voices", () => {
  test("only Piper recordings whose voice passed the licence gate are ever played", () => {
    for (const [lang, credit] of Object.entries(voiceCreditsByLang)) {
      expect(`${lang}:${credit!.license}`).toMatch(
        /:(Public domain \(CC0\)|CC BY 4\.0|CC BY 3\.0|MIT|Apache-2\.0)$/,
      );
      expect(credit!.card).toStartWith("https://huggingface.co/rhasspy/piper-voices/");
    }
    for (const byLang of Object.values(recordedAudio))
      for (const [lang, chapters] of Object.entries(byLang))
        for (const entry of Object.values(chapters ?? {})) {
          expect(entry.engine).toBe("piper");
          expect(entry.voice).toBe(voiceCreditsByLang[lang as "tr"]?.voice);
        }
  });

  test("an Edge-era entry (no engine) is ignored, so the device voice speaks", () => {
    const text = "Hoş geldiniz.";
    const key = "site:__edge_test__";
    (recordedAudio as Record<string, unknown>)[key] = {
      tr: { intro: { url: "/audio/x.mp3", hash: textHash(text), v: 2 } },
    };
    expect(recordingFor(key, "tr", "intro", text)).toBeUndefined();
    delete (recordedAudio as Record<string, unknown>)[key];
  });

  test("no Edge or unlicensed audio files are shipped", () => {
    const ambience = readdirSync(join(root, "public", "ambience"));
    if (ambience.includes("voices")) {
      const manifest = JSON.parse(
        readFileSync(join(root, "public", "ambience", "voices", "manifest.json"), "utf-8"),
      ) as { engine?: string; voice?: string };
      expect(manifest.engine).toBe("piper");
      expect(manifest.voice).toBe(voiceCreditsByLang.el?.voice);
    }
    // Files only: scripts/glb (the Unity export tools) is a folder.
    const scripts = readdirSync(join(root, "scripts"), { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => readFileSync(join(root, "scripts", entry.name), "utf-8"));
    for (const code of scripts)
      expect(code).not.toMatch(/import edge_tts|edge_tts\.|pip install[^\n]*edge-tts/);
  });
});

describe("ambient sound", () => {
  test("no ShareAlike or NonCommercial source is credited", () => {
    const credits = readFileSync(join(root, "public", "ambience", "CREDITS.txt"), "utf-8");
    expect(credits).not.toMatch(/BY-SA|BY-NC|0 A\.D\.|Wildfire/);
  });
});

describe("software", () => {
  test("the third-party notices name every direct dependency, and no copyleft licence", () => {
    const notices = readFileSync(join(root, "public", "third-party-notices.txt"), "utf-8");
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8")) as {
      dependencies: Record<string, string>;
    };
    for (const dep of Object.keys(pkg.dependencies)) expect(notices).toContain(`\n${dep}@`);
    expect(notices).not.toMatch(/ — (A?GPL|LGPL|SSPL)/);
  });
});

describe("privacy policy and terms", () => {
  test("exist in every language and name the operator, the contact and the AI provider", () => {
    for (const doc of [privacyPolicy, termsOfUse]) {
      for (const lang of ["tr", "en", "de", "ru"] as const) {
        const text = JSON.stringify(doc[lang]);
        expect(text).toContain(OPERATOR);
        expect(text).toContain(CONTACT_EMAIL);
        expect(text).toContain("Gemini");
      }
    }
  });
});
