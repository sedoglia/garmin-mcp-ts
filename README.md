# Garmin Connect MCP Server

<div align="center">

**[English](README_EN.md)** | **Italiano**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-3.0.0-green.svg)](https://github.com/sedoglia/garmin-mcp-ts)

[![PayPal](https://img.shields.io/badge/Supporta%20il%20Progetto-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

</div>

---

Un server Model Context Protocol (MCP) che connette Claude Desktop a Garmin Connect, permettendo di interrogare in linguaggio naturale i tuoi dati di attività fisica, metriche di salute, sonno e altro ancora.

## Novità v3.0.0
- **OAuth Token Persistence**: Salvataggio/caricamento token OAuth per riutilizzo sessione
- **User Summary**: Riepilogo giornaliero completo dell'utente
- **Steps Avanzati**: Daily steps con range di date, steps data dettagliati
- **Attività per Data**: Ricerca attività in un range di date
- **Activity Typed Splits**: Split dettagliati per tipo di attività
- **Resting Heart Rate**: Frequenza cardiaca a riposo giornaliera
- **Hill Score**: Punteggio prestazioni in salita
- **All Day Events**: Eventi di tutto il giorno (stress, body battery)
- **Badges Avanzati**: Badge disponibili, in progress, challenges
- **Virtual Challenges**: Sfide virtuali in corso
- **Gear Activities**: Attività associate a equipaggiamento
- **Training Plans**: Piani di allenamento disponibili
- **Salute Femminile**: Dati mestruali e gravidanza
- **Activity Types**: Tutti i tipi di attività disponibili
- **Primary Device**: Dispositivo di allenamento primario
- **Activity Count**: Conteggio totale attività
- **Fitness Stats**: Statistiche fitness in range di date

## Funzionalità

Questo server MCP fornisce **71 potenti strumenti** per interagire con i tuoi dati Garmin Connect:

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

### Activity Details Avanzati
| Strumento | Descrizione |
|-----------|-------------|
| `get_activity_weather` | Ottiene meteo durante un'attività |
| `get_activity_hr_zones` | Ottiene tempo nelle zone HR |
| `get_activity_gear` | Ottiene gear usato in un'attività |
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
| `get_gear` | Ottiene tutto l'equipaggiamento |
| `get_gear_defaults` | Ottiene gear predefinito per tipo attività |
| `get_gear_stats` | Ottiene statistiche uso gear |
| `link_gear_to_activity` | Collega gear a un'attività |

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
| `count_activities` | Conta il numero totale di attività |
| `get_fitness_stats` | Ottiene statistiche fitness in un range di date |
| `add_hydration_data` | Aggiunge dati idratazione |

---

## Prerequisiti

- **Node.js** 18.0 o superiore
- **npm** 8.0 o superiore
- **Claude Desktop** installato
- Account **Garmin Connect** con credenziali valide

## Installazione

### 1. Clona il Repository

```bash
git clone https://github.com/sedoglia/garmin-mcp-ts.git
cd garmin-mcp-ts
```

### 2. Installa le Dipendenze

```bash
npm install
```

### 3. Compila il Progetto

```bash
npm run build
```

### 4. Configura le Credenziali Garmin

Crea un file `.env` nella root del progetto:

```env
GARMIN_EMAIL=tua.email@esempio.com
GARMIN_PASSWORD=la_tua_password_garmin
```

> **Nota sulla Sicurezza:** Non commitare mai il file `.env` nel controllo versione. È già incluso in `.gitignore`.

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
      "args": ["C:\\percorso\\a\\garmin-mcp-ts\\dist\\index.js"],
      "env": {
        "GARMIN_EMAIL": "tua.email@esempio.com",
        "GARMIN_PASSWORD": "la_tua_password_garmin"
      }
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
      "args": ["/percorso/a/garmin-mcp-ts/dist/index.js"],
      "env": {
        "GARMIN_EMAIL": "tua.email@esempio.com",
        "GARMIN_PASSWORD": "la_tua_password_garmin"
      }
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

## Test

Esegui i test con dati reali:

```bash
npm test
```

Il test script verifica tutti i 71 strumenti con il tuo account Garmin (100% success rate).

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
│   │   ├── tools.ts       # Definizioni strumenti e schemi (71 tools)
│   │   └── handlers.ts    # Logica implementazione strumenti
│   └── utils/
│       ├── constants.ts   # Costanti dell'applicazione
│       ├── errors.ts      # Classi di errore personalizzate
│       └── logger.ts      # Utility di logging (solo stderr)
├── dist/                  # Output JavaScript compilato
├── package.json
└── tsconfig.json
```

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

## Disclaimer

Questo progetto non è affiliato, approvato o connesso a Garmin Ltd. o alle sue sussidiarie. Garmin e Garmin Connect sono marchi registrati di Garmin Ltd.

---

<div align="center">

### Supporta lo Sviluppo

Se questo progetto ti è utile, considera di supportarlo con una donazione!

[![PayPal](https://img.shields.io/badge/Dona%20con-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

**[English](README_EN.md)** | **Italiano** | [Segnala Problemi](https://github.com/sedoglia/garmin-mcp-ts/issues)

</div>
