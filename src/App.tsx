import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { catalogSchema, type Catalog } from "./features/catalog";
import Home from "./pages/Home";
import CatalogPage from "./pages/Catalog";
import Detail from "./pages/Detail";
import Player from "./pages/Player";
function NotFound() {
  return (
    <div className="page-intro">
      <h1>Fuori copione</h1>
      <p>Questa pagina non esiste.</p>
      <Link className="button primary" to="/catalogo">
        Torna al catalogo
      </Link>
    </div>
  );
}
function TitleRoute({
  catalog,
  player = false,
}: {
  catalog: Catalog;
  player?: boolean;
}) {
  const { slug } = useParams();
  const t = catalog.titles.find((t) => t.slug === slug);
  return t ? (
    player ? (
      <Player key={slug} title={t} />
    ) : (
      <Detail key={slug} title={t} catalog={catalog} />
    )
  ) : (
    <NotFound />
  );
}
export default function App() {
  const [catalog, setCatalog] = useState<Catalog>();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => {
    const abort = new AbortController();
    fetch("/data/catalog.json", { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((c) => {
        setCatalog(catalogSchema.parse(c));
        setError(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => abort.abort();
  }, [attempt]);
  useEffect(() => {
    const site = catalog?.site;
    if (!site) return;
    document.documentElement.style.setProperty("--accent", site.accent);
    const t = catalog.titles.find((t) =>
      location.pathname.endsWith("/" + t.slug),
    );
    document.title = t
      ? `${t.title} — ${site.name}`
      : `${site.name} — Le nostre produzioni`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", site.description);
  }, [catalog, location.pathname]);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    main.current?.focus();
  }, [location.pathname]);
  const links = [
    ["/", "Home"],
    ["/catalogo", "Catalogo"],
    ["/catalogo?tipo=series", "Serie"],
    ["/catalogo?tipo=short", "Corti"],
    ["/catalogo?stato=coming_soon", "Prossimamente"],
    ["/catalogo?q=", "Ricerca"],
  ];
  return (
    <>
      <a href="#contenuto" className="skip">
        Vai al contenuto
      </a>
      <header>
        <Link className="brand" to="/">
          {catalog?.site.logo ? (
            <img src={catalog.site.logo.src} alt={catalog.site.name} />
          ) : (
            (catalog?.site.name ?? "Fuori Scena")
          )}
          <span aria-hidden="true">.</span>
        </Link>
        <nav aria-label="Navigazione principale">
          {links.map(([to, label]) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              className={() =>
                location.pathname + location.search === to ? "active" : ""
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="contenuto" tabIndex={-1} ref={main}>
        {error ? (
          <div className="empty">
            <h1>Catalogo non disponibile</h1>
            <p>Non è stato possibile caricare le produzioni.</p>
            <button
              onClick={() => {
                setError(false);
                setAttempt((n) => n + 1);
              }}
            >
              Riprova
            </button>
          </div>
        ) : !catalog ? (
          <div className="empty" role="status">
            Caricamento del catalogo…
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home catalog={catalog} />} />
            <Route
              path="/catalogo"
              element={<CatalogPage catalog={catalog} />}
            />
            <Route
              path="/titolo/:slug"
              element={<TitleRoute catalog={catalog} />}
            />
            <Route
              path="/guarda/:slug"
              element={<TitleRoute catalog={catalog} player />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>
      <footer>
        <p>{catalog?.site.name ?? "Fuori Scena"}</p>
        <span>{catalog?.site.tagline}</span>
        <Link to="/catalogo">Tutte le produzioni →</Link>
      </footer>
    </>
  );
}
