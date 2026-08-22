# Garmin Connect MCP Server

<div align="center">

**[English](README_EN.md)** | **Italiano**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-4.5.5-green.svg)](https://github.com/sedoglia/garmin-mcp-ts)

[![PayPal](https://img.shields.io/badge/Supporta%20il%20Progetto-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

</div>

---

Un server Model Context Protocol (MCP) che connette Claude Desktop a Garmin Connect, permettendo di interrogare in linguaggio naturale i tuoi dati di attività fisica, metriche di salute, sonno e altro ancora.

## 🆕 Novità v4.5.5 - Composizione corporea nelle pesate

- **`add_weigh_in`** accetta grasso corporeo, acqua, massa muscolare e ossea, ma Garmin
  conserva **solo il grasso corporeo** su una pesata inserita a mano: le altre tre vengono
  scartate in silenzio. Verificato scrivendole e rileggendo il record, anche con nomi di
  campo alternativi: sopravvive sempre e solo `bodyFat`.
- I parametri restano — una bilancia intelligente quei valori li trasmette davvero — ma un
  parametro accettato e scartato sembra una funzione che c'è. Ora la descrizione dice quali
  campi vengono effettivamente memorizzati.

## 🆕 Novità v4.5.4 - README allineati

- I README si erano fermati alla v4.4.0 e le tabelle descrivevano tool che nel frattempo
  avevano guadagnato parametri. Il codice compilato è quello della v4.5.3, a parte la
  costante con la versione dichiarata nell'handshake.
- Due voci erano sbagliate, non solo vecchie: `update_gear` era elencato come funzionante
  (non lo era fino alla v4.5.3), e la creazione gear era attribuita a un 403 dell'API,
  mentre in realtà l'endpoint è raggiungibile e a bloccarlo è un payload non documentato.

## 🆕 Novità v4.5.3 - Modifica dell'equipaggiamento

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

## 🆕 Novità v4.5.2 - Identificativo del profilo

- **`get_user_profile`**: restituiva solo `id` (un identificativo interno che nessun altro
  endpoint Garmin accetta) e ometteva `profileId`, che è invece il valore con cui è indicizzato
  tutto il resto: è l'`ownerId` di ogni attività e lo `userProfilePK` dei dati di benessere.
  Chi chiedeva "l'id dell'utente" otteneva l'unico numero inutilizzabile. Ora ci sono entrambi.

## 🆕 Novità v4.5.1 - Tre tool di scrittura riparati

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

## 🆕 Novità v4.5.0 - Quattro tool che non potevano rispondere

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

## 🆕 Novità v4.4.0 - Risposte più snelle e Node 22

- **`get_floors`**: restituisce di default solo i totali giornalieri; il dettaglio a
  intervalli di 15 minuti si ottiene con `includeBreakdown: true`. La risposta passa da
  ~5600 a ~210 caratteri nel caso normale.
- **Richiesto Node 22**: il manifest chiedeva Node 18, che non riceve più patch di
  sicurezza dal 30 aprile 2025 (Node 20 dal 30 aprile 2026). Chi è su Node 18 o 20 deve
  aggiornare, altrimenti Claude Desktop considererà l'estensione incompatibile. Il
  codice non è cambiato per questo: usa solo API di lunga data.
- **Sicurezza**: chiusi tutti gli advisory aperti nell'albero delle dipendenze
  (`hono`, `fast-uri`, `ip-address`, `tmp`). `npm audit` non segnala più nulla.

## 🆕 Novità v4.3.3 - Icona

- L'icona del bundle era l'artwork ufficiale dell'app Garmin Connect. È stata sostituita
  con un disegno originale: nessun logo né marchio di terzi, così l'estensione non si
  presenta come un prodotto Garmin.
- Lo sfondo attorno al riquadro arrotondato è trasparente, non bianco: su un tema scuro
  un PNG opaco mostrerebbe un quadrato bianco attorno all'icona.

## 🆕 Novità v4.3.2 - Vault nativo su tutte le piattaforme

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

## 🆕 Novità v4.3.1 - Requisiti per la MCP Directory

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

## 🆕 Novità v4.3.0 - Correttezza dei dati restituiti dai tool

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

## 🆕 Novità v4.2.0 - Prima installazione e credenziali

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

---

## 🎉 Novità v4.1.0 - Gear Management & Collections

### 🔧 **GEAR MANAGEMENT** ✅ MIGLIORATO
- **`get_all_gear`**: ✅ **ORA FUNZIONANTE** - Lista automatica di tutto l'equipaggiamento (non richiede più UUID manuale!)
- ~~**`create_gear`**~~: ❌ **RIMOSSO** (l'API OAuth Garmin restituisce 403 Forbidden per la creazione gear)
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

---

## Novità v4.1.0 - Social & Advanced Analytics

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

---

## Funzionalità

Questo server MCP fornisce **109 potenti strumenti** per interagire con i tuoi dati Garmin Connect:

### Strumenti Attività (Base)
| Strumento | Descrizione |
|-----------|-------------|
| `list_recent_activities` | Ottiene la lista delle attività recenti con filtri opzionali |
| `get_activity_details` | Ottiene informazioni dettagliate su un'attività specifica |
| `get_activity_splits` | Ottiene dati di split/lap per un'attività specifica |
| `get_workouts` | Ottiene la lista dei workout pianificati |

### Strumenti Salute & Benessere
| Strumento | Descrizione |
|-----------|-------------|
| `get_health_metrics` | Ottiene metriche di salute giornaliere (passi, frequenza cardiaca, VO2 max) |
| `get_sleep_data` | Ottiene sonno: durata, fasi, punteggio e riepilogo notturno; con `includeTimeSeries` anche le serie al minuto |
| `get_body_composition` | Ottiene misurazioni della composizione corporea (peso, BMI, grasso, massa muscolare) su un periodo di `days` giorni, con la media |
| `get_steps` | Ottiene il conteggio passi per una data specifica |
| `get_heart_rate` | Ottiene dati dettagliati sulla frequenza cardiaca |
| `get_hydration` | Ottiene dati giornalieri sull'idratazione |

### Metriche Wellness (v1.2)
| Strumento | Descrizione |
|-----------|-------------|
| `get_stress_data` | Ottiene lo stress del giorno (scala 0-100): medio/max/min e secondi per fascia; con `includeValues` anche i singoli campioni |
| `get_body_battery` | Ottiene i livelli di energia Body Battery (0-100) |
| `get_hrv_data` | Ottiene dati di variabilità cardiaca (HRV) |
| `get_respiration_data` | Ottiene dati sulla frequenza respiratoria |
| `get_spo2_data` | Ottiene dati SpO2 (saturazione di ossigeno nel sangue) |

### Strumenti Utente & Dispositivi
| Strumento | Descrizione |
|-----------|-------------|
| `get_devices` | Ottiene la lista dei dispositivi Garmin registrati (id, modello, seriale, firmware) |
| `get_user_profile` | Ottiene il profilo utente. `profileId` è l'id con cui è indicizzato il resto dei dati (`ownerId` delle attività); `id` è un identificativo interno separato |
| `get_training_status` | Ottiene lo stato di allenamento per una data: status, VO2 max, carico acuto/cronico, rapporto ACWR |

---

## Nuovi Strumenti v2.0

### Gestione Workout
| Strumento | Descrizione |
|-----------|-------------|
| `get_workout_by_id` | Ottiene dettagli di un workout specifico |
| `download_workout` | Scarica workout in formato FIT per sync su device |
| `create_workout` | **Crea workout strutturati** con warmup, intervalli, cooldown. Sport validi: `running`, `cycling`, `walking`, `swimming`, `strength`, `cardio`, `yoga`, `pilates`, `hiit`, `mobility`, `rucking`, `other` |
| `update_workout` | Modifica un workout esistente |
| `delete_workout` | Elimina un workout |
| `schedule_workout` | Schedula un workout su una data specifica |
| `unschedule_workout` | Rimuove workout dal calendario (⚠️ usare prima di delete_workout) |

### Gestione Attività
| Strumento | Descrizione |
|-----------|-------------|
| `upload_activity` | Upload file attività (FIT, GPX, TCX) |
| `create_manual_activity` | Crea attività manuale |
| `set_activity_name` | Modifica nome attività |
| `set_activity_type` | Modifica tipo attività |
| `delete_activity` | Elimina un'attività (⚠️ irreversibile) |
| `download_activity` | Scarica attività in vari formati (FIT, TCX, GPX, KML, CSV) |

### Device & Settings
| Strumento | Descrizione |
|-----------|-------------|
| `get_device_last_used` | Ottiene info sull'ultimo dispositivo usato |
| `get_device_settings` | Ottiene impostazioni di un dispositivo |

### Health & Wellness Avanzati
| Strumento | Descrizione |
|-----------|-------------|
| `get_all_day_stress` | Ottiene stress dettagliato per tutto il giorno |
| `get_floors` | Ottiene piani saliti e scesi; con `includeBreakdown` anche il dettaglio a intervalli di 15 minuti |
| `get_intensity_minutes` | Ottiene minuti di intensità (moderata e vigorosa) per una data o un range, con totali e obiettivo settimanali |
| `get_max_metrics` | Ottiene metriche max (VO2 max, etc.) |
| `get_training_readiness` | **Ottiene punteggio Training Readiness** |
| `get_endurance_score` | **Ottiene Endurance Score** |
| `get_fitness_age` | **Ottiene Fitness Age stimata** |
| `get_daily_summary` | Ottiene sommario giornaliero completo (passi, calorie, distanza, piani, minuti intensità, FC, stress, Body Battery) |

### Weight & Body
| Strumento | Descrizione |
|-----------|-------------|
| `get_weigh_ins` | Ottiene pesate in un range di date |
| `add_weigh_in` | Aggiunge pesata con dati composizione corporea |
| `delete_weigh_in` | Elimina una pesata; `date` serve solo se la pesata è riferita a un giorno diverso da quello di registrazione |
| `get_blood_pressure` | Ottiene misurazioni pressione sanguigna |
| `set_blood_pressure` | Registra misurazione pressione |
| `delete_blood_pressure` | Elimina misurazione pressione |

### Activity Details Avanzati
| Strumento | Descrizione |
|-----------|-------------|
| `get_activity_weather` | Ottiene meteo durante un'attività |
| `get_activity_hr_zones` | Ottiene il tempo trascorso in ciascuna zona di frequenza cardiaca |
| `get_activity_exercise_sets` | Ottiene set esercizi (strength training) |

### Goals, Challenges & Records
| Strumento | Descrizione |
|-----------|-------------|
| `get_goals` | Ottiene obiettivi; senza `status` interroga tutti gli stati e unisce i risultati |
| `get_adhoc_challenges` | Ottiene sfide ad-hoc |
| `get_badge_challenges` | Ottiene sfide badge disponibili |
| `get_earned_badges` | Ottiene i badge guadagnati con la data di conquista; con `includeDetails` il record completo |
| `get_personal_records` | Ottiene i record personali (typeId, valore, data e attività di riferimento) |
| `get_race_predictions` | Ottiene previsioni tempi gara (5K, 10K, HM, M) |

### Gear Management
| Strumento | Descrizione |
|-----------|-------------|
| `get_all_gear` | Lista completa di tutto l'equipaggiamento con UUID |
| `update_gear` | Aggiorna equipaggiamento esistente. `brandName` e `modelName` finiscono nella stessa etichetta libera, perché marca e modello di catalogo sono un vocabolario che Garmin valida |
| `delete_gear` | Elimina equipaggiamento |
| `get_gear_stats` | Ottiene statistiche uso gear |
| `link_gear_to_activity` | Collega gear a un'attività |

> **Nota:** A partire dalla v4.1, `get_all_gear` funziona automaticamente e fornisce gli UUID necessari per gli altri strumenti gear. La creazione di nuovo gear non è supportata dall'API OAuth di Garmin.

### Reports & Progress
| Strumento | Descrizione |
|-----------|-------------|
| `get_progress_summary` | Ottiene sommario progressi tra due date |

---

## 🆕 Nuovi Strumenti v3.0

### User & Activity Summary
| Strumento | Descrizione |
|-----------|-------------|
| `get_user_summary` | Ottiene riepilogo utente per una data (steps, calories, etc.) |
| `get_steps_data` | Ottiene dati passi dettagliati per una data |
| `get_daily_steps` | Ottiene passi giornalieri in un range di date (max 28 giorni) |
| `get_activities_by_date` | Ottiene attività in un range di date |
| `get_activity_typed_splits` | Ottiene split per tipo di attività |

### Health Metrics Avanzati
| Strumento | Descrizione |
|-----------|-------------|
| `get_rhr_day` | Ottiene frequenza cardiaca a riposo giornaliera |
| `get_hill_score` | Ottiene punteggio Hill Score in un range di date |
| `get_all_day_events` | Ottiene tutti gli eventi del giorno (stress, body battery) |
| `get_body_battery_events` | Ottiene eventi Body Battery dettagliati |

### Badges & Challenges Avanzati
| Strumento | Descrizione |
|-----------|-------------|
| `get_available_badges` | Ottiene i badge disponibili (id, nome, categoria, difficoltà, punti); con `includeDetails` il record completo |
| `get_in_progress_badges` | Ottiene badge in corso di completamento |
| `get_available_badge_challenges` | Ottiene sfide badge disponibili |
| `get_non_completed_badge_challenges` | Ottiene sfide badge non completate |
| `get_in_progress_virtual_challenges` | Ottiene sfide virtuali in corso |

### Gear Avanzato
| Strumento | Descrizione |
|-----------|-------------|
| `get_gear_activities` | Ottiene attività associate a un gear |
| `remove_gear_from_activity` | Rimuove gear da un'attività |

### Training Plans
| Strumento | Descrizione |
|-----------|-------------|
| `get_training_plans` | Ottiene piani di allenamento disponibili |
| `get_training_plan_by_id` | Ottiene dettagli piano di allenamento |

### Salute Femminile
| Strumento | Descrizione |
|-----------|-------------|
| `get_menstrual_data` | Ottiene dati ciclo mestruale per una data |
| `get_pregnancy_summary` | Ottiene riepilogo gravidanza |

### Utility & Stats
| Strumento | Descrizione |
|-----------|-------------|
| `get_activity_types` | Ottiene tutti i tipi di attività disponibili |
| `get_primary_training_device` | Ottiene dispositivo di allenamento primario |
| `count_activities` | Conta le attività, su tutto lo storico o in un range di date |
| `get_fitness_stats` | Ottiene statistiche fitness in un range di date |
| `add_hydration_data` | Aggiunge dati idratazione |

---

## 🆕 Nuovi Strumenti v4.0

### Social Features
| Strumento | Descrizione |
|-----------|-------------|
| `get_activity_comments` | Ottiene commenti su un'attività |
| `set_activity_privacy` | Imposta privacy attività (public/private/subscribers) |

### Advanced Training Metrics
| Strumento | Descrizione |
|-----------|-------------|
| `get_training_load` | Bilanciamento del carico mensile (aerobico basso/alto, anaerobico) rispetto ai target |
| `get_load_ratio` | Rapporto acuto/cronico (injury risk indicator) |
| `get_performance_condition` | Condizione di performance attuale |

### Advanced Sleep & Device
| Strumento | Descrizione |
|-----------|-------------|
| `get_sleep_movement` | Movimenti durante il sonno e momenti irrequieti |
| `get_device_alarms` | Sveglie configurate sui dispositivi (orario, giorni, attiva/disattiva) |
| `get_courses` | Percorsi/route salvati |

### Activity Analysis
| Strumento | Descrizione |
|-----------|-------------|
| `compare_activities` | Confronta 2-5 attività fianco a fianco |
| `find_similar_activities` | Trova attività simili per tipo/distanza/durata |
| `analyze_training_period` | Analisi completa trends, volumi e pattern |

---

## 🆕 Nuovi Strumenti v4.1

### Gear Metadata
| Strumento | Descrizione |
|-----------|-------------|
| `get_gear_types` | Tipi di equipaggiamento disponibili (scarpe, bici, etc.) |
| `get_gear_makes` | Marche/brand disponibili |

### Gear Collections (CRUD completo)
| Strumento | Descrizione |
|-----------|-------------|
| `get_gear_collections` | Lista tutte le collezioni di equipaggiamento |
| `get_gear_collection` | Dettagli collezione (gear associati, tipi attività) |
| `create_gear_collection` | Crea nuova collezione con associazione attività |
| `update_gear_collection` | Aggiorna collezione (nome, gear, tipi attività) |
| `delete_gear_collection` | Elimina una collezione |

---

## 🆕 Nuovi Strumenti v4.2

### Credenziali
Funzionano anche quando l'autenticazione a Garmin non è ancora possibile: sono il modo
per configurarla.

| Strumento | Descrizione |
|-----------|-------------|
| `setup_credentials` | Salva email e password cifrate nel vault del SO e verifica subito l'accesso |
| `check_credentials` | Stato della configurazione: fonte attiva, archivio, sessione (mai la password) |
| `clear_credentials` | Elimina credenziali cifrate e token OAuth e chiude la sessione |

---

## Prerequisiti

- **Node.js** 22.0 o superiore
- **npm** 8.0 o superiore
- **Claude Desktop** installato
- Account **Garmin Connect** con credenziali valide

## 🚀 Installazione Rapida (Bundle Precompilato)

### Passaggi:

### 1. Installa Keytar (Raccomandato per sicurezza massima)

Per utilizzare il vault nativo del sistema operativo (Windows Credential Manager, macOS Keychain, Linux Secret Service), installa `keytar`:

```bash
npm install keytar
```

> **Nota:** Se `keytar` non può essere installato, il sistema userà automaticamente un file criptato come fallback.

### 2. Scarica il bundle

Usa il browser oppure:

```bash
wget https://github.com/sedoglia/garmin-mcp-ts/releases/latest/download/garmin-mcp-ts.mcpb
```

### 3. Verifica l'integrità

Verifica l'integrità (opzionale ma consigliato):

```bash
wget https://github.com/sedoglia/garmin-mcp-ts/releases/latest/download/garmin-mcp-ts.mcpb.sha256
sha256sum -c garmin-mcp-ts.mcpb.sha256
```

### 4. Installa l'estensione in Claude Desktop (Metodo Consigliato)

**Installazione tramite Custom Desktop Extensions:**

1. Apri **Claude Desktop**
2. Vai su **Impostazioni** (Settings)
3. Seleziona la scheda **Estensioni** (Extensions)
4. Clicca su **Impostazioni Avanzate** (Advanced settings) e trova la sezione **Extension Developer**
5. Clicca su **"Installa Estensione..."** (Install Extension…)
6. Seleziona il file `.mcpb` (`garmin-mcp-ts.mcpb` scaricato al passaggio 2)
7. Segui le indicazioni a schermo per completare l'installazione

> **Nota:** Questo è il metodo più semplice e consigliato. L'estensione sarà automaticamente integrata in Claude Desktop senza necessità di configurazione manuale.

---

### 5. Configura le Credenziali Garmin

Durante l'installazione Claude Desktop mostra due campi, **Garmin Email** e
**Garmin Password**: compilali con le credenziali del tuo account Garmin Connect.
La password viene conservata nel vault nativo del sistema operativo (Windows Credential
Manager, macOS Keychain, Linux Secret Service) e non viene mai scritta in chiaro.

Puoi rivedere o modificare i due campi in qualsiasi momento da
**Impostazioni → Estensioni → garmin-mcp-ts**.

**In alternativa, dalla chat:** apri una **nuova chat su Claude Desktop** e scrivi:

```
Configura le credenziali di accesso per Garmin
```

Rispondi al messaggio fornendo:
- **Utente:** la tua email Garmin
- **Password:** la tua password Garmin

Claude usa il tool `setup_credentials`, che cifra e salva le credenziali nel vault nativo
del sistema operativo e verifica subito l'accesso a Garmin Connect. Non serve riavviare.

> **Nota:** Le credenziali NON verranno salvate in file di testo. Saranno sempre
> crittografate e gestite dal vault nativo del SO. Se hai compilato i campi
> dell'estensione, quei valori hanno la precedenza su quanto salvato da
> `setup_credentials`: per cambiarli, modificali in Impostazioni → Estensioni.

Per verificare la configurazione in qualsiasi momento:

```
Controlla lo stato delle credenziali Garmin
```

### 6. Riavvia Claude Desktop

- Chiudi completamente l'applicazione
- Riapri Claude Desktop
- Verifica in Impostazioni → Sviluppatore lo stato della connessione ✅

## 🚀 Installazione (clonando il repository con GIT)

### 1. Clona il Repository

```bash
git clone https://github.com/sedoglia/garmin-mcp-ts.git
cd garmin-mcp-ts
```

### 2. Installa le Dipendenze

```bash
npm install
```

### 3. Installa Keytar (Raccomandato per sicurezza massima)

Per utilizzare il vault nativo del sistema operativo (Windows Credential Manager, macOS Keychain, Linux Secret Service), installa `keytar`:

```bash
npm install keytar
```

> **Nota:** Se `keytar` non può essere installato, il sistema userà automaticamente un file criptato come fallback.

### 4. Compila il Progetto

```bash
npm run build
```

### 5. Configura le Credenziali Garmin (Metodo Sicuro - Raccomandato)

Esegui lo script di setup per configurare le credenziali in modo sicuro:

```bash
npm run setup-encryption
```

Questo script:
1. Crea una directory sicura nella home dell'utente
2. Genera una chiave di encryption e la salva nel vault nativo del SO
3. Chiede email e password Garmin
4. Cripta e salva le credenziali in modo sicuro

Per verificare la configurazione:
```bash
npm run check-encryption
```

### 5b. Metodo Alternativo (Legacy)

In alternativa, puoi creare un file `.env` nella root del progetto:

```env
GARMIN_EMAIL=tua.email@esempio.com
GARMIN_PASSWORD=la_tua_password_garmin
```

> **Nota sulla Sicurezza:** Non commitare mai il file `.env` nel controllo versione. È già incluso in `.gitignore`. Si consiglia di usare il metodo sicuro sopra descritto.

## Configurazione di Claude Desktop

### Posizione del File di Configurazione

Il file di configurazione di Claude Desktop si trova in:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

### Esempio di Configurazione

Aggiungi il server MCP Garmin al tuo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "garmin": {
      "command": "node",
      "args": ["C:\\percorso\\a\\garmin-mcp-ts\\dist\\index.js"]
    }
  }
}
```

**Per macOS/Linux:**

```json
{
  "mcpServers": {
    "garmin": {
      "command": "node",
      "args": ["/percorso/a/garmin-mcp-ts/dist/index.js"]
    }
  }
}
```

### Verifica della Configurazione

1. Riavvia Claude Desktop dopo aver salvato la configurazione
2. Cerca gli strumenti Garmin tra quelli disponibili (icona martello)
3. Prova a chiedere: "Quali sono le mie attività recenti su Garmin?"

## Esempi di Utilizzo

### Interrogare le Attività Recenti

> "Mostrami le mie ultime 5 attività Garmin"

> "Quali attività ho fatto questa settimana?"

### Ottenere Metriche di Salute

> "Quali sono le mie metriche di salute per oggi?"

> "Quanti passi ho fatto ieri?"

### Analisi del Sonno

> "Come ho dormito la scorsa notte?"

> "Mostrami i dati del sonno del 10 dicembre"

### Gestione Workout (NUOVO v2.0)

> "Mostrami i miei workout pianificati"

> "Scarica il mio ultimo workout"

### Training Readiness (NUOVO v2.0)

> "Qual è il mio Training Readiness di oggi?"

> "Mostrami il mio Endurance Score"

### Progressi e Statistiche (NUOVO v2.0)

> "Quanti km ho corso questo mese?"

> "Mostrami il sommario dei miei progressi dell'ultimo mese"

### Health Metrics Avanzati (NUOVO v3.0)

> "Qual è stata la mia frequenza cardiaca a riposo oggi?"

> "Mostrami gli eventi di tutto il giorno per stress e body battery"

### Salute Femminile (NUOVO v3.0)

> "Come influisce il mio ciclo mestruale sulla mia performance di allenamento?"

> "In base al mio ciclo, quale tipo di allenamento dovrei fare?"

### Gestione Equipaggiamento (NUOVO v4.0/v4.1)

> "Mostrami tutto il mio equipaggiamento Garmin"

> "Quali tipi di equipaggiamento posso gestire?"

> "Crea una collezione 'Scarpe Running' e associala alle attività di corsa"

> "Mostrami le mie collezioni di equipaggiamento"

### Commenti e Privacy (NUOVO v4.0)

> "Mostrami i commenti sulla mia ultima attività"

> "Imposta la mia ultima corsa come privata"

### Metriche Training Avanzate (NUOVO v4.0)

> "Come sta andando il mio carico di allenamento questo mese?"

> "Qual è il mio rapporto acuto/cronico? Sono a rischio infortuni?"

### Analisi Attività (NUOVO v4.0)

> "Confronta le mie ultime 3 corse"

> "Trova attività simili alla mia corsa di domenica scorsa"

> "Analizza il mio allenamento dell'ultimo mese"

## Test

Esegui i test con dati reali:

```bash
npm test
```

Il test script verifica tutti gli strumenti con il tuo account Garmin.

## Architettura

```
garmin-mcp-ts/
├── src/
│   ├── index.ts           # Punto di ingresso, gestione stdout/stderr
│   ├── garmin/
│   │   ├── client.ts      # Client API Garmin Connect (2200+ righe)
│   │   ├── types.ts       # Definizioni tipi TypeScript
│   │   └── simple-login.ts # Utility standalone per test login
│   ├── mcp/
│   │   ├── server.ts      # Setup server MCP e gestori richieste
│   │   ├── tools.ts       # Definizioni strumenti e schemi (109 tools)
│   │   └── handlers.ts    # Logica implementazione strumenti
│   └── utils/
│       ├── constants.ts   # Costanti dell'applicazione
│       ├── errors.ts      # Classi di errore personalizzate
│       ├── logger.ts      # Utility di logging (solo stderr)
│       └── secure-storage.ts # Modulo di storage sicuro con encryption
├── scripts/
│   ├── setup-encryption.ts  # Script interattivo per setup credenziali
│   ├── check-encryption.ts  # Script diagnostico per verificare encryption
│   ├── sync-manifest.ts     # Rigenera e verifica manifest.json dal codice
│   └── test-keytar.ts       # Script diagnostico per testare l'integrazione con Keytar
├── dist/                  # Output JavaScript compilato
├── manifest.json          # Manifest MCPB del bundle (generato in parte da sync-manifest)
├── PRIVACY.md             # Privacy policy referenziata dal manifest
├── package.json
└── tsconfig.json
```

## 📦 Costruire il bundle .mcpb

Il bundle pubblicato viene costruito dal workflow `Release`, che allega `.mcpb` e
`.sha256` a una release in bozza. Si attiva in due modi:

- **dal tag**: `git tag v4.3.1 && git push origin v4.3.1`;
- **a mano**: Actions → Release → *Run workflow*, indicando il tag da pubblicare. Se non
  esiste ancora, il workflow lo crea dal ramo selezionato; se esiste, costruisce quello
  che il tag contiene.

La release nasce in bozza. La casella *publish* la pubblica: lanciando di nuovo il
workflow sullo stesso tag con quella casella spuntata, la bozza esistente viene
pubblicata senza toccarne gli allegati.

Le note della release stanno in `.github/release-notes/<tag>.md`. Se il file esiste il
workflow lo usa come testo della release, altrimenti ripiega sull'elenco automatico delle
pull request. Per correggere il testo di una release già pubblicata basta modificare il
file e rilanciare il workflow: gli allegati non vengono toccati.

In entrambi i casi il workflow rifiuta di procedere se il tag non corrisponde alla
versione dichiarata nel manifest. Per costruire il bundle in locale:

```bash
npm ci
npm run pack        # build + controllo manifest + validazione + mcpb pack
```

Se cambi, aggiungi o rimuovi un tool, rigenera l'elenco dichiarato nel manifest:

```bash
npm run sync:manifest
```

`npm run check:manifest` fa fallire la CI quando manifest e codice divergono: la directory
MCP legge il manifest e la risposta di `tools/list`, e un disallineamento fra i due si
scopre altrimenti solo in fase di review.

## 🔐 Architettura di Sicurezza

Il sistema di sicurezza utilizza un'architettura a due livelli per proteggere le credenziali:

### Dove vengono salvati i dati

| Sistema Operativo | Chiave di Encryption | Dati Criptati |
|-------------------|---------------------|---------------|
| **Windows** | Windows Credential Manager | `%LOCALAPPDATA%\garmin-mcp\` |
| **macOS** | Keychain (Face ID/Touch ID) | `~/Library/Application Support/garmin-mcp/` |
| **Linux** | Secret Service (D-Bus/GNOME) | `~/.config/garmin-mcp/` |

### Come funziona

1. **Chiave di Encryption**: Una chiave AES-256 viene generata alla prima esecuzione e salvata nel vault nativo del SO
2. **Credenziali**: Email e password vengono cifrate con AES-256-GCM e salvate in `garmin-credentials.enc`
3. **Token OAuth**: I token vengono cifrati e salvati in `garmin-tokens.enc` per riutilizzo sessione

### Perché è sicuro

- **La chiave non è mai su disco in chiaro**: È nel vault hardware/software del SO
- **Se il repository viene esposto**: I dati rimangono inutili senza la chiave
- **Se il PC viene clonato**: I dati sono inaccessibili (la chiave rimane nel vault dell'utente originale)
- **Encryption forte**: AES-256-GCM con IV casuale per ogni operazione

### Fallback

Se `keytar` non è disponibile (vault nativo), il sistema usa un file `.encryption.key` con permessi ristretti (0o600) nella directory dati.

### Verifica stato encryption

Per verificare lo stato completo dell'encryption e keytar:

```bash
npm run check-encryption
```

Per testare l'integrazione con keytar:

```bash
npm run test-keytar
```

## ⚠️ Limitazioni Note

### Limitazioni API Garmin OAuth

Alcuni endpoint e funzionalità non sono disponibili tramite l'API OAuth pubblica di Garmin:

#### Commenti alle Attività
- ✅ **Lettura commenti** (`get_activity_comments`): Funzionante
- ❌ **Scrittura commenti** (`add_activity_comment`): **NON SUPPORTATO** dall'API OAuth
  - I commenti possono essere aggiunti solo tramite:
    - Web interface di [Garmin Connect](https://connect.garmin.com)
    - App mobile Garmin Connect
    - NON disponibile via API OAuth

#### Privacy Attività
- ✅ **Impostare privacy** (`set_activity_privacy`): Funzionante
  - ✅ `public`: Funziona correttamente
  - ✅ `private`: Funziona correttamente
  - ✅ `subscribers`: Funziona correttamente (è "solo connessioni" in Garmin Connect)
  - ❌ `followers`: **NON SUPPORTATO** - non è una chiave valida, restituisce 400. La chiave corretta è `subscribers`

  Il livello attuale si legge da `accessControlRuleDTO` in `get_activity_details`: leggerlo prima di modificarlo evita di sovrascrivere `subscribers` con `public`.

#### Gear Management
- ✅ **Lista gear** (`get_all_gear`): Funzionante (via endpoint `filterGear`)
- ✅ **Aggiorna/elimina gear** (`update_gear`, `delete_gear`): Funzionante (`update_gear` era rotto fino alla v4.5.3)
- ❌ **Creazione gear** (`create_gear`): **NON DISPONIBILE** - l'endpoint esiste ma il suo payload non è documentato: risponde 500 senza indicare quale campo rifiuti
  - I gear possono essere creati solo tramite:
    - Web interface di [Garmin Connect](https://connect.garmin.com/modern/gear)
    - App mobile Garmin Connect
- ✅ **Collezioni gear** (CRUD completo): Funzionante

#### Metriche Avanzate (Dipende dal Dispositivo)

Alcune metriche potrebbero non essere disponibili a seconda del modello di smartwatch:

| Metrica | Dispositivi Supportati | Note |
|---------|------------------------|------|
| `get_endurance_score` | Solo dispositivi premium (Fenix 7+, Forerunner 955+) | Non disponibile su Instinct 2 Solar |
| `get_training_readiness` | Richiede rilevazione HRV notturna | Assente se il dispositivo non registra l'HRV |
| `get_floors` | Richiede barometro | Assente sui dispositivi senza altimetro barometrico |
| `get_intensity_minutes` | Tutti i dispositivi | — |
| `get_training_load` | Richiede 7+ giorni di dati | Snapshot alla data richiesta, non un aggregato del range |
| `get_load_ratio` | Richiede 4+ settimane consecutive | Calcolato su storico esteso |
| `get_performance_condition` | Durante attività | Garmin non la espone come metrica giornaliera: usare `get_activity_details` |

**Nota**: Alcune metriche sono visibili nell'app Garmin Connect ma potrebbero non essere esposte tramite API OAuth.

## Risoluzione dei Problemi

### Problemi Comuni

#### Autenticazione Fallita

1. Verifica che le tue credenziali Garmin siano corrette
2. Controlla di poter accedere manualmente a [connect.garmin.com](https://connect.garmin.com)
3. Assicurati che non ci siano caratteri speciali nella password che potrebbero richiedere escape

#### Rate Limiting (Errore 429)

Garmin potrebbe bloccare temporaneamente le richieste se ne vengono fatte troppe in un breve periodo. Attendi qualche minuto e riprova.

#### Il Server Non Appare in Claude Desktop

1. Controlla che il percorso a `dist/index.js` sia corretto e assoluto
2. Verifica che la sintassi del JSON di configurazione sia valida
3. Riavvia completamente Claude Desktop
4. Controlla i log di Claude Desktop per eventuali errori

### Visualizzare i Log

Il server produce informazioni diagnostiche su stderr. In Claude Desktop, controlla i log dell'applicazione:

- **Windows:** `%APPDATA%\Claude\logs\`
- **macOS:** `~/Library/Logs/Claude/`

## Crediti e Ringraziamenti

Questo progetto è stato ispirato e costruito sul lavoro di diversi progetti open-source:

- [Taxuspt/garmin_mcp](https://github.com/Taxuspt/garmin_mcp) - Implementazione originale Garmin MCP
- [matin/garth](https://github.com/matin/garth) - Libreria di autenticazione Garmin
- [matin/garth-mcp-server](https://github.com/matin/garth-mcp-server) - Server MCP basato su Garth
- [Async-IO/pierre_mcp_server](https://github.com/Async-IO/pierre_mcp_server) - Pattern per server MCP
- [WillRaphaelson/garmin-mcp](https://github.com/WillRaphaelson/garmin-mcp) - Reference per API endpoints

Un ringraziamento speciale ai manutentori del pacchetto npm [garmin-connect](https://www.npmjs.com/package/garmin-connect).

## Contribuire

I contributi sono benvenuti! Sentiti libero di inviare una Pull Request.

1. Fai il fork del repository
2. Crea il tuo branch per la feature (`git checkout -b feature/FunzionalitàIncredibile`)
3. Committa le tue modifiche (`git commit -m 'Aggiunge una FunzionalitàIncredibile'`)
4. Pusha il branch (`git push origin feature/FunzionalitàIncredibile`)
5. Apri una Pull Request

## Licenza

Questo progetto è rilasciato sotto Licenza MIT - vedi il file [LICENSE](LICENSE) per i dettagli.

## Privacy Policy

Questo progetto rispetta la tua privacy. Per informazioni complete su come vengono gestiti i tuoi dati, consulta la nostra [Privacy Policy](https://github.com/sedoglia/garmin-mcp-ts/blob/main/PRIVACY.md).

### Riepilogo

- **Dati raccolti**: Credenziali Garmin (email e password) e token OAuth
- **Archiviazione**: Tutti i dati sono crittografati localmente con AES-256-GCM e salvati nel vault nativo del sistema operativo
- **Trasmissione**: I dati vengono trasmessi solo ai server Garmin Connect per l'autenticazione e il recupero dei dati
- **Nessun server di terze parti**: Non raccogliamo, non memorizziamo e non trasmettiamo i tuoi dati a server di terze parti
- **Controllo locale**: Tutti i dati rimangono sul tuo dispositivo sotto il tuo controllo

## Disclaimer

Questo progetto non è affiliato, approvato o connesso a Garmin Ltd. o alle sue sussidiarie. Garmin e Garmin Connect sono marchi registrati di Garmin Ltd.

---

<div align="center">

### Supporta lo Sviluppo

Se questo progetto ti è utile, considera di supportarlo con una donazione!

[![PayPal](https://img.shields.io/badge/Dona%20con-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

**[English](README_EN.md)** | **Italiano** | [Segnala Problemi](https://github.com/sedoglia/garmin-mcp-ts/issues)

</div>
