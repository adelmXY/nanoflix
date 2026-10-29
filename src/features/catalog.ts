import { z } from "zod";
const url = z
  .string()
  .refine(
    (s) => /^\/(?!\/)[^?#]*$/.test(s) || /^https:\/\/[^\s]+$/.test(s),
    "Usa un percorso /media/... oppure un URL HTTPS",
  );
const image = z.object({
  src: url,
  alt: z.string().min(1),
  position: z.string().optional(),
});
const video = z.object({
  src: url,
  mimeType: z.enum(["video/mp4", "video/webm"]),
  subtitles: z
    .array(
      z.object({ src: url, lang: z.string().min(2), label: z.string().min(1) }),
    )
    .default([]),
});
const status = z.enum(["available", "coming_soon"]);
const episode = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  synopsis: z.string().optional(),
  status,
  video: video.optional(),
  thumbnail: image.optional(),
  durationSeconds: z.number().positive().optional(),
});
const title = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.enum(["series", "short", "animation"]),
  title: z.string().min(1),
  synopsis: z.string().min(1),
  status,
  genres: z.array(z.string()),
  categories: z.array(z.string()),
  cast: z.array(z.string()),
  example: z.boolean().default(false),
  year: z.number().int().optional(),
  durationSeconds: z.number().positive().optional(),
  expectedDate: z.string().optional(),
  publishedAt: z.iso.date().optional(),
  images: z
    .object({
      poster: image.optional(),
      landscape: image.optional(),
      hero: image.optional(),
      heroMobile: image.optional(),
    })
    .default({}),
  video: video.optional(),
  trailer: video.optional(),
  film: video.optional(),
  seasons: z
    .array(
      z.object({
        number: z.number().int().positive(),
        episodes: z.array(episode),
      }),
    )
    .default([]),
  gallery: z
    .array(image.extend({ kind: z.enum(["original", "backstage"]) }))
    .default([]),
  relatedIds: z.array(z.string()).default([]),
});
export const catalogSchema = z
  .object({
    schemaVersion: z.literal(1),
    featuredId: z.string().optional(),
    site: z.object({
      name: z.string().min(1),
      tagline: z.string(),
      logo: image.optional(),
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      description: z.string(),
    }),
    titles: z.array(title),
    rows: z.array(
      z.object({
        id: z.string(),
        label: z.string().min(1),
        titleIds: z.array(z.string()),
        availableOnly: z.boolean().default(false),
        sortByPublication: z.boolean().default(false),
      }),
    ),
  })
  .superRefine((c, ctx) => {
    const fail = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path, message });
    const ids = new Set<string>(),
      slugs = new Set<string>(),
      episodes = new Set<string>(),
      rows = new Set<string>();
    c.titles.forEach((t, i) => {
      if (ids.has(t.id)) fail(["titles", i, "id"], "ID duplicato");
      ids.add(t.id);
      if (slugs.has(t.slug)) fail(["titles", i, "slug"], "Slug duplicato");
      slugs.add(t.slug);
      if (t.type === "series" && !t.seasons.length)
        fail(
          ["titles", i, "seasons"],
          "Una serie richiede almeno una stagione",
        );
      let sn = 0;
      t.seasons.forEach((s, j) => {
        if (s.number <= sn)
          fail(
            ["titles", i, "seasons", j],
            "Stagioni non ordinate o duplicate",
          );
        sn = s.number;
        let en = 0;
        s.episodes.forEach((e, k) => {
          const p = ["titles", i, "seasons", j, "episodes", k];
          if (e.number <= en) fail(p, "Episodi non ordinati o duplicati");
          en = e.number;
          if (episodes.has(e.id)) fail([...p, "id"], "ID episodio duplicato");
          episodes.add(e.id);
          if (e.status === "available" && !e.video)
            fail(p, "Episodio disponibile senza video");
          if (e.status === "coming_soon" && e.video)
            fail(p, "Episodio futuro con video pubblico");
        });
      });
      if (
        t.status === "coming_soon" &&
        (t.video ||
          t.film ||
          t.seasons.some((s) =>
            s.episodes.some((e) => e.status === "available"),
          ))
      )
        fail(
          ["titles", i, "status"],
          "Contenuto futuro con media principale disponibile",
        );
      if (
        t.status === "available" &&
        (t.type === "series"
          ? !t.film &&
            !t.seasons.some((s) =>
              s.episodes.some((e) => e.status === "available" && e.video),
            )
          : !t.video)
      )
        fail(["titles", i, "video"], "Titolo disponibile senza video fruibile");
    });
    if (c.featuredId && !ids.has(c.featuredId))
      fail(["featuredId"], "Titolo inesistente");
    c.rows.forEach((r, i) => {
      if (rows.has(r.id)) fail(["rows", i, "id"], "Raccolta duplicata");
      rows.add(r.id);
      r.titleIds.forEach((id) => {
        if (!ids.has(id))
          fail(["rows", i, "titleIds"], `Riferimento inesistente: ${id}`);
      });
    });
    c.titles.forEach((t, i) =>
      t.relatedIds.forEach((id) => {
        if (!ids.has(id) || id === t.id)
          fail(["titles", i, "relatedIds"], `Riferimento non valido: ${id}`);
      }),
    );
  });
