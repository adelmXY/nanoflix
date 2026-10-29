import { Link } from "react-router-dom";
import type { Catalog } from "../features/catalog";
import { primaryPath } from "../features/catalog";
import { Media } from "../components/Media";
import { Row, Empty } from "../components/Shared";
export default function Home({ catalog: c }: { catalog: Catalog }) {
  const t = c.titles.find((t) => t.id === c.featuredId);
  return (
    <div className="home-screen">
      {t ? (
        <section className="hero">
          <div className="hero-art" aria-hidden="true">
            <Media
              asset={t.images.hero ?? t.images.landscape}
              label="Immagine panoramica della produzione"
              mobileAsset={t.images.heroMobile}
              ratio="hero"
              eager
            />
          </div>
          <div className="hero-copy">
            <p className="hero-signature">Una produzione {c.site.name}</p>
            <h1>
              {t.title.includes(" — ") ? (
                <>
                  <span className="hero-series-name">
                    {t.title.split(" — ")[0]}
                  </span>
                  <span className="hero-title-divider"> — </span>
                  <span className="hero-production-name">
                    {t.title.split(" — ").slice(1).join(" — ")}
                  </span>
                </>
              ) : (
                t.title
              )}
            </h1>
            <p className="meta">
              {t.type === "series"
                ? "Serie originale"
                : t.type === "short"
                  ? "Corto originale"
                  : "Animazione originale"}{" "}
              · {t.status === "coming_soon" ? "Prossimamente" : "Disponibile"}
            </p>
            <p>{t.synopsis}</p>
            <div className="actions">
              <Link className="button primary" to={primaryPath(t)}>
                {primaryPath(t).startsWith("/titolo")
                  ? "Esplora la serie"
                  : t.trailer && primaryPath(t).includes("trailer")
                    ? "Guarda il trailer"
                    : "Guarda ora"}{" "}
                <span aria-hidden="true">→</span>
              </Link>
              <Link className="button hero-secondary" to="/catalogo">
                Sfoglia il catalogo →
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="page-intro">
          <h1>{c.site.name}</h1>
          <p>{c.site.description}</p>
          <Link to="/catalogo">Esplora il catalogo →</Link>
        </div>
      )}
      {!c.titles.length && <Empty title="Le storie stanno arrivando" />}
      <div className="home-collections">
        {c.rows.map((r) => {
          let titles = r.titleIds
            .map((id) => c.titles.find((t) => t.id === id)!)
            .filter((t) => !r.availableOnly || t.status === "available");
          if (r.sortByPublication)
            titles = [...titles].sort((a, b) =>
              (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
            );
          return <Row key={r.id} label={r.label} titles={titles} />;
        })}
      </div>
    </div>
  );
}
