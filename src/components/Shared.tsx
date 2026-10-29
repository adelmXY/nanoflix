import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Title } from "../features/catalog";
import { Media } from "./Media";
export const typeLabel = {
  series: "Serie",
  short: "Corto",
  animation: "Animazione",
};
export function Card({ title: t }: { title: Title }) {
  return (
    <article className="card">
      <Link to={`/titolo/${t.slug}`}>
        <Media asset={t.images.poster} label={t.title} ratio="poster" />
        <h3>{t.title}</h3>
        <p>
          {t.example ? "Esempio · " : ""}
          {typeLabel[t.type]} ·{" "}
          {t.status === "coming_soon" ? "Prossimamente" : "Disponibile"}
        </p>
      </Link>
    </article>
  );
}
export function Row({ label, titles }: { label: string; titles: Title[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdges({
        start: el.scrollLeft < 2,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      });
    update();
    el.addEventListener("scroll", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [titles]);
  if (!titles.length) return null;
  return (
    <section className="row">
      <div className="section-heading">
        <h2>{label}</h2>
        <div className="row-controls">
          <button
            aria-label={`Scorri ${label} indietro`}
            disabled={edges.start}
            onClick={() =>
              ref.current?.scrollBy({
                left: -ref.current.clientWidth * 0.8,
                behavior: "smooth",
              })
            }
          >
            ←
          </button>
          <button
            aria-label={`Scorri ${label} avanti`}
            disabled={edges.end}
            onClick={() =>
              ref.current?.scrollBy({
                left: ref.current.clientWidth * 0.8,
                behavior: "smooth",
              })
            }
          >
            →
          </button>
        </div>
      </div>
      <div className="rail" ref={ref}>
        {titles.map((t) => (
          <Card key={t.id} title={t} />
        ))}
      </div>
    </section>
  );
}
export function Share({ path }: { path?: string }) {
  const [message, setMessage] = useState("");
  const [fallback, setFallback] = useState("");
  async function share() {
    const url = new URL(
      path ?? location.pathname + location.search,
      location.origin,
    ).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        setMessage("Link condiviso");
        return;
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copiato");
    } catch {
      setFallback(url);
      setMessage("Seleziona e copia il link qui sotto");
    }
  }
  return (
    <div className="share">
      <button onClick={share}>Condividi →</button>
      <span role="status">{message}</span>
      {fallback && (
        <input
          aria-label="Link da copiare"
          readOnly
          value={fallback}
          onFocus={(e) => e.target.select()}
        />
      )}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
