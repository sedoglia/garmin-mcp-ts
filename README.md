# Garmin Connect MCP Server

<div align="center">

**[English](README_EN.md)** | **Italiano**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![PayPal](https://img.shields.io/badge/Supporta%20il%20Progetto-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/sedoglia)

</div>

---

Un server Model Context Protocol (MCP) che connette Claude Desktop a Garmin Connect, permettendo di interrogare in linguaggio naturale i tuoi dati di attività fisica, metriche di salute, sonno e altro ancora.

## Funzionalità

Questo server MCP fornisce **18 potenti strumenti** per interagire con i tuoi dati Garmin Connect:

### Strumenti Attività
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

### Metriche Wellness (NUOVO in v1.2)
| Strumento | Descrizione |
|-----------|-------------|
| `get_stress_data` | **Ottiene i livelli di stress durante il giorno (scala 0-100)** |
| `get_body_battery` | **Ottiene i livelli di energia Body Battery (0-100)** |
| `get_hrv_data` | Ottiene dati di variabilità cardiaca (HRV) |
| `get_respiration_data` | Ottiene dati sulla frequenza respiratoria |
| `get_spo2_data` | Ottiene dati SpO2 (saturazione di ossigeno nel sangue) |

### Strumenti Utente & Dispositivi
| Strumento | Descrizione |
|-----------|-------------|
| `get_devices` | Ottiene la lista dei dispositivi Garmin connessi |
| `get_user_profile` | Ottiene informazioni sul profilo utente |
| `get_training_status` | Ottiene lo stato di allenamento e statistiche delle attività |

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

<!-- Placeholder screenshot: Mostra Claude Desktop con gli strumenti Garmin disponibili -->

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

### Dettagli Attività

> "Dimmi di più sulla mia ultima corsa"

> "Qual era la mia frequenza cardiaca media nell'ultimo allenamento?"

### Informazioni sui Dispositivi

> "Quali dispositivi Garmin ho connessi?"

### Stato di Allenamento

> "Qual è il mio stato di allenamento attuale?"

> "Quante attività ho registrato in totale?"

## Riferimento degli Strumenti

### list_recent_activities

Recupera una lista di attività recenti da Garmin Connect.

**Parametri:**
- `limit` (opzionale, numero): Numero massimo di attività da restituire. Default: 10, Max: 100
- `start` (opzionale, numero): Indice iniziale per la paginazione. Default: 0

**Esempio di Risposta:**
```json
{
  "success": true,
  "data": [
    {
      "activityId": 12345678,
      "activityName": "Corsa Mattutina",
      "startTimeLocal": "2024-12-11 07:30:00",
      "distance": 5000,
      "duration": 1800,
      "averageHeartRate": 145
    }
  ]
}
```

### get_activity_details

Ottiene informazioni dettagliate su un'attività specifica.

**Parametri:**
- `activityId` (obbligatorio, numero): L'identificatore univoco dell'attività

### get_health_metrics

Recupera le metriche di salute giornaliere per una data specifica.

**Parametri:**
- `date` (opzionale, stringa): Data nel formato YYYY-MM-DD. Default: oggi

**Restituisce:** Dati sulla frequenza cardiaca, conteggio passi e altre metriche giornaliere.

### get_sleep_data

Ottiene informazioni dettagliate sul sonno per una data specifica.

**Parametri:**
- `date` (opzionale, stringa): Data nel formato YYYY-MM-DD. Default: oggi

**Restituisce:** Durata del sonno, fasi del sonno, punteggio qualità del sonno.

### get_body_composition

Recupera i dati sulla composizione corporea.

**Parametri:**
- `days` (opzionale, numero): Numero di giorni di dati. Default: 30

**Restituisce:** Peso, BMI, percentuale di grasso corporeo (se disponibile).

### get_devices

Elenca tutti i dispositivi Garmin connessi.

**Parametri:** Nessuno

**Restituisce:** Informazioni sui dispositivi inclusi nome, modello e impostazioni.

### get_user_profile

Ottiene le informazioni del profilo utente.

**Parametri:** Nessuno

**Restituisce:** ID utente, nome visualizzato e impostazioni del profilo.

### get_training_status

Recupera lo stato di allenamento e le statistiche.

**Parametri:**
- `days` (opzionale, numero): Numero di giorni per le statistiche. Default: 7

**Restituisce:** Conteggio attività, statistiche di allenamento, impostazioni utente.

### get_steps

Ottiene il conteggio passi per una data specifica.

**Parametri:**
- `date` (opzionale, stringa): Data nel formato YYYY-MM-DD. Default: oggi

**Restituisce:** Numero totale di passi registrati per la data specificata.

### get_heart_rate

Ottiene dati dettagliati sulla frequenza cardiaca per una data specifica.

**Parametri:**
- `date` (opzionale, stringa): Data nel formato YYYY-MM-DD. Default: oggi

**Restituisce:** Frequenza cardiaca a riposo, max e zone di frequenza cardiaca.

### get_hydration

Ottiene dati giornalieri sull'idratazione.

**Parametri:**
- `date` (opzionale, stringa): Data nel formato YYYY-MM-DD. Default: oggi

**Restituisce:** Dati idratazione in oz e ml (o messaggio se nessun dato registrato).

### get_workouts

Ottiene la lista dei workout pianificati.

**Parametri:**
- `limit` (opzionale, numero): Numero massimo di workout da restituire. Default: 10, Max: 100
- `start` (opzionale, numero): Indice iniziale per la paginazione. Default: 0

**Restituisce:** Lista dei workout pianificati da Garmin Connect.

### get_activity_splits

Ottiene dati di split/lap per un'attività specifica.

**Parametri:**
- `activityId` (obbligatorio, numero): L'identificatore univoco dell'attività

**Restituisce:** Riepiloghi degli split inclusi passo, distanza e tempo per ogni split.

### get_stress_data (NUOVO in v1.2)

Ottiene i dati del livello di stress per una data specifica. Lo stress è misurato su una scala 0-100:
- **0-25**: Stato di riposo
- **26-50**: Stress basso
- **51-75**: Stress medio
- **76-100**: Stress alto

**Parametri:**
- `date` (opzionale, stringa): Data nel formato YYYY-MM-DD. Default: oggi

**Restituisce:** Livello di stress complessivo, durata per categoria, stress medio/max/min, e valori con timestamp.

### get_body_battery (NUOVO in v1.2)

Ottiene i dati del livello di energia Body Battery. Body Battery traccia i livelli di energia (0-100) durante il giorno basandosi sulla qualità del sonno, stress e attività fisica.

**Parametri:**
- `startDate` (opzionale, stringa): Data iniziale nel formato YYYY-MM-DD. Default: oggi
- `endDate` (opzionale, stringa): Data finale nel formato YYYY-MM-DD. Default: uguale a startDate

**Restituisce:** Livelli di energia durante il giorno, livelli max/min, quantità caricata e scaricata.

### get_hrv_data (NUOVO in v1.2)

Ottiene dati di Variabilità della Frequenza Cardiaca (HRV) per una data specifica. L'HRV misura la variazione nel tempo tra i battiti cardiaci, indicando lo stato di recupero e i livelli di stress.

**Parametri:**
- `date` (opzionale, stringa): Data nel formato YYYY-MM-DD. Default: oggi

**Restituisce:** Metriche e letture HRV.

### get_respiration_data (NUOVO in v1.2)

Ottiene dati sulla frequenza respiratoria per una data specifica.

**Parametri:**
- `date` (opzionale, stringa): Data nel formato YYYY-MM-DD. Default: oggi

**Restituisce:** Respiri al minuto durante il giorno e durante il sonno.

### get_spo2_data (NUOVO in v1.2)

Ottiene dati SpO2 (saturazione di ossigeno nel sangue) per una data specifica. I livelli normali di SpO2 sono tipicamente 95-100%.

**Parametri:**
- `date` (opzionale, stringa): Data nel formato YYYY-MM-DD. Default: oggi

**Restituisce:** Letture di pulsossimetria come percentuale.

## Risoluzione dei Problemi

### Problemi Comuni

#### "Cannot read properties of undefined"

Questo errore si verifica tipicamente quando il server riceve argomenti malformati. Assicurati di usare l'ultima versione con la corretta gestione degli argomenti.

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

### Modalità Debug

Abilita il logging di debug impostando la variabile d'ambiente:

```json
{
  "env": {
    "GARMIN_EMAIL": "...",
    "GARMIN_PASSWORD": "...",
    "DEBUG_GARMIN": "true"
  }
}
```

## Architettura

```
garmin-mcp-ts/
├── src/
│   ├── index.ts           # Punto di ingresso, gestione stdout/stderr
│   ├── garmin/
│   │   ├── client.ts      # Client API Garmin Connect
│   │   ├── types.ts       # Definizioni tipi TypeScript
│   │   └── simple-login.ts # Utility standalone per test login
│   ├── mcp/
│   │   ├── server.ts      # Setup server MCP e gestori richieste
│   │   ├── tools.ts       # Definizioni strumenti e schemi
│   │   └── handlers.ts    # Logica implementazione strumenti
│   └── utils/
│       ├── constants.ts   # Costanti dell'applicazione
│       ├── errors.ts      # Classi di errore personalizzate
│       └── logger.ts      # Utility di logging (solo stderr)
├── dist/                  # Output JavaScript compilato
├── package.json
└── tsconfig.json
```

### Decisioni di Design Chiave

- **Protezione Stdout:** Tutte le chiamate console.log vengono reindirizzate a stderr per assicurare che solo messaggi JSON-RPC validi appaiano su stdout
- **Libreria Garmin Connect:** Utilizza il pacchetto npm `garmin-connect` per un'autenticazione affidabile
- **Validazione JSON Schema:** I parametri di input vengono validati usando JSON Schema con campi opzionali e valori di default sensati

## Crediti e Ringraziamenti

Questo progetto è stato ispirato e costruito sul lavoro di diversi progetti open-source:

- [Taxuspt/garmin_mcp](https://github.com/Taxuspt/garmin_mcp) - Implementazione originale Garmin MCP
- [matin/garth](https://github.com/matin/garth) - Libreria di autenticazione Garmin
- [matin/garth-mcp-server](https://github.com/matin/garth-mcp-server) - Server MCP basato su Garth
- [Async-IO/pierre_mcp_server](https://github.com/Async-IO/pierre_mcp_server) - Pattern per server MCP

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
