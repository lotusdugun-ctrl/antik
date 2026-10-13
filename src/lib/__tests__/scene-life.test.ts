import { describe, expect, test } from "bun:test";
import { boundsOf, IDENTITIES, partsFor, type Part } from "@/lib/reconstruction-parts";
import { reconstructions } from "@/lib/reconstructions";
import { lifeFor } from "@/lib/scene-life";

/**
 * The life of a scene is illustration, not measurement — but it still has to
 * sit in the building it illustrates: nobody under the floor, nothing that
 * moves the camera, nothing that pretends to be part of the measured model.
 */

const lives = reconstructions.map((item) => ({ item, life: lifeFor(item) }));

describe("the life of each scene", () => {
  test("every reconstruction has people and at least one fire", () => {
    for (const { item, life } of lives) {
      expect(`${item.id}: ${life.people.length > 5}`).toBe(`${item.id}: true`);
      expect(`${item.id}: ${life.flames.length > 0}`).toBe(`${item.id}: true`);
    }
  });

  test("the same scene comes out the same every time", () => {
    for (const item of reconstructions) {
      expect(JSON.stringify(lifeFor(item))).toBe(JSON.stringify(lifeFor(item)));
    }
  });

  test("every prop is decor, so it never moves the camera's frame", () => {
    for (const { item, life } of lives) {
      const loose = life.props.filter((part) => !part.decor);
      expect(`${item.id}: ${loose.length}`).toBe(`${item.id}: 0`);
      // And adding them to the building leaves its bounds exactly as they were.
      const parts = partsFor(item.model);
      expect(boundsOf([...parts, ...life.props])).toEqual(boundsOf(parts));
    }
  });

  test("people are people-sized, and stand on or above the ground", () => {
    for (const { item, life } of lives) {
      for (const person of life.people) {
        expect(person.height).toBeGreaterThan(1);
        expect(person.height).toBeLessThan(1.9);
        expect(person.at[1]).toBeGreaterThanOrEqual(0);
        for (const point of person.route ?? []) expect(point[1]).toBeGreaterThanOrEqual(0);
      }
      expect(life.props.every((part) => part.at[1] >= -0.01)).toBe(true);
      void item;
    }
  });

  test("nobody wanders off: every person stays within reach of the building", () => {
    for (const { item, life } of lives) {
      const { min, max } = boundsOf(partsFor(item.model));
      const margin = 45;
      for (const person of life.people) {
        for (const p of [person.at, ...(person.route ?? [])]) {
          expect(p[0]).toBeGreaterThan(min[0] - margin);
          expect(p[0]).toBeLessThan(max[0] + margin);
          expect(p[2]).toBeGreaterThan(min[2] - margin);
          expect(p[2]).toBeLessThan(max[2] + margin);
        }
      }
    }
  });

  test("a crowd stays within what a phone can draw", () => {
    for (const { life } of lives) expect(life.crowd.length).toBeLessThan(3200);
    const theatres = lives.filter(({ item }) => item.model.kind === "roman-theatre");
    for (const { life } of theatres) expect(life.crowd.length).toBeGreaterThan(500);
  });

  test("a scene asks for only a handful of real lights", () => {
    for (const { item, life } of lives) {
      const lit = life.flames.filter((f) => f.light).length;
      expect(`${item.id}: ${lit > 0 && lit <= 8}`).toBe(`${item.id}: true`);
    }
  });

  test("the Göbeklitepe people wear hides, and Nemrut's priests Persian dress", () => {
    const gobekli = lives.find(({ item }) => item.id === "gobeklitepe-d-yapisi")!.life;
    expect(gobekli.people.every((p) => p.look.garment === "hide")).toBe(true);
    const nemrut = lives.find(({ item }) => item.id === "nemrut-dogu-terasi")!.life;
    expect(nemrut.people.filter((p) => p.look.garment === "persian").length).toBeGreaterThan(8);
  });
});

describe("the statues", () => {
  const statues = (id: string) =>
    partsFor(reconstructions.find((r) => r.id === id)!.model).filter(
      (part): part is Extract<Part, { kind: "figure" }> =>
        part.kind === "figure" && part.material !== "human",
    );

  test("each temple's cella holds its own god", () => {
    const names = (id: string) => statues(id).map((s) => s.identity?.name);
    expect(names("artemis-tapinagi")).toContain(IDENTITIES.artemisEphesia.name);
    expect(names("aizanoi-zeus-tapinagi")).toContain(IDENTITIES.zeus.name);
  });

  test("the figures between the Mausoleum's columns are not all alike", () => {
    const figures = statues("halikarnas-mozolesi");
    const kinds = new Set(figures.map((f) => JSON.stringify(f.identity)));
    expect(kinds.size).toBeGreaterThanOrEqual(6);
    const colours = new Set(figures.map((f) => JSON.stringify(f.paint)));
    expect(colours.size).toBeGreaterThanOrEqual(6);
  });

  test("the marble statues of Celsus carry their paint", () => {
    expect(statues("celsus-kutuphanesi").every((s) => s.material === "bronze" || s.paint)).toBe(
      true,
    );
  });
});
