import type {
  GreatAltarSpec,
  IonicDipterosSpec,
  ModelSpec,
  NeolithicEnclosureSpec,
  PeristyleHouseSpec,
  RomanFacadeSpec,
  RomanTheatreSpec,
  StadiumSpec,
} from "@/lib/reconstructions";

/**
 * The geometry half of a reconstruction, kept deliberately free of three.js.
 *
 * A builder here turns a measured spec into a flat list of primitives — boxes,
 * tapered cylinders, annulus sectors, triangular prisms — in metres, with `y`
 * up and `at` naming the *bottom* centre of each part rather than its middle,
 * because every one of these buildings is described from the ground upwards.
 *
 * Keeping this module renderer-free is what makes a reconstruction checkable:
 * the tests can assert that the top row of a theatre lands at the radius its
 * cited diameter implies, without a canvas, a GPU or a browser anywhere in
 * sight. `Reconstruction3DInner.tsx` is then only a translator from these
 * parts into meshes.
 */

export type Vec3 = [number, number, number];

export type Material =
  | "marble"
  | "marbleWorn"
  | "limestone"
  | "stone"
  | "stoneDark"
  | "terrazzo"
  | "shadow"
  | "human"
  /** Burnt summer grass, and the thin soil it grows out of. */
  | "grass"
  | "ground"
  /*
   * Paint. A Roman marble front was not white: the panels behind the columns
   * were coloured, the mouldings picked out, the ornament gilded. The bare
   * stone everyone pictures is what eleven centuries of weather left, not what
   * was built — so a reconstruction that shows the building new has to show it
   * painted, and say that the colours come from a published reconstruction
   * rather than from surviving pigment.
   */
  | "paintRed"
  | "paintBlue"
  | "paintGold"
  | "timber"
  | "bronze";

/**
 * A photograph of the real carving, wrapped onto the surface that carried it.
 *
 * Procedural boxes and cylinders cannot cut a Gigantomachy, a Medusa or the
 * folds of a draped statue, and inventing an approximation of a famous relief
 * would be worse than leaving the stone blank. A photograph of the thing
 * itself is neither: it is the carving, on the surface it belongs to.
 *
 * Every URL here must be a freely licensed Wikimedia Commons file with an
 * entry in `photo-credits.ts` — the test suite asserts it, and the page prints
 * the credits under the model.
 */
export type Carving = {
  /** Commons thumbnail URL, pinned to a width Commons actually serves. */
  url: string;
  /** How many times it tiles across the surface. */
  repeat?: [number, number];
  /**
   * How far the carving stands out of the stone, in metres.
   *
   * The photograph doubles as a height map: a `relief` panel is a finely
   * divided surface, and every vertex on it is pushed outwards by the
   * brightness of the pixel in front of it. So the carving is not a picture of
   * depth — it is depth. It catches a raking light and throws its own shadow,
   * and turning the model shows it from the side.
   *
   * Brightness is not really height, which is why the number stays small:
   * enough for the carving to read as cut into the stone, not so much that the
   * photograph's own shadows turn into craters.
   */
  relief?: number;
  /**
   * What the photograph contributes.
   *
   * `"colour"` shows the picture itself — right for a fresco or a mosaic,
   * which *are* colour, and for a statue standing in shadow. `"depth"` throws
   * the picture away after using it as the height map, so the carving is cut
   * into the surrounding stone in the surrounding stone's own colour. A relief
   * shown in colour reads as a photograph stuck to the wall; the same relief
   * shown as depth reads as carving, because that is what it now is.
   */
  blend?: "colour" | "depth";
};

type Base = {
  material: Material;
  carving?: Carving;
  /**
   * Scenery rather than building: loose stone on the ground, and anything else
   * that sets the scene without being part of what is being reconstructed.
   *
   * `boundsOf` skips it, so the camera frames the enclosure rather than the
   * scatter of rock around it — a metre of rubble on every side pushed
   * Göbeklitepe far enough away that its carvings became invisible.
   */
  decor?: boolean;
  /**
   * How hard the weather has worked on this stone, in metres of wander.
   *
   * A block carrying a weather figure is subdivided and every vertex pushed
   * along its own normal by that much noise, so the faces bow, the arrises
   * chip, and no two stones come out alike. Limestone that has stood in the
   * open for eleven thousand years is not a box — and a ring of identical
   * boxes is the one thing that most gives a reconstruction away.
   */
  weather?: number;
};

export type Part =
  | (Base & { kind: "box"; at: Vec3; size: Vec3; rotY: number })
  | (Base & {
      kind: "cylinder";
      at: Vec3;
      radiusBottom: number;
      radiusTop: number;
      height: number;
      segments: number;
      /**
       * Tips the cylinder over after it is stood up, so its axis runs along +z
       * from `at`. A half drum laid this way is a segmental pediment.
       */
      rotX?: number;
      /** Turns it about the vertical, applied after `rotX`. */
      rotY?: number;
      /** A slice of the drum rather than the whole of it. */
      thetaStart?: number;
      thetaLength?: number;
      /**
       * Flutes cut down the shaft. A Greek column without them reads as a pipe:
       * the grooves are what break the light into vertical stripes and make a
       * 19.7 m shaft look like quarried stone.
       */
      flutes?: number;
    })
  /** An annulus sector standing on its base — seat rows, walls, floors. */
  | (Base & {
      kind: "ring";
      at: Vec3;
      inner: number;
      outer: number;
      height: number;
      thetaStart: number;
      thetaLength: number;
    })
  /**
   * A carved panel: a finely divided surface that the carving's own photograph
   * pushes into relief. Faces +z before `rotY` turns it, and `at` is the
   * bottom centre like everything else.
   */
  | (Base & {
      kind: "relief";
      at: Vec3;
      size: [number, number];
      rotY: number;
      /**
       * Tips the panel over before `rotY` turns it. `-π/2` lays it flat and
       * face up, which is what a mosaic floor is; without it a floor stands on
       * edge and disappears.
       */
      rotX?: number;
    })
  /** A triangular prism, apex centred: pediments and gable ends. */
  | (Base & { kind: "prism"; at: Vec3; size: Vec3; rotY: number })
  /** A stylised human, for scale. `at` is the ground under their feet. */
  | (Base & {
      kind: "figure";
      at: Vec3;
      height: number;
      rotY: number;
      /**
       * A beard, drawn under the jaw. `true` makes a male figure; without it a
       * bronze horseman, a marble Celsus or the Didyma Apollo would share the
       * hair-bun of the four Celsus virtues.
       */
      bearded?: boolean;
      /**
       * Standing on the ground under `at`, or astride a horse whose back is
       * at `at` — for a rider the point given is the seat, not the feet, and
       * `height` is still how tall they would stand.
       */
      pose?: "standing" | "riding";
    })
  /**
   * A silhouette cut in relief: an outline drawn in the plane of a face and
   * pushed out of it, the edges bevelled so the light catches them. `at` is
   * the point on the face the outline is drawn from, `u` across it and `v`
   * up it, and the carving stands out along local `+z` before `rotY` turns
   * that onto the face's own normal. This is what a Göbeklitepe animal is —
   * a flat raised shape with the ground chipped back around it — and what a
   * crest of mane or a fold of cloth can be cut as too.
   */
  | (Base & {
      kind: "carving";
      at: Vec3;
      outline: [number, number][];
      /** Cut-outs inside the outline: a drilled eye. */
      holes?: [number, number][][];
      /** How far the whole carving is, front to back. */
      depth: number;
      /**
       * The share of `depth` buried behind the face, so the bevel runs into
       * the stone it is cut from rather than leaving a hairline. `0.4` unless
       * said otherwise; `0.5` centres a fin in a surface.
       */
      sink?: number;
      rotY: number;
      /** Turns the outline in its own plane first: a beast leaping downwards. */
      rotZ?: number;
    })
  /**
   * A skin lofted over elliptical cross-sections along a path: the body of a
   * horse, a neck, a limb, a fold of cloth. Each section is an ellipse `rx`
   * wide across the path and `ry` tall, centred at `c` relative to `at`, and
   * the surface runs smoothly through all of them.
   */
  | (Base & {
      kind: "loft";
      at: Vec3;
      rotY: number;
      sections: LoftSection[];
    });

/** One cross-section of a loft, in metres relative to the part's `at`. */
export type LoftSection = { c: Vec3; rx: number; ry: number };

const TAU = Math.PI * 2;

/**
 * How many drums a shaft is built from. Exported because the tests count
 * columns by counting drums, and a column that quietly changed how many
 * pieces it is made of would otherwise look like a column that vanished.
 */
export const SHAFT_DRUMS = 7;

/**
 * The carvings, each a photograph of the surviving original.
 *
 * Chosen for being shot square-on: a picture taken at an angle carries its own
 * perspective into the texture and reads as a photograph stuck to a wall. That
 * ruled out several otherwise excellent photographs — the whole stage front at
 * Aspendos among them, which is why that wall is carved in geometry instead.
 */
export const CARVINGS = {
  /** A sculpted drum from the Artemision, now in the British Museum. */
  artemisionDrum: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Column_drum_from_the_temple_of_Artemis_at_Ephesus_%28British_Museum%29.jpg/1280px-Column_drum_from_the_temple_of_Artemis_at_Ephesus_%28British_Museum%29.jpg",
    relief: 0.16,
    blend: "depth" as const,
  },
  /** The Gigantomachy frieze, as re-erected in the Pergamonmuseum. */
  gigantomachy: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Pergamonmuseum_-_Antikensammlung_-_Pergamonaltar_31.JPG/1280px-Pergamonmuseum_-_Antikensammlung_-_Pergamonaltar_31.JPG",
    repeat: [3, 1] as [number, number],
    // High relief: the giants come almost fully out of the ground behind them.
    relief: 0.3,
    blend: "depth" as const,
  },
  /** The Medusa head from the frieze of the temple at Didyma. */
  medusa: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/A_stone-carved_Medusa_head%2C_Apollo_Temple%2C_Didyma.jpg/1280px-A_stone-carved_Medusa_head%2C_Apollo_Temple%2C_Didyma.jpg",
    relief: 0.28,
    blend: "depth" as const,
  },
  /** Animals carved on a pillar at Göbeklitepe. */
  gobekliReliefs: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Animal_hunting_scene._Gobekli_Tepe.jpg/1280px-Animal_hunting_scene._Gobekli_Tepe.jpg",
    // Low relief, chipped a few centimetres into limestone with flint.
    relief: 0.09,
    blend: "depth" as const,
  },
  /**
   * A row of animals cut across the face of a pillar in Enclosure C — the
   * clearest square-on photograph of Göbeklitepe carving there is.
   */
  gobekliPillarFace: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/G%C3%B6beklitepe_Building_C_3143.jpg/1280px-G%C3%B6beklitepe_Building_C_3143.jpg",
    relief: 0.085,
    blend: "depth" as const,
  },
  /** A single beast, with the drilled hole beside it, on another C pillar. */
  gobekliBeast: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/G%C3%B6beklitepe_Building_C_3145.jpg/1280px-G%C3%B6beklitepe_Building_C_3145.jpg",
    relief: 0.08,
    blend: "depth" as const,
  },
  /**
   * A wall painting from the House of the Muses at Ephesus. Paint, not
   * carving: it lies flat on the plaster, so it takes no relief at all.
   */
  terraceFresco: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Ephesus_Terrace_Houses_fresco_in_house_with_muses_in_2015_2718.jpg/1280px-Ephesus_Terrace_Houses_fresco_in_house_with_muses_in_2015_2718.jpg",
  },
  /** The geometric mosaic of a terrace house floor. */
  terraceMosaic: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Ephesus_Terrace_Houses_Geometric_mosaic_in_2015_2743.jpg/1280px-Ephesus_Terrace_Houses_Geometric_mosaic_in_2015_2743.jpg",
    repeat: [2, 2] as [number, number],
    // Tesserae sit slightly unevenly, which is what a mosaic floor feels like.
    relief: 0.014,
  },
  /** Dionysus, in mosaic, on the floor of the reception room. */
  terraceDionysus: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Ephesus_Terrace_Houses_Dionysus_mosaic_in_2015_2730.jpg/1280px-Ephesus_Terrace_Houses_Dionysus_mosaic_in_2015_2730.jpg",
    relief: 0.014,
  },
} satisfies Record<string, Carving>;

const box = (material: Material, at: Vec3, size: Vec3, rotY = 0, carving?: Carving): Part => ({
  kind: "box",
  material,
  at,
  size,
  rotY,
  ...(carving ? { carving } : {}),
});

const cyl = (
  material: Material,
  at: Vec3,
  radiusBottom: number,
  radiusTop: number,
  height: number,
  segments = 24,
  extra: {
    rotX?: number;
    rotY?: number;
    thetaStart?: number;
    thetaLength?: number;
    flutes?: number;
  } = {},
): Part => ({
  kind: "cylinder",
  material,
  at,
  radiusBottom,
  radiusTop,
  height,
  segments,
  ...extra,
});

/**
 * The round-topped pediment that alternates with the triangular one along a
 * Roman façade: a drum laid on its side, sunk into the cornice so that only a
 * shallow arc shows. A full half-circle sitting on top reads as a dome, which
 * is what the first attempt at the Celsus front looked like.
 */
const segmentalPediment = (material: Material, at: Vec3, radius: number, depth: number): Part =>
  cyl(material, [at[0], at[1] - radius * 0.62, at[2]], radius, radius, depth, 26, {
    rotX: Math.PI / 2,
    thetaStart: Math.PI / 2,
    thetaLength: Math.PI,
  });

const ring = (
  material: Material,
  y: number,
  inner: number,
  outer: number,
  height: number,
  thetaStart = 0,
  thetaLength = TAU,
  centre: [number, number] = [0, 0],
): Part => ({
  kind: "ring",
  material,
  at: [centre[0], y, centre[1]],
  inner,
  outer,
  height,
  thetaStart,
  thetaLength,
});

const prism = (material: Material, at: Vec3, size: Vec3, rotY = 0): Part => ({
  kind: "prism",
  material,
  at,
  size,
  rotY,
});

/** The same stone, but weathered: hand it a part, get an eroded one back. */
const worn = <T extends Part>(part: T, metres: number): T => ({ ...part, weather: metres });

/** Scenery: in the picture, but not part of what is being reconstructed. */
const scenery = <T extends Part>(part: T): T => ({ ...part, decor: true });

/**
 * The place a building stands in.
 *
 * Every one of these sites is somewhere: a limestone plateau above the Harran
 * plain, a silted Aegean river mouth, a hillside over the Pamphylian coast.
 * Without any of that a reconstruction is an object on a turntable, and the
 * mind reads it as a model rather than as a building — the scale stops meaning
 * anything the moment there is nothing beside it that has a known size.
 *
 * All of it is `scenery`, so it never enters the bounding box: the camera goes
 * on framing the building, and the county behind it is just there.
 *
 * `character` is what makes one site not look like another. Stone is how much
 * rock breaks the surface, grass how much survives the summer, and hills how
 * near the skyline closes in — `0` for a coastal plain that runs to the sea.
 */
