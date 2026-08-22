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

> 📜 **Cronologia delle versioni**: tutte le modifiche dettagliate di ogni release —
> nuovi tool, correzioni, note di aggiornamento — sono nel **[CHANGELOG](CHANGELOG.md)**.

---

## Strumenti

Il server espone **109 strumenti**, raggruppati per argomento. I **26** contrassegnati con ✏️ scrivono sull'account Garmin; tutti gli altri leggono soltanto.

### 🏃 Attività

**Elenco e ricerca**

| Strumento | Descrizione |
|-----------|-------------|
| `list_recent_activities` | Le attività più recenti, ciascuna con nome, tipo, distanza, durata e data |
| `get_activities_by_date` | Le attività in un intervallo di date, con filtro per tipo e ordinamento |
| `count_activities` | Conta le attività, su tutto lo storico o in un intervallo di date |
| `get_activity_types` | L'elenco dei tipi di attività riconosciuti da Garmin Connect |

**Dettaglio di una singola attività**

| Strumento | Descrizione |
|-----------|-------------|
| `get_activity_details` | Il dettaglio completo di un'attività: metriche di riepilogo, zone, dati GPS |
| `get_activity_splits` | Split e lap con passo, distanza e tempo di ciascuno |
| `get_activity_typed_splits` | Split tipizzati, più dettagliati dei normali (boulder, forza, multisport) |
| `get_activity_hr_zones` | Il tempo trascorso in ciascuna zona di frequenza cardiaca |
| `get_activity_exercise_sets` | I set di esercizi registrati in un'attività di forza |
| `get_activity_weather` | Le condizioni meteo durante l'attività |
| `get_activity_comments` | I commenti lasciati su un'attività (solo lettura: scriverli non è possibile via API, vedi Limitazioni note) |

**Creazione e modifica**

| Strumento | Descrizione |
|-----------|-------------|
| `create_manual_activity` ✏️ | Inserisce a mano un'attività: nome, tipo, inizio, durata; distanza e calorie opzionali |
| `upload_activity` ✏️ | Carica un file di attività in formato FIT, GPX o TCX |
| `download_activity` | Scarica un'attività in FIT, TCX, GPX, KML o CSV |
| `set_activity_name` ✏️ | Rinomina un'attività |
| `set_activity_type` ✏️ | Cambia il tipo di un'attività |
| `set_activity_privacy` ✏️ | Imposta la privacy: `public`, `private` o `subscribers` ("solo connessioni"). Il livello attuale si legge da `accessControlRuleDTO` in `get_activity_details` |
| `delete_activity` ✏️ | Elimina un'attività. L'operazione non è reversibile |

**Confronti e analisi di periodo**

| Strumento | Descrizione |
|-----------|-------------|
| `compare_activities` | Confronta da 2 a 5 attività: distanza, durata, velocità, FC, calorie, dislivello, passi, training effect |
| `find_similar_activities` | Cerca attività simili per tipo, distanza e durata (tolleranza 20%), dalla più simile; `searchDepth` allarga lo storico esaminato |
| `analyze_training_period` | Analisi di trend, volumi e ricorrenze di allenamento su un intervallo di date |
| `get_progress_summary` | Aggrega i progressi fra due date su `distance`, `duration` o `calories` |
| `get_fitness_stats` | Statistiche aggregate fra due date su `distance`, `duration`, `elevationGain` o `movingDuration`, raggruppate per tipo di attività |

### ❤️ Salute e benessere

**Riepiloghi giornalieri**

| Strumento | Descrizione |
|-----------|-------------|
| `get_daily_summary` | Riepilogo compatto del giorno: passi e obiettivo, calorie, distanza, piani, minuti di intensità, FC a riposo/minima/massima, stress, Body Battery |
| `get_user_summary` | Riepilogo utente di una data: passi, calorie, distanza, minuti attivi |
| `get_health_metrics` | Frequenza cardiaca e passi di una giornata in un'unica risposta |

**Passi, piani e minuti di intensità**

| Strumento | Descrizione |
|-----------|-------------|
| `get_steps` | Il totale dei passi di una data |
| `get_steps_data` | La serie dettagliata dei passi della giornata, con gli orari |
| `get_daily_steps` | Passi giornalieri su un intervallo: oltre i 28 giorni la richiesta viene spezzata automaticamente |
| `get_floors` | Piani saliti e scesi; con `includeBreakdown` anche i 96 intervalli da 15 minuti |
| `get_intensity_minutes` | Minuti di intensità moderata e vigorosa, per una data o un intervallo, con totale e obiettivo settimanali |

