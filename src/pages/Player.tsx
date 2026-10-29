import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { Title, Video } from "../features/catalog";
import { nextEpisode, selectMedia } from "../features/catalog";
import { releaseVideo, attemptPlay } from "../features/video";
import { Share, Empty } from "../components/Shared";
function VideoPlayer({
  source,
  onEnded,
  autoStart,
}: {
  source: Video;
  onEnded: () => void;
  autoStart: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const v = ref.current!;
    if (autoStart) void attemptPlay(v).then((ok) => setBlocked(!ok));
    return () => releaseVideo(v);
  }, [autoStart]);
  return (
    <>
      <video
        ref={ref}
        src={source.src}
        controls
        playsInline
        preload="metadata"
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onPlaying={() => {
          setWaiting(false);
          setBlocked(false);
        }}
        onError={() => {
          setError(true);
          setWaiting(false);
        }}
        onEnded={onEnded}
      >
        {source.subtitles.map((s) => (
          <track
            key={s.src}
            kind="subtitles"
            src={s.src}
            srcLang={s.lang}
            label={s.label}
          />
        ))}
      </video>
      <div role="status">
        {waiting && !error && "Caricamento del video…"}
        {error && (
          <p>
            Video non disponibile. Il file potrebbe essere assente o non
            compatibile.{" "}
            <button
              onClick={() => {
                setError(false);
                ref.current?.load();
              }}
            >
              Riprova
            </button>
          </p>
        )}
        {blocked && !error && (
          <button
            onClick={() =>
              void attemptPlay(ref.current!).then((ok) => setBlocked(!ok))
            }
          >
            Avvia il prossimo episodio
          </button>
        )}
      </div>
      <label>
        Velocità{" "}
        <select
          defaultValue="1"
          onChange={(e) => {
            if (ref.current) ref.current.playbackRate = Number(e.target.value);
          }}
        >
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((n) => (
            <option key={n} value={n}>
              {n}×
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
export default function Player({ title: t }: { title: Title }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const selection = selectMedia(t, params);
  const [autoplay, setAutoplay] = useState(
    () => sessionStorage.getItem("autoplay") !== "off",
  );
  const [ended, setEnded] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const next = selection.episode
    ? nextEpisode(t, selection.episode.id)
    : undefined;
  function advance() {
    if (!next?.next) return;
    setEnded(false);
    setAutoStart(true);
    navigate(`/guarda/${t.slug}?episodio=${next.next.id}`);
  }
  return (
    <>
      <Link className="back" to={`/titolo/${t.slug}`}>
        ← Torna alla scheda
      </Link>
      <div className="player-heading">
        <h1>{selection.label}</h1>
        <p>{t.title}</p>
      </div>
      <section className="player" aria-label="Player video">
        {selection.error ? (
          <Empty title={selection.error}>
            <p>Controlla il collegamento o torna alla scheda.</p>
          </Empty>
        ) : selection.video ? (
          <VideoPlayer
            key={selection.video.src + selection.episode?.id}
            source={selection.video}
            autoStart={autoStart}
            onEnded={() => {
              setEnded(true);
              if (autoplay && next?.next) advance();
            }}
          />
        ) : (
          <Empty title="Video non ancora disponibile">
            <p>Qui troverai il video quando sarà pubblicato.</p>
          </Empty>
        )}
      </section>
      <div className="player-options">
        <label>
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => {
              setAutoplay(e.target.checked);
              sessionStorage.setItem(
                "autoplay",
                e.target.checked ? "on" : "off",
              );
            }}
          />{" "}
          Riproduci automaticamente il prossimo episodio
        </label>
        <Share />
      </div>
      {ended && (
        <div role="status" className="notice">
          {next?.next ? (
            <button onClick={advance}>
              Prossimo episodio: {next.next.title}
            </button>
          ) : next?.blocked ? (
            <p>Il prossimo episodio non è ancora disponibile.</p>
          ) : (
            <p>
              Hai raggiunto la fine.{" "}
              <Link to={`/titolo/${t.slug}`}>Torna alla scheda</Link>
            </p>
          )}
        </div>
      )}
    </>
  );
}