function setting(
  radius: number,
  seed: number,
  character: { stone?: number; grass?: number; hills?: number; ground?: Material } = {},
): Part[] {
  const parts: Part[] = [];
  const random = seeded(seed);
  const stone = character.stone ?? 1;
  const grass = character.grass ?? 1;
  const hills = character.hills ?? 1;
  const bed = character.ground ?? "limestone";

  parts.push(
    ...rubble(
      bed,
      Math.round(46 * stone),
      radius * 1.05,
      radius * 1.9,
      seed + 7,
      0.9 * (radius / 15) ** 0.4,
    ).map(scenery),
  );

  // Bedrock breaking the surface, in long low slabs rather than boulders.
  for (let i = 0; i < Math.round(26 * stone); i += 1) {
    const theta = random() * TAU;
    const r = radius * (1.15 + random() * 1.5);
    const scale = (radius / 15) ** 0.5;
    parts.push(
      scenery(
        worn(
          box(
            bed,
            [Math.cos(theta) * r, -0.12, Math.sin(theta) * r],
            [
              (1.6 + random() * 4.5) * scale,
              (0.3 + random() * 0.34) * scale,
              (1.2 + random() * 3) * scale,
            ],
            random() * TAU,
          ),
          0.12 * scale,
        ),
      ),
    );
  }

  // Dry grass, in the clumps it grows in on thin soil.
  for (let i = 0; i < Math.round(260 * grass); i += 1) {
    const theta = random() * TAU;
    const r = radius * (1.02 + random() * 2.1);
    const blades = 3 + Math.floor(random() * 4);
    for (let b = 0; b < blades; b += 1) {
      parts.push(
        scenery(
          box(
            "grass",
            [
              Math.cos(theta) * r + (random() - 0.5) * 0.45,
              -0.02,
              Math.sin(theta) * r + (random() - 0.5) * 0.45,
            ],
            [0.035, 0.2 + random() * 0.3, 0.035],
            random() * TAU,
          ),
        ),
      );
    }
  }

  // The ridges on the skyline, far enough out to read as distance.
  if (hills > 0) {
    for (let i = 0; i < 22; i += 1) {
      const theta = (TAU * i) / 22 + (random() - 0.5) * 0.2;
      const r = radius * (7 + random() * 4) * (1 / hills);
      parts.push(
        scenery(
          worn(
            cyl(
              "ground",
              [Math.cos(theta) * r, -6 * hills, Math.sin(theta) * r],
              radius * (1.6 + random() * 1.4),
              radius * (0.8 + random() * 0.9),
              (8 + random() * 9) * hills,
              9,
            ),
            1.4,
          ),
        ),
      );
    }
  }

  return parts;
}

/** A panel of carving, standing proud of the surface behind it. */
const relief = (
  material: Material,
  at: Vec3,
  size: [number, number],
  carving: Carving,
  rotY = 0,
  rotX?: number,
): Part => ({ kind: "relief", material, at, size, rotY, carving, ...(rotX ? { rotX } : {}) });

/** A mosaic floor: a panel laid flat, its near edge at `at`, running back. */
const floorPanel = (material: Material, at: Vec3, size: [number, number], carving: Carving): Part =>
  relief(material, at, size, carving, 0, -Math.PI / 2);

const person = (
  at: Vec3,
  height = 1.75,
  rotY = 0,
  material: Material = "human",
  bearded?: boolean,
): Part => ({
  kind: "figure",
  material,
  at,
  height,
  rotY,
  ...(bearded !== undefined ? { bearded } : {}),
});

/** A lofted skin: see the `loft` part kind. */
const loft = (material: Material, at: Vec3, rotY: number, sections: LoftSection[]): Part => ({
  kind: "loft",
  material,
  at,
  rotY,
  sections,
});

/**
 * A point given in a figure's own frame, turned by `rotY` and moved to `at` —
 * the same turn three.js applies, so a rider computed here sits where the
 * horse's own parts end up.
 */
const placed = (at: Vec3, rotY: number, local: Vec3): Vec3 => [
  at[0] + local[0] * Math.cos(rotY) + local[2] * Math.sin(rotY),
  at[1] + local[1],
  at[2] - local[0] * Math.sin(rotY) + local[2] * Math.cos(rotY),
];

/**
 * A repeatable pseudo-random source.
 *
 * Fallen blocks scattered by `Math.random()` would move every time the page
 * rendered, and no test could ever pin them down. Seeded, a ruin lands its
 * rubble in the same place forever.
 */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Blocks fallen off the building, strewn in a band around it.
 *
 * Kept inside the model's own footprint on purpose: anything further out
 * enlarges the bounding box, and the camera then frames the rubble instead of
 * the building.
 */
function rubble(
  material: Material,
  count: number,
  innerRadius: number,
  outerRadius: number,
  seed: number,
  scale = 1,
): Part[] {
  const random = seeded(seed);
  const parts: Part[] = [];
  for (let i = 0; i < count; i += 1) {
    const theta = random() * TAU;
    const r = innerRadius + random() * (outerRadius - innerRadius);
    const w = (0.5 + random() * 1.1) * scale;
    const h = (0.25 + random() * 0.5) * scale;
    const d = (0.4 + random() * 0.9) * scale;
    parts.push({
      ...(box(
        random() > 0.55 ? "marbleWorn" : material,
        [Math.cos(theta) * r, -0.05, Math.sin(theta) * r],
        [w, h, d],
        random() * TAU,
      ) as Extract<Part, { kind: "box" }>),
      decor: true,
    });
  }
  return parts;
}

/**
 * A classical column, from the moulded base up to the abacus.
 *
 * `order` decides what sits on top: an Ionic capital gets the pair of volutes
 * that name it — modelled as two drums laid on their sides, which is what a
 * volute is before the carver spirals it.
 */
function column(
  material: Material,
  at: Vec3,
  diameter: number,
  height: number,
  order: "ionic" | "composite" | "plain" = "ionic",
  /**
   * Flutes, or `0` for a smooth shaft. Roman imperial marble columns — the
   * Celsus façade, the stage front at Aspendos — are monolithic and polished,
   * not fluted, and giving them grooves makes them read as Greek.
   */
  fluting?: number,
): Part[] {
  const parts: Part[] = [];
  const [x, y, z] = at;
  const radius = diameter / 2;
  const baseHeight = height * 0.035;
  const capitalHeight = height * 0.055;
  const shaft = height - baseHeight - capitalHeight;
  const flutes = fluting ?? (diameter > 1.2 ? 24 : 20);

  // Base: a plinth and the torus above it.
  parts.push(box(material, [x, y, z], [diameter * 1.25, baseHeight * 0.45, diameter * 1.25]));
  parts.push(
    cyl(
      material,
      [x, y + baseHeight * 0.45, z],
      radius * 1.16,
      radius * 1.04,
      baseHeight * 0.55,
      20,
    ),
  );

  /*
   * The shaft, built as the drums it was actually built from.
   *
   * Two things come of that. One is entasis: the profile is not a straight
   * cone but swells a little around the lower third, the correction Greek
   * masons cut so a tall shaft would not look pinched — a single tapered
   * cylinder reads as a factory-made tube. The other is the joints between
   * drums, which catch the light as faint rings all the way up.
   */
  const drums = SHAFT_DRUMS;
  const segments = flutes ? flutes * 2 : 28;
  const profile = (t: number) => {
    const taper = 1 - 0.18 * t;
    const swell = 1 + 0.022 * Math.sin(Math.PI * Math.min(1, t * 1.15));
    return radius * taper * swell;
  };
  for (let i = 0; i < drums; i += 1) {
    const from = i / drums;
    const to = (i + 1) / drums;
    parts.push(
      cyl(
        material,
        [x, y + baseHeight + shaft * from, z],
        profile(from),
        profile(to),
        (shaft / drums) * 0.985,
        segments,
        flutes ? { flutes } : {},
      ),
    );
  }

  const capitalBase = y + baseHeight + shaft;
  if (order === "plain") {
    parts.push(box(material, [x, capitalBase, z], [diameter * 1.2, capitalHeight, diameter * 1.2]));
    return parts;
  }

  // The echinus the capital sits on, and then the capital itself.
  parts.push(
    cyl(material, [x, capitalBase, z], radius * 0.82, radius * 0.95, capitalHeight * 0.4, 20),
  );
  if (order === "ionic") {
    /*
     * The volutes, wound rather than stamped: each is four drums of shrinking
     * radius stepped along a spiral, so the scroll actually curls inwards and
     * the eye at its centre sits proud of the coil around it. One flat drum
     * per side reads as a bolt head.
     */
    const volute = radius * 0.62;
    const turns = 4;
    for (const side of [-1, 1]) {
      for (let i = 0; i < turns; i += 1) {
        const t = i / turns;
        const coil = volute * (1 - t * 0.62);
        const angle = t * Math.PI * 1.5;
        parts.push(
          cyl(
            material,
            [
              x + side * radius * 0.86 + Math.cos(angle) * volute * 0.24 * t,
              capitalBase + capitalHeight * 0.4 + volute - Math.sin(angle) * volute * 0.24 * t,
              z - volute * (1 - t * 0.16),
            ],
            coil,
            coil,
            volute * (2 - t * 0.9),
            14,
            { rotX: Math.PI / 2 },
          ),
        );
      }
    }
    parts.push(
      box(
        material,
        [x, capitalBase + capitalHeight * 0.4, z],
        [diameter * 1.9, capitalHeight * 0.35, diameter * 0.85],
      ),
    );
  } else {
    /*
     * A composite capital: the bell, two ranks of acanthus leaves round it,
     * and a volute at each corner. Eight leaves below and eight above, the
     * upper rank set half a leaf across from the lower — which is how the
     * carving reads from the ground, as a basket of foliage rather than a
     * moulding.
     */
    const bell = capitalHeight * 0.72;
    parts.push(
      cyl(
        material,
        [x, capitalBase + capitalHeight * 0.28, z],
        radius * 0.92,
        radius * 1.1,
        bell,
        16,
      ),
    );
    /*
     * The leaves themselves, as leaves rather than as blocks: each one a
     * tapering form tipped outwards from the bell, so it comes to a point away
     * from the stone and throws a shadow underneath. Upright boxes read as a
     * row of teeth; acanthus curls away from what it grows on.
     */
    for (const rank of [0, 1]) {
      const leaves = 8;
      const lift = capitalHeight * (0.22 + rank * 0.3);
      const leafLength = capitalHeight * (0.46 + rank * 0.06);
      const lean = rank === 0 ? 0.62 : 0.86;
      const r = radius * (0.82 + rank * 0.1);
      for (let i = 0; i < leaves; i += 1) {
        const theta = (TAU * (i + rank * 0.5)) / leaves;
        parts.push(
          cyl(
            material,
            [x + Math.cos(theta) * r, capitalBase + lift, z + Math.sin(theta) * r],
            radius * 0.2,
            radius * 0.05,
            leafLength,
            5,
            // `rotX` tips the leaf away from vertical, `rotY` aims that tilt
            // outwards along the radius it grows on.
            { rotX: lean, rotY: Math.PI / 2 - theta },
          ),
        );
      }
    }
    // The four corner volutes, each a small drum turned to lie along the face.
    const volute = radius * 0.4;
    for (let i = 0; i < 4; i += 1) {
      const theta = Math.PI / 4 + (TAU * i) / 4;
      const r = radius * 1.18;
      parts.push(
        cyl(
          material,
          [
            x + Math.cos(theta) * r,
            capitalBase + capitalHeight * 0.86 - volute,
            z + Math.sin(theta) * r,
          ],
          volute,
          volute * 0.86,
          volute * 1.5,
          12,
          { rotX: Math.PI / 2, rotY: -theta },
        ),
      );
    }
  }
  parts.push(
    box(
      material,
      [x, capitalBase + capitalHeight - capitalHeight * 0.25, z],
      [diameter * 1.55, capitalHeight * 0.25, diameter * 1.55],
    ),
  );
  return parts;
}

/**
 * A cornice: three stepped courses rather than one slab, because the shadow
 * line a cornice throws is the whole reason it projects.
 */
function cornice(
  material: Material,
  at: Vec3,
  width: number,
  depth: number,
  height: number,
): Part[] {
  const [x, y, z] = at;
  const course = height / 3;
  return [
    box(material, [x, y, z], [width, course, depth]),
    box(material, [x, y + course, z], [width * 1.02, course, depth * 1.08]),
    box(material, [x, y + course * 2, z], [width * 1.05, course, depth * 1.16]),
  ];
}

/* ------------------------------------------------------------------ *
 * Low-relief figures cut into a standing face
 * ------------------------------------------------------------------ */

/**
 * The animals of the Göbeklitepe pillars, each traced from photographs of the
 * carving it stands for and cut as a silhouette a few centimetres proud of
 * the stone — which is exactly what the originals are: flat raised outlines,
 * the ground chipped back around them with flint, a drilled eye, the legs
 * split by a groove.
 *
 * Outlines are drawn in a unit frame, the animal about one unit long with
 * its feet on `v = 0`, facing `-u`. `animalCarving` scales them into metres.
 * Traced from: the fox on the flank of Pillar 18 and the fox of Pillar 10;
 * the boar of Pillar 12; the aurochs, fox and crane stacked on Pillar 2;
 * the vulture, scorpion and cranes of Pillar 43 (the "Vulture Stone"); the
 * snakes of Pillar 1; the gazelles of Enclosure C; the H-sign that recurs on
 * the central pillars of Enclosure D.
 */
export type Animal =
  "fox" | "boar" | "aurochs" | "vulture" | "crane" | "snake" | "scorpion" | "symbol" | "gazelle";

type Outline = [number, number][];

/** A snake sliding down the face: a tapering wave with a spade of a head. */
function snakeOutline(): Outline {
  const left: Outline = [];
  const right: Outline = [];
  const steps = 22;
  for (let i = 0; i <= steps; i += 1) {
    const v = 0.08 + (i / steps) * 0.78;
    const t = i / steps;
    const centre = Math.sin(t * Math.PI * 2.4 + 0.6) * 0.14;
    // Thick behind the head, thinning to a tail at the bottom.
    const half = 0.025 + t * 0.045;
    left.push([centre - half, v]);
    right.push([centre + half, v]);
  }
  const top = right[right.length - 1]!;
  const head: Outline = [
    [top[0] + 0.02, top[1] + 0.02],
    [top[0] + 0.09, top[1] + 0.1],
    [top[0] + 0.02, top[1] + 0.2],
    [top[0] - 0.11, top[1] + 0.2],
    [top[0] - 0.17, top[1] + 0.1],
    [top[0] - 0.1, top[1] + 0.02],
  ];
  return [...right, ...head, ...left.reverse()];
}

