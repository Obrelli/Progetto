# Progetto Book&Party


## Partecipanti al Progetto:

A questo progetto hanno partecipato i seguenti collaboratori:

* <b> Daniele Obrelli       </b>
* <b> Alessandro Cacciabue  </b>
* <b> Marco Antonini        </b>

## Struttura della Repository
Questa repository di GitHub contiene il progetto dell'applicazione Book&Party.

Nella repository si possono trovare:
* i file per la gestione delle API locali: "server.js", "package.json" e "package-lock.json"
* la cartella "view": contenente la cartella "pages" e "partials" per il FrontEnd e la cartella "img" per la memorizzazione di immagini di supporto
* la cartella "test": contenente il file "index.js" per la gestione del testing delle API dell'applicazione
* la cartella "userflow": contenente il pdf dello user flow presentato nelle sezione 3 del documento D5 consegnato
* la cartella "video": contenente un video rappresentante il FrontEnd e le sue interazione con le API dell'applicazione Book&Party; per completezza insieme al video sarà presente un file in formato '.sql' che corrisponde alla copia del database utilizzato dall'applicazione.

## Come eseguire il codice
* Per eseguire il progetto basta richiamare il comando "npm start" all'interno della repository principale, dove è presente il file "server.js".
* Per quanto riguarda il lato Client basta aprire nel browser il seguente URL, una volta avviato il comando sopra riportato: http://localhost:3535/, sarà necessario l'aiuto di un server apache e di un database, noi abbiamo utilizzato XAMPP.
* Per il funzionamento completo dell'applicazione sarà necessario un database in MySql (per questo abbiamo caricato una copia nella repository).
* Per visualizzare la documentazione delle API sviluppate basta invece apire nel browser, una volta avviato il comando specificato al primo punto, il seguente URL: http://localhost:3535/api-docs/
* Per quanto riguarda il Testing delle API bisogna richiamare il comando "npm test" all'interno della repository principale, dove è presente il file "server.js".
