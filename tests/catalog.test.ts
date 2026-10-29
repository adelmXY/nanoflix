import { describe, it, expect, vi } from "vitest";
import raw from "../public/data/catalog.json";
import {
  catalogSchema,
  searchTitles,
  selectMedia,
  nextEpisode,
  primaryPath,
  type Title,
} from "../src/features/catalog";
import { releaseVideo, attemptPlay } from "../src/features/video";
const c = catalogSchema.parse(raw),
  t = c.titles[0];
const source = {
  src: "/media/test.mp4",
  mimeType: "video/mp4" as const,
  subtitles: [],
};
function available(): Title {
  const a = structuredClone(t);
  a.status = "available";
  a.seasons[0].episodes.forEach((e) => {
    e.status = "available";
    e.video = source;
  });
  return a;
}
describe("Catalogo e ricerca", () => {
  it("conserva 14 episodi futuri senza sorgenti", () => {
    expect(t.seasons[0].episodes).toHaveLength(14);
    expect(
      t.seasons[0].episodes.every(
        (e) => e.status === "coming_soon" && !e.video,
      ),
    ).toBe(true);
  });
  it("rifiuta ID duplicati e riferimenti mancanti", () => {
    const d = structuredClone(c);
    d.titles.push(d.titles[0]);
    d.rows[0].titleIds.push("inesistente");
    const r = catalogSchema.safeParse(d);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.length).toBeGreaterThanOrEqual(3);
  });
  it("rifiuta campi mancanti, ordine episodi e sorgenti incoerenti", () => {
    for (const mutate of [
      (d: typeof c) => {
        d.titles[0].title = "";
      },
      (d: typeof c) => {
        d.titles[0].seasons[0].episodes[1].number = 1;
      },
      (d: typeof c) => {
        d.titles[1].status = "available";
      },
      (d: typeof c) => {
        d.titles[0].seasons[0].episodes[0].video = source;
      },
    ]) {
      const d = structuredClone(c);
      mutate(d);
      expect(catalogSchema.safeParse(d).success).toBe(false);
    }
  });
  it("cerca titolo, cast, descrizione e genere normalizzando accenti e spazi", () => {
    for (const q of [
      "  ÁLEXIUCCIO  ",
      "ULTIMO ATTIMO",
      "supereroi",
      "  onda   misteriosa ",
    ])
      expect(searchTitles(c.titles, new URLSearchParams({ q }))).toContain(t);
  });
  it("combina e azzera filtri", () => {
    expect(
      searchTitles(
        c.titles,
        new URLSearchParams({ q: "alexiuccio", tipo: "short" }),
      ),
    ).toEqual([]);
    expect(
      searchTitles(
        c.titles,
        new URLSearchParams({
          tipo: "series",
          stato: "coming_soon",
          genere: "Supereroi",
        }),
      ),
    ).toEqual([t]);
    expect(searchTitles(c.titles, new URLSearchParams())).toHaveLength(4);
  });
});
describe("Disponibilità e selezione media", () => {
  it("non offre Play senza media", () => {
    expect(primaryPath(t)).toBe(`/titolo/${t.slug}`);
    expect(selectMedia(t, new URLSearchParams()).video).toBeUndefined();
  });
  it("sceglie episodio, trailer e film distinti", () => {
    const a = available();
    a.trailer = { ...source, src: "/trailer.mp4" };
    a.film = { ...source, src: "/film.mp4" };
    expect(
      selectMedia(
        a,
        new URLSearchParams({ episodio: a.seasons[0].episodes[3].id }),
      ).episode?.number,
    ).toBe(4);
    expect(
      selectMedia(a, new URLSearchParams({ versione: "trailer" })).video?.src,
    ).toBe("/trailer.mp4");
    expect(
      selectMedia(a, new URLSearchParams({ versione: "film" })).video?.src,
    ).toBe("/film.mp4");
  });
  it("non riproduce un episodio futuro e non lo salta", () => {
    const a = available();
    a.seasons[0].episodes[1].status = "coming_soon";
    delete a.seasons[0].episodes[1].video;
    expect(
      selectMedia(
        a,
        new URLSearchParams({ episodio: a.seasons[0].episodes[1].id }),
      ).video,
    ).toBeUndefined();
    expect(nextEpisode(a, a.seasons[0].episodes[0].id)).toEqual({
      next: undefined,
      blocked: true,
    });
  });
  it("sceglie primo disponibile e prossimo ordinato, senza loop", () => {
    const a = available();
    expect(selectMedia(a, new URLSearchParams()).episode?.number).toBe(1);
    expect(nextEpisode(a, a.seasons[0].episodes[0].id).next?.number).toBe(2);
    expect(nextEpisode(a, a.seasons[0].episodes[13].id)).toEqual({
      next: undefined,
      blocked: false,
    });
  });
  it("segnala parametri e identificativi non validi senza fallback", () => {
    for (const p of [
      "episodio=non-esiste",
      "episodio=",
      "versione=altro",
      "versione=",
      "episodio=&versione=",
      "episodio=x&versione=film",
      "versione=film&versione=trailer",
      "foo=bar",
    ])
      expect(selectMedia(t, new URLSearchParams(p)).error).toBeTruthy();
  });
  it("rilascia la risorsa quando si cambia pagina", () => {
    const calls: string[] = [];
    const v = {
      pause: () => calls.push("pause"),
      removeAttribute: (s: string) => calls.push(s),
      load: () => calls.push("load"),
    } as unknown as HTMLVideoElement;
    releaseVideo(v);
    expect(calls).toEqual(["pause", "src", "load"]);
  });
  it("gestisce autoplay bloccato dal browser", async () => {
    expect(
      await attemptPlay({
        play: vi.fn().mockRejectedValue(new Error()),
      } as unknown as HTMLVideoElement),
    ).toBe(false);
    expect(
      await attemptPlay({
        play: vi.fn().mockResolvedValue(undefined),
      } as unknown as HTMLVideoElement),
    ).toBe(true);
  });
});