/**
 * Every outline runs once round the figure without crossing itself; a
 * silhouette that folds back over its own edge will not extrude.
 */
// prettier-ignore
export const ANIMAL_SHAPES: Record<Animal, { outline: Outline; eye?: [number, number, number] }> =
  {
    fox: {
      outline: [
        [-0.5, 0.42], [-0.44, 0.47], [-0.36, 0.52], [-0.33, 0.62], [-0.3, 0.72], [-0.26, 0.6],
        [-0.18, 0.59], [0.0, 0.61], [0.18, 0.59], [0.3, 0.55], [0.4, 0.6], [0.52, 0.52],
        [0.5, 0.43], [0.4, 0.44], [0.34, 0.37], [0.37, 0.02], [0.3, 0.02], [0.29, 0.18],
        [0.27, 0.02], [0.2, 0.02], [0.2, 0.31], [0.1, 0.34], [-0.02, 0.34], [-0.06, 0.3],
        [-0.04, 0.02], [-0.11, 0.02], [-0.12, 0.18], [-0.14, 0.02], [-0.21, 0.02], [-0.2, 0.31],
        [-0.28, 0.38], [-0.36, 0.4], [-0.46, 0.38],
      ],
      eye: [-0.38, 0.5, 0.022],
    },
    boar: {
      outline: [
        [-0.5, 0.3], [-0.48, 0.38], [-0.4, 0.46], [-0.3, 0.56], [-0.26, 0.66], [-0.22, 0.57],
        [-0.12, 0.63], [0.05, 0.65], [0.22, 0.61], [0.36, 0.53], [0.44, 0.46], [0.46, 0.36],
        [0.41, 0.34], [0.37, 0.3], [0.39, 0.02], [0.32, 0.02], [0.31, 0.14], [0.29, 0.02],
        [0.22, 0.02], [0.21, 0.24], [0.05, 0.22], [-0.08, 0.22], [-0.12, 0.24], [-0.1, 0.02],
        [-0.17, 0.02], [-0.18, 0.14], [-0.2, 0.02], [-0.27, 0.02], [-0.26, 0.26], [-0.34, 0.3],
        [-0.42, 0.26], [-0.46, 0.2], [-0.48, 0.26],
      ],
      eye: [-0.4, 0.42, 0.022],
    },
    aurochs: {
      outline: [
        [-0.5, 0.4], [-0.5, 0.48], [-0.44, 0.56], [-0.42, 0.6], [-0.48, 0.72], [-0.42, 0.82],
        [-0.4, 0.7], [-0.36, 0.62], [-0.32, 0.7], [-0.28, 0.82], [-0.24, 0.7], [-0.26, 0.6],
        [-0.14, 0.64], [0.0, 0.68], [0.18, 0.64], [0.32, 0.6], [0.42, 0.58], [0.44, 0.2],
        [0.4, 0.2], [0.39, 0.5], [0.36, 0.36], [0.37, 0.02], [0.3, 0.02], [0.29, 0.16],
        [0.27, 0.02], [0.2, 0.02], [0.2, 0.32], [0.06, 0.3], [-0.08, 0.3], [-0.14, 0.32],
        [-0.12, 0.02], [-0.19, 0.02], [-0.2, 0.16], [-0.22, 0.02], [-0.29, 0.02], [-0.28, 0.32],
        [-0.38, 0.36], [-0.46, 0.36],
      ],
      eye: [-0.42, 0.52, 0.022],
    },
    vulture: {
      outline: [
        [-0.3, 0.72], [-0.34, 0.66], [-0.26, 0.64], [-0.22, 0.58], [-0.22, 0.44], [-0.2, 0.3],
        [-0.12, 0.24], [-0.12, 0.02], [-0.06, 0.02], [-0.06, 0.22], [0.04, 0.22], [0.04, 0.02],
        [0.1, 0.02], [0.1, 0.24], [0.16, 0.22], [0.26, 0.26], [0.24, 0.36], [0.3, 0.44],
        [0.44, 0.62], [0.5, 0.8], [0.46, 0.82], [0.4, 0.7], [0.38, 0.84], [0.34, 0.72],
        [0.32, 0.86], [0.28, 0.74], [0.24, 0.8], [0.2, 0.66], [0.12, 0.66], [0.02, 0.7],
        [-0.02, 0.86], [-0.06, 0.74], [-0.08, 0.88], [-0.12, 0.76], [-0.14, 0.86], [-0.18, 0.72],
        [-0.2, 0.78], [-0.22, 0.8], [-0.28, 0.8],
      ],
      eye: [-0.27, 0.73, 0.016],
    },
    crane: {
      outline: [
        [-0.4, 0.86], [-0.36, 0.9], [-0.26, 0.9], [-0.22, 0.84], [-0.18, 0.7], [-0.14, 0.6],
        [0.0, 0.62], [0.16, 0.58], [0.3, 0.52], [0.34, 0.44], [0.24, 0.4], [0.12, 0.34],
        [0.06, 0.32], [0.07, 0.02], [0.02, 0.02], [0.01, 0.3], [-0.04, 0.3], [-0.03, 0.02],
        [-0.08, 0.02], [-0.09, 0.32], [-0.14, 0.38], [-0.18, 0.48], [-0.22, 0.6], [-0.26, 0.72],
        [-0.3, 0.8], [-0.4, 0.83],
      ],
      eye: [-0.29, 0.86, 0.014],
    },
    snake: { outline: snakeOutline() },
    scorpion: {
      outline: [
        // Claws raised at the top, a segmented tail curling up on the right.
        [-0.34, 0.86], [-0.24, 0.9], [-0.2, 0.82], [-0.26, 0.78], [-0.16, 0.74], [-0.06, 0.76],
        [0.02, 0.82], [0.08, 0.92], [0.14, 0.86], [0.1, 0.76], [0.14, 0.66], [0.26, 0.6],
        [0.36, 0.5], [0.4, 0.36], [0.36, 0.22], [0.42, 0.14], [0.36, 0.08], [0.3, 0.18],
        [0.32, 0.34], [0.26, 0.46], [0.16, 0.52], [0.12, 0.44], [0.24, 0.38], [0.26, 0.32],
        [0.14, 0.36], [0.1, 0.3], [0.22, 0.24], [0.24, 0.18], [0.1, 0.22], [0.04, 0.2],
        [0.04, 0.02], [-0.02, 0.02], [-0.02, 0.2], [-0.1, 0.22], [-0.22, 0.18], [-0.2, 0.24],
        [-0.08, 0.3], [-0.12, 0.36], [-0.24, 0.32], [-0.22, 0.38], [-0.1, 0.44], [-0.14, 0.52],
        [-0.24, 0.5], [-0.24, 0.56], [-0.14, 0.6], [-0.2, 0.68], [-0.3, 0.72], [-0.38, 0.8],
      ],
    },
    symbol: {
      outline: [
        [-0.3, 0.0], [-0.3, 0.9], [-0.14, 0.9], [-0.14, 0.52], [0.14, 0.52], [0.14, 0.9],
        [0.3, 0.9], [0.3, 0.0], [0.14, 0.0], [0.14, 0.38], [-0.14, 0.38], [-0.14, 0.0],
      ],
    },
    gazelle: {
      outline: [
        [-0.44, 0.62], [-0.42, 0.68], [-0.36, 0.72], [-0.34, 0.74], [-0.28, 0.9], [-0.26, 0.92],
        [-0.3, 0.76], [-0.32, 0.74], [-0.22, 0.66], [-0.12, 0.6], [0.04, 0.6], [0.2, 0.58],
        [0.3, 0.54], [0.36, 0.5], [0.36, 0.42], [0.32, 0.44], [0.3, 0.36], [0.33, 0.02],
        [0.28, 0.02], [0.26, 0.22], [0.24, 0.02], [0.19, 0.02], [0.2, 0.34], [0.08, 0.36],
        [-0.06, 0.36], [-0.1, 0.36], [-0.08, 0.02], [-0.13, 0.02], [-0.14, 0.22], [-0.16, 0.02],
        [-0.21, 0.02], [-0.2, 0.36], [-0.26, 0.44], [-0.3, 0.56], [-0.38, 0.6],
      ],
      eye: [-0.38, 0.66, 0.018],
    },
  };

/** A small drilled circle, the way the carvers made an eye. */
function eyeHole(centre: [number, number], radius: number): Outline {
  const points: Outline = [];
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * TAU;
    points.push([centre[0] + Math.cos(a) * radius, centre[1] + Math.sin(a) * radius]);
  }
  return points;
}

/**
 * One animal, about `scale` metres long, on the plane through `base` whose
 * outward normal is `out`. Cut in the pillar's own limestone so it reads as
 * carved out of the stone rather than stuck onto it; each one is a few
 * degrees off level and a little different in size, the way hand-cut ones
 * are. `flip` turns the animal to face the other way, and `tilt` tips it over
 * in the face — the Pillar 18 fox is cut leaping head-first down the flank.
 */
function animalCarving(
  animal: Animal,
  base: Vec3,
  out: [number, number],
  seed: number,
  scale = 1,
  options: { flip?: boolean; tilt?: number } = {},
): Part[] {
  const shape = ANIMAL_SHAPES[animal];
  const random = seeded(seed);
  const size = scale * (0.92 + random() * 0.16);
  const mirror = options.flip ? -1 : 1;
  const lean = (random() - 0.5) * 0.08 + (options.tilt ?? 0);
  const scaled = (points: Outline): Outline =>
    points.map(([u, v]) => [u * size * mirror, v * size]);
  return [
    {
      kind: "carving",
      material: "limestone",
      at: base,
      outline: scaled(shape.outline),
      ...(shape.eye
        ? { holes: [scaled(eyeHole([shape.eye[0], shape.eye[1]], shape.eye[2]))] }
        : {}),
      // Flint chipped the ground back this far around the animal; a little
      // of the depth is sunk so the bevel runs into the bowed, weathered face.
      depth: 0.075,
      rotY: Math.atan2(out[0], out[1]),
      ...(lean ? { rotZ: lean } : {}),
    },
  ];
}

/* ------------------------------------------------------------------ *
 * A bronze horse and rider
 * ------------------------------------------------------------------ */

/**
 * A horse, built the way a sculptor builds one: as a skin lofted over the
 * animal's cross-sections. Rump, loin, barrel, girth and chest; a neck that
 * rises and thins to the poll; a head that tapers to the muzzle with pricked
 * ears; four legs with the joints a horse has — stifle, hock and fetlock
 * behind, elbow, knee and fetlock in front — and a tail falling from the
 * dock. The proportions are those of the Capitoline Marcus Aurelius, the one
 * Roman bronze horseman that survives whole: withers at about 1.5 m, the body
 * as long as it is tall, the near foreleg raised with the hoof hanging.
 *
 * The horse stands at `at` facing `-z` before `rotY` turns it, one unit of
 * `scale` being a life-sized animal. The mane is a serrated crest cut along
 * the neck; the rider is a bearded figure astride, arm out in address.
 */
function bronzeHorseman(at: Vec3, rotY: number, scale = 1.1, raised: -1 | 1 = -1): Part[] {
  const parts: Part[] = [];
  const S = (c: Vec3, rx: number, ry: number): LoftSection => ({
    c: [c[0] * scale, c[1] * scale, c[2] * scale],
    rx: rx * scale,
    ry: ry * scale,
  });
  const skin = (sections: LoftSection[]) => parts.push(loft("bronze", at, rotY, sections));

  // The body, from the tail root forward to the breast.
  skin([
    S([0, 1.06, 0.82], 0.1, 0.13),
    S([0, 1.06, 0.62], 0.25, 0.28),
    S([0, 1.04, 0.32], 0.3, 0.34),
    S([0, 1.01, 0.0], 0.31, 0.37),
    S([0, 1.02, -0.36], 0.3, 0.37),
    S([0, 1.07, -0.66], 0.25, 0.33),
    S([0, 1.12, -0.86], 0.17, 0.24),
    S([0, 1.14, -0.96], 0.08, 0.12),
  ]);
  // The neck, carried up from the withers to the poll.
  skin([
    S([0, 1.18, -0.6], 0.2, 0.3),
    S([0, 1.4, -0.86], 0.18, 0.3),
    S([0, 1.64, -1.08], 0.15, 0.26),
    S([0, 1.84, -1.26], 0.12, 0.2),
    S([0, 1.97, -1.38], 0.1, 0.15),
    S([0, 2.02, -1.44], 0.09, 0.12),
  ]);
  // The head, lowered a little against the rein, forehead to muzzle.
  skin([
    S([0, 2.02, -1.4], 0.1, 0.12),
    S([0, 1.96, -1.54], 0.115, 0.15),
    S([0, 1.86, -1.68], 0.1, 0.13),
    S([0, 1.74, -1.82], 0.085, 0.11),
    S([0, 1.64, -1.94], 0.078, 0.095),
    S([0, 1.58, -2.02], 0.07, 0.08),
    S([0, 1.56, -2.06], 0.05, 0.06),
  ]);
  // Ears pricked forward.
  for (const side of [-1, 1]) {
    skin([
      S([side * 0.06, 2.04, -1.42], 0.035, 0.025),
      S([side * 0.085, 2.14, -1.44], 0.025, 0.02),
      S([side * 0.1, 2.22, -1.46], 0.006, 0.006),
    ]);
  }
  for (const side of [-1, 1]) {
    const x = side * 0.17;
    if (side === raised) {
      // The near foreleg lifted: knee brought up and forward, cannon hanging.
      skin([
        S([x, 1.05, -0.64], 0.11, 0.14),
        S([x, 0.84, -0.78], 0.085, 0.1),
        S([x, 0.66, -0.98], 0.06, 0.07),
        S([x, 0.5, -0.96], 0.045, 0.055),
        S([x, 0.36, -0.9], 0.05, 0.06),
        S([x, 0.28, -0.86], 0.06, 0.065),
        S([x, 0.24, -0.84], 0.055, 0.06),
      ]);
    } else {
      skin([
        S([x, 1.05, -0.64], 0.11, 0.14),
        S([x, 0.8, -0.68], 0.085, 0.1),
        S([x, 0.56, -0.68], 0.06, 0.07),
        S([x, 0.3, -0.67], 0.045, 0.055),
        S([x, 0.12, -0.66], 0.05, 0.06),
        S([x, 0.04, -0.68], 0.062, 0.068),
        S([x, 0.0, -0.69], 0.065, 0.07),
      ]);
    }
    // The hind leg: thigh into the body, gaskin, hock set back, cannon down.
    const hx = side * 0.16;
    skin([
      S([hx, 1.0, 0.42], 0.14, 0.17),
      S([hx, 0.74, 0.54], 0.1, 0.12),
      S([hx, 0.52, 0.66], 0.06, 0.08),
      S([hx, 0.3, 0.6], 0.045, 0.055),
      S([hx, 0.1, 0.56], 0.05, 0.06),
      S([hx, 0.04, 0.57], 0.062, 0.068),
      S([hx, 0.0, 0.58], 0.065, 0.07),
    ]);
  }
  // The tail, from the dock, falling behind the hocks.
  skin([
    S([0, 1.08, 0.8], 0.05, 0.06),
    S([0, 1.0, 0.92], 0.07, 0.08),
    S([0, 0.78, 1.0], 0.08, 0.09),
    S([0, 0.52, 0.98], 0.07, 0.08),
    S([0, 0.3, 0.92], 0.045, 0.05),
    S([0, 0.2, 0.88], 0.02, 0.02),
  ]);

  /*
   * The mane: a crest of clipped tufts standing along the top of the neck,
   * cut as one serrated silhouette in the plane of the neck. Its foot is
   * buried in the neck so it grows out of it rather than sitting on it.
   */
  const crest: [number, number][] = [
    [-0.56, 1.42],
    [-0.86, 1.68],
    [-1.08, 1.88],
    [-1.26, 2.02],
    [-1.4, 2.1],
    [-1.46, 2.13],
  ];
  const crestAt = (z: number) => {
    for (let i = 0; i < crest.length - 1; i += 1) {
      const [z0, y0] = crest[i]!;
      const [z1, y1] = crest[i + 1]!;
      if (z <= z0 && z >= z1) return y0 + ((z - z0) / (z1 - z0)) * (y1 - y0);
    }
    return z > crest[0]![0] ? crest[0]![1] : crest[crest.length - 1]![1];
  };
  const mane: [number, number][] = [];
  const tufts = 14;
  const zFrom = -0.58;
  const zTo = -1.44;
  // Along the top, one tuft after another; the outline's `u` runs towards
  // the head, which the carving's turn below maps onto the horse's `-z`.
  for (let i = 0; i <= tufts; i += 1) {
    const z = zFrom + ((zTo - zFrom) * i) / tufts;
    const tall = i % 2 === 0 ? 0.13 : 0.08;
    mane.push([-z * scale, (crestAt(z) + tall) * scale]);
  }
  // Then back along the foot, inside the neck.
  for (let i = tufts; i >= 0; i -= 1) {
    const z = zFrom + ((zTo - zFrom) * i) / tufts;
    mane.push([-z * scale, (crestAt(z) - 0.1) * scale]);
  }
  parts.push({
    kind: "carving",
    material: "bronze",
    at,
    outline: mane,
    depth: 0.06 * scale,
    sink: 0.5,
    // A quarter turn lays the silhouette in the horse's own x = 0 plane.
    rotY: rotY + Math.PI / 2,
  });

  // The rider, astride at the withers, turned to face the way the horse does.
  parts.push({
    kind: "figure",
    material: "bronze",
    at: placed(at, rotY, [0, 1.38 * scale, -0.3 * scale]),
    height: 1.85 * scale,
    rotY: rotY + Math.PI,
    bearded: true,
    pose: "riding",
  });
  return parts;
}

