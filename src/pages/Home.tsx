import { Link } from "react-router-dom";
import type { Catalog } from "../features/catalog";
import { primaryPath } from "../features/catalog";
import { Media } from "../components/Media";
import { Row, Empty } from "../components/Shared";
export default function Home({ catalog: c }: { catalog: Catalog }) {
  const t = c.titles.find((t) => t.id === c.featuredId);
  return (
    <>
      {t ? (
        <section className="hero">
          <h1>{t.title}</h1>
          <div className="hero-copy">
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
              <Link className="text-link" to="/catalogo">
                Sfoglia il catalogo →
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <Media
              asset={t.images.hero ?? t.images.landscape}
              label={t.title}
              mobileAsset={t.images.heroMobile}
              ratio="hero"
              eager
            />
            <p>{c.site.tagline}</p>
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
    </>
  );
}