**Cuore e respiro**

| Strumento | Descrizione |
|-----------|-------------|
| `get_heart_rate` | Frequenza cardiaca della giornata: a riposo, massima e serie di valori |
| `get_rhr_day` | Frequenza cardiaca a riposo di un singolo giorno |
| `get_hrv_data` | Variabilità della frequenza cardiaca (HRV), indicatore di recupero |
| `get_respiration_data` | Frequenza respiratoria durante il giorno e durante il sonno |
| `get_spo2_data` | Saturazione di ossigeno nel sangue (SpO2) |

**Stress ed energia**

| Strumento | Descrizione |
|-----------|-------------|
| `get_stress_data` | Stress del giorno sulla scala 0-100: medio, massimo, minimo e secondi per fascia; con `includeValues` anche i singoli campioni da 3 minuti |
| `get_all_day_stress` | Il payload grezzo dello stesso endpoint di `get_stress_data`, campioni compresi e senza statistiche calcolate. Risposta molto più grande: di norma conviene `get_stress_data` |
| `get_body_battery` | Body Battery (0-100) su un intervallo di date, con i periodi di ricarica e di consumo |
| `get_body_battery_events` | Gli eventi che hanno inciso sulla Body Battery di una data: sonno, attività, pisolini |
| `get_all_day_events` | Tutti gli eventi della giornata, comprese le attività rilevate automaticamente |

**Sonno**

| Strumento | Descrizione |
|-----------|-------------|
| `get_sleep_data` | La notte: durata, fasi, punteggio e riepilogo. Le serie al minuto sono contate e non incluse; `includeTimeSeries` le inserisce nella risposta |
| `get_sleep_movement` | Movimenti durante il sonno e momenti di irrequietezza |

**Idratazione**

| Strumento | Descrizione |
|-----------|-------------|
| `get_hydration` | L'idratazione registrata in una data |
| `add_hydration_data` ✏️ | Aggiunge millilitri all'idratazione del giorno; un valore negativo li sottrae |

**Peso e composizione corporea**

| Strumento | Descrizione |
|-----------|-------------|
| `get_body_composition` | Peso, BMI, grasso, massa muscolare e ossea su un periodo di `days` giorni, con la media del periodo |
| `get_weigh_ins` | Le pesate registrate in un intervallo di date |
| `add_weigh_in` ✏️ | Registra una pesata. Peso e grasso corporeo vengono conservati; acqua, muscolo e osso sono accettati ma Garmin li scarta su una pesata manuale |
| `delete_weigh_in` ✏️ | Elimina una pesata dal suo id (`samplePk`). `date` serve solo se la pesata è riferita a un giorno diverso da quello in cui è stata inserita |

**Pressione sanguigna**

| Strumento | Descrizione |
|-----------|-------------|
| `get_blood_pressure` | Le misurazioni di pressione in un intervallo di date, con la `version` che serve per cancellarle |
| `set_blood_pressure` ✏️ | Registra una misurazione: sistolica, diastolica, pulsazioni, data e ora |
| `delete_blood_pressure` ✏️ | Elimina una misurazione: servono la data e la `version` restituita da `get_blood_pressure` |

**Salute femminile**

| Strumento | Descrizione |
|-----------|-------------|
| `get_menstrual_data` | I dati del ciclo mestruale per una data |
| `get_pregnancy_summary` | Il riepilogo del monitoraggio della gravidanza |

### 📈 Allenamento e performance

**Stato di forma**

| Strumento | Descrizione |
|-----------|-------------|
| `get_training_status` | Stato di allenamento di una data: status e frase di feedback, VO2 max, trend, carico acuto e cronico, rapporto ACWR |
| `get_training_readiness` | Il punteggio di prontezza all'allenamento |
| `get_endurance_score` | L'Endurance Score calcolato sul carico recente |
| `get_fitness_age` | L'età fisica stimata da VO2 max e altre metriche |
| `get_max_metrics` | Le metriche di picco, VO2 max compreso |
| `get_hill_score` | L'Hill Score, la resa in salita, su un intervallo di date |
| `get_performance_condition` | La performance condition di una data. Garmin la registra per attività, quindi di norma si legge da `get_activity_details` |
| `get_race_predictions` | I tempi di gara previsti su 5K, 10K, mezza e maratona |

**Carico di allenamento**

| Strumento | Descrizione |
|-----------|-------------|
| `get_training_load` | Il bilanciamento mensile del carico (aerobico basso e alto, anaerobico) rispetto ai target. È una fotografia alla data finale, non un aggregato dell'intervallo |
| `get_load_ratio` | Il rapporto fra carico acuto e cronico, indicatore di rischio infortuni |