/* ------------------------------------------------------------------ *
 * A two-storey Roman façade, and the hall behind it
 * ------------------------------------------------------------------ */

/**
 * The façade faces the viewer down -z; the building runs back into +z.
 *
 * Laid out from photographs of the re-erected front rather than from a
 * generic idea of a Roman façade, because this one is specific and famous:
 *
 * - four aediculae below, each a pair of columns on one tall shared pedestal,
 *   with a statue standing in the niche the pair frames;
 * - three doorways in the bays between them, the middle one wider;
 * - an entablature that breaks forward over every pair, so the front is a row
 *   of projections and recesses rather than a flat wall;
 * - four more aediculae above, set half a step inwards, framing three large
 *   windows — the windows are upstairs, not down;
 * - three pediments over those windows, the middle triangular and the outer
 *   two segmental, all of them broken.
 *
 * The columns are smooth, not fluted: these are Roman monolithic shafts.
 * The hall behind stops at the height its masonry actually survives to.
 */
export function romanFacadeParts(spec: RomanFacadeSpec): Part[] {
  const parts: Part[] = [];
  const w = spec.facadeWidth;
  const stepRise = 0.18;
  const stepTread = 0.44;
  const podium = spec.steps * stepRise;
  const depth = spec.porchDepth + spec.hallDepth + 1.4;
  const wallDepth = 0.7;

  // Nine steps the full width of the building, each one a slab under the last.
  for (let i = 0; i < spec.steps; i += 1) {
    const run = (spec.steps - i) * stepTread;
    parts.push(box("marbleWorn", [0, i * stepRise, -run / 2], [w, stepRise, run]));
  }
  parts.push(box("marbleWorn", [0, 0, depth / 2 - 0.7], [w + 1.4, podium, depth + 1.4]));

  const y0 = podium;

  /* The bay rhythm across 21 m: four aediculae 3.2 m wide, two side bays of
     2.4 m and a middle bay of 3.2 m. */
  const aediculaWidth = w * 0.152;
  const sideBay = w * 0.114;
  const middleBay = w * 0.152;
  const aediculaCentres = [
    -(middleBay / 2 + aediculaWidth + sideBay + aediculaWidth / 2),
    -(middleBay / 2 + aediculaWidth / 2),
    middleBay / 2 + aediculaWidth / 2,
    middleBay / 2 + aediculaWidth + sideBay + aediculaWidth / 2,
  ];
  const bays = [
    { centre: -(middleBay / 2 + aediculaWidth + sideBay / 2), width: sideBay },
    { centre: 0, width: middleBay },
    { centre: middleBay / 2 + aediculaWidth + sideBay / 2, width: sideBay },
  ];

  const lowerTop = y0 + spec.lowerOrderHeight;
  const upperHeight = spec.facadeHeight - spec.lowerOrderHeight;

  /* The wall behind, built as piers so the doorways are holes rather than
     dark paint. Doors below, windows above: the reading room was lit from the
     upper storey, and the ground floor carried carved panels instead. */
  const doorHeight = spec.lowerOrderHeight * 0.56;
  const windowBase = lowerTop + upperHeight * 0.22;
  const windowHeight = upperHeight * 0.46;

  const wallCourse = (
    base: number,
    height: number,
    openings: { centre: number; width: number }[],
  ) => {
    let cursor = -w / 2;
    for (const opening of openings) {
      const from = opening.centre - opening.width / 2;
      const to = opening.centre + opening.width / 2;
      if (from > cursor) {
        parts.push(
          box(
            "marble",
            [(cursor + from) / 2, base, wallDepth / 2],
            [from - cursor, height, wallDepth],
          ),
        );
      }
      // The reveal at the back of the opening, which is what gives a doorway
      // depth when you cannot cut a hole in a box.
      parts.push(
        box("shadow", [opening.centre, base, wallDepth - 0.06], [opening.width, height, 0.12]),
      );
      cursor = to;
    }
    parts.push(
      box(
        "marble",
        [(cursor + w / 2) / 2, base, wallDepth / 2],
        [w / 2 - cursor, height, wallDepth],
      ),
    );
  };

  const doors = bays.map((bay) => ({ centre: bay.centre, width: bay.width * 0.72 }));
  wallCourse(y0, doorHeight, doors);

  /*
   * Timber doors in the three openings, panelled and studded. The library shut
   * at night like any other building, and a black hole where a door belongs is
   * the detail that most makes a reconstruction look unfinished.
   */
  for (const door of doors) {
    const leaf = door.width / 2 - 0.04;
    for (const side of [-1, 1]) {
      const cx = door.centre + side * (leaf / 2 + 0.02);
      parts.push(box("timber", [cx, y0, wallDepth - 0.14], [leaf, doorHeight, 0.1]));
      // Two sunk panels per leaf, and the frame that holds them.
      for (let panel = 0; panel < 2; panel += 1) {
        parts.push(
          box(
            "timber",
            [cx, y0 + 0.25 + panel * (doorHeight * 0.46), wallDepth - 0.2],
            [leaf * 0.68, doorHeight * 0.38, 0.06],
          ),
        );
      }
      parts.push(
        box(
          "paintGold",
          [cx - side * leaf * 0.36, y0 + doorHeight * 0.44, wallDepth - 0.22],
          [0.09, 0.16, 0.06],
        ),
      );
    }
  }

  // Above each doorway: a moulded lintel, then the panelled wall to the top of
  // the lower order.
  parts.push(box("marble", [0, y0 + doorHeight, wallDepth / 2], [w, 0.55, wallDepth]));
  for (const door of doors) {
    // The painted panel over each door, framed in gilded moulding.
    parts.push(
      box("paintRed", [door.centre, y0 + doorHeight + 0.75, 0.06], [door.width * 1.15, 1.5, 0.12]),
    );
    parts.push(
      box("paintGold", [door.centre, y0 + doorHeight + 0.68, 0.02], [door.width * 1.3, 0.09, 0.08]),
    );
    parts.push(
      box("paintGold", [door.centre, y0 + doorHeight + 2.25, 0.02], [door.width * 1.3, 0.09, 0.08]),
    );
  }
  parts.push(
    box(
      "marble",
      [0, y0 + doorHeight + 0.55, wallDepth / 2],
      [w, lowerTop - y0 - doorHeight - 0.55, wallDepth],
    ),
  );

  // Upper storey: solid to the sill, then the three windows, then solid again.
  parts.push(box("marble", [0, lowerTop, wallDepth / 2], [w, windowBase - lowerTop, wallDepth]));
  const windows = bays.map((bay) => ({ centre: bay.centre, width: bay.width * 0.78 }));
  wallCourse(windowBase, windowHeight, windows);

  /*
   * The windows were not open holes: they carried a lattice, gilded, which is
   * what the sources mean by the openings above the doors being "fitted with
   * glass or latticework". Modelled as the grid it is — the light through it
   * is half the character of the front.
   */
  for (const window of windows) {
    const bars = 7;
    const rows = 5;
    for (let i = 1; i < bars; i += 1) {
      parts.push(
        box(
          "paintGold",
          [
            window.centre - window.width / 2 + (window.width * i) / bars,
            windowBase,
            wallDepth - 0.12,
          ],
          [0.045, windowHeight, 0.045],
        ),
      );
    }
    for (let i = 1; i < rows; i += 1) {
      parts.push(
        box(
          "paintGold",
          [window.centre, windowBase + (windowHeight * i) / rows, wallDepth - 0.12],
          [window.width, 0.045, 0.045],
        ),
      );
    }
    // The sill and the moulded frame round the opening.
    parts.push(
      box("paintGold", [window.centre, windowBase - 0.12, 0.02], [window.width * 1.18, 0.12, 0.1]),
    );
  }
  parts.push(
    box(
      "marble",
      [0, windowBase + windowHeight, wallDepth / 2],
      [w, y0 + spec.facadeHeight - windowBase - windowHeight, wallDepth],
    ),
  );

  /**
   * One aedicula: the pair of columns, the pedestal they share, the statue in
   * the niche between them, and the entablature broken forward over the top.
   */
  const aedicula = (
    base: number,
    height: number,
    centre: number,
    spread: number,
    diameter: number,
    statueHeight: number,
    project: number,
    /** What this one is wearing: the robes were painted, not left white. */
    robe: Material,
    /** A bearded man — Celsus or his son — rather than a draped virtue. */
    bearded?: boolean,
  ) => {
    const pedestal = height * 0.26;
    const shaft = height * 0.58;
    const entablature = height - pedestal - shaft;
    const z = -(project + diameter / 2);

    // One pedestal under both columns, moulded top and bottom.
    parts.push(
      box("marble", [centre, base, z], [spread * 2 + diameter * 2.2, 0.16, diameter * 2.6]),
    );
    parts.push(
      box(
        "marble",
        [centre, base + 0.16, z],
        [spread * 2 + diameter * 1.7, pedestal - 0.32, diameter * 2.2],
      ),
    );
    parts.push(
      box(
        "marble",
        [centre, base + pedestal - 0.16, z],
        [spread * 2 + diameter * 2.2, 0.16, diameter * 2.6],
      ),
    );

    for (const side of [-1, 1]) {
      parts.push(
        ...column(
          "marble",
          [centre + side * spread, base + pedestal, z],
          diameter,
          shaft,
          "composite",
          0,
        ),
      );
    }

    /*
     * The niche, and the statue standing clear of the wall in it. Eight
     * statues lived on this front — the four virtues below and Celsus with his
     * son above — and each is modelled in the round, a draped figure on its
     * own stepped pedestal, rather than drawn as a photograph. The dress, the
     * poses and which virtue wears which colour are the reconstruction's
     * reading; the surviving originals are in Vienna.
     */
    parts.push(
      box("paintRed", [centre, base + pedestal, 0.02], [spread * 1.5, statueHeight + 1.3, 0.1]),
    );
    parts.push(
      person([centre, base + pedestal - 0.02, -0.045], statueHeight, Math.PI, robe, bearded),
    );
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "marble",
          [centre + side * spread * 0.82, base + pedestal, 0.06],
          [spread * 0.22, statueHeight + 1.2, 0.24],
        ),
      );
    }
    parts.push(
      ...cornice(
        "marble",
        [centre, base + pedestal + statueHeight + 1.2, 0.06],
        spread * 1.95,
        0.3,
        0.3,
      ),
    );

    // The entablature over the pair, in three courses so it throws a shadow.
    parts.push(
      ...cornice(
        "marble",
        [centre, base + pedestal + shaft, z],
        spread * 2 + diameter * 2.4,
        diameter * 2.8,
        entablature,
      ),
    );
  };

  const lowerSpread = aediculaWidth * 0.42;
  const upperSpread = aediculaWidth * 0.38;

  /* The entablature runs the whole width of the front and breaks forward over
     each pair. Without the continuous band between the projections the façade
     falls apart into four separate porches. */
  const bandDepth = 0.5;
  const lowerBand = spec.lowerOrderHeight * 0.16;
  parts.push(
    ...cornice(
      "marble",
      [0, lowerTop - lowerBand, wallDepth / 2 + bandDepth / 2],
      w,
      bandDepth + wallDepth,
      lowerBand,
    ),
  );
  const upperBand = upperHeight * 0.16;
  const facadeTop = y0 + spec.facadeHeight;
  parts.push(
    ...cornice(
      "marble",
      [0, facadeTop - upperBand, wallDepth / 2 + bandDepth / 2],
      w,
      bandDepth + wallDepth,
      upperBand,
    ),
  );

  /*
   * The painted courses that run the width of both entablatures. Roman
   * mouldings were not left in the marble: the frieze took a colour and the
   * enrichments above and below it were picked out and gilded, which is what
   * makes an entablature read as bands rather than as a shelf.
   */
  for (const level of [lowerTop - lowerBand, facadeTop - upperBand]) {
    const face = wallDepth + bandDepth - 0.04;
    parts.push(box("paintBlue", [0, level + 0.06, face], [w * 0.995, 0.2, 0.06]));
    parts.push(box("paintGold", [0, level + 0.26, face], [w * 0.995, 0.07, 0.07]));
    parts.push(box("paintRed", [0, level + 0.33, face], [w * 0.995, 0.14, 0.06]));
    parts.push(box("paintGold", [0, level + 0.47, face], [w * 0.995, 0.07, 0.07]));
  }

  // Wisdom, Knowledge, Intelligence and Virtue, in the white marble the
  // surviving figures are cut from. The paint is on the niche behind each of
  // them, which is what makes a pale statue read against a pale front.
  const robes: Material[] = ["marble", "marble", "marble", "marble"];
  aediculaCentres.forEach((centre, index) => {
    aedicula(
      y0,
      spec.lowerOrderHeight,
      centre,
      lowerSpread,
      spec.columnDiameter,
      2,
      1.0,
      robes[index % robes.length]!,
    );
  });
  // The upper order is set back and drawn in, which is what makes the front
  // read as two storeys rather than one tall one. Where the virtues stand
  // below, the four podia above carried Celsus and his son Aquila — white
  // marble by now, not painted, the bearded father and the clean-shaven son.
  aediculaCentres.forEach((centre, index) => {
    const inward = Math.sign(centre) * aediculaWidth * 0.12;
    aedicula(
      lowerTop,
      upperHeight,
      centre - inward,
      upperSpread,
      spec.columnDiameter * 0.86,
      1.9,
      0.72,
      "marbleWorn",
      index % 2 === 0,
    );
  });

  /* Three pediments over the three window bays: triangular in the middle,
     segmental either side, and all of them broken at the centre — which is
     what the fragments show and what the re-erected front carries. */
  const top = y0 + spec.facadeHeight;
  const pedimentDepth = spec.columnDiameter * 2.4;
  const pedimentZ = -(0.72 + spec.columnDiameter * 0.43);
  bays.forEach((bay, index) => {
    const width = bay.width + aediculaWidth * 0.9;
    if (index === 1) {
      parts.push(prism("marble", [0, top, pedimentZ], [width, width * 0.3, pedimentDepth]));
      // The tympanum behind the raking cornice was painted, not left bare.
      parts.push(
        prism("paintRed", [0, top + 0.1, pedimentZ - 0.05], [width * 0.86, width * 0.24, 0.12]),
      );
    } else {
      parts.push(
        segmentalPediment(
          "marble",
          [bay.centre, top, pedimentZ - pedimentDepth / 2],
          width / 2,
          pedimentDepth,
        ),
      );
      parts.push(
        segmentalPediment(
          "paintRed",
          [bay.centre, top + 0.08, pedimentZ - pedimentDepth * 0.52],
          width * 0.43,
          0.1,
        ),
      );
    }
    // The gilded band along the top of the entablature under each pediment.
    parts.push(
      box("paintGold", [bay.centre, top - 0.16, pedimentZ], [width, 0.1, pedimentDepth * 1.04]),
    );
  });

  /*
   * The two bronze horsemen on the courtyard, one either side of the stairs.
   * They stand on their own inscribed plinths, and they are the reason the
   * front reads as the end of a public square rather than as a building in a
   * field: the eye gets something at ground level to measure the steps by.
   */
  for (const side of [-1, 1]) {
    const px = side * (w * 0.56);
    const pz = -spec.steps * stepTread - 2.6;
    parts.push(box("marbleWorn", [px, 0, pz], [2.6, 0.28, 3.4]));
    parts.push(box("marble", [px, 0.28, pz], [2.2, 2.4, 3.0]));
    parts.push(box("marbleWorn", [px, 2.68, pz], [2.6, 0.26, 3.4]));
    // The horse and its rider, a little over life size, each turned a touch
    // towards the stair so the pair address whoever climbs it.
    parts.push(
      ...bronzeHorseman([px, 2.94, pz + 0.05], side > 0 ? -0.3 : 0.3, 1.1, side > 0 ? -1 : 1),
    );
  }

  /* The hall: side walls, rear wall and apse, stopped at the height the
     masonry actually survives to. */
  const hallFront = spec.porchDepth + wallDepth;
  const hallBack = hallFront + spec.hallDepth;
  const wallThickness = 0.9;
  const halfHall = spec.hallWidth / 2;
  const hallHeight = spec.wallHeight;

  parts.push(
    box("stone", [0, y0 - 0.1, (hallFront + hallBack) / 2], [spec.hallWidth, 0.12, spec.hallDepth]),
  );
  for (const side of [-1, 1]) {
    parts.push(
      box(
        "stone",
        [side * (halfHall + wallThickness / 2), y0, (hallFront + hallBack) / 2],
        [wallThickness, hallHeight, spec.hallDepth],
      ),
    );
    parts.push(
      box(
        "stone",
        [side * (halfHall - 0.5), y0, (hallFront + hallBack) / 2],
        [1, 1, spec.hallDepth],
      ),
    );
  }

  const apseHalf = spec.apseWidth / 2;
  for (const side of [-1, 1]) {
    const from = side * apseHalf;
    const to = side * (halfHall + wallThickness);
    parts.push(
      box(
        "stone",
        [(from + to) / 2, y0, hallBack + wallThickness / 2],
        [Math.abs(to - from), hallHeight, wallThickness],
      ),
    );
  }
  parts.push(
    ring("stone", y0, apseHalf, apseHalf + wallThickness, hallHeight, 0, Math.PI, [0, hallBack]),
  );

  // Ten shelf niches per storey: four at the back, three down each side.
  const nicheWidth = 1.1;
  const nicheDepth = 0.35;
  for (let storey = 0; storey < 2; storey += 1) {
    const base = y0 + 1 + storey * (spec.nicheHeight + 0.5);
    if (base + spec.nicheHeight > y0 + hallHeight) continue;
    for (let i = 0; i < 4; i += 1) {
      const x = -halfHall + (halfHall * 2 * (i + 0.5)) / 4;
      if (Math.abs(x) < apseHalf + 0.8) continue;
      parts.push(
        box(
          "shadow",
          [x, base, hallBack - nicheDepth / 2],
          [nicheWidth, spec.nicheHeight, nicheDepth],
        ),
      );
    }
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i += 1) {
        const z = hallFront + (spec.hallDepth * (i + 0.5)) / 3;
        parts.push(
          box(
            "shadow",
            [side * (halfHall - nicheDepth / 2), base, z],
            [nicheDepth, spec.nicheHeight, nicheWidth],
          ),
        );
      }
    }
  }

  // Someone at the foot of the stairs, so 16 metres reads as 16 metres.
  /*
   * The library stood on a paved courtyard in the middle of a city, so the
   * ground round it is worked stone, not countryside: little rock, no grass,
   * and Bülbül Dağı well back on the skyline.
   */
  parts.push(...setting(w * 0.62, 4101, { stone: 0.35, grass: 0.12, hills: 0.55 }));
  parts.push(person([w * 0.3, 0, -spec.steps * stepTread - 1.6]));
  return parts;
}

