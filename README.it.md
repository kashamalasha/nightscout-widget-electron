# 🦉 Ciao, sono Owlet!

[![RU](https://img.shields.io/badge/Language-RU-red.svg)](https://github.com/kashamalasha/nightscout-widget-electron/blob/main/README.ru.md)

Il nome dell'app è "Owlet", che significa piccolo gufo ed è scelto per via del logo del progetto Nightscout.

## 👋 Descrizione del Progetto

Questa è un'applicazione multipiattaforma, creata con [framework Electron](https://www.electronjs.org/), che utilizza le [API Nightscout](https://nightscout.github.io/). L'obiettivo è fornire un'interfaccia leggera per la visualizzazione della misurazione del livello di zucchero nel sangue per i T1D.

Il widget rimarrà in primo piano sullo schermo, quindi non avrai più bisogno di tenere aperto il tuo sito Nightscout nel browser per vedere le tue misurazioni, di un tuo parente o di un bambino in tempo reale.

Sono stato inspirato dalla soluzione [mlukasek/M5_NightscoutMon](https://github.com/mlukasek/M5_NightscoutMon), creata per l'hardware [M5 Stack's](https://m5stack.com/).

<img src="docs/screenshot-widget.png" alt="Screenshot-widget" width="300"/>

## 📦 Pacchetti di installazione

[![Download for Windows](https://img.shields.io/badge/Download-Windows%20.exe-blue?style=for-the-badge&logo=windows)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.6.1-beta/Owlet-0.6.1-beta-win-x64.exe)

[![Download for macOS(Apple Silicon)](https://img.shields.io/badge/Download-macOS%20(Apple%20Silicon)%20.dmg-blue?style=for-the-badge&logo=apple)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.6.1-beta/Owlet-0.6.1-beta-mac-arm64.dmg)

[![Download for macOS(Intel)](https://img.shields.io/badge/Download-macOS%20(Intel)%20.dmg-blue?style=for-the-badge&logo=apple)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.6.1-beta/Owlet-0.6.1-beta-mac-x64.dmg)

[![Download for Linux](https://img.shields.io/badge/Download-Linux%20.AppImage-blue?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/kashamalasha/nightscout-widget-electron/releases/download/v0.6.1-beta/Owlet-0.6.1-beta-linux-x86_64.AppImage)

[![Download Souces](https://img.shields.io/badge/Download-Sources%20.tar.gz-blue?style=for-the-badge&logo=electron&logoColor=white)](https://github.com/kashamalasha/nightscout-widget-electron/archive/refs/tags/v0.6.1-beta.tar.gz)

[![Download Souces](https://img.shields.io/badge/Browse-Latest%20Release-red?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kashamalasha/nightscout-widget-electron/releases/latest)

<details>
  <summary>Utenti <b>LINUX</b>, aprite questa sezione e leggete... </summary>
  <br>
  Il widget è incluso in un pacchetto [AppImage](https://appimage.org/) per i seguenti motivi:

   - Funziona su tutte le comuni distribuzioni Linux
   - Supporta una funzione di aggiornamento automatico (ma non supporta la notifica a riguardo)
   - L'utilizzo di AppImage semplifica il processo di sviluppo e test su molte distribuzioni Linux diverse

  Consiglio di utilizzare [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) per integrare correttamente AppImage nel sistema operativo e creare tutti i file `.desktop` necessari per avviarlo come applicazione installata. Tuttavia, questa decisione dipende interamente da te. Puoi avviare l'applicazione subito dopo averla scaricata dalla cartella che hai scelto di scaricare e creare manualmente il file `.desktop`.

  Installa le dipendenze elencate utilizzando il gestore pacchetti del sistema operativo:

   - wmctrl
   - xdg-utils

  Senza queste dipendenze elencate il widget funzionerà comunque ma potrebbe essere difficile gestire correttamente gli stati della finestra (`wmctrl` viene utilizzato per nascondere l'app dal pannello e dalla barra delle applicazioni) e aprire altre applicazioni (`xdg-open` viene utilizzato per aprire il browser per reindirizzare al sito Nightscout e aprire il file manager per accedere alla cartella dei registri).

  Senza questi pacchetti, il widget ti avviserà delle dipendenze mancanti una volta al giorno ad ogni lancio.

  <b>L'aggiornamento automatico può causare il blocco</b>. L'applicazione inizia a verificare la presenza di aggiornamenti subito dopo il lancio, ma solo una volta al giorno. Se trova una nuova versione inizierà a scaricare e a sostituire AppImage sul tuo disco, operazione che in genere richiede circa 1-2 minuti. Se l'applicazione si blocca, devi attendere finché non si riavvia o, in alternativa, puoi terminare il processo utilizzando il comando `ps` e riavviarlo.

  Il problema è legato alla mancanza di usabilità del `daemon di notifica`. A volte, il servizio D-Bus non viene configurato correttamente e, di conseguenza, il comando "notify-send" non può essere eseguito. Se il comando `notify-send` funziona bene sulla tua distribuzione, allora non è un tuo problema e tutto dovrebbe funzionare correttamente.

  Tieni presente che AppImage non dispone ancora di un meccanismo integrato per notificare gli aggiornamenti. Se sei a conoscenza di come implementare questa funzionalità, puoi contribuire inviando una richiesta pull; Lo apprezzerei sinceramente.

</details>

## ⚠️ Prima di cominciare

> ‼️ **MOLTO IMPORTANTE**: Devi essere sicuro che tutti i passaggi siano stati eseguiti prima di effettuare il primo lancio!

1. Autenticati nel pannello di amministrazione del tuo sito Nightscout (es. https://some-cgm.site.com/admin/)
2. Crea un nuovo ruolo con i permessi di lettura usando questo pattern `*:*:read`
3. Crea un nuovo utente per la tua applicazione con il ruolo creato nello step 2, oppure usa un ruolo già esistente con il pattern di sola lettura `*:*:read`
4. Copia il token di accesso di questo utente negli appunti oppure salvalo

## 🚀 Primo avvio

Al primo avvio l'app ti proporrà di compilare le seguenti informazioni

<figure>
  <p>
    <img src="docs/screenshot-settings-default-en.png" alt="Screenshot-widget"/>
  </p>
</figure>

### 1. Impostazioni API Nightscout

- **NIGHTSCOUT URL** - è l'indirizzo del tuo sito nightscout (e.g. https://some-cgm.fly.dev) 
- **NIGHTSCOUT TOKEN** - il token di accesso che hai creato nei precedenti step
- **NIGHTSCOUT REQUEST INTERVAL (SEC.)** - (*default: 60*) l'intervalli di tempo per l'aggiornamento dei dati da Nightscout da visualizzare nel widget

### 2. Preferenze Widget
- **AGE LIMIT (MIN.)** - (*default: 20*) intervallo di timeout della richiesta dati, dopo questo intervallo il widget cambierà e mostrerà uno stato "congelato". Ciò indica in genere che il lettore è offline, staccato dal sensore o che la batteria dello smartphone è scarica. Se preferisci che il widget non si blocchi, puoi impostare questa proprietà su 0. Il valore massimo consentito per questo campo, così come il valore massimo mostrato, è 999 minuti.

<img src="docs/screenshot-widget-frozen.png" alt="Screenshot-widget" width="200"/>

- **SHOW AGE** - (*default: enabled*) questa opzione visualizza informazioni aggiuntive sull'età dei dati mostrati

- **UNITS IN MMOL/L** - (*default: enabled*) questa opzione consente di visualizzare i valori glicemici del sensore in mmol/l anziché in mg/dl. Se decidi di modificare questa impostazione assicurati di regolare tutte le preferenze del livello di zucchero nel sangue anche in base alle unità di misura selezionate. Quando si modificano le unità di misura, la visualizzazione a colori dei valori SGV sarà disabilitata finché le impostazioni non verranno salvate.
- 
- **CALC TREND** - (*default: disabled*) Questa opzione consente di calcolare la direzione del trend utilizzando gli ultimi sei valori SGV ricevuti (nell'ultima mezz'ora). Potresti trovarlo utile quando il tuo sensore non dispone di un'opzione integrata (ad esempio, Dexcom, Medtronic) e l'API Nightscout non memorizza questo valore. In questi casi, vedrai sempre un simbolo ` - ` nell'angolo in basso a destra del widget invece di una freccia di tendenza.

L' app usa il seguente algoritmo dei sensori Abbot™ FreeStyle Libre™ per riconoscere la tendenza.

<figure>
  <p>
    <img src="docs/fs-libre-trend-arrows.png" alt="Screenshot-widget"/>
  </p>
</figure>

È possibile trovare ulteriori informazioni sull'approccio all'utilizzo delle frecce di tendenza per regolare le dosi di insulina nell'articolo del **Journal of the Endocrine Society**: [Approach to Using Trend Arrows in the FreeStyle Libre Flash Glucose Monitoring Systems in Adults](https://academic.oup.com/jes/article/2/12/1320/5181247). 

[PDF version](docs/js.2018-00294.pdf) disponibile per il download.


### 3. Preferenze del livello di zucchero del sangue


Imposta i parametri di monitoraggio della glicemia utilizzando le seguenti guide:

- Oltre il **HIGH LEVEL TRESHOLD** (*default: 10*) e sotto il **LOW LEVEL THRESHOLD** (*default: 3.5*) l'ultimo valore verrà colorato di rosso

<img src="docs/screenshot-widget-critical.png" alt="Screenshot-widget" width="200"/>

- Oltre il **TARGET TOP LEVEL** (*default: 8.5*) e sotto il **TARGET BOTTOM LEVEL** (*default: 4*) l'ultimo valore verrà colorato di arancione

<img src="docs/screenshot-widget-warning.png" alt="Screenshot-widget" width="200"/>

- Di default, l'ultimo valore è colorato di verde

<img src="docs/screenshot-widget-ok.png" alt="Screenshot-widget" width="200"/>

- Puoi testare i parametri di connessione inseriti facendo clic sul pulsante **TEST** per verificare che il sito Nightscout sia accessibile e che il token sia corretto
- Se tutto è ok, premi il pulsante **SALVA** per salvare le impostazioni e riavviare l'applicazione


### 4. Impostazioni lingua e localizzazione 


Puoi scegliere la lingua delle impostazioni facendo clic sull'icona **EN** in alto a sinistra e selezionando la lingua preferita.

<figure>
  <p>
    <img src="docs/screenshot-settings-language-en.png" alt="Screenshot-widget"/>
  </p>
</figure>

- Attualmente l'applicazione offre solo due opzioni di lingua: **Inglese** e **Russo**.

- Se ti senti sicuro e hai una buona conoscenza di una lingua straniera, puoi contribuire alla traduzione dell'applicazione diventando collaboratore del progetto su [POEditor](https://poeditor.com/projects/view?id=640131).

## 🧭 Uso del widget

- Dopo il riavvio il widget rimarrà sempre in primo piano sullo schermo finché non lo chiuderai facendo clic sull'angolo in alto a sinistra con il segno X.
- Se è necessario modificare le impostazioni è possibile fare clic sul simbolo dell'ingranaggio nell'angolo in basso a sinistra.
- Se vuoi navigare velocemente nel sito Nightscout puoi cliccare il pulsante centrale con il simbolo del grafico.

## ⬇️ Auto aggiornamenti

- Il widget ha un sistema di aggiornamento del sistema integrato.
- Il widget controllerà la disponibilità dell'ultima versione ogni volta che viene avviato, ma solo una volta al giorno.
- Se è disponibile l'ultima versione, il widget verrà scaricato e installato automaticamente subito dopo l'uscita.
- Sui sistemi operativi **Mac** e **Windows**, gli utenti riceveranno una notifica sulla versione appena scaricata.
- Su **Linux**, la notifica non funziona ancora correttamente.

## 🚧 In Progress 

- Unit tests coverage con [Jest](https://jestjs.io/)
- Creazione di una pagina landing del progetto con [Jekyll](https://jekyllrb.com/)
- Sostituzione di Electron con [Tauri app](https://beta.tauri.app/)

Se senti il desiderio di migliorarlo o di aiutare puoi suggerire qualsiasi idea o bug rilevato al [project board](https://github.com/users/kashamalasha/projects/2/views/1).

## 🗜️ Contenuto

La corrente applicazione include questi file:

- `package.json`: punta al file principale dell'app ed ne elenca i dettagli e le dipendenze.
- `main.js` - Avvia l'app e crea un widget. Questo è il **processo principale** dell'app.
- `widget.html` - Un file HTML per la finestra principale. Questo è il punto di partenza del **processo di rendering** dell'app.
- `settings.html` - Un file HTML per la finestra delle impostazioni. Queste sono le impostazioni dell'app.
- `styles.css` - Stili per il processo di rendering
- `js/widget.js` - Il codice JS principale del **processo di rendering** dell'app.
- `js/settings.js` - Le impostazioni del modulo **processo di rendering** codice JS.
- `js/logger.js` - Adattatore logger per libreria di log elettronici.
- `js/preload.js` - L'interfaccia API per la messaggistica IPC tra il **processo principale** e il **processo di rendering**.
- `js/backend.js` - Il codice per ottenere dati dall'API Nightscout utilizzando AJAX.
- `js/util.js` - Il codice JS per adattare i dati raccolti a una visualizzazione leggibile dall'uomo.
- `js/auto-update.js` - Implementazione JS dell'aggiornamento automatico dell'app.
- `js/translator.js` - Questo file contiene l'implementazione della classe JS di localizzazione.
- `js/localization/{lang}.json` - Questi file contengono set di chiavi per la localizzazione, dove {lang} è un segnaposto per il codice della lingua specifica.
- `js/config-schema.json` - File di convalida dello schema json di configurazione dell'app.
- `js/config-sample.json` - Esempio di config.json dell'app
- `js/config-default.json` - I valori predefiniti per config.json
- `build/` - La directory build contiene i file necessari per creare l'applicazione sul tuo host dal codice sorgente.
- `docs/` - Screenshot per questo README.

## 🛠️ Per costruirlo dal codice sorgente

Per clonare ed eseguire questo repository, avrai bisogno di [Git](https://git-scm.com) e [Node.js](https://nodejs.org/en/download/) (che viene fornito con [ npm](http://npmjs.com)) installato sul tuo computer. Dalla riga di comando esegui:

```bash
# Clona questo repository
git clone https://github.com/kashamalasha/nightscout-widget-electron
# Entra nel repository
cd nightscout-widget-electron
# Installa le dipendenze
npm install
# Avvia l'app
npm start
# Oppure eseguila in developer mode per un maggiore logging e debugging
npm run dev
```

### Sistemi Operativi

Compatibile con:
* MacOS, 
* MS Windows, 
* Linux (testato su Ubuntu, Fedora, CentOS, Alma su GNOME Desktop e XFCE)

### Crea applicazioni native

Puoi creare un'applicazione nativa per le preferenze del tuo sistema operativo dal codice sorgente utilizzando uno di questi strumenti:

- [electron-forge](https://www.electronforge.io/) 
- [electron-builder](https://www.electron.build/) (attualmente in uso)

### Risorse Aggiuntive

- [electronjs.org/docs](https://electronjs.org/docs) - tutta la documentazione di Electron
- [electron.build](https://electron.build) - documentazione electron-builder
- [Nightscout API v3](https://github.com/nightscout/cgm-remote-monitor/blob/master/lib/api3/doc/tutorial.md) - documentazione Nightscout API v3
- [Icons8.com](https://icons8.com/) - Fantastica raccolta di icone e risorse che ho utilizzato in questo progetto
- [POEditor](https://poeditor.com/projects/view?id=640131) - localizzazione dell'applicazione

## ⚖️ Licenze

[GNU GPL v3](LICENSE.md)

## ✉️ Contatti
Sentitevi liberi di contattarmi in uno di questi modi:
- dmitry.burnyshev@gmail.com
- https://linkedin.com/in/diburn
- https://t.me/diburn

🙏 Apprezzerò qualsiasi feedback!

