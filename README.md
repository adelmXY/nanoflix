# Fuori Scena

Piattaforma statica in italiano per le nostre produzioni. React, TypeScript e Vite; nessun backend, account o chiave API. Marchio provvisorio configurabile in `public/data/catalog.json`.

## Avvio locale (anche Windows / PowerShell)

Installa Node.js 24 LTS (verificato: **24.19.0**, npm 11.9.0); minimo Node 22.12. Apri un terminale nella cartella del progetto scaricato e decompresso, dove si trova `package.json`:

```sh
npm ci
npm run dev
```

Apri l'indirizzo mostrato da Vite nel tuo terminale (normalmente `http://localhost:5173`). `npm install` è disponibile per aggiornare le dipendenze; per riprodurre il lockfile usa `npm ci`. Non servono Git o strumenti globali per eseguire la cartella scaricata.

```sh
npm run validate:catalog
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

`preview` serve la build `dist/` sulla porta 4173. Su un server remoto questi indirizzi locali non sono link pubblici. Nessuna preview cloud pubblica è stata creata.

Per i test browser: `npx playwright install chromium` una volta, poi `npm run test:e2e`. Nei sistemi con Chromium già installato imposta `CHROMIUM_PATH` al suo eseguibile (nell'ambiente cloud: `/usr/bin/chromium`). Gli script taste-skill cercano Chrome/Chromium installato, oppure usano `CHROME_PATH`.

## Percorsi

- `/`: titolo in evidenza e raccolte non vuote.
- `/catalogo`: ricerca e filtri combinabili, conservati nella query URL.
- `/titolo/carminuccio-alexiuccio-ultimo-attimo`: scheda e 14 episodi.
- `/guarda/carminuccio-alexiuccio-ultimo-attimo`: spazio player senza sorgente.
- `/guarda/carminuccio-alexiuccio-ultimo-attimo?episodio=ultimo-attimo-s01e02`: collegamento a un episodio specifico, ora futuro.
- `?versione=film` / `?versione=trailer`: montaggio e trailer distinti, quando forniti.

Tutti i contenuti reali sono prossimamente. Tre schede marcate **Esempio** mostrano tipi e filtri: rimuovile insieme ai riferimenti nelle raccolte quando arrivano le altre produzioni. Nessuna durata o data di uscita inventata, nessuna dipendenza da TMDB. Nessun file immagine, video o audio è incluso nel prodotto: solo segnaposto HTML/CSS.

## Contenuti e distribuzione

Leggi [Gestione contenuti](docs/GESTIONE_CONTENUTI.md), [Inserimento media](docs/INSERIMENTO_MEDIA.md), [Materiali mancanti](docs/MATERIALI_MANCANTI.md) e [Verifiche](docs/VERIFICHE.md).

`firebase.json` configura `dist`, fallback SPA, catalogo/HTML senza cache permanente e cache lunga per bundle versionati. Non contiene un project ID. In futuro, dopo aver verificato quote e traffico, associa il tuo progetto con la CLI ufficiale Firebase (`firebase use --add`) e segui le istruzioni Firebase Hosting. Questo incarico non esegue login o deploy e non attiva servizi Firebase. I file pubblicati saranno pubblici: non includere media inediti o segreti. Non esiste embargo tecnico o protezione con PIN.

## Scelte

La V1 non include accesso, preferiti, upload o cronologia. L'autoplay ha una sola preferenza nella sessione browser, nessun tracciamento. I controlli nativi del video sono affiancati da velocità esplicita. I media vengono rilasciati al cambio pagina; la sequenza non salta episodi futuri. La galleria usa dialog nativo con Escape e ripristino focus. Condivisione nativa con fallback appunti e link selezionabile.

La skill di design è conservata in `.agents/skills/design-taste-frontend/`, licenza MIT inclusa. Provenienza e adattamenti sono in `docs/VERIFICHE.md`.
