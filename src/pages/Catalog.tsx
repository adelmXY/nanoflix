import { useSearchParams } from "react-router-dom";
import type { Catalog as CatalogData } from "../features/catalog";
import { searchTitles } from "../features/catalog";
import { Card, Empty } from "../components/Shared";
export default function Catalog({ catalog }: { catalog: CatalogData }) {
  const [params, setParams] = useSearchParams();
  const results = searchTitles(catalog.titles, params);
  const change = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };
  return (
    <>
      <div className="page-intro">
        <h1>Il catalogo</h1>
        <p>
          Tutte le nostre storie. Anche quelle che devono ancora cominciare.
        </p>
      </div>
      <form
        className="filters"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <label className="search">
          Cerca una produzione
          <input
            autoFocus={params.has("q")}
            type="search"
            placeholder="Titolo, protagonista, genere…"
            value={params.get("q") ?? ""}
            onChange={(e) => change("q", e.target.value)}
          />
        </label>
        <label>
          Tipo
          <select
            aria-label="Tipo"
            value={params.get("tipo") ?? ""}
            onChange={(e) => change("tipo", e.target.value)}
          >
            <option value="">Tutti i tipi</option>
            <option value="series">Serie</option>
            <option value="short">Corti</option>
            <option value="animation">Animazioni</option>
          </select>
        </label>
        <label>
          Genere
          <select
            aria-label="Genere"
            value={params.get("genere") ?? ""}
            onChange={(e) => change("genere", e.target.value)}
          >
            <option value="">Tutti i generi</option>
            {[...new Set(catalog.titles.flatMap((t) => t.genres))]
              .sort()
              .map((g) => (
                <option key={g}>{g}</option>
              ))}
          </select>
        </label>
        <label>
          Disponibilità
          <select
            aria-label="Disponibilità"
            value={params.get("stato") ?? ""}
            onChange={(e) => change("stato", e.target.value)}
          >
            <option value="">Tutti gli stati</option>
            <option value="available">Disponibile</option>
            <option value="coming_soon">Prossimamente</option>
          </select>
        </label>
        <button type="button" onClick={() => setParams({})}>
          Azzera filtri
        </button>
      </form>
      <p role="status">
        {results.length} {results.length === 1 ? "titolo" : "titoli"}
      </p>
      {results.length ? (
        <div className="catalog-grid">
          {results.map((t) => (
            <Card key={t.id} title={t} />
          ))}
        </div>
      ) : (
        <Empty
          title={
            catalog.titles.length
              ? "Nessun risultato"
              : "Il catalogo è ancora vuoto"
          }
        >
          <p>Prova un altro termine o azzera i filtri.</p>
        </Empty>
      )}
    </>
  );
}
