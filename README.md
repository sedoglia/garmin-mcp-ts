# Garmin Connect MCP Server

<div align="center">

**[English](README_EN.md)** | **Italiano**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-4.0.0-green.svg)](https://github.com/sedoglia/garmin-mcp-ts)

[![PayPal](https://img.shields.io/badge/Supporta%20il%20Progetto-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

</div>

---

Un server Model Context Protocol (MCP) che connette Claude Desktop a Garmin Connect, permettendo di interrogare in linguaggio naturale i tuoi dati di attività fisica, metriche di salute, sonno e altro ancora.

## 🎉 Novità v4.0.0 - Major Update: Social & Advanced Analytics

### 🤝 **SOCIAL FEATURES** ⚠️ PARZIALE
- **`get_activity_comments`**: Ottieni commenti su un'attività ✅ FUNZIONANTE
- ~~**`add_activity_comment`**: Aggiungi commenti alle attività~~ ❌ **RIMOSSO** (Non supportato da API OAuth Garmin)
- **`set_activity_privacy`**: Imposta privacy (**public** o **private** solo) ⚠️ PARZIALE (opzione "followers" non supportata)

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

### ⚠️ **GEAR MANAGEMENT** (Limitazione API Garmin)
- **`get_all_gear`**: Fornisce istruzioni per ottenere UUID gear da [Garmin Connect Web](https://connect.garmin.com/modern/gear)
- **`create_gear`**: Guida alla creazione manuale (l'API OAuth non supporta listing/creazione automatica)
- **`update_gear`**: Aggiorna equipaggiamento (richiede UUID)
- **`delete_gear`**: Elimina equipaggiamento (richiede UUID)

### 📈 Ora con **94 TOOLS** disponibili! (92 funzionanti + 2 limitati da API)

---

## Funzionalità

Questo server MCP fornisce **94 potenti strumenti** per interagire con i tuoi dati Garmin Connect:

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
| `get_sleep_data` | Ottiene informazioni dettagliate sul sonno (durata, qualità, fasi) |
| `get_body_composition` | Ottiene dati sulla composizione corporea (peso, BMI, grasso corporeo) |
| `get_steps` | Ottiene il conteggio passi per una data specifica |
| `get_heart_rate` | Ottiene dati dettagliati sulla frequenza cardiaca |
| `get_hydration` | Ottiene dati giornalieri sull'idratazione |

### Metriche Wellness (v1.2)
| Strumento | Descrizione |
|-----------|-------------|
| `get_stress_data` | Ottiene i livelli di stress durante il giorno (scala 0-100) |
| `get_body_battery` | Ottiene i livelli di energia Body Battery (0-100) |
| `get_hrv_data` | Ottiene dati di variabilità cardiaca (HRV) |
| `get_respiration_data` | Ottiene dati sulla frequenza respiratoria |
| `get_spo2_data` | Ottiene dati SpO2 (saturazione di ossigeno nel sangue) |

### Strumenti Utente & Dispositivi
| Strumento | Descrizione |
|-----------|-------------|
| `get_devices` | Ottiene la lista dei dispositivi Garmin connessi |
| `get_user_profile` | Ottiene informazioni sul profilo utente |
| `get_training_status` | Ottiene lo stato di allenamento e statistiche delle attività |

---

## Nuovi Strumenti v2.0

### Gestione Workout
| Strumento | Descrizione |
|-----------|-------------|
| `get_workout_by_id` | Ottiene dettagli di un workout specifico |
| `download_workout` | Scarica workout in formato FIT per sync su device |
| `create_workout` | **Crea workout strutturati** con warmup, intervalli, cooldown |
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
| `get_floors` | Ottiene piani saliti |
| `get_intensity_minutes` | Ottiene minuti di intensità (moderata e vigorosa) |
| `get_max_metrics` | Ottiene metriche max (VO2 max, etc.) |
| `get_training_readiness` | **Ottiene punteggio Training Readiness** |
| `get_endurance_score` | **Ottiene Endurance Score** |
| `get_fitness_age` | **Ottiene Fitness Age stimata** |
| `get_daily_summary` | Ottiene sommario giornaliero completo |

### Weight & Body
| Strumento | Descrizione |
|-----------|-------------|
| `get_weigh_ins` | Ottiene pesate in un range di date |
| `add_weigh_in` | Aggiunge pesata con dati composizione corporea |
| `delete_weigh_in` | Elimina una pesata |
| `get_blood_pressure` | Ottiene misurazioni pressione sanguigna |
| `set_blood_pressure` | Registra misurazione pressione |
| `delete_blood_pressure` | Elimina misurazione pressione |

### Activity Details Avanzati
| Strumento | Descrizione |
|-----------|-------------|
| `get_activity_weather` | Ottiene meteo durante un'attività |
| `get_activity_hr_zones` | Ottiene tempo nelle zone HR |
| `get_activity_exercise_sets` | Ottiene set esercizi (strength training) |

### Goals, Challenges & Records
| Strumento | Descrizione |
|-----------|-------------|
| `get_goals` | Ottiene obiettivi (attivi, futuri, passati) |
| `get_adhoc_challenges` | Ottiene sfide ad-hoc |
| `get_badge_challenges` | Ottiene sfide badge disponibili |
| `get_earned_badges` | Ottiene badge guadagnati |
| `get_personal_records` | Ottiene record personali |
| `get_race_predictions` | Ottiene previsioni tempi gara (5K, 10K, HM, M) |

### Gear Management
| Strumento | Descrizione |
|-----------|-------------|
| `get_gear_stats` | Ottiene statistiche uso gear (richiede UUID da interfaccia web) |
| `link_gear_to_activity` | Collega gear a un'attività (richiede UUID da interfaccia web) |

> **Nota:** L'API OAuth di Garmin non supporta la lista dei gear. Per usare gli strumenti gear, è necessario ottenere l'UUID del gear dall'interfaccia web di Garmin Connect (Impostazioni → Attrezzatura → clicca sul gear → l'UUID è nell'URL).

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
| `get_available_badges` | Ottiene tutti i badge disponibili |
| `get_in_progress_badges` | Ottiene badge in corso di completamento |
| `get_available_badge_challenges` | Ottiene sfide badge disponibili |
| `get_non_completed_badge_challenges` | Ottiene sfide badge non completate |
| `get_in_progress_virtual_challenges` | Ottiene sfide virtuali in corso |

### Gear Avanzato
| Strumento | Descrizione |
|-----------|-------------|
| `get_gear_activities` | Ottiene attività associate a un gear (richiede UUID) |
| `remove_gear_from_activity` | Rimuove gear da un'attività (richiede UUID) |

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
| `count_activities` | Conta il numero totale di attività |
| `get_fitness_stats` | Ottiene statistiche fitness in un range di date |
| `add_hydration_data` | Aggiunge dati idratazione |

---

## Prerequisiti

- **Node.js** 18.0 o superiore
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
wget https://github.com/sedoglia/garmin-mcp-ts/releases/download/v4.0.0/diabetes-m-mcp.mcpb
```

### 3. Verifica l'integrità

Verifica l'integrità (opzionale ma consigliato):

```bash
wget https://github.com/sedoglia/garmin-mcp-ts/releases/download/v4.0.0/diabetes-m-mcp.mcpb.sha256
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

### 5. Configura le Credenziali Garmin (Metodo Sicuro - Raccomandato)

Apri una **nuova chat su Claude Desktop** e scrivi il seguente prompt:

```
Configura le credenziali di accesso per Garmin
```

Rispondi al messaggio fornendo:
- **Utente:** la tua email Garmin
- **Password:** la tua password Garmin

L'estensione provvederà automaticamente a criptare e salvare le credenziali in modo sicuro nel vault nativo del sistema operativo (Windows Credential Manager, macOS Keychain, Linux Secret Service).

> **Nota:** Le credenziali NON verranno salvate in file di testo. Saranno sempre crittografate e gestite dal vault nativo del SO.

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

### Gestione Equipaggiamento (NUOVO v4.0)

> "Mostrami tutto il mio equipaggiamento Garmin"

> "Crea un nuovo paio di scarpe da corsa Nike Pegasus 40"

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
│   │   ├── tools.ts       # Definizioni strumenti e schemi (69 tools)
│   │   └── handlers.ts    # Logica implementazione strumenti
│   └── utils/
│       ├── constants.ts   # Costanti dell'applicazione
│       ├── errors.ts      # Classi di errore personalizzate
│       ├── logger.ts      # Utility di logging (solo stderr)
│       └── secure-storage.ts # Modulo di storage sicuro con encryption
├── scripts/
│   ├── setup-encryption.ts  # Script interattivo per setup credenziali
│   ├── check-encryption.ts  # Script diagnostico per verificare encryption
│   └── test-keytar.ts       # Script diagnostico per testare l'integrazione con Keytar
├── dist/                  # Output JavaScript compilato
├── package.json
└── tsconfig.json
```

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
- ✅ **Impostare privacy** (`set_activity_privacy`): Parzialmente funzionante
  - ✅ `public`: Funziona correttamente
  - ✅ `private`: Funziona correttamente
  - ❌ `followers`: **NON SUPPORTATO** - restituisce errore 400 "PRIVACY_INVALID"

#### Metriche Avanzate (Dipende dal Dispositivo)

Alcune metriche potrebbero non essere disponibili a seconda del modello di smartwatch:

| Metrica | Dispositivi Supportati | Note |
|---------|------------------------|------|
| `get_endurance_score` | Solo dispositivi premium (Fenix 7+, Forerunner 955+) | Non disponibile su Instinct 2 Solar |
| `get_training_readiness` | Solo Instinct 2**X** | Non su Instinct 2 Solar standard |
| `get_floors` | Richiede barometro | Potrebbe non sincronizzarsi via API |
| `get_intensity_minutes` | Tutti i dispositivi | Potrebbe non sincronizzarsi via API |
| `get_training_load` | Richiede 7+ giorni di dati | Usa Firstbeat Analytics |
| `get_load_ratio` | Richiede 4+ settimane consecutive | Calcolato su storico esteso |
| `get_performance_condition` | Durante attività | Visibile sul watch, non sempre via API |

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