export type Catalog = z.infer<typeof catalogSchema>;
export type Title = Catalog["titles"][number];
export type Episode = Title["seasons"][number]["episodes"][number];
export type Video = z.infer<typeof video>;
export type ImageAsset = z.infer<typeof image>;
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
export function searchTitles(titles: Title[], p: URLSearchParams) {
  const query = normalize(p.get("q") ?? "");
  return titles.filter(
    (t) =>
      (!p.get("tipo") || t.type === p.get("tipo")) &&
      (!p.get("stato") || t.status === p.get("stato")) &&
      (!p.get("genere") || t.genres.includes(p.get("genere")!)) &&
      normalize(
        [t.title, t.synopsis, ...t.cast, ...t.genres, ...t.categories].join(
          " ",
        ),
      ).includes(query),
  );
}
export const allEpisodes = (t: Title) => t.seasons.flatMap((s) => s.episodes);
export function selectMedia(
  t: Title,
  p: URLSearchParams,
): { video?: Video; episode?: Episode; label: string; error?: string } {
  const version = p.get("versione"),
    id = p.get("episodio");
  if (
    (id && version) ||
    [...p.keys()].some((k) => !["episodio", "versione"].includes(k)) ||
    p.getAll("versione").length > 1 ||
    p.getAll("episodio").length > 1
  )
    return { label: t.title, error: "Parametri del player non validi" };
  if (version) {
    if (!["film", "trailer"].includes(version))
      return { label: t.title, error: "Versione non valida" };
    return {
      label: version === "film" ? "Film completo" : "Trailer",
      video:
        version === "trailer"
          ? t.trailer
          : t.status === "available"
            ? t.film
            : undefined,
    };
  }
  if (id !== null) {
    const e = allEpisodes(t).find((e) => e.id === id);
    return e
      ? {
          episode: e,
          label: e.title,
          video:
            t.status === "available" && e.status === "available"
              ? e.video
              : undefined,
        }
      : { label: t.title, error: "Episodio non trovato" };
  }
  if (t.type === "series") {
    const e = allEpisodes(t).find((e) => e.status === "available" && e.video);
    return {
      episode: e,
      label: e?.title ?? t.title,
      video: t.status === "available" ? e?.video : undefined,
    };
  }
  return {
    label: t.title,
    video: t.status === "available" ? t.video : undefined,
  };
}
export function nextEpisode(t: Title, id: string) {
  const es = allEpisodes(t),
    index = es.findIndex((e) => e.id === id);
  const next = index < 0 ? undefined : es[index + 1];
  return {
    next:
      next &&
      t.status === "available" &&
      next.status === "available" &&
      next.video
        ? next
        : undefined,
    blocked: !!next && !(next.status === "available" && next.video),
  };
}
export function primaryPath(t: Title) {
  const base = `/guarda/${t.slug}`;
  if (
    t.status === "available" &&
    (t.video || allEpisodes(t).some((e) => e.status === "available" && e.video))
  )
    return base;
  if (t.status === "available" && t.film) return `${base}?versione=film`;
  if (t.trailer) return `${base}?versione=trailer`;
  return `/titolo/${t.slug}`;
}
