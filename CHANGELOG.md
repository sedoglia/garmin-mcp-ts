# Changelog

**[English](CHANGELOG_EN.md)** | **Italiano**

Tutte le modifiche di rilievo di **Garmin Connect MCP Server**, dalla versione più
recente alla più vecchia. Il progetto adotta il
[versionamento semantico](https://semver.org/lang/it/).

> Le voci dalla 4.2.0 in poi sono quelle che stavano in testa ai README. Quelle
> precedenti sono ricostruite dai messaggi di commit, dai tag di release e dalle
> versioni storiche dei README.

## [4.5.5] - 2026-08-22 — Composizione corporea nelle pesate

- **`add_weigh_in`** accetta grasso corporeo, acqua, massa muscolare e ossea, ma Garmin
  conserva **solo il grasso corporeo** su una pesata inserita a mano: le altre tre vengono
  scartate in silenzio. Verificato scrivendole e rileggendo il record, anche con nomi di
  campo alternativi: sopravvive sempre e solo `bodyFat`.
- I parametri restano — una bilancia intelligente quei valori li trasmette davvero — ma un
  parametro accettato e scartato sembra una funzione che c'è. Ora la descrizione dice quali
  campi vengono effettivamente memorizzati.

## [4.5.4] - 2026-08-22 — README allineati

- I README si erano fermati alla v4.4.0 e le tabelle descrivevano tool che nel frattempo
  avevano guadagnato parametri. Il codice compilato è quello della v4.5.3, a parte la
  costante con la versione dichiarata nell'handshake.
- Due voci erano sbagliate, non solo vecchie: `update_gear` era elencato come funzionante
  (non lo era fino alla v4.5.3), e la creazione gear era attribuita a un 403 dell'API,
  mentre in realtà l'endpoint è raggiungibile e a bloccarlo è un payload non documentato.

## [4.5.3] - 2026-08-22 — Modifica dell'equipaggiamento

- **`update_gear`**: non riusciva a modificare nulla. Costruiva il payload della PUT a
  partire da `getGearStats`, che restituisce distanza percorsa e numero di attività e
  nessuno dei campi che il servizio richiede indietro: ogni chiamata falliva con
  `NullPointerException`. Ora rilegge l'attrezzatura dallo stesso indirizzo su cui scrive.
- **Parametri mappati sui campi reali**: il limite di distanza è `maximumMeters` (il tool
  inviava `maximumMeter`), e non esiste un campo modello libero. `gearMakeName` e
  `gearModelName` sono un vocabolario accoppiato che Garmin valida, quindi `brandName` e
  `modelName` vengono scritti in `customMakeModel`, l'unica etichetta libera che l'app
  mostra: `brandName: "Nike"` + `modelName: "Pegasus 41"` dà **Nike Pegasus 41**.
- `link_gear_to_activity`, `remove_gear_from_activity` e `delete_gear` sono stati
  verificati su equipaggiamento reale e non richiedevano modifiche.

## [4.5.2] - 2026-08-22 — Identificativo del profilo

- **`get_user_profile`**: restituiva solo `id` (un identificativo interno che nessun altro
  endpoint Garmin accetta) e ometteva `profileId`, che è invece il valore con cui è indicizzato
  tutto il resto: è l'`ownerId` di ogni attività e lo `userProfilePK` dei dati di benessere.
  Chi chiedeva "l'id dell'utente" otteneva l'unico numero inutilizzabile. Ora ci sono entrambi.

## [4.5.1] - 2026-08-22 — Tre tool di scrittura riparati

Emersi esercitando i tool che scrivono sull'account, non solo quelli che leggono.

- **`delete_weigh_in`**: non cancellava niente. Usava `/weight-service/user-weight/{id}`,
  che risponde 404 per qualsiasi id; il servizio cancella per data e versione. La data viene
  dedotta dall'id della pesata; si può passare esplicitamente con `date` per una pesata
  registrata in un giorno diverso da quello a cui si riferisce.
- **`delete_blood_pressure`**: era inutilizzabile. Richiede la `version` della misurazione,
  e l'unico tool che poteva fornirla — `get_blood_pressure` — chiamava l'endpoint senza
  `includeAll`, quindi l'elenco delle misurazioni tornava sempre vuoto. La lettura si vedeva
  (`numOfMeasurements: 1`) ma non era cancellabile.
- **`create_workout`**: sbagliava sei tipi di sport su otto. Il servizio identifica lo sport
  dall'id e ignora la chiave inviata accanto, quindi creava in silenzio workout di uno sport
  diverso — **swimming e strength erano invertiti fra loro**, `walking` produceva HIIT,
  `cardio` produceva "other", `hiking` e `yoga` usavano id inesistenti. Uno sport non
  riconosciuto ripiegava su **running senza dirlo**: ora viene rifiutato per nome. Sono
  raggiungibili anche i tipi che il servizio offre davvero: `pilates`, `hiit`, `mobility`,
  `rucking`, `other`. La tassonomia dei workout non ha `hiking`: usare `walking` o `rucking`.
- **`get_stress_data`**: leggeva le durate per fascia da campi che l'endpoint `dailyStress`
  non invia, quindi erano sempre assenti. Ora sono calcolate dai campioni.

## [4.5.0] - 2026-08-22 — Quattro tool che non potevano rispondere

- **Risposte oltre il limite**: `get_available_badges` (~85.000 token), `get_sleep_data`
  (~44.000), `get_earned_badges` (~41.000) e `get_stress_data` (~28.000) restituivano il
  payload Garmin grezzo, superando il tetto di token di un risultato: la risposta non
  arrivava affatto al modello. Non erano lenti, erano **inutilizzabili**.
- **Riepilogo di default, dettaglio a richiesta**: seguendo il modello già usato da
  `get_floors`, ora restituiscono un riepilogo e tengono il payload completo dietro un
  parametro esplicito — `includeTimeSeries`, `includeValues`, `includeDetails`.
  `get_sleep_data` scende da ~44.000 a ~1.400 token e dichiara quante misurazioni ha omesso
  per ciascuna serie, dato che ognuna ha già un tool dedicato.
- **Serializzazione compatta**: i risultati venivano indentati con due spazi. L'indentazione
  serve a chi legge un file, non a un modello: rimuoverla ha tolto circa il **58% da ogni
  risposta di tutti i 109 tool**.

## [4.4.0] - 2026-08-22 — Risposte più snelle e Node 22

- **`get_floors`**: restituisce di default solo i totali giornalieri; il dettaglio a
  intervalli di 15 minuti si ottiene con `includeBreakdown: true`. La risposta passa da
  ~5600 a ~210 caratteri nel caso normale.
- **Richiesto Node 22**: il manifest chiedeva Node 18, che non riceve più patch di
  sicurezza dal 30 aprile 2025 (Node 20 dal 30 aprile 2026). Chi è su Node 18 o 20 deve
  aggiornare, altrimenti Claude Desktop considererà l'estensione incompatibile. Il
  codice non è cambiato per questo: usa solo API di lunga data.
- **Sicurezza**: chiusi tutti gli advisory aperti nell'albero delle dipendenze
  (`hono`, `fast-uri`, `ip-address`, `tmp`). `npm audit` non segnala più nulla.

## [4.3.3] - 2026-08-18 — Icona

- L'icona del bundle era l'artwork ufficiale dell'app Garmin Connect. È stata sostituita
  con un disegno originale: nessun logo né marchio di terzi, così l'estensione non si
  presenta come un prodotto Garmin.
- Lo sfondo attorno al riquadro arrotondato è trasparente, non bianco: su un tema scuro
  un PNG opaco mostrerebbe un quadrato bianco attorno all'icona.

## [4.3.2] - 2026-08-18 — Vault nativo su tutte le piattaforme

### 🔐 **KEYTAR**
- Il bundle conteneva **un solo binario nativo di keytar**, quello della macchina che
  lo impacchettava. Su ogni altra piattaforma il caricamento falliva e la chiave di
  cifratura finiva nel file di fallback invece che nel vault del sistema operativo —
  cioè su Windows e macOS, dove gira Claude Desktop, mentre il manifest e la privacy
  policy promettevano il vault.
- Il bundle porta ora un binario per piattaforma (`darwin-x64`, `darwin-arm64`,
  `win32-x64`, `win32-ia32`, `linux-x64`, `linux-arm64`) sotto `vendor/keytar`, e il
  server carica quello che corrisponde a `process.platform` / `process.arch`. I binari
  sono scaricati al momento del pack dallo stesso `prebuild-install` che userebbe npm
  su ciascuna piattaforma.
- Il fallback su file resta per le architetture senza prebuild e per le sessioni Linux
  senza keyring attivo: `check_credentials` dice quale dei due è in uso.
- **Migrazione automatica**: chi aggiorna da una versione precedente ha la chiave nel
  file; al primo avvio viene spostata nel vault e il file viene rimosso. Se il vault
  rifiuta, la chiave resta dov'è e il tentativo si ripete al riavvio successivo. Il
  metodo che fa la migrazione esisteva già nel progetto ma non veniva mai chiamato.

### 📄 **PRIVACY POLICY**
- Documentato il fallback su file, che prima non era menzionato.

## [4.3.1] - 2026-08-18 — Requisiti per la MCP Directory

Nessun cambiamento nel comportamento dei tool: quello che cambia è ciò che il
server e il bundle dichiarano di sé.

### 📋 **MANIFEST**
- **`display_name`**: campo obbligatorio, mancante. Ora vale "Garmin Connect".
- **`icon`**: il valore era `.\GARMIN.png`, un percorso relativo in stile Windows che non
  si risolve quando il bundle viene spacchettato su altre piattaforme. Ora è `GARMIN.png`,
  e l'immagine è stata portata a 512×512, la dimensione consigliata da Claude Desktop.
- **`privacy_policies`**: assente. Una privacy policy mancante o incompleta è motivo di
  rifiuto immediato in fase di review. Ora elenca la policy del progetto e quella di Garmin.
- **`tools`**: i 109 tool sono ora dichiarati nel manifest, generati dal codice con
  `npm run sync:manifest` e verificati in CI, così l'elenco non può divergere.
- **`long_description`**, **`keywords`**, **`compatibility`**: aggiunti per la scheda della
  directory e per dichiarare piattaforme e versione di Node richieste.

### 🏷️ **ANNOTAZIONI DEI TOOL**
- `tools/list` restituiva solo nome, descrizione e schema: **titoli e annotazioni non
  uscivano mai dal server**. La directory legge proprio quella risposta per classificare i
  tool, quindi i 109 tool risultavano privi di titolo e di indicazione di sicurezza. Ora
  ogni tool espone `title`, `readOnlyHint`/`destructiveHint` e `openWorldHint`.
- **`setup_credentials`**: era l'unico tool senza `readOnlyHint` né `destructiveHint`.
  Sovrascrive credenziali e token salvati, quindi ora dichiara `destructiveHint`.
- **`delete_weigh_in`**: descrizione ampliata a cosa viene cancellato e dove trovare l'ID.

### 🔒 **SICUREZZA**
- Gli argomenti dei tool venivano loggati integralmente con `DEBUG_GARMIN` attivo: la
  password passata a `setup_credentials` finiva in chiaro su stderr. I valori sensibili
  sono ora sostituiti da `[redacted]` e l'email viene mascherata.

### 🔧 **RILASCIO**
- Il bundle `.mcpb` e il suo `.sha256` sono costruiti dal tag da un workflow GitHub
  Actions, con le sole dipendenze di produzione, e non più a mano.
- I link di download nel README puntano a `releases/latest`: non si disallineano più a
  ogni versione.

## [4.3.0] - 2026-07-28 — Correttezza dei dati restituiti dai tool

Diciannove tool restituivano dati vuoti, fittizi o semplicemente sbagliati. Ogni
correzione è stata verificata contro un account Garmin reale.

### 🐛 **DATI SBAGLIATI** ✅ CORRETTO
- **`count_activities`**: restituiva sempre `0`. Il servizio risponde con un array di
  bucket contenenti `countOfActivities`, mentre il codice leggeva un `totalCount`
  inesistente. Accetta ora `startDate` / `endDate` opzionali.
- **`get_training_status`**: restituiva il conteggio delle attività di tutta la vita più
  l'intero blob delle impostazioni utente. Ora usa l'endpoint dello stato di allenamento
  e accetta `date` al posto dell'inutile `days`.
- **`get_goals`**: errore 400 perché non inviava il parametro `status`. Senza `status`
  interroga ora tutti e tre gli stati e unisce i risultati.
- **`get_device_alarms`**: restituiva `[]`. L'endpoint `deviceservice/alarms` non esiste:
  le sveglie fanno parte delle impostazioni del dispositivo. `deviceId` è ora opzionale.
- **`get_devices` / `get_device_last_used`**: restituivano entrambi le impostazioni
  utente invece di un elenco di dispositivi e dell'ultimo usato.
- **`get_personal_records`**: leggeva `profile.personalRecords`, campo inesistente.
- **`get_intensity_minutes` / `get_floors`**: gli endpoint usati rispondevano 404, quindi
  dichiaravano "nessun dato" anche per giornate piene.
- **`get_daily_summary`**: restituiva solo i passi più l'intera serie di frequenza
  cardiaca. Ora include calorie, distanza, piani, minuti di intensità, stress e Body Battery.
- **`get_body_composition`**: ignorava `days` e interrogava solo la giornata odierna.
- **`compare_activities` / `find_similar_activities`**: nel dettaglio attività le metriche
  stanno in `summaryDTO`, quindi i confronti producevano `undefined` e `NaN`.
- **`get_activity_splits`**: sempre vuoto, cercava i dati in un payload che non li contiene.
- **`get_race_predictions`**, **`get_training_load`**, **`get_load_ratio`**: endpoint
  errati o inesistenti, mascherati da "nessun dato".
- **`get_training_readiness`**, **`get_max_metrics`**, **`get_activity_hr_zones`**,
  **`get_activity_exercise_sets`**: forma della risposta errata (array espansi in oggetti
  del tipo `{"0": ...}`).
- **`get_progress_summary`**: filtrava solo le ultime 100 attività, troncando in silenzio
  i periodi più intensi.

### ✨ **NUOVI PARAMETRI**
- `count_activities`: `startDate`, `endDate`
- `get_training_status`: `date` (sostituisce `days`)
- `get_device_alarms`: `deviceId` ora opzionale, di default tutti i dispositivi
- `get_intensity_minutes`, `get_body_composition`: `endDate`
- `find_similar_activities`: `searchDepth`
- `set_activity_privacy`: livello `subscribers` ("solo connessioni")

## [4.2.0] - 2026-07-28 — Prima installazione e credenziali

### 🔐 **CONFIGURAZIONE CREDENZIALI** ✅ NUOVO
- **Credenziali richieste durante l'installazione**: Claude Desktop chiede email e password
  Garmin al momento dell'installazione del bundle. La password viene conservata nel vault
  del sistema operativo, mai in un file di testo.
- **`setup_credentials`**: nuovo tool per configurare le credenziali dalla chat, senza
  riavviare l'estensione.
- **`check_credentials`**: mostra se le credenziali sono configurate, da quale fonte
  provengono e dove sono archiviate (non restituisce mai la password).
- **`clear_credentials`**: elimina credenziali cifrate e token OAuth.

### 🐛 **AVVIO DEL SERVER** ✅ CORRETTO
- Il server non termina più all'avvio quando le credenziali mancano o sono errate:
  il transport MCP viene collegato per primo e il login avviene alla prima richiesta.
  L'errore `Server transport closed unexpectedly` su una installazione pulita è risolto,
  e al suo posto compare un messaggio che spiega cosa configurare.
- Le credenziali impostate nell'estensione hanno la precedenza sulla copia cifrata su
  disco, che viene riallineata automaticamente quando cambiano.

### 📈 Ora con **109 TOOLS** disponibili!

## [4.1.1] - 2026-07-24 — Manutenzione e sicurezza

Release di sola manutenzione: nessuna modifica a `src/`, quindi i 106 tool e il loro
comportamento restano identici alla 4.1.0.

- **Sicurezza delle dipendenze**: chiusi in più riprese gli advisory Dependabot aperti
  sull'albero (`hono`, `express-rate-limit`, `qs`, `lodash`, `@modelcontextprotocol/sdk`
  e altri), in parte con aggiornamenti diretti e in parte con `overrides` su versioni
  minime.