**Workout**

| Strumento | Descrizione |
|-----------|-------------|
| `get_workouts` | L'elenco dei workout salvati |
| `get_workout_by_id` | Il dettaglio di un singolo workout |
| `create_workout` ✏️ | Crea un workout strutturato con riscaldamento, intervalli e defaticamento. Sport ammessi: `running`, `cycling`, `walking`, `swimming`, `strength`, `cardio`, `yoga`, `pilates`, `hiit`, `mobility`, `rucking`, `other` (non esiste `hiking`: usare `walking` o `rucking`) |
| `update_workout` ✏️ | Modifica nome, descrizione o struttura di un workout |
| `schedule_workout` ✏️ | Mette un workout in calendario a una data; restituisce l'id da usare per rimuoverlo |
| `unschedule_workout` ✏️ | Toglie un workout dal calendario. Va fatto **prima** di `delete_workout`, altrimenti resta una voce fantasma |
| `delete_workout` ✏️ | Elimina un workout |
| `download_workout` | Scarica un workout in formato FIT per sincronizzarlo sul dispositivo |

**Piani e percorsi**

| Strumento | Descrizione |
|-----------|-------------|
| `get_training_plans` | I piani di allenamento disponibili |
| `get_training_plan_by_id` | Il dettaglio di un piano di allenamento |
| `get_courses` | I percorsi salvati sull'account |

### 👟 Equipaggiamento

**Equipaggiamento**

| Strumento | Descrizione |
|-----------|-------------|
| `get_all_gear` | Tutto l'equipaggiamento con i rispettivi UUID, che servono a ogni altro tool gear |
| `get_gear_stats` | Le statistiche d'uso di un pezzo di equipaggiamento |
| `get_gear_activities` | Le attività in cui un pezzo di equipaggiamento è stato usato |
| `update_gear` ✏️ | Aggiorna nome, marca, modello e limite di distanza. `brandName` e `modelName` finiscono nella stessa etichetta libera, perché marca e modello di catalogo sono un vocabolario che Garmin valida |
| `delete_gear` ✏️ | Elimina un pezzo di equipaggiamento. L'operazione non è reversibile |
| `link_gear_to_activity` ✏️ | Associa un pezzo di equipaggiamento a un'attività |
| `remove_gear_from_activity` ✏️ | Toglie l'associazione fra equipaggiamento e attività |

**Cataloghi Garmin**

| Strumento | Descrizione |
|-----------|-------------|
| `get_gear_types` | I tipi di equipaggiamento previsti da Garmin (scarpe, bici, mazze da golf, altro) |
| `get_gear_makes` | Le marche riconosciute da Garmin, con la chiave da usare nel catalogo |

**Collezioni**

| Strumento | Descrizione |
|-----------|-------------|
| `get_gear_collections` | Le collezioni, cioè i gruppi di equipaggiamento usati insieme |
| `get_gear_collection` | Il dettaglio di una collezione: equipaggiamento contenuto e tipi di attività associati |
| `create_gear_collection` ✏️ | Crea una collezione: servono nome e data di primo utilizzo |
| `update_gear_collection` ✏️ | Aggiorna nome, equipaggiamento e tipi di attività di una collezione (le liste vengono sostituite) |
| `delete_gear_collection` ✏️ | Elimina una collezione. L'equipaggiamento che conteneva resta |

### 🏅 Obiettivi, badge e sfide

**Obiettivi e record**

| Strumento | Descrizione |
|-----------|-------------|
| `get_goals` | Gli obiettivi impostati; senza `status` interroga tutti e tre gli stati e unisce i risultati |
| `get_personal_records` | I record personali: categoria, valore, data e, quando c'è, l'attività in cui è stato stabilito |

**Badge**

| Strumento | Descrizione |
|-----------|-------------|
| `get_earned_badges` | I badge conquistati con la data; `includeDetails` restituisce il record completo |
| `get_available_badges` | I badge conquistabili con categoria, difficoltà, punti e avanzamento; `includeDetails` per il record completo |
| `get_in_progress_badges` | I badge iniziati e non ancora completati |

**Sfide**

| Strumento | Descrizione |
|-----------|-------------|
| `get_badge_challenges` | Le sfide badge a cui ci si può iscrivere, senza paginazione |
| `get_available_badge_challenges` | Le stesse sfide di `get_badge_challenges` — è lo stesso endpoint — ma con paginazione (`start`, `limit`) |
| `get_non_completed_badge_challenges` | Le sfide badge non ancora completate |
| `get_adhoc_challenges` | Lo storico delle sfide ad hoc |
| `get_in_progress_virtual_challenges` | Le sfide virtuali in corso |

