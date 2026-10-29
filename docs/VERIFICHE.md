# Verifiche e decisioni — 29 ottobre 2026

## Ambito

V1 statica navigabile, senza backend, login, upload o persistenza della visione. Il brief allegato è la specifica: non sono state eseguite istruzioni di deploy o login. Il repository GitHub selezionato era vuoto (lettura HTTPS riuscita, nessun riferimento remoto). La base viene preparata per il branch main. Gli allegati e l'ambiente non contenevano media utilizzabili: la consegna usa solo testo e HTML/CSS. I file della skill sono strumenti e riferimenti testuali, non contenuti del catalogo.

## Verifiche automatiche

- Installazione con `npm ci` dal lockfile, Node 24.19.0 / npm 11.9.0.
- `validate:catalog`: 4 titoli, 14 episodi, nessuna sorgente multimediale.
- TypeScript, ESLint e build Vite.
- 12 test Vitest: schema, duplicati/riferimenti, ordine e disponibilità, ricerca per titolo/cast/genere/sinossi, normalizzazione, filtri, media distinti, parametri errati, primo/prossimo episodio, nessun salto o loop, rilascio del video e rifiuto autoplay.
- 8 test Playwright su Chromium: navigazione e refresh dei link, ricerca/reset, 404 e episodio inesistente, nessuna richiesta a media nella navigazione normale, layout a 320/390/768/1440 px e titoli lunghi E02/E03/E05/E07/E09/E14, condivisione con link selezionabile, errore catalogo recuperabile, Escape e ripristino focus della galleria. La fixture di galleria è solo JSON con immagine assente, non un file scaricato.

Gli errori iniziali (raccolta vuota con ref assente, nome accessibile del filtro, import JSON della fixture) sono stati corretti e i controlli ripetuti. Il player senza sorgente è stabile e non crea tag video o richieste fittizie. Il player con sorgente viene predisposto con controlli nativi, velocità esplicita, sottotitoli e gestione errore; i mock verificano le logiche, non la riproduzione reale.

La build comprende circa 365 kB JS (112 kB gzip), 9 kB CSS (3 kB gzip), HTML e 10 kB di catalogo; nessun media incluso. I bundle dipendono dalle versioni esatte nel lockfile. Il server dev e il server della build sono verificati con richieste HTTP locali. Firebase Hosting non viene distribuito o emulato: fallback e cache sono configurati, da collaudare sul futuro progetto insieme ai media reali.

## Taste Skill: provenienza e applicazione

Copia completa in `.agents/skills/design-taste-frontend/`, frontmatter `name: design-taste-frontend`, licenza MIT del repository inclusa. Origine: https://github.com/Leonxlnx/taste-skill, commit verificato **12af471f627f866411b4bd785b19646d3672784c**. Il README corrente richiede Node 22+ e Chrome/Chromium; disponibili in questo ambiente. Nessuna versione semantica attribuita per supposizione.

Letti SKILL.md e riferimenti pertinenti a composizione, tipografia, colore e critica. Direzioni estratte per `culture`; scelta **The contact sheet**, seed **459720766**, nessuna riestrazione. Idea: i 14 microepisodi diventano una sequenza ordinata di fotogrammi consultabili; l'azione viva è esplorare la serie e filtrare il catalogo. Palette e font conservati: carbone, testo chiaro, verde acido, Arial/sistema. La convenzione di catalogo streaming richiesta dal brief prevale sulle indicazioni da landing page: titolo in evidenza, locandine ripetute come oggetti del catalogo e numeri di episodio come dati reali. Non si costruiscono dashboard né pagine promozionali.

Adattamenti espliciti: niente ricerca/generazione/download di media, niente font esterni, scene animate o videoclip. Omettiamo i passaggi `assets.mjs`, fotografia e motion intensiva perché incompatibili con il brief e con una V1 senza sorgenti. Entrate brevi e feedback dei controlli rispettano `prefers-reduced-motion`.

Eseguiti `lint.mjs src` e `inspect.mjs` sulla build di produzione a 1440/768/390 px in modalità app per i moduli ripetuti del catalogo. Esito: 0 FAIL; due WARN motivati: `app-title-size` per il titolo cinematografico ampio e `below-fold` perché le raccolte scorrono sotto l'hero, come richiesto. Non sono dashboard da concentrare in un solo viewport. Schermate esaminate per tutte le larghezze, incluse le tavole dell'intera homepage. Le schermate di verifica non sono media del prodotto e rimangono tra gli output locali ignorati.

ROUND 1
Seen in one second: titolo Carminuccio & Alexiuccio e catalogo scuro.
Idea (one sentence): i microepisodi diventano una sequenza ordinata e consultabile.
Live thing: ricerca, filtri e selezione della scheda.
Layout words by section: hero=fascia e split / serie=locandine / episodi=elenco / catalogo=griglia.
Scores: design 6 · usability 8 · creativity 6 · content 5 → overall 6.4.
Caps applied: assenza intenzionale di fotografie e presenza di segnaposto; nessuna pretesa di artwork definitivo.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Titolo su tre righe nelle prime schermate: spostato su tutta la griglia, due righe su mobile.
2. Simbolo freccia non disponibile nel font delle schermate: sostituito con freccia semplice.
3. Segnaposto hero legato al solo titolo iniziale: ora legge dal catalogo; ridotta la dimensione per titoli lunghi.

Il risultato resta volutamente una valutazione della struttura senza media, non una direzione visiva definitiva valutabile come un sito con fotografie. Nessun punteggio di eccellenza inventato.

## Collaudi rinviati

Video/audio reali, codec, sottotitoli, fullscreen, seek, buffering, transizioni e autoplay tra file su browser e dispositivi reali. Anche immagini definitive, punto focale, trailer, montaggio e diritti/pubblicabilità dei materiali saranno verificati al loro inserimento. Condivisione nativa e appunti vanno verificati anche su HTTPS e sui dispositivi di destinazione; il fallback selezionabile è collaudato. Nessuna preview localhost interna viene presentata come pubblica. Nessun deploy Firebase o servizio cloud attivato.