/* ------------------------------------------------------------------ *
 * A Roman theatre
 * ------------------------------------------------------------------ */

/** Seat rows fan over +z; the stage building closes the theatre across -z. */
export function romanTheatreParts(spec: RomanTheatreSpec): Part[] {
  const parts: Part[] = [];
  const outerRadius = spec.caveaDiameter / 2;
  const orchestraRadius = spec.orchestraDiameter / 2;
  const rows = spec.lowerRows + spec.upperRows;
  const diazoma = 1.8;

  // The orchestra floor. The ground under it all is the renderer's to lay.
  parts.push(ring("stone", 0, 0, orchestraRadius, 0.12, 0, Math.PI));

  // The podium wall that separated the orchestra from the first row.
  const podiumOuter = orchestraRadius + 0.7;
  parts.push(ring("stone", 0, orchestraRadius, podiumOuter, spec.podiumHeight, 0, Math.PI));

  const rowAt = (index: number) => {
    const walkways = index >= spec.lowerRows ? diazoma : 0;
    const inner = podiumOuter + index * spec.seatTread + walkways;
    return { inner, outer: inner + spec.seatTread, y: spec.podiumHeight + index * spec.seatRise };
  };

  for (let i = 0; i < rows; i += 1) {
    const { inner, outer, y } = rowAt(i);
    parts.push(ring("stone", y, inner, outer, spec.seatRise + 0.06, 0, Math.PI));
  }

  // The walkway that splits the bank in two.
  const lower = rowAt(spec.lowerRows - 1);
  parts.push(
    ring(
      "stoneDark",
      lower.y + spec.seatRise,
      lower.outer,
      lower.outer + diazoma,
      0.12,
      0,
      Math.PI,
    ),
  );

  // Radial stairs, laid over the rows rather than cut into them.
  const top = rowAt(rows - 1);
  for (let s = 0; s < spec.stairways; s += 1) {
    const theta = (Math.PI * (s + 0.5)) / spec.stairways;
    for (let i = 0; i < rows; i += 1) {
      const { inner, outer, y } = rowAt(i);
      const width = 1.1 / inner;
      parts.push(
        ring("stoneDark", y + 0.02, inner, outer, spec.seatRise + 0.08, theta - width / 2, width),
      );
    }
  }

  // The vaulted gallery around the rim, and the outer wall holding it up.
  const galleryInner = top.outer;
  const galleryTop = top.y + spec.seatRise;
  parts.push(ring("stone", galleryTop, galleryInner, outerRadius, 0.3, 0, Math.PI));

  /*
   * The outer face, as an arcade rather than a drum. Each bay is two piers with
   * a barrel vault turned between them: the vault is a half drum whose axis is
   * laid along the radius, which is why the cylinder needs a yaw as well as a
   * tilt. A blank retaining wall would read as a modern stadium.
   */
  const bays = 30;
  const wallThickness = 1.4;
  const archSpring = galleryTop * 0.62;
  const archRadius = ((Math.PI * outerRadius) / bays) * 0.34;
  for (let i = 0; i < bays; i += 1) {
    const centreTheta = (Math.PI * (i + 0.5)) / bays;
    const bayWidth = Math.PI / bays;
    const openingWidth = bayWidth * 0.56;
    // Pier between this opening and the next.
    parts.push(
      ring(
        "stone",
        0,
        outerRadius,
        outerRadius + wallThickness,
        galleryTop,
        centreTheta + openingWidth / 2,
        bayWidth - openingWidth,
      ),
    );
    // Wall over the opening, above the arch.
    parts.push(
      ring(
        "stone",
        archSpring + archRadius,
        outerRadius,
        outerRadius + wallThickness,
        galleryTop - archSpring - archRadius,
        centreTheta - openingWidth / 2,
        openingWidth,
      ),
    );
    // The vault turned over the opening, its axis laid along the radius.
    parts.push(
      cyl(
        "stoneDark",
        [Math.cos(centreTheta) * outerRadius, archSpring, Math.sin(centreTheta) * outerRadius],
        archRadius,
        archRadius,
        wallThickness,
        14,
        {
          rotX: Math.PI / 2,
          rotY: Math.PI / 2 - centreTheta,
          thetaStart: Math.PI / 2,
          thetaLength: Math.PI,
        },
      ),
    );
  }

  const arcadeColumns = 34;
  for (let i = 0; i <= arcadeColumns; i += 1) {
    const theta = (Math.PI * i) / arcadeColumns;
    const r = galleryInner + 0.5;
    parts.push(
      ...column(
        "stone",
        [Math.cos(theta) * r, galleryTop + 0.3, Math.sin(theta) * r],
        0.72,
        3.6,
        "plain",
      ),
    );
  }
  parts.push(
    ring("stone", galleryTop + 3.9, galleryInner, outerRadius + wallThickness, 0.6, 0, Math.PI),
  );

  // Post holes for the awning masts, one mast each, around the rim.
  for (let i = 0; i < spec.velariumMasts; i += 1) {
    const theta = (Math.PI * (i + 0.5)) / spec.velariumMasts;
    const r = outerRadius + 0.6;
    parts.push(
      cyl(
        "stoneDark",
        [Math.cos(theta) * r, galleryTop + 4.5, Math.sin(theta) * r],
        0.12,
        0.1,
        3,
        8,
      ),
    );
  }

  /* The stage building. It is bonded to the seating bank across the full width
     of the theatre, which is exactly why this one still has its roof line. */
  const stageWidth = spec.caveaDiameter;
  const wallZ = -spec.stageDepth;
  const wallHeight = spec.scaenaeHeight + 3.3;
  parts.push(box("stone", [0, 0, wallZ - 0.9], [stageWidth, wallHeight, 1.8]));
  parts.push(box("stone", [0, 0, wallZ - 5.4], [stageWidth, wallHeight, 7.2]));
  // The stage floor itself.
  parts.push(box("stone", [0, 0, wallZ / 2], [stageWidth * 0.62, 1.5, spec.stageDepth]));

  /*
   * The scaenae frons, laid out from photographs of the wall at Aspendos: two
   * storeys of aediculae standing clear of the wall on their own bases, five
   * doorways at stage level, and — the detail that dates the building — a row
   * of square beam sockets along each storey, left by the timbers that carried
   * the roof over the stage.
   */
  const screenLower = spec.scaenaeHeight * 0.55;
  const screenUpper = spec.scaenaeHeight - screenLower;
  const screenBays = 10;
  const screenSpan = stageWidth * 0.86;
  const bayWidth = screenSpan / screenBays;
  const stageTop = 1.5;

  const aediculaPair = (x: number, base: number, height: number, project: number) => {
    const diameter = height * 0.11;
    parts.push(
      box(
        "marbleWorn",
        [x, base, wallZ + project],
        [diameter * 2.4, height * 0.09, diameter * 2.4],
      ),
    );
    parts.push(
      ...column(
        "marbleWorn",
        [x, base + height * 0.09, wallZ + project],
        diameter,
        height * 0.78,
        "composite",
        0,
      ),
    );
    parts.push(
      ...cornice(
        "marbleWorn",
        [x, base + height * 0.87, wallZ + project],
        diameter * 2.6,
        diameter * 2.6,
        height * 0.13,
      ),
    );
  };

  for (let i = 0; i <= screenBays; i += 1) {
    const x = -(screenSpan / 2) + i * bayWidth;
    aediculaPair(x, stageTop, screenLower, 1.2);
    aediculaPair(x, stageTop + screenLower, screenUpper, 1.6);
  }
  // The continuous cornices the aediculae break forward from.
  parts.push(
    ...cornice(
      "marbleWorn",
      [0, stageTop + screenLower - 0.7, wallZ + 0.5],
      stageWidth * 0.94,
      1.5,
      0.7,
    ),
  );
  parts.push(
    ...cornice(
      "marbleWorn",
      [0, stageTop + spec.scaenaeHeight - 0.8, wallZ + 0.7],
      stageWidth * 0.94,
      1.8,
      0.8,
    ),
  );
  parts.push(prism("marbleWorn", [0, stageTop + spec.scaenaeHeight, wallZ + 1.4], [16, 3, 2.6]));

  // Beam sockets: two rows of small square holes across the wall.
  for (const row of [stageTop + screenLower * 0.62, stageTop + screenLower + screenUpper * 0.6]) {
    for (let i = 0; i < 26; i += 1) {
      const x = -(stageWidth * 0.44) + (stageWidth * 0.88 * i) / 25;
      parts.push(box("shadow", [x, row, wallZ + 0.02], [0.55, 0.55, 0.12]));
    }
  }

  // Five doorways at stage level: the royal door in the middle, the guest
  // doors either side of it, and one at each end of the wall.
  for (const [x, width, height] of [
    [0, 4.2, 8],
    [-stageWidth * 0.16, 2.8, 6.4],
    [stageWidth * 0.16, 2.8, 6.4],
    [-stageWidth * 0.36, 2.4, 5.6],
    [stageWidth * 0.36, 2.4, 5.6],
  ] as const) {
    parts.push(box("shadow", [x, stageTop, wallZ + 0.02], [width, height, 0.14]));
    parts.push(
      ...cornice("marbleWorn", [x, stageTop + height, wallZ + 0.3], width + 1.4, 1.1, 0.7),
    );
  }

  // Both these theatres are cut into a hillside above a plain, so the ground
  // rises behind the seating and falls away in front of the stage.
  parts.push(...setting(outerRadius, 8803, { stone: 0.7, grass: 0.8, hills: 0.75 }));
  parts.push(person([6, 0.12, orchestraRadius * 0.45], 1.75, Math.PI));
  return parts;
}