### ⚙️ Profilo, dispositivi e credenziali

**Profilo**

| Strumento | Descrizione |
|-----------|-------------|
| `get_user_profile` | Il profilo: nome visualizzato e i due id dell'account. `profileId` è quello con cui è indicizzato il resto dei dati (l'`ownerId` di un'attività, lo `userProfilePK` dei dati di benessere); `id` è un identificativo interno separato |
| `request_reload` ✏️ | Chiede a Garmin di ricaricare i dati di una data: serve per le giornate vecchie che il servizio ha spostato fuori dalla cache |

**Dispositivi**

| Strumento | Descrizione |
|-----------|-------------|
| `get_devices` | I dispositivi Garmin registrati sull'account, con id, modello, seriale e firmware |
| `get_device_settings` | Le impostazioni di un singolo dispositivo |
| `get_device_last_used` | Il dispositivo che ha caricato dati più di recente |
| `get_device_alarms` | Le sveglie configurate: orario, giorni di ripetizione e stato. Senza `deviceId` le riporta di tutti i dispositivi |
| `get_primary_training_device` | Il dispositivo di allenamento primario e le priorità fra dispositivi |

**Credenziali**

| Strumento | Descrizione |
|-----------|-------------|
| `setup_credentials` ✏️ | Salva email e password cifrate nel vault del sistema operativo e verifica subito l'accesso |
| `check_credentials` | Lo stato della configurazione: fonte attiva, archivio usato, sessione. Non restituisce mai la password |
| `clear_credentials` ✏️ | Cancella credenziali cifrate e token OAuth e chiude la sessione |

---

## Prerequisiti

- **Node.js** 22.0 o superiore
- **npm** 8.0 o superiore
- **Claude Desktop** installato
- Account **Garmin Connect** con credenziali valide

## 🚀 Installazione Rapida (Bundle Precompilato)

### Passaggi:

> **Il vault del sistema operativo è già incluso.** Dalla v4.3.2 il bundle porta con sé i
> binari di `keytar` per ogni piattaforma (`darwin-x64`, `darwin-arm64`, `win32-x64`,
> `win32-ia32`, `linux-x64`, `linux-arm64`): non c'è niente da installare a parte
> l'estensione. Sulle architetture senza binario, e sulle sessioni Linux senza keyring
> attivo, la chiave finisce in un file protetto; `check_credentials` dice quale dei due è
> in uso.

### 1. Scarica il bundle

Usa il browser oppure:

```bash
wget https://github.com/sedoglia/garmin-mcp-ts/releases/latest/download/garmin-mcp-ts.mcpb
```

### 2. Verifica l'integrità

Verifica l'integrità (opzionale ma consigliato):

```bash
wget https://github.com/sedoglia/garmin-mcp-ts/releases/latest/download/garmin-mcp-ts.mcpb.sha256
sha256sum -c garmin-mcp-ts.mcpb.sha256
```

### 3. Installa l'estensione in Claude Desktop (Metodo Consigliato)

**Installazione tramite Custom Desktop Extensions:**

1. Apri **Claude Desktop**
2. Vai su **Impostazioni** (Settings)
3. Seleziona la scheda **Estensioni** (Extensions)
4. Clicca su **Impostazioni Avanzate** (Advanced settings) e trova la sezione **Extension Developer**
5. Clicca su **"Installa Estensione..."** (Install Extension…)
6. Seleziona il file `.mcpb` (`garmin-mcp-ts.mcpb` scaricato al passaggio 1)
7. Segui le indicazioni a schermo per completare l'installazione

> **Nota:** Questo è il metodo più semplice e consigliato. L'estensione sarà automaticamente integrata in Claude Desktop senza necessità di configurazione manuale.

---

### 4. Configura le Credenziali Garmin

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

### 5. Riavvia Claude Desktop

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

`keytar` è una dipendenza opzionale: `npm install` lo compila o ne scarica il binario, e
il vault nativo del sistema operativo viene usato senza altri passaggi. Se quel passaggio
fallisce — è normale su una macchina senza toolchain di compilazione — il server ripiega
su un file protetto e continua a funzionare; `npm run check-encryption` dice quale dei due
è in uso.

### 3. Compila il Progetto

```bash
npm run build
```

### 4. Configura le Credenziali Garmin (Metodo Sicuro - Raccomandato)

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

