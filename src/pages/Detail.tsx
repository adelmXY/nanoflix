import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Catalog, Title } from "../features/catalog";
import { primaryPath } from "../features/catalog";
import { Media } from "../components/Media";
import { Share, Row, typeLabel } from "../components/Shared";
export default function Detail({
  title: t,
  catalog,
}: {
  title: Title;
  catalog: Catalog;
}) {
  const [season, setSeason] = useState(t.seasons[0]?.number);
  const [photo, setPhoto] = useState<number>();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (photo !== undefined) dialog.current?.showModal();
  }, [photo]);
  const selected = t.seasons.find((s) => s.number === season);
  const target = primaryPath(t);
  return (
    <>
      <Link className="back" to="/catalogo">
        ← Catalogo
      </Link>
      <section className="detail-hero">
        <Media asset={t.images.poster} label={t.title} ratio="poster" eager />
        <div>
          <h1>{t.title}</h1>
          <p className="meta">
            {t.example ? "Esempio · " : ""}
            {typeLabel[t.type]} ·{" "}
            {t.status === "coming_soon" ? "Prossimamente" : "Disponibile"}
            {t.year ? ` · ${t.year}` : ""}
            {t.durationSeconds ? ` · ${t.durationSeconds} s` : ""}
          </p>
          <p>{t.synopsis}</p>
          <p>{t.genres.join(" · ")}</p>
          {t.cast.length > 0 && <p>Con {t.cast.join(", ")}</p>}
          {t.expectedDate && <p>Uscita prevista: {t.expectedDate}</p>}
          <div className="actions">
            {target.startsWith("/guarda") && (
              <Link className="button primary" to={target}>
                {target.includes("trailer")
                  ? "Guarda il trailer"
                  : "Guarda ora"}
              </Link>
            )}
            {t.trailer && !target.includes("trailer") && (
              <Link
                className="button"
                to={`/guarda/${t.slug}?versione=trailer`}
              >
                Trailer
              </Link>
            )}
            {t.film && t.status === "available" && !target.includes("film") && (
              <Link className="button" to={`/guarda/${t.slug}?versione=film`}>
                Film completo
              </Link>
            )}
          </div>
          {t.status === "coming_soon" && (
            <p className="notice">
              Questa produzione sta arrivando. Il video non è ancora
              disponibile.
            </p>
          )}
          <Share />
        </div>
      </section>
      {selected && (
        <section className="episodes">
          <div className="section-heading">
            <h2>Episodi</h2>
            <label>
              Stagione{" "}
              <select
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
              >
                {t.seasons.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ol>
            {selected.episodes.map((e) => (
              <li key={e.id}>
                <Media
                  asset={e.thumbnail}
                  label={`E${String(e.number).padStart(2, "0")}`}
                />
                <div>
                  <p className="meta">
                    Episodio {e.number} ·{" "}
                    {e.status === "coming_soon"
                      ? "Prossimamente"
                      : "Disponibile"}
                  </p>
                  <h3>{e.title}</h3>
                  {e.synopsis && <p>{e.synopsis}</p>}
                  {e.durationSeconds && <p>{e.durationSeconds} s</p>}
                  {e.status === "available" &&
                    e.video &&
                    t.status === "available" && (
                      <Link
                        className="button"
                        to={`/guarda/${t.slug}?episodio=${e.id}`}
                      >
                        Guarda episodio
                      </Link>
                    )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
      {t.gallery.length > 0 && (
        <section>
          <h2>Dietro la scena</h2>
          <div className="gallery">
            {t.gallery.map((a, i) => (
              <button key={a.src} onClick={() => setPhoto(i)}>
                <Media asset={a} label={a.alt} />
                <span>
                  {a.kind === "original" ? "L’originale" : "Backstage"} ·{" "}
                  {a.alt}
                </span>
              </button>
            ))}
          </div>
          <dialog
            ref={dialog}
            onClose={() => setPhoto(undefined)}
            onClick={(e) => {
              if (e.target === e.currentTarget) dialog.current?.close();
            }}
          >
            <button autoFocus onClick={() => dialog.current?.close()}>
              Chiudi ×
            </button>
            {photo !== undefined && (
              <>
                <Media asset={t.gallery[photo]} label={t.gallery[photo].alt} />
                <p>{t.gallery[photo].alt}</p>
              </>
            )}
          </dialog>
        </section>
      )}
      <Row
        label="Altre storie"
        titles={t.relatedIds.map((id) =>
          catalog.titles.find((t) => t.id === id)!,
        )}
      />
    </>
  );
}