/* ------------------------------------------------------------------ *
 * A dipteral Ionic temple
 * ------------------------------------------------------------------ */

/** Length runs along z, width along x; the front (pronaos) faces -z. */
export function ionicDipterosParts(spec: IonicDipterosSpec): Part[] {
  const parts: Part[] = [];
  const stepRise = 0.5;
  const platform = spec.crepidomaSteps * stepRise;
  const insetW = (spec.crepidomaWidth - spec.stylobateWidth) / 2 / spec.crepidomaSteps;
  const insetL = (spec.crepidomaLength - spec.stylobateLength) / 2 / spec.crepidomaSteps;

  for (let i = 0; i < spec.crepidomaSteps; i += 1) {
    parts.push(
      box(
        "marbleWorn",
        [0, i * stepRise, 0],
        [spec.crepidomaWidth - 2 * i * insetW, stepRise, spec.crepidomaLength - 2 * i * insetL],
      ),
    );
  }

  const y0 = platform;
  const radius = spec.columnDiameter / 2;
  // Counted as they go up, because the count is a claim the model has to meet:
  // Pliny said the Artemision stood on 127 columns, and it does.
  let raised = 0;
  const raise = (x: number, z: number) => {
    if (raised >= spec.totalColumns) return;
    raised += 1;
    parts.push(...column("marble", [x, y0, z], spec.columnDiameter, spec.columnHeight, "ionic"));
  };

  // Two rings of columns: 10 x 21 outside, one intercolumniation in, 8 x 19.
  const gridWidth = spec.stylobateWidth - 3;
  const gridLength = spec.stylobateLength - 3;
  const stepX = gridWidth / (spec.outerColumnsShort - 1);
  const stepZ = gridLength / (spec.outerColumnsLong - 1);

  const perimeter = (cols: number, rowsAlong: number, halfW: number, halfL: number) => {
    for (let i = 0; i < cols; i += 1) {
      for (let k = 0; k < rowsAlong; k += 1) {
        const onEdge = i === 0 || i === cols - 1 || k === 0 || k === rowsAlong - 1;
        if (!onEdge) continue;
        const x = -halfW + (2 * halfW * i) / (cols - 1);
        const z = -halfL + (2 * halfL * k) / (rowsAlong - 1);
        raise(x, z);
      }
    }
  };

  perimeter(spec.outerColumnsShort, spec.outerColumnsLong, gridWidth / 2, gridLength / 2);
  perimeter(
    spec.outerColumnsShort - 2,
    spec.outerColumnsLong - 2,
    gridWidth / 2 - stepX,
    gridLength / 2 - stepZ,
  );

  // Architrave, frieze and cornice, carried only over the colonnade: the court
  // inside was open to the sky and never took a roof.
  const beamTop = y0 + spec.columnHeight;
  const beam = (halfW: number, halfL: number) => {
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "marble",
          [side * halfW, beamTop, 0],
          [radius * 2.6, spec.entablatureHeight, halfL * 2 + radius * 2.6],
        ),
      );
      parts.push(
        box(
          "marble",
          [0, beamTop, side * halfL],
          [halfW * 2 + radius * 2.6, spec.entablatureHeight, radius * 2.6],
        ),
      );
    }
  };
  beam(gridWidth / 2, gridLength / 2);
  beam(gridWidth / 2 - stepX, gridLength / 2 - stepZ);

  if (spec.interior === "open-court") {
    /*
     * The frieze that ran above the outer colonnade, carrying the Medusa heads
     * that are the one piece of Didyma everybody has seen. Photographed from
     * the block lying on the site, and set on the front where the visitor
     * meets it.
     */
    const friezeHeight = spec.entablatureHeight * 0.42;
    const friezeZ = -(gridLength / 2 + radius * 1.3);
    parts.push(
      box(
        "marble",
        [0, beamTop + spec.entablatureHeight, friezeZ],
        [gridWidth * 0.62, friezeHeight, 0.5],
      ),
    );
    parts.push(
      relief(
        "marble",
        [0, beamTop + spec.entablatureHeight, friezeZ - 0.27],
        [friezeHeight * 1.6, friezeHeight],
        CARVINGS.medusa,
        Math.PI,
      ),
    );
  } else {
    /*
     * The columnae caelatae: Pliny counts 36 columns carved in relief at the
     * base, and here they are — the sculpted drum photographed in the British
     * Museum, wrapped round the lowest drum of the front columns.
     */
    let carved = 0;
    for (let i = 0; i < spec.outerColumnsShort && carved < (spec.reliefColumns ?? 0); i += 1) {
      for (const z of [-(gridLength / 2), -(gridLength / 2 - stepZ)]) {
        if (carved >= (spec.reliefColumns ?? 0)) break;
        const x = -gridWidth / 2 + (gridWidth * i) / (spec.outerColumnsShort - 1);
        parts.push(
          relief(
            "marble",
            [x, y0 + spec.columnHeight * 0.035, z - spec.columnDiameter * 0.48],
            [spec.columnDiameter * 0.92, spec.columnHeight * 0.1],
            CARVINGS.artemisionDrum,
            Math.PI,
          ),
        );
        carved += 1;
      }
    }
  }

  /* What the columns surround: at Didyma an open court walled to 25 m, at the
     Artemision a roofed cella. */
  const courtWidth = spec.courtWidth;
  const courtLength = spec.courtLength;
  const wallThickness = 2.4;
  const courtCentre = gridLength / 2 - stepZ - courtLength / 2 - 5;
  const halfCW = courtWidth / 2;
  const halfCL = courtLength / 2;

  for (const side of [-1, 1]) {
    parts.push(
      box(
        "marbleWorn",
        [side * (halfCW + wallThickness / 2), y0, courtCentre],
        [wallThickness, spec.sekosWallHeight, courtLength + wallThickness * 2],
      ),
    );
  }
  parts.push(
    box(
      "marbleWorn",
      [0, y0, courtCentre + halfCL + wallThickness / 2],
      [courtWidth + wallThickness * 2, spec.sekosWallHeight, wallThickness],
    ),
  );
  // The front wall of the court, pierced by the great portal nobody walked
  // through: the opening sits above the floor of the porch.
  const portalWidth = 5.6;
  // Didyma's portal is 14 m; a cella door is a door. Either way it has to stay
  // inside the wall it is cut through.
  const portalHeight = Math.min(14, spec.sekosWallHeight * 0.72);
  for (const side of [-1, 1]) {
    const from = side * (portalWidth / 2);
    const to = side * (halfCW + wallThickness);
    parts.push(
      box(
        "marbleWorn",
        [(from + to) / 2, y0, courtCentre - halfCL - wallThickness / 2],
        [Math.abs(to - from), spec.sekosWallHeight, wallThickness],
      ),
    );
  }
  parts.push(
    box(
      "marbleWorn",
      [0, y0 + portalHeight, courtCentre - halfCL - wallThickness / 2],
      [portalWidth, spec.sekosWallHeight - portalHeight, wallThickness],
    ),
  );
  parts.push(
    box("shadow", [0, y0, courtCentre - halfCL - wallThickness], [portalWidth, portalHeight, 0.3]),
  );
  // The court floor sits below the porch, reached by the two sloping tunnels.
  parts.push(box("stone", [0, y0 - 1.4, courtCentre], [courtWidth, 0.3, courtLength]));

  // Pronaos: rows of columns in front of the portal, and then as many more
  // rows as it takes to stand up the number the sources count.
  const pronaosFront = courtCentre - halfCL - wallThickness - 2.5;
  for (let row = 0; raised < spec.totalColumns && row < spec.pronaosRows + 6; row += 1) {
    for (let i = 0; i < spec.pronaosPerRow; i += 1) {
      const x = -halfCW + (courtWidth * i) / (spec.pronaosPerRow - 1);
      raise(x, pronaosFront - row * stepZ * 0.62);
    }
  }

  if (spec.interior === "cella") {
    /*
     * A roofed cella, and a gabled roof over the whole peristyle. The slope is
     * built as a stack of narrowing courses rather than as tilted planes: the
     * part list has no way to tip a slab, and a stepped gable at least carries
     * the right silhouette and the right shadow.
     */
    const eaves = beamTop + spec.entablatureHeight;
    const roofHalf = gridWidth / 2 + radius * 1.3;
    const roofLength = gridLength + radius * 2.6;
    const courses = 20;
    const pitch = roofHalf * 0.36;
    for (let i = 0; i < courses; i += 1) {
      const width = 2 * roofHalf * (1 - i / courses);
      parts.push(
        box(
          "marbleWorn",
          [0, eaves + (pitch * i) / courses, 0],
          [width, pitch / courses + 0.02, roofLength],
        ),
      );
    }
    for (const side of [-1, 1]) {
      parts.push(
        prism("marble", [0, eaves, side * (roofLength / 2 - 0.6)], [roofHalf * 2, pitch, 1.2]),
      );
    }
    // The cult statue, standing in the dark at the back of the cella.
    parts.push(box("marbleWorn", [0, y0, courtCentre + halfCL - 6], [4, 1.2, 4]));
    parts.push(person([0, y0 + 1.2, courtCentre + halfCL - 6], 6, Math.PI, "marbleWorn"));
  } else {
    // The naiskos: a small temple standing alone in the open court, over the
    // spring the oracle answered from.
    const nx = spec.naiskosWidth;
    const nz = spec.naiskosLength;
    const naiskosZ = courtCentre + halfCL - nz / 2 - 6;
    parts.push(box("marble", [0, y0 - 1.4, naiskosZ], [nx + 1.6, 1.1, nz + 1.6]));
    parts.push(box("marble", [0, y0 - 0.3, naiskosZ + 2.4], [nx, 6.4, nz - 4.8]));
    for (let i = 0; i < 4; i += 1) {
      const x = -nx / 2 + 0.9 + (i * (nx - 1.8)) / 3;
      parts.push(...column("marble", [x, y0 - 0.3, naiskosZ - nz / 2 + 1.2], 1, 6.4, "ionic"));
    }
    parts.push(box("marble", [0, y0 + 6.1, naiskosZ], [nx + 0.8, 0.8, nz + 0.8]));
    parts.push(prism("marble", [0, y0 + 6.9, naiskosZ - nz / 2 + 0.4], [nx + 0.8, 2, 0.8]));
  }

  /*
   * Both temples stand on flat, open ground — Didyma on the Milesian
   * peninsula, the Artemision on the marshy floor of the Cayster. Scrub and
   * thin soil, and the horizon a long way off.
   */
  parts.push(
    ...setting(Math.max(spec.crepidomaWidth, spec.crepidomaLength) * 0.42, 5501, {
      stone: 0.55,
      grass: 1.1,
      hills: 0.45,
    }),
  );
  parts.push(person([gridWidth / 2 + 4, 0, -gridLength / 2 - 2], 1.75, 0));
  return parts;
}

/* ------------------------------------------------------------------ *
 * A Neolithic enclosure
 * ------------------------------------------------------------------ */

