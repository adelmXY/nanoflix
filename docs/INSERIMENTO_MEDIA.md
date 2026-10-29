# Inserimento dei materiali

La consegna non contiene media. Crea le cartelle sotto `public/media/` solo quando hai i file: `images`, `videos`, `subtitles` sono suggerimenti, non percorsi già popolati. Nel catalogo usa `/media/...` (senza `public`) o un URL HTTPS. Nessun `src` vuoto, base64 o URL di riempimento.

Immagini: `images.poster` verticale 2:3, `images.landscape` orizzontale 16:9, `images.hero` panoramico, `images.heroMobile` opzionale per mobile. Ognuna ha `{ "src": "/media/images/locandina.jpg", "alt": "Descrizione fedele", "position": "50% 40%" }`. `position` controlla il punto focale CSS. Il catalogo accetta JPG, PNG, WebP o altri formati browser; le immagini assenti o errate mantengono il segnaposto e le proporzioni. Il logo opzionale è `site.logo` con lo stesso formato. Non includere spoiler nei testi alternativi.

L'episodio usa `thumbnail` con lo stesso oggetto. Un video, trailer o film completo usa:

```json
{
  "src": "/media/videos/episodio.mp4",
  "mimeType": "video/mp4",
  "subtitles": [
    {
      "src": "/media/subtitles/episodio-it.vtt",
      "lang": "it",
      "label": "Italiano"
    }
  ]
}
```

Valorizza `video` su corto/animazione o episodio, `trailer` su titolo e `film` sul titolo della serie solo per il file di montaggio distinto. Consigliato MP4 H.264/AAC; supportato anche MIME `video/webm`, con codec da verificare. Per fonti esterne configura sul servizio CORS, MIME, richieste Range e accessibilità dei sottotitoli. La libreria non transcodifica. Il player mostra errore e Riprova se riceve un file incompatibile o HTML da un fallback SPA.

`gallery` contiene `{src, alt, kind: "original"}` o `kind: "backstage"`. La galleria appare solo quando popolata: miniature apribili con tastiera/touch, dialog chiudibile con Escape e ritorno del focus al comando. Non è un editor.

Dopo il popolamento verifica: risposte HTTP e Content-Type, dimensioni/ritagli desktop e mobile, caricamento ed errore immagini, avvio da gesto, audio, codec su Chrome/Safari/Firefox/iOS/Android, seek, velocità, sottotitoli, fullscreen, buffering, ripresa dall'errore, fine episodio e blocco del successivo futuro, autoplay attivo/disattivo e rifiuto del browser, film e trailer corretti, stop e rilascio alla navigazione. Questi collaudi reali sono rinviati; i test con mock non li sostituiscono.