- **Toolchain**: TypeScript 5.9 → 7.0, `dotenv` 16 → 17, `tsx` a ^4.23.1 (per esbuild
  0.28.1); risoluzione dei moduli passata a `nodenext`; rimossa la dipendenza `pino`
  inutilizzata; `@types/node` e CI allineati a Node 24.
- **CI**: azioni aggiornate (`checkout@v7`, `setup-node@v7`, `fetch-metadata@v3`),
  auto-merge delle patch di sicurezza Dependabot dietro un gate di build, e stop
  all'esclusione delle dipendenze opzionali in fase di installazione.
- **Bundle**: le impostazioni locali di Claude Code non sono più tracciate né
  impacchettate.
- **Documentazione**: corrette le istruzioni di download del bundle, che indicavano
  `diabetes-m-mcp.mcpb` — un nome copiato da un altro progetto e mai esistito in queste
  release: il percorso di installazione documentato restituiva 404.

## [4.1.0] - 2026-03-01 — Gear Management & Collections

### 🔧 **GEAR MANAGEMENT** ✅ MIGLIORATO
- **`get_all_gear`**: ✅ **ORA FUNZIONANTE** - Lista automatica di tutto l'equipaggiamento (non richiede più UUID manuale!)
- ~~**`create_gear`**~~: ❌ **RIMOSSO** (l'API OAuth Garmin restituisce 403 Forbidden per la creazione gear)
  <br>*Nota aggiunta nella 4.5.4: la diagnosi del 403 era sbagliata. L'endpoint di creazione
  è raggiungibile; a bloccarlo è un payload non documentato.*
- **`update_gear`**: Aggiorna equipaggiamento (UUID ora ottenibile via `get_all_gear`)
- **`delete_gear`**: Elimina equipaggiamento (UUID ora ottenibile via `get_all_gear`)

### 🆕 **GEAR METADATA & COLLECTIONS** ✅ NUOVO
- **`get_gear_types`**: Ottieni i tipi di equipaggiamento disponibili (scarpe, bici, casco, etc.)
- **`get_gear_makes`**: Ottieni le marche/brand disponibili
- **`get_gear_collections`**: Lista tutte le collezioni di equipaggiamento
- **`get_gear_collection`**: Dettagli di una collezione specifica (gear associati, tipi attività)
- **`create_gear_collection`**: Crea una nuova collezione di equipaggiamento
- **`update_gear_collection`**: Aggiorna una collezione (nome, gear, tipi attività)
- **`delete_gear_collection`**: Elimina una collezione

### 📈 Ora con **106 TOOLS** disponibili! (tutti testati e funzionanti)

## [4.0.0] - 2026-01-06 — Social & Advanced Analytics

> Nei README questa sezione era etichettata "Novità v4.1.0" per errore: i tool elencati
> qui sono usciti con la 4.0.0.

### 🤝 **SOCIAL FEATURES** ⚠️ PARZIALE
- **`get_activity_comments`**: Ottieni commenti su un'attività ✅ FUNZIONANTE
- ~~**`add_activity_comment`**: Aggiungi commenti alle attività~~ ❌ **RIMOSSO** (Non supportato da API OAuth Garmin)
- **`set_activity_privacy`**: Imposta privacy (**public**, **private** o **subscribers**)

### 📊 **ADVANCED TRAINING METRICS** ✅ TESTATO
- **`get_training_load`**: Carico di allenamento settimanale e bilanciamento
- **`get_load_ratio`**: Rapporto acuto/cronico (injury risk indicator)
- **`get_performance_condition`**: Condizione di performance attuale

### 💤 **ADVANCED SLEEP ANALYSIS** ✅ TESTATO
- **`get_sleep_movement`**: Movimenti durante il sonno e momenti irrequieti

### ⏰ **DEVICE MANAGEMENT** ✅ TESTATO
- **`get_device_alarms`**: Ottieni sveglie configurate sui dispositivi

### 🗺️ **COURSE MANAGEMENT** ✅ TESTATO
- **`get_courses`**: Ottieni percorsi/route salvati

### 🔬 **ACTIVITY ANALYSIS TOOLS** ✅ TESTATO
- **`compare_activities`**: Confronta 2-5 attività fianco a fianco
- **`find_similar_activities`**: Trova attività simili per tipo/distanza/durata (20% tolerance)
- **`analyze_training_period`**: Analisi completa trends, volumi e pattern di allenamento

### 📋 **CONFORMITÀ MCP DIRECTORY**
Lavoro svolto dopo la 3.2.0 e confluito in questa versione.
- Aggiunti `LICENSE` (MIT) e `PRIVACY.md`, con una sezione dedicata in entrambi i README;
  `manifest.json` portato alla versione 0.3 con `privacy_policies`, icona e repository.
- Privacy policy allineata al GDPR: titolare del trattamento, base giuridica,
  conservazione dei dati, diritti dell'interessato, privacy dei minori (COPPA),
  trasferimenti internazionali, notifica delle violazioni.
- Annotazioni MCP su tutti i tool: `title` leggibile, `readOnlyHint` per quelli di sola
  lettura e `destructiveHint` per quelli che scrivono. Il server però continuerà a non
  esporle in `tools/list` fino alla 4.3.1.

### 📈 **94 TOOL** (92 funzionanti + 2 limitati dall'API)

## [3.2.0] - 2025-12-20 — Bug fix e pulizia

### 🔧 **CORREZIONI**
- **`unschedule_workout`**: nuovo tool per togliere un workout dal calendario. Senza,
  la sola cancellazione lasciava voci fantasma.
- **`delete_blood_pressure`**: implementato l'endpoint funzionante e documentato il tool.
- **`add_weigh_in`**: corretti l'URL dell'endpoint e il formato del payload.
- **`create_manual_activity`**: `startTime` normalizzato e inviato in ora locale.
- **Cancellazioni**: i metodi di delete usano ora le chiamate corrette della libreria
  `garmin-connect`.
- **`get_fitness_age`**: endpoint corretto in `fitnessage-service`.
- **Equipaggiamento**: rimossi i tool gear non funzionanti per limiti dell'API OAuth
  (da 71 a 68 tool), risaliti a 69 con `unschedule_workout`.
- `update_activity_exercise_sets` era stato aggiunto per l'allenamento della forza e poi
  rimosso nella stessa finestra di rilascio.

### 🧹 **PULIZIA**
- Rimossi file e script non utilizzati (`test-all-tools.ts`, `test-gear.ts`), la cartella
  `releases` non è più tracciata da Git e lo script di test unschedula prima di eliminare.

### 📈 **69 TOOL**

## [3.1.0] - 2025-12-17 — Cifratura a riposo e primo bundle

### 🔐 **CIFRATURA**
- Chiave di cifratura nel vault nativo del sistema operativo (Windows Credential Manager,
  macOS Keychain, Linux Secret Service) tramite keytar.
- Credenziali e token OAuth sempre cifrati con **AES-256-GCM**: i dati cifrati stanno in
  `%LOCALAPPDATA%\garmin-mcp\`, i token in `garmin-tokens.enc`.
- Fallback su file protetto quando il vault non è disponibile, con migrazione automatica
  della chiave da file a vault. Il metodo che esegue la migrazione resterà però non
  invocato fino alla 4.3.2.
- Script di supporto: `npm run setup-encryption`, `npm run check-encryption`,
  `npm run test-keytar`.
- Multipiattaforma: Windows, macOS e Linux.

### 📦 **BUNDLE PRECOMPILATO**
- Prima pubblicazione del bundle `.mcpb` per l'installazione rapida in Claude Desktop
  (tag `v3.1.0-bundle`).

## [3.0.1] - 2025-12-13 — Token OAuth su disco

- I token OAuth vengono salvati automaticamente nella root del progetto
  (`oauth1_token.json`, `oauth2_token.json`), esclusi da Git.
- Rimosso il parametro `tokenDir` da `initialize()`.

## [3.0.0] - 2025-12-13 — Espansione completa dall'API Garmin Connect

**Totale: 71 tool.**

- **Utente e attività**: `get_user_summary`, `get_steps_data`, `get_daily_steps`,
  `get_activities_by_date`, `get_activity_typed_splits`
- **Salute**: `get_rhr_day`, `get_hill_score`, `get_all_day_events`,
  `get_body_battery_events`
- **Badge e sfide**: `get_available_badges`, `get_in_progress_badges`,
  `get_available_badge_challenges`, `get_non_completed_badge_challenges`,
  `get_in_progress_virtual_challenges`
- **Equipaggiamento**: `get_gear_activities`, `remove_gear_from_activity`
- **Allenamento**: `get_training_plans`, `get_training_plan_by_id`
- **Salute femminile**: `get_menstrual_data`, `get_pregnancy_summary`
- **Utility**: `get_activity_types`, `get_primary_training_device`, `count_activities`,
  `get_fitness_stats`, `add_hydration_data`
- **Persistenza dei token OAuth**: salvataggio e ricarica per riutilizzare la sessione.
- Correzioni: il parametro `start` delle badge challenge deve essere ≥ 1; il range dei
  passi giornalieri non può superare 28 giorni.

## [2.0.3] - 2025-12-13 — create_workout: InvalidTypeIdException

- La creazione di un workout falliva perché il payload conteneva campi extra
  (`poolLength: 0`, `estimated`, …) che il servizio rifiuta. Ora invia solo i campi
  richiesti: `workoutName`, `description`, `sportType`, `workoutSegments`.

## [2.0.2] - 2025-12-13 — Formato corretto dei workout

- **`create_workout`**: passa al formato richiesto dall'API Garmin — `ExecutableStepDTO`
  per ogni step, oggetti `stepType`, `endCondition` e `targetType`, e tutti i campi null
  attesi.
- **`delete_workout`**: usa il metodo `deleteWorkout` della libreria.
- Verificato il ciclo di vita completo: creazione → modifica → schedulazione →
  cancellazione.

## [2.0.1] - 2025-12-13 — Endpoint corretti e suite di test

- Corretti **`get_device_last_used`** (usa `getUserSettings`), **`get_activity_gear`**
  (estratto dal dettaglio attività), **`get_progress_summary`** (calcolato dalle attività)
  e **`get_daily_summary`** (metodi della libreria).
- Fallback esplicito invece di un errore per `get_personal_records`, `get_gear`,
  `get_gear_defaults` e per gli errori di `create_workout`.
- Aggiunta la suite `npm test`, che esercita tutti i 55 tool.
- README italiano e inglese aggiornati con la documentazione completa della 2.0.

## [2.0.0] - 2025-12-13 — 37 nuovi tool: workout e gestione attività

**Totale: 55 tool.**

- **Gestione workout**: `create_workout` (warmup, intervalli, cooldown),
  `get_workout_by_id`, `download_workout` (FIT), `update_workout`, `delete_workout`,
  `schedule_workout`
- **Gestione attività**: `upload_activity` (FIT/GPX/TCX), `create_manual_activity`,
  `set_activity_name`, `set_activity_type`, `delete_activity`, `download_activity`
  (FIT/TCX/GPX/KML/CSV)
- **Dispositivi**: `get_device_last_used`, `get_device_settings`
- **Salute avanzata**: `get_all_day_stress`, `get_floors`, `get_intensity_minutes`,
  `get_max_metrics` (VO2 max), `get_training_readiness`, `get_endurance_score`,
  `get_fitness_age`
- **Peso e corpo**: `get_weigh_ins`, `add_weigh_in`, `delete_weigh_in`,
  `get_blood_pressure`, `set_blood_pressure`
- **Dettagli attività**: `get_activity_weather`, `get_activity_hr_zones`,
  `get_activity_gear`, `get_activity_exercise_sets`
- **Obiettivi e record**: `get_goals`, `get_adhoc_challenges`, `get_badge_challenges`,
  `get_earned_badges`, `get_personal_records`, `get_race_predictions`
- **Equipaggiamento**: `get_gear`, `get_gear_defaults`, `get_gear_stats`,
  `link_gear_to_activity`
- **Report e progressi**: `get_progress_summary`, `get_daily_summary`

## [1.2.0] - 2025-12-12 — Stress, Body Battery e wellness

**5 nuovi tool, totale 18.**

- `get_stress_data` (scala 0-100), `get_body_battery` (0-100), `get_hrv_data`,
  `get_respiration_data`, `get_spo2_data`
- Richieste dirette agli endpoint `wellness-service` di Garmin, su
  `connectapi.garmin.com`, con statistiche calcolate (media, massimo, minimo) per stress
  e Body Battery.
- Suite di test estesa a 49 test.

## [1.0.0] - 2025-12-12 — Prima release

**13 tool.**

- `list_recent_activities`, `get_activity_details`, `get_activity_splits`, `get_workouts`,
  `get_health_metrics`, `get_sleep_data`, `get_body_composition`, `get_steps`,
  `get_heart_rate`, `get_hydration`, `get_devices`, `get_user_profile`,
  `get_training_status`
- Implementazione interamente in TypeScript, validazione degli argomenti via JSON Schema
  (senza Zod), suite di 37 test e documentazione bilingue (italiano e inglese).

> Non è mai esistita una versione 1.1.0: dalla 1.0.0 si è passati direttamente alla 1.2.0.