/** T-pillars stand in a ring wall, broad faces turned to the two at the centre. */
export function neolithicEnclosureParts(spec: NeolithicEnclosureSpec): Part[] {
  const parts: Part[] = [];
  const outer = spec.enclosureDiameter / 2;
  const inner = outer - spec.wallThickness;
  const headHeight = 0.9;
  const centralHead = 1.1;

  // A terrazzo floor of burnt lime, poured inside the ring.
  parts.push(ring("terrazzo", 0, 0, inner, 0.14, 0, TAU));

  const pillarAngle = (index: number) => (TAU * index) / spec.ringPillars;

  /*
   * The wall runs between the pillars, not through them — and it is laid up
   * from unworked stone, so it is built here as stones rather than as a smooth
   * band. A clean extruded ring read as poured concrete, which is the one thing
   * a Neolithic dry-stone wall is not.
   */
  const gapAngle = (spec.pillarWidth * 1.25) / inner;
  const random = seeded(97);
  for (let i = 0; i < spec.ringPillars; i += 1) {
    const from = pillarAngle(i) + gapAngle / 2;
    const span = TAU / spec.ringPillars - gapAngle;
    const courses = 4;
    const stones = Math.max(3, Math.round((span * inner) / 0.85));
    for (let course = 0; course < courses; course += 1) {
      const y = course * 0.36;
      // Each course is offset half a stone, the way a wall is actually laid.
      const shift = course % 2 === 0 ? 0 : 0.5;
      for (let s = 0; s < stones; s += 1) {
        const theta = from + (span * (s + 0.5 + shift)) / stones;
        if (theta > from + span) continue;
        const r = inner + spec.wallThickness / 2 + (random() - 0.5) * 0.12;
        const width = 0.55 + random() * 0.45;
        parts.push(
          worn(
            box(
              "limestone",
              [Math.cos(theta) * r, y, Math.sin(theta) * r],
              [spec.wallThickness * (0.8 + random() * 0.3), 0.34 + random() * 0.06, width],
              -theta + (random() - 0.5) * 0.12,
            ),
            0.035,
          ),
        );
      }
    }
    // Benches for sitting, against the inside of the wall.
    parts.push(ring("limestone", 0.14, inner - 0.75, inner, spec.benchHeight, from, span));
  }

  /*
   * Twelve pillars set into the ring, each turned to face the centre — and
   * every one of them carved. Nearly all the excavated pillars at Göbeklitepe
   * carry animals; a ring of blank stones is the one thing this place was not.
   * Three of them wear a photograph of a real carved face as depth; the rest
   * carry animals cut as silhouettes in the stone, one to three a pillar,
   * dealt round the ring the way the excavated programme runs — the aurochs,
   * fox and crane stacked on Pillar 2, the boars of Pillar 12, the vulture
   * and scorpion of Pillar 43, snakes, gazelles and the H-sign — so that no
   * two neighbours repeat and every face shows real relief.
   */
  const faces = [CARVINGS.gobekliPillarFace, CARVINGS.gobekliBeast, CARVINGS.gobekliReliefs];
  const programme: { animals: Animal[]; photo?: number; tilt?: number }[] = [
    { animals: ["fox"], photo: 0 },
    { animals: ["crane", "fox", "aurochs"] },
    { animals: ["boar"] },
    { animals: ["snake"] },
    { animals: ["gazelle"], photo: 1 },
    { animals: ["scorpion", "vulture"] },
    { animals: ["symbol", "boar"] },
    { animals: ["fox", "crane"] },
    { animals: ["boar"], photo: 2 },
    { animals: ["fox"], tilt: 1.15 },
    { animals: ["symbol", "gazelle"] },
    { animals: ["vulture"] },
  ];
  const shapes = seeded(613);
  for (let i = 0; i < spec.ringPillars; i += 1) {
    const theta = pillarAngle(i);
    /*
     * No two of these stones are the same. The cited 3.5 m is the *average*
     * height of the Layer III pillars, so a ring of identical 3.5 m posts is
     * further from the excavation than a ring that scatters around it: each
     * one is quarried to its own height, width and thickness, set a little in
     * or out of the wall line, and stood a few degrees off square.
     */
    const tall = 0.78 + shapes() * 0.44;
    const wide = 0.84 + shapes() * 0.34;
    const thick = 0.86 + shapes() * 0.3;
    const lean = (shapes() - 0.5) * 0.14;
    const r = inner + spec.wallThickness / 2 + (shapes() - 0.5) * 0.22;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const rotY = -theta + lean;
    const height = spec.ringPillarHeight * tall;
    const head = headHeight * (0.85 + shapes() * 0.3);
    const shaft = height - head;
    const width = spec.pillarWidth * wide;
    const depth = spec.pillarThickness * thick;
    parts.push(worn(box("limestone", [x, 0, z], [depth, shaft, width], rotY), 0.05));
    parts.push(worn(box("limestone", [x, shaft, z], [depth, head, width * 1.45], rotY), 0.045));
    // The carving, on the inner face — the one the pillar turns to the centre.
    const faceRadius = r - depth / 2;
    const faceCentre: [number, number] = [
      Math.cos(theta) * faceRadius,
      Math.sin(theta) * faceRadius,
    ];
    const inward: [number, number] = [-Math.cos(theta), -Math.sin(theta)];
    const plan = programme[i % programme.length]!;
    // How long an animal can be on this stone, and where the next one goes.
    const size = Math.min(1.0, width * 0.78);
    let y = 0.32;
    if (plan.photo !== undefined) {
      parts.push(
        relief(
          "limestone",
          [faceCentre[0], 0.42, faceCentre[1]],
          [width * 0.86, shaft * 0.5],
          faces[plan.photo]!,
          -theta - Math.PI / 2 + lean,
        ),
      );
      y = 0.42 + shaft * 0.5 + 0.12;
    }
    plan.animals.forEach((animal, order) => {
      const shake = seeded(9000 + i * 7 + order);
      const scale = plan.tilt ? size * 1.15 : size * (animal === "snake" ? 1.3 : 1);
      // A tilted beast is pinned by its middle, so it is lifted up the face.
      const lift = plan.tilt ? shaft * 0.42 : 0;
      parts.push(
        ...animalCarving(
          animal,
          [faceCentre[0], y + lift + (shake() - 0.5) * 0.08, faceCentre[1]],
          inward,
          4000 + i * 11 + order,
          scale,
          { flip: (i + order) % 3 === 1, ...(plan.tilt ? { tilt: plan.tilt } : {}) },
        ),
      );
      y += scale * (animal === "snake" || animal === "symbol" ? 0.98 : 0.78) + 0.1;
    });
  }

  // The two at the centre: taller, thicker, facing one another across the floor.
  const centreOffset = 1.6;
  for (const side of [-1, 1]) {
    const x = side * centreOffset;
    const shaft = spec.centralPillarHeight - centralHead;
    parts.push(worn(box("limestone", [x, 0, 0], [1.9, 0.45, 1.9]), 0.05));
    parts.push(
      worn(box("limestone", [x, 0.45 - spec.pedestalSocket, 0], [0.62, shaft, 1.5]), 0.04),
    );
    parts.push(
      worn(
        box("limestone", [x, 0.45 - spec.pedestalSocket + shaft, 0], [0.62, centralHead, 2.2]),
        0.04,
      ),
    );
    const base = 0.45 - spec.pedestalSocket;
    // The animals, cut into the broad face that turns towards the other
    // pillar — carved into the stone as depth, not painted onto it.
    parts.push(
      relief(
        "limestone",
        [x - side * 0.32, base + 0.4, 0],
        [1.34, shaft * 0.55],
        CARVINGS.gobekliReliefs,
        side > 0 ? -Math.PI / 2 : Math.PI / 2,
      ),
    );
    // Above the photographed panel, more figures risen straight out of the
    // stone: a vulture with spread wings over a scorpion on one pillar, like
    // Pillar 43, a boar under a fox on the other — all carved as silhouettes.
    const upper = base + 0.4 + shaft * 0.56;
    const broad: [number, number] = side < 0 ? [1, 0] : [-1, 0];
    if (side < 0) {
      parts.push(
        ...animalCarving("scorpion", [x - side * 0.31, upper, 0], broad, 7001, 0.55),
        ...animalCarving("vulture", [x - side * 0.31, upper + 0.62, 0], broad, 7002, 0.95),
      );
    } else {
      parts.push(
        ...animalCarving("boar", [x - side * 0.31, upper, 0], broad, 7003, 0.9),
        ...animalCarving("fox", [x - side * 0.31, upper + 0.7, 0], broad, 7004, 0.85, {
          flip: true,
        }),
      );
    }
    // And on the narrow flank of each, below the belt, the fox of Pillar 18 —
    // cut leaping head-first down the stone the way it is on the original,
    // and small enough to fit between the edges of a 62 cm flank.
    parts.push(
      ...animalCarving("fox", [x, base + shaft * 0.16, side * 0.75], [0, side], 7005 + side, 0.5, {
        tilt: side > 0 ? 1.15 : -1.15,
        flip: side > 0,
      }),
    );

    /*
     * What makes these two stones people rather than posts, carved in the
     * lowest relief the excavators describe: an arm folded down each narrow
     * side, the hands brought together above a belt, and a fox-pelt loincloth
     * hanging from it. Modelled as geometry, a few centimetres proud, because
     * that is exactly how deep the carving is.
     */
    const proud = 0.035;
    const armTop = base + shaft * 0.72;
    const beltY = base + shaft * 0.42;
    for (const edge of [-1, 1]) {
      // The upper arm, running down the narrow side of the pillar.
      parts.push(
        box(
          "limestone",
          [x, armTop - shaft * 0.3, edge * (0.75 + proud / 2)],
          [0.62, shaft * 0.3, proud],
        ),
      );
      // The forearm, turning in across the face towards the belt.
      parts.push(
        box(
          "limestone",
          [x - side * (0.31 + proud / 2), beltY + 0.18, edge * 0.45],
          [proud, 0.16, 0.62],
        ),
      );
      // A hand, five fingers wide, laid over the belt.
      parts.push(
        box(
          "limestone",
          [x - side * (0.31 + proud / 2), beltY + 0.1, edge * 0.16],
          [proud, 0.22, 0.28],
        ),
      );
    }
    // The belt, running round three faces, with its buckle at the front.
    parts.push(box("limestone", [x, beltY, 0], [0.62 + proud * 2, 0.16, 1.5 + proud * 2]));
    parts.push(box("limestone", [x - side * (0.31 + proud), beltY - 0.02, 0], [proud, 0.2, 0.3]));
    // The loincloth hanging below it.
    parts.push(
      box("limestone", [x - side * (0.31 + proud / 2), beltY - 0.62, 0], [proud, 0.62, 0.78]),
    );
  }

  // A limestone plateau above the Harran plain: bare rock through thin soil,
  // burnt grass, and the Germuş ridges close on the skyline.
  parts.push(...setting(outer, 2207, { stone: 1.3, grass: 1, hills: 1 }));
  parts.push(person([4.6, 0.14, 3.2], 1.75, -2.2));
  return parts;
}

/* ------------------------------------------------------------------ *
 * A Hellenistic altar on a stepped podium
 * ------------------------------------------------------------------ */

/**
 * The stair cuts a recess into the -z front; the frieze wraps everything else.
 *
 * The recess is why the podium is built as four blocks rather than one: a
 * staircase drawn on top of a solid podium is a staircase to nowhere, and the
 * two wings the stair climbs between are the altar's most recognisable feature.
 */
export function greatAltarParts(spec: GreatAltarSpec): Part[] {
  const parts: Part[] = [];
  const halfW = spec.baseWidth / 2;
  const halfD = spec.baseDepth / 2;
  const halfStair = spec.stairWidth / 2;
  const stepRise = 0.3;
  const stepRun = 0.55;
  const ground = spec.steps * stepRise;

  // The five steps that run round the building, open where the stair cuts in.
  for (let i = 0; i < spec.steps; i += 1) {
    const grow = (spec.steps - i) * stepRun;
    const w = spec.baseWidth + 2 * grow;
    const d = spec.baseDepth + 2 * grow;
    parts.push(
      box("marbleWorn", [0, i * stepRise, halfD + grow - stepRun / 2], [w, stepRise, stepRun]),
    );
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "marbleWorn",
          [side * (halfW + grow - stepRun / 2), i * stepRise, 0],
          [stepRun, stepRise, d],
        ),
      );
      const from = side * halfStair;
      const to = side * (halfW + grow);
      parts.push(
        box(
          "marbleWorn",
          [(from + to) / 2, i * stepRise, -(halfD + grow - stepRun / 2)],
          [Math.abs(to - from), stepRise, stepRun],
        ),
      );
    }
  }

  /* The podium: a back block, two wings, and the recess between the wings that
     the stair climbs through. */
  const socle = 1.4;
  const friezeBase = ground + socle;
  const bandTop = friezeBase + spec.friezeHeight;
  const corniceHeight = 0.9;
  const terrace = bandTop + 0.5 + corniceHeight;
  const stairRun = 8.5;
  const backDepth = spec.baseDepth - stairRun;

  const podiumBlock = (x: number, z: number, w: number, d: number) => {
    parts.push(box("marbleWorn", [x, ground, z], [w, socle, d]));
    // The frieze stands slightly proud of everything above and below it, which
    // is what let 2.3 m of carving read from the ground — and it carries the
    // Gigantomachy, cut into all four faces as depth rather than laid on them
    // as a picture.
    parts.push(box("marble", [x, friezeBase, z], [w + 0.5, spec.friezeHeight, d + 0.5]));
    const halfBW = (w + 0.5) / 2;
    const halfBD = (d + 0.5) / 2;
    for (const side of [-1, 1]) {
      parts.push(
        relief(
          "marble",
          [x, friezeBase, z + side * (halfBD + 0.01)],
          [w + 0.5, spec.friezeHeight],
          CARVINGS.gigantomachy,
          side > 0 ? 0 : Math.PI,
        ),
      );
      parts.push(
        relief(
          "marble",
          [x + side * (halfBW + 0.01), friezeBase, z],
          [d + 0.5, spec.friezeHeight],
          CARVINGS.gigantomachy,
          side > 0 ? Math.PI / 2 : -Math.PI / 2,
        ),
      );
    }
    parts.push(box("marbleWorn", [x, bandTop, z], [w + 0.9, 0.5, d + 0.9]));
    parts.push(...cornice("marbleWorn", [x, bandTop + 0.5, z], w + 1.1, d + 1.1, corniceHeight));
  };

  podiumBlock(0, halfD - backDepth / 2, spec.baseWidth, backDepth);
  for (const side of [-1, 1]) {
    const wingWidth = halfW - halfStair;
    podiumBlock(side * (halfStair + wingWidth / 2), -halfD + stairRun / 2, wingWidth, stairRun);
  }

  // The stair itself, climbing the recess from the ground to the terrace.
  const flight = Math.max(2, Math.round((terrace - ground) / stepRise));
  for (let i = 0; i < flight; i += 1) {
    const run = stairRun / flight;
    parts.push(
      box(
        "marbleWorn",
        [0, ground + i * ((terrace - ground) / flight), -halfD + run * (i + 0.5)],
        [spec.stairWidth, (terrace - ground) / flight, run],
      ),
    );
  }

  /* The colonnade round the terrace, and the entablature it carries — four
     beams, not a lid: the court inside the columns was open. */
  const columnHeight = spec.totalHeight - terrace - 1.4;
  const cw = halfW - 1.2;
  const cd = halfD - 1.2;
  const along = (from: number, to: number, fixed: number, axis: "x" | "z") => {
    const count = Math.max(2, Math.round(Math.abs(to - from) / spec.columnSpacing));
    for (let i = 0; i <= count; i += 1) {
      const t = from + ((to - from) * i) / count;
      const x = axis === "x" ? t : fixed;
      const z = axis === "x" ? fixed : t;
      // Nothing stands in the mouth of the stair.
      if (z < -cd + 0.5 && Math.abs(x) < halfStair - 0.5) continue;
      parts.push(...column("marble", [x, terrace, z], spec.columnDiameter, columnHeight, "ionic"));
    }
  };
  along(-cw, cw, cd, "x");
  along(-cw, cw, -cd, "x");
  along(-cd + spec.columnSpacing, cd - spec.columnSpacing, -cw, "z");
  along(-cd + spec.columnSpacing, cd - spec.columnSpacing, cw, "z");

  const beamTop = terrace + columnHeight;
  const beamWidth = spec.columnDiameter * 2.2;
  for (const side of [-1, 1]) {
    parts.push(...cornice("marble", [side * cw, beamTop, 0], beamWidth, cd * 2 + beamWidth, 1.4));
    parts.push(...cornice("marble", [0, beamTop, side * cd], cw * 2 + beamWidth, beamWidth, 1.4));
  }

  // The court on top, and the fire altar standing in the middle of it.
  const half = spec.courtSide / 2;
  const courtHeight = columnHeight * 0.72;
  for (const side of [-1, 1]) {
    parts.push(box("marbleWorn", [side * half, terrace, 2], [0.9, courtHeight, spec.courtSide]));
  }
  parts.push(box("marbleWorn", [0, terrace, 2 + half], [spec.courtSide + 1.8, courtHeight, 0.9]));
  parts.push(box("stoneDark", [0, terrace, 2], [4.4, 1.8, 4.4]));

  // The altar stood on a terrace cut into the acropolis, high above the plain,
  // so the skyline is close and the ground is rock.
  parts.push(...setting(spec.baseWidth * 0.55, 6607, { stone: 0.8, grass: 0.5, hills: 0.9 }));
  parts.push(person([halfStair + 3, 0, -halfD - spec.steps * stepRun - 1.5], 1.75, 0));
  return parts;
}

