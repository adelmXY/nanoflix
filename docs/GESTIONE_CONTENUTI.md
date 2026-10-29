# Gestione del catalogo

Modifica `public/data/catalog.json` e poi esegui `npm run validate:catalog`, `npm test` e `npm run build`. La nuova versione richiede una nuova pubblicazione. Nessun componente va modificato.

Lo schema eseguibile e i tipi sono in `src/features/catalog.ts`. Il comando mostra il percorso del campo non valido. `schemaVersion` vale 1. `site` centralizza nome, firma, descrizione, logo opzionale e colore `accent` in formato esadecimale; i token delle superfici e del testo sono in `src/styles/app.css`. `featuredId` indica il titolo dell'hero ed è facoltativo per un catalogo vuoto.

Ogni titolo richiede `id`, `slug` univoco, `type` (`series`, `short`, `animation`), `title`, `synopsis`, `status` (`coming_soon`, `available`), array `genres`, `categories`, `cast`. `images` può restare `{}`. `example: true` distingue le schede di esempio. Facoltativi: `year`, `durationSeconds` effettiva, `expectedDate` editoriale e `publishedAt` ISO `YYYY-MM-DD`. Nessuna data attiva automaticamente un video.

Una serie ha `seasons: [{number: 1, episodes: [...]}]`. Ogni episodio richiede ID globalmente univoco, numero positivo, titolo e stato; `synopsis`, `thumbnail`, durata e `video` sono facoltativi se futuro. Mantieni stagioni ed episodi ordinati con numeri crescenti. Un episodio futuro non deve contenere `video`. Non pubblicare file futuri: l'hosting statico non ne impedisce l'accesso diretto.

Per rendere disponibile un corto imposta `status: "available"` e `video` con sorgente valida. Per una serie aggiorna anche lo stato del titolo e gli episodi disponibili; deve esistere un episodio riproducibile o un `film` distinto. Un episodio intermedio futuro ferma la sequenza: non si passa silenziosamente a quello dopo. Il trailer è indipendente e può esistere anche quando il titolo è futuro.

Esempio di corto futuro, da aggiungere a `titles`:

```json
{
  "id": "nuovo-corto",
  "slug": "nuovo-corto",
  "type": "short",
  "title": "Titolo della produzione",
  "synopsis": "Premessa pubblica senza spoiler.",
  "status": "coming_soon",
  "genres": ["Commedia"],
  "categories": ["Corti e scene impossibili"],
  "cast": [],
  "images": {}
}
```

`rows` è un array ordinato di raccolte: `id`, `label`, `titleIds`. `availableOnly: true` limita le ultime uscite ai disponibili; `sortByPublication: true` ordina per pubblicazione decrescente. Le righe vuote scompaiono. `relatedIds` collega altre schede esistenti. Quando rimuovi una scheda, elimina anche i suoi riferimenti da `rows`, `relatedIds` e `featuredId`. Testi sempre renderizzati come testo React, senza HTML arbitrario.