### 4b. Metodo Alternativo (Legacy)

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

### Gestione Workout

> "Mostrami i miei workout pianificati"

> "Scarica il mio ultimo workout"

### Training Readiness

> "Qual è il mio Training Readiness di oggi?"

> "Mostrami il mio Endurance Score"

### Progressi e Statistiche

> "Quanti km ho corso questo mese?"

> "Mostrami il sommario dei miei progressi dell'ultimo mese"

### Health Metrics Avanzati

> "Qual è stata la mia frequenza cardiaca a riposo oggi?"

> "Mostrami gli eventi di tutto il giorno per stress e body battery"

### Salute Femminile

> "Come influisce il mio ciclo mestruale sulla mia performance di allenamento?"

> "In base al mio ciclo, quale tipo di allenamento dovrei fare?"

### Gestione Equipaggiamento

> "Mostrami tutto il mio equipaggiamento Garmin"

> "Quali tipi di equipaggiamento posso gestire?"

> "Crea una collezione 'Scarpe Running' e associala alle attività di corsa"

> "Mostrami le mie collezioni di equipaggiamento"

### Commenti e Privacy

> "Mostrami i commenti sulla mia ultima attività"

> "Imposta la mia ultima corsa come privata"

### Metriche Training Avanzate

> "Come sta andando il mio carico di allenamento questo mese?"

> "Qual è il mio rapporto acuto/cronico? Sono a rischio infortuni?"

### Analisi Attività

> "Confronta le mie ultime 3 corse"

> "Trova attività simili alla mia corsa di domenica scorsa"

> "Analizza il mio allenamento dell'ultimo mese"

## Test

Esegui i test con dati reali:

```bash
npm test
```

Lo script esercita **90 dei 109 tool** contro il tuo account Garmin: tutti quelli di sola
lettura, più il ciclo di vita completo di un workout (crea → modifica → schedula → togli
dal calendario → elimina) e quello di una collezione gear. Restano fuori i tre tool delle
credenziali e i tool che scrivono altri dati sull'account — pesate, pressione,
idratazione, attività manuali, upload, modifiche all'equipaggiamento — che vanno provati a
mano su dati che sei disposto a perdere.

## Architettura

```
garmin-mcp-ts/
├── src/
│   ├── index.ts           # Punto di ingresso, gestione stdout/stderr
│   ├── garmin/
│   │   ├── client.ts      # Client API Garmin Connect (~3700 righe)
│   │   ├── auth.ts        # Login, sessione e rinnovo dei token OAuth
│   │   └── simple-login.ts # Utility standalone per provare il login
│   ├── mcp/
│   │   ├── server.ts      # Setup server MCP e gestori richieste
│   │   ├── tools.ts       # Definizioni strumenti e schemi (109 tool)
│   │   └── handlers.ts    # Logica implementazione strumenti
│   ├── utils/
│   │   ├── constants.ts   # Costanti dell'applicazione, nomi dei tool compresi
│   │   ├── credentials.ts # Risoluzione delle credenziali fra estensione, vault e .env
│   │   ├── errors.ts      # Classi di errore personalizzate
│   │   ├── logger.ts      # Utility di logging (solo stderr)
│   │   ├── stdio-guard.ts # Impedisce ad altro codice di scrivere su stdout e rompere il protocollo
│   │   └── secure-storage.ts # Storage cifrato e accesso al vault del SO
│   ├── test-tools.ts      # Suite che esercita i tool su un account reale (npm test)
│   └── test-oauth.ts      # Diagnostica del flusso OAuth
├── scripts/
│   ├── setup-encryption.ts  # Script interattivo per setup credenziali
│   ├── check-encryption.ts  # Script diagnostico per verificare encryption
│   ├── sync-manifest.ts     # Rigenera e verifica manifest.json dal codice
│   ├── fetch-keytar-prebuilds.mjs # Scarica i binari keytar di tutte le piattaforme
│   └── test-keytar.ts       # Script diagnostico per testare l'integrazione con Keytar
├── vendor/keytar/         # Binari keytar per piattaforma, inclusi nel bundle
├── dist/                  # Output JavaScript compilato
├── manifest.json          # Manifest MCPB del bundle (generato in parte da sync-manifest)
├── PRIVACY.md             # Privacy policy referenziata dal manifest
├── CHANGELOG.md           # Cronologia delle versioni (CHANGELOG_EN.md in inglese)
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

La storia completa del progetto, versione per versione, è nel [CHANGELOG](CHANGELOG.md).

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