/* ------------------------------------------------------------------ *
 * A Roman stadium
 * ------------------------------------------------------------------ */

/** The long axis runs along z; both ends are curved, as at Aphrodisias. */
export function stadiumParts(spec: StadiumSpec): Part[] {
  const parts: Part[] = [];
  const halfWidth = spec.overallWidth / 2;
  const arenaHalf = spec.arenaWidth / 2;
  const depth = halfWidth - arenaHalf;
  const tread = depth / spec.rows;
  // The curved ends are semicircles on the arena's own half-width.
  const endCentre = spec.overallLength / 2 - halfWidth;

  parts.push(box("stone", [0, 0, 0], [spec.arenaWidth, 0.12, endCentre * 2]));
  for (const side of [-1, 1]) {
    parts.push(
      ring("stone", 0, 0, arenaHalf, 0.12, side > 0 ? 0 : Math.PI, Math.PI, [0, side * endCentre]),
    );
  }

  for (let row = 0; row < spec.rows; row += 1) {
    const inner = arenaHalf + row * tread;
    const outer = inner + tread;
    const y = row * spec.seatRise;
    // The two straight banks.
    for (const side of [-1, 1]) {
      parts.push(
        box(
          "stone",
          [side * (inner + tread / 2), y, 0],
          [tread, spec.seatRise + 0.06, endCentre * 2],
        ),
      );
    }
    // And the two curved ends that close them.
    for (const side of [-1, 1]) {
      parts.push(
        ring("stone", y, inner, outer, spec.seatRise + 0.06, side > 0 ? 0 : Math.PI, Math.PI, [
          0,
          side * endCentre,
        ]),
      );
    }
  }

  /*
   * The mouths of the vaulted passages that brought the crowd in at track
   * level. Only the mouths: a tunnel driven through the bank would push its
   * dark box up through the seats above it, since nothing here can cut a hole.
   */
  const bankTop = spec.rows * spec.seatRise;
  for (let i = 0; i < spec.entrances; i += 1) {
    const z = -endCentre + (2 * endCentre * (i + 0.5)) / spec.entrances;
    for (const side of [-1, 1]) {
      parts.push(box("shadow", [side * (arenaHalf + 0.6), 0, z], [1.4, 2.6, 3.2]));
    }
  }

  // The outer wall, and the walkway along the top of the seating.
  const outerRadius = halfWidth;
  for (const side of [-1, 1]) {
    parts.push(
      box("stoneDark", [side * (outerRadius + 0.6), 0, 0], [1.2, bankTop + 1.2, endCentre * 2]),
    );
    parts.push(
      ring(
        "stoneDark",
        0,
        outerRadius,
        outerRadius + 1.2,
        bankTop + 1.2,
        side > 0 ? 0 : Math.PI,
        Math.PI,
        [0, side * endCentre],
      ),
    );
  }

  // The stadium sits against the city wall on flat ground, with the Baba Dağı
  // ridge behind it and dry scrub either side.
  parts.push(...setting(spec.overallWidth * 0.62, 9203, { stone: 0.5, grass: 1.2, hills: 0.6 }));
  parts.push(person([0, 0.12, -endCentre * 0.5], 1.75, 0));
  return parts;
}

/* ------------------------------------------------------------------ *
 * A Roman house round a colonnaded court
 * ------------------------------------------------------------------ */

/**
 * Cut open on the -z side so the court can be seen into, the way the terrace
 * houses are visited today: the rooms on that side are left off rather than
 * walled, and the model is an interior first and a building second.
 *
 * This is the one model here whose surfaces matter more than its mass. The
 * floors are mosaic and the walls are fresco, both of them photographs of the
 * house's own decoration, and the mosaics carry a millimetre or so of relief
 * so the tesserae catch the light unevenly, the way a laid floor does.
 */
export function peristyleHouseParts(spec: PeristyleHouseSpec): Part[] {
  const parts: Part[] = [];
  const halfW = spec.courtWidth / 2;
  const halfD = spec.courtDepth / 2;
  const wall = 0.45;
  const upper = spec.wallHeight * 0.82;

  // The court floor, in mosaic, with the impluvium pool set into it.
  parts.push(box("stone", [0, -0.12, 0], [spec.courtWidth, 0.12, spec.courtDepth]));
  parts.push(
    floorPanel(
      "marbleWorn",
      [0, 0.001, halfD],
      [spec.courtWidth, spec.courtDepth],
      CARVINGS.terraceMosaic,
    ),
  );
  const pool = spec.poolWidth;
  parts.push(box("stoneDark", [0, 0, 0], [pool + 0.4, 0.22, pool + 0.4]));
  parts.push(box("shadow", [0, 0.02, 0], [pool, 0.18, pool]));

  /* The rooms round three sides: a floor, walls, and the fresco on the wall
     that faces into the court. */
  const room = (
    centre: [number, number],
    size: [number, number],
    frescoRot: number,
    frescoAt: Vec3,
    frescoSize: [number, number],
    floor: Carving,
  ) => {
    const [cx, cz] = centre;
    const [w, d] = size;
    parts.push(box("stone", [cx, -0.12, cz], [w, 0.12, d]));
    parts.push(floorPanel("marbleWorn", [cx, 0.001, cz + d / 2], [w, d], floor));
    parts.push(relief("marbleWorn", frescoAt, frescoSize, CARVINGS.terraceFresco, frescoRot));
  };

  const sideCentre = halfW + wall + spec.roomDepth / 2;
  room(
    [0, halfD + wall + spec.roomDepth / 2],
    [spec.courtWidth, spec.roomDepth],
    Math.PI,
    [0, 0.4, halfD + wall + spec.roomDepth - 0.06],
    [spec.courtWidth * 0.8, spec.wallHeight * 0.72],
    CARVINGS.terraceDionysus,
  );
  for (const side of [-1, 1]) {
    room(
      [side * sideCentre, 0],
      [spec.roomDepth, spec.courtDepth],
      side > 0 ? -Math.PI / 2 : Math.PI / 2,
      [side * (sideCentre + spec.roomDepth / 2 - 0.06), 0.4, 0],
      [spec.courtDepth * 0.75, spec.wallHeight * 0.72],
      CARVINGS.terraceMosaic,
    );
  }

  // The walls: the outer shell, and the piers between court and rooms.
  const outer = (x: number, z: number, w: number, d: number, height: number) =>
    parts.push(box("marbleWorn", [x, 0, z], [w, height, d]));
  const shellHalfW = sideCentre + spec.roomDepth / 2;
  const shellBack = halfD + wall + spec.roomDepth;
  // The back wall carries the upper storey; the two side walls are cut down to
  // the ground floor, because a house modelled with all four walls at full
  // height is a box with a lid, and nobody can see the mosaics inside it.
  outer(0, shellBack + wall / 2, shellHalfW * 2 + wall, wall, spec.wallHeight + upper);
  for (const side of [-1, 1]) {
    outer(
      side * (shellHalfW + wall / 2),
      (shellBack - halfD) / 2 - halfD / 2,
      wall,
      shellBack + halfD + wall,
      spec.wallHeight * 0.62,
    );
  }
  // The piers that carry the upper storey over the rooms.
  for (const side of [-1, 1]) {
    parts.push(
      box(
        "marbleWorn",
        [side * (halfW + wall / 2), 0, 0],
        [wall, spec.wallHeight, spec.courtDepth],
      ),
    );
  }
  parts.push(
    box(
      "marbleWorn",
      [0, 0, halfD + wall / 2],
      [spec.courtWidth + wall * 2, spec.wallHeight, wall],
    ),
  );

  /* The colonnade round the court, and the roof it carries over the walkway.
     The court itself stays open: that is where the light and the rain came in. */
  const columns: [number, number][] = [];
  for (let i = 0; i < spec.courtColumns; i += 1) {
    const t = i / (spec.courtColumns - 1);
    columns.push([-halfW + spec.courtWidth * t, -halfD]);
    columns.push([-halfW + spec.courtWidth * t, halfD]);
  }
  for (let i = 1; i < spec.courtColumns - 1; i += 1) {
    const t = i / (spec.courtColumns - 1);
    columns.push([-halfW, -halfD + spec.courtDepth * t]);
    columns.push([halfW, -halfD + spec.courtDepth * t]);
  }
  for (const [x, z] of columns) {
    parts.push(
      ...column("marble", [x, 0, z], spec.columnDiameter, spec.wallHeight * 0.86, "ionic"),
    );
  }
  // The architrave over them, and the lean-to roof behind it.
  const beam = spec.wallHeight * 0.86;
  for (const side of [-1, 1]) {
    parts.push(box("marbleWorn", [0, beam, side * halfD], [spec.courtWidth + 0.6, 0.34, 0.42]));
    parts.push(box("marbleWorn", [side * halfW, beam, 0], [0.42, 0.34, spec.courtDepth + 0.6]));
  }
  parts.push(box("stoneDark", [0, beam + 0.34, 0], [spec.courtWidth + wall * 2, 0.16, wall]));

  // Someone standing in the court, because a room is the one place where the
  // scale figure is the whole point.
  parts.push(person([halfW * 0.55, 0.02, -halfD * 0.45], 1.75, 2.4));
  return parts;
}

export function partsFor(spec: ModelSpec): Part[] {
  switch (spec.kind) {
    case "roman-facade":
      return romanFacadeParts(spec);
    case "roman-theatre":
      return romanTheatreParts(spec);
    case "ionic-dipteros":
      return ionicDipterosParts(spec);
    case "neolithic-enclosure":
      return neolithicEnclosureParts(spec);
    case "great-altar":
      return greatAltarParts(spec);
    case "peristyle-house":
      return peristyleHouseParts(spec);
    case "stadium":
      return stadiumParts(spec);
  }
}

/** The axis-aligned box every part of a model fits inside, in metres. */
export function boundsOf(parts: Part[]): { min: Vec3; max: Vec3 } {
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];

  const grow = (x: number, y: number, z: number) => {
    min[0] = Math.min(min[0], x);
    min[1] = Math.min(min[1], y);
    min[2] = Math.min(min[2], z);
    max[0] = Math.max(max[0], x);
    max[1] = Math.max(max[1], y);
    max[2] = Math.max(max[2], z);
  };

  /** The footprint of a yawed rectangle, exactly rather than by its diagonal. */
  const yawed = (x: number, z: number, width: number, depth: number, rotY: number) => {
    const c = Math.abs(Math.cos(rotY));
    const s = Math.abs(Math.sin(rotY));
    return {
      hx: (width / 2) * c + (depth / 2) * s,
      hz: (width / 2) * s + (depth / 2) * c,
      x,
      z,
    };
  };

  for (const part of parts) {
    if (part.decor) continue;
    const [x, y, z] = part.at;
    if (part.kind === "box" || part.kind === "prism") {
      // Taking the half-diagonal instead used to inflate a 60 x 120 m platform
      // to 134 m square, and the camera framed the empty air around it.
      const { hx, hz } = yawed(x, z, part.size[0], part.size[2], part.rotY);
      grow(x - hx, y, z - hz);
      grow(x + hx, y + part.size[1], z + hz);
    } else if (part.kind === "cylinder") {
      const r = Math.max(part.radiusBottom, part.radiusTop);
      if (part.rotX) {
        // Tipped over: the axis lies flat, so its length is a plan dimension.
        const { hx, hz } = yawed(x, z, r * 2, part.height * 2, part.rotY ?? 0);
        grow(x - hx, y - r, z - hz);
        grow(x + hx, y + r, z + hz);
      } else {
        grow(x - r, y, z - r);
        grow(x + r, y + part.height, z + r);
      }
    } else if (part.kind === "ring") {
      // A half ring covers half a circle, and saying otherwise put the centre
      // of a theatre 25 m behind its stage.
      const from = part.thetaStart;
      const to = part.thetaStart + part.thetaLength;
      const angles = [from, to];
      for (let quarter = -4; quarter <= 8; quarter += 1) {
        const angle = (quarter * Math.PI) / 2;
        if (angle > from && angle < to) angles.push(angle);
      }
      for (const angle of angles) {
        for (const r of [part.inner, part.outer]) {
          const px = x + Math.cos(angle) * r;
          const pz = z + Math.sin(angle) * r;
          grow(px, y, pz);
          grow(px, y + part.height, pz);
        }
      }
    } else if (part.kind === "relief") {
      // A panel has no depth worth counting; its width is what it spans.
      const { hx, hz } = yawed(x, z, part.size[0], 0.2, part.rotY);
      grow(x - hx, y, z - hz);
      grow(x + hx, y + part.size[1], z + hz);
    } else if (part.kind === "carving") {
      // A tilted outline can swing any of its extent into any direction, so
      // one is taken for all three; a level one only reaches as high as it is.
      let reach = 0;
      let top = 0;
      for (const [u, v] of part.outline) {
        reach = Math.max(reach, Math.abs(u), Math.abs(v));
        top = Math.max(top, v);
      }
      const { hx, hz } = yawed(x, z, reach * 2, part.depth * 2, part.rotY);
      grow(x - hx, y - (part.rotZ ? reach : 0), z - hz);
      grow(x + hx, y + (part.rotZ ? reach : top), z + hz);
    } else if (part.kind === "loft") {
      const c = Math.cos(part.rotY);
      const s = Math.sin(part.rotY);
      for (const section of part.sections) {
        const r = Math.max(section.rx, section.ry);
        const px = x + section.c[0] * c + section.c[2] * s;
        const py = y + section.c[1];
        const pz = z - section.c[0] * s + section.c[2] * c;
        grow(px - r, py - r, pz - r);
        grow(px + r, py + r, pz + r);
      }
    } else {
      // A figure: a rider's legs hang below the seat given as `at`.
      const r = part.height * 0.25;
      const foot = part.pose === "riding" ? y - part.height * 0.5 : y;
      const top = part.pose === "riding" ? y + part.height * 0.56 : y + part.height;
      grow(x - r, foot, z - r);
      grow(x + r, top, z + r);
    }
  }

  return { min, max };
}
