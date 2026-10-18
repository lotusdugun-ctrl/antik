import { CONTACT_EMAIL, OPERATOR, type LegalDoc } from "@/lib/legal";

/** A privacy policy or terms page: headings and paragraphs, links made clickable. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{doc.title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{doc.intro}</p>
      {doc.sections.map((section) => (
        <section key={section.h} className="mt-8">
          <h2 className="font-display text-xl font-semibold">{section.h}</h2>
          {section.p.map((text) => (
            <p key={text.slice(0, 40)} className="mt-3 text-sm leading-relaxed">
              {linkify(text)}
            </p>
          ))}
        </section>
      ))}
      <p className="mt-10 border-t border-border pt-4 text-sm text-muted-foreground">
        {OPERATOR} ·{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
          {CONTACT_EMAIL}
        </a>
      </p>
    </article>
  );
}

function linkify(text: string) {
  return text.split(/(https:\/\/\S+[^\s.,;)]|[\w.+-]+@[\w-]+\.[\w.]+[a-z])/g).map((part, i) => {
    if (part.startsWith("https://"))
      return (
        <a key={i} href={part} target="_blank" rel="noreferrer" className="underline">
          {part}
        </a>
      );
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part))
      return (
        <a key={i} href={`mailto:${part}`} className="underline">
          {part}
        </a>
      );
    return part;
  });
}
