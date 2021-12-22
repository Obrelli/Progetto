const express = require("express");
var bodyParser = require("body-parser");
const app = express();
var session = require("express-session");
const alert = require("alert");
var cors = require("cors");


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//----------------------------------------------------
//api documentation
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
        swaggerDefinition: {
        info: {
            title: "Book&Party",
            description: "API documentation dell'applicazione Book&Party del Gruppo G31",
            contact: {
                name: "Gruppo G31"
            },
            servers: ["http://localhost:3535/"]
        }
    },
    apis: ["server.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
//documentazione swagger da aggiungere
//----------------------------------------------------

function formatDate(date) {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
}
app.use( express.static( "views" ) );
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

const mysql = require("mysql");
const { response, query } = require("express");
const { join } = require("path");
const { runMain } = require("module");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "book&party",
});

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// set the view engine to ejs
app.set("view engine", "ejs");

// index page
app.get("/", function (req, res) {
    res.render("pages/index");
});


//----------------------------------------------------------
app.get('/ric', async function(req,res){
    res.render('pages/ricerca.ejs');
  })

  

/**
* @swagger
* 
* 
* /ricerca:
*   get:
*     tags:  
*     - "Utente non registrato"  
*     - "Cliente"
*     - "Gestore"
*     summary: Permette all'utente non registrato o all'utente di tipo Cliente di effettuare la ricerca dei locali.
*     parameters:
*     - in: "query" 
*       name: "citta"
*       description: "Indica la città in cui il locale è situato"
*       required: true
*     - in: "query" 
*       name: "np"
*       description: "Indica il numero di persone che un locale può accettare"
*       required: true
*     responses:  
*         "200":
*           description: "Ricerca avvenuta correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/
//ricerca locali 
app.get('/ricerca', function(req,res){
    connection.query('CREATE OR REPLACE VIEW id(id_locale, nome_locale, np, id_tipologia, nome_tipologia) AS SELECT DISTINCT utente_locale.id_locale, nome_locale, numero_massimo_persone, tipologia.id_tipologia, nome_tipologia FROM tipologia,utente_locale WHERE tipologia.id_locale=utente_locale.id_locale && citta="'+req.query.città+'" && numero_massimo_persone >= "'+req.query.np+'"',(err,rows) =>{
        if(!err){
            connection.query('SELECT DISTINCT nome_locale,id_locale  FROM id  WHERE (id_locale IN (SELECT DISTINCT id_locale FROM id) )', (err,rrr)=>{
                //console.log('CREATE OR REPLACE VIEW id(id_locale, id_tipologia, nome_tipologia) AS SELECT DISTINCT utente_locale.id_locale, tipologia.id_tipologia, nome_tipologia FROM tipologia,utente_locale WHERE tipologia.id_locale=utente_locale.id_locale && citta="'+req.query.città+'" && numero_massimo_persone <= "'+req.query.np+'"');
                connection.query('SELECT DISTINCT COUNT(*) as num FROM utente_locale  WHERE (utente_locale.id_locale IN (SELECT DISTINCT id_locale FROM id) )' , (err, n) =>{
                    connection.query('CREATE OR REPLACE VIEW bho(id_locale, id_tipologia, nome_tipologia, tipo_servizio, id_servizi, np) AS SELECT id.id_locale, id.id_tipologia, id.nome_tipologia, tipo_servizio, id_servizi, numero_massimo_persone FROM id,tipologia,servizi WHERE (tipologia.id_locale IN (SELECT DISTINCT id_locale FROM id) );', (err,r)=>{
                        if(!err){
                            //connection.query('SELECT DISTINCT id_locale,nome_locale  FROM id  WHERE (id_locale IN (SELECT DISTINCT id_locale FROM id) );' ,(err,idloc)=>{
                                //if(!err){
                                connection.query('SELECT DISTINCT bho.id_locale, bho.nome_tipologia, bho.id_tipologia FROM bho,id WHERE (bho.id_locale IN (SELECT DISTINCT id_locale FROM id) )' ,(err,rr)=>{
                                    connection.query('SELECT DISTINCT np, id_locale, id_tipologia FROM id' ,(err,rnp)=>{
                                        if(!err){
                                            connection.query("DROP VIEW BHO, ID;");
                                            res.status(200);
                                            var data = formatDate(req.query.data);
                                            res.render("pages/locali", {città: req.query.città, np:req.query.np, n: n, r:r, rr:rr, idloc:rrr, rnp, data});     
                                        }else{
                                            console.log("error");
                                            res.status(400);
                                        }   
                                    })
                                }) 
                                /*}else{
                                    console.log("non va un cazzo");
                                }
                            })*/
                        }else{
                            console.log("error");
                            res.status(400);
                        }                     
                    })
                })   
            })       
        }else{
            
            
        } 
    })
    
})

/**
* @swagger
* 
* 
* /info:
*   get:
*     tags:  
*     - "Utente non registrato"  
*     - "Cliente"
*     - "Gestore"
*     summary: Permette all'utente non registrato o all'utente di tipo Cliente di visualizzare le informazioni di un singolo locale.
*     parameters:
*     - in: "query" 
*       name: "id"
*       description: "Indica l'id del Locale del quale si vogliono visualizzare le varie informazioni"
*       required: true
*     responses: 
*         "200":
*           description: "Visualizzazione avvenuta correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/
//info singolo locale
app.get('/info', (req,res) =>{
    connection.query('CREATE OR REPLACE VIEW id(id_locale, nome_locale, descrizione) AS SELECT DISTINCT utente_locale.id_locale, nome_locale, descrizione FROM tipologia,utente_locale WHERE tipologia.id_locale= utente_locale.id_locale',(err,rows)=>{
        if(!err){
            connection.query('SELECT DISTINCT * FROM id WHERE id_locale="'+req.query.id+'"' , (err, rows)=>{
                connection.query('CREATE OR REPLACE VIEW bho(id_locale, id_tipologia, nome_tipologia, tipo_servizio, id_servizi, np, costo) AS SELECT tipologia.id_locale, tipologia.id_tipologia, tipologia.nome_tipologia, tipo_servizio, id_servizi, numero_massimo_persone,tipologia.costo FROM tipologia,servizi WHERE (tipologia.id_locale IN (SELECT DISTINCT id_locale FROM id) )', (err,r)=>{
                    connection.query('SELECT DISTINCT id_tipologia, nome_tipologia, costo FROM bho WHERE id_locale="'+req.query.id+'"', (err,rr)=>{
                        if(!err){
                            connection.query('SELECT DISTINCT id_tipologia, id_servizi, tipo_servizio, prezzo_servizio FROM servizi WHERE (id_tipologia IN (SELECT id_tipologia FROM bho WHERE id_locale="'+req.query.id+'"))', (err,r)=>{
                                if(!err){
                                    //console.log(r);
                                    connection.query("DROP VIEW bho, id;");
                                    res.status(200);
                                    res.render('pages/infolocale', {rows,rr,r});
                                }else{
                                    res.status(400);
                                    //console.log("errore!");
                                }
                            })
                        }else{
                            //console.log("errore");
                            res.status(400);
                        }
                    })
                })
            })
        }
    })
})


/**
* @swagger
* 
* 
* /pren:
*   get:
*     tags:
*     - "Cliente"
*     - "Gestore"
*     summary: Permette all'utente di tipo Cliente di effettuare una prenotazione presso un locale, impostando i vari parametri della prenotazione.
*     parameters:
*     - in: "query" 
*       name: "id_locale"
*       description: "Indica l'id dell'utente di tipo Locale presso il quale il Cliente vuole effettuare una prenotazione"
*       required: true
*     responses: 
*         "200":
*           description: "Api eseguita correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/
//api che gestisce la visualizzazione e la gestione della prenotazione 
app.get("/pren", function(req,res){
    connection.query('CREATE OR REPLACE VIEW id(id_locale, nome_locale, descrizione) AS SELECT DISTINCT utente_locale.id_locale, nome_locale, descrizione FROM tipologia,utente_locale WHERE tipologia.id_locale= utente_locale.id_locale',(err,rows)=>{
        if(!err){
            connection.query('SELECT DISTINCT * FROM id WHERE id_locale="'+req.query.id_locale+'"' , (err, rows)=>{
                connection.query('CREATE OR REPLACE VIEW bho(id_locale, id_tipologia, nome_tipologia, tipo_servizio, quantita, id_servizi, np, costo) AS SELECT tipologia.id_locale, tipologia.id_tipologia, tipologia.nome_tipologia, tipo_servizio, quantita, id_servizi, numero_massimo_persone,tipologia.costo FROM tipologia,servizi WHERE (tipologia.id_locale IN (SELECT DISTINCT id_locale FROM id) )', (err,r)=>{
                    connection.query('SELECT DISTINCT id_tipologia, nome_tipologia, costo FROM bho WHERE id_locale="'+req.query.id_locale+'"', (err,rr)=>{
                        if(!err){
                                if(!err){
                                    connection.query("DROP VIEW BHO, ID;");
                                    res.status(200);
                                    res.render("pages/prenota", {id_locale: req.query.id_locale, rr, rows});
                                }else{
                                    res.status(400);
                                    //console.log("errore!");
                                }
                        }else{
                            //console.log("errore");
                            res.status(400);
                        }
                    })
                })
            })
        }
    })
   
})

/**
* @swagger
* 
* 
* /prenota:
*   post:
*     tags:
*     - "Cliente"
*     - "Gestore"
*     summary: Permette all'utente di tipo Cliente di effettuare una prenotazione presso un locale, andando a salvare la prenotazione sul DB.
*     parameters:
*     - in: "body" 
*       name: "nome_tipologia"
*       description: "Indica il nome della tipologia che il Cliente vuole prenotare presso un determinato locale"
*       required: true
*     - in: "body" 
*       name: "id_locale"
*       description: "Indica l'id dell'utente di tipo Locale presso il quale il Cliente vuole effettuare una prenotazione"
*       required: true
*     - in: "body" 
*       name: "data"
*       description: "Indica la data per cui viene effettuta la prenotazione presso il locale"
*       required: true
*     - in: "body" 
*       name: "quantita"
*       description: "Indica la quantità che il cliente vuole prenotare di una determinata tipologia"
*       required: true
*     - in: "session" 
*       name: "id_utente"
*       description: "Indica l'id dell'utente che vuole effettuare la prenotazione"
*       required: true
*     responses: 
*         "200":
*           description: "Prenotazione avvenuta correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/
app.post("/prenota", urlencodedParser, (req,res)=>{
    const nome_tipologia = req.body.tip.split(' ');
    if(req.session.id_utente!=undefined){
    connection.query("select id_tipologia from tipologia where nome_tipologia='"+nome_tipologia[0]+"' && id_locale='"+req.body.id_locale+"'", (err,rows)=>{
        if(!err){
            connection.query("INSERT INTO prenotazione_tipologia_locale (id_locale, id_cliente, id_tipologia, data_prenotazione, quantita) VALUES ('"+req.body.id_locale+"','"+req.session.id_utente+"','"+ rows[0].id_tipologia+"','"+req.body.data+"','"+req.body.quantita+"')", (err,rows)=>{
                if(!err){
                    res.status(200);
                    res.redirect("/elencopre");
                }else{
                   // console.log("errore");
                   res.status(400);
                }
            })
        }else{
            // console.log("errore");
            res.status(400);
        }
    })
}else{
    res.redirect("/login");
}
})



/**
* @swagger
* 
* 
* /elencopre:
*   get:
*     tags:
*     - "Cliente"
*     - "Gestore"
*     summary: Permette all'utente di tipo Cliente di visualizzare tutte le prenotazioni da lui effettuate.
*     parameters:
*     - in: "session" 
*       name: "id_utente"
*       description: "Indica l'id dell'utente di tipo Cliente del quale si vogliono visualizzare tutte le prenotazioni che ha effettuato"
*       required: true
*     responses: 
*         "200":
*           description: "Visualizzazione avvenuta correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/
//elenca le varie prenotazioni effettuate da un cliente
app.get("/elencopre", (req,res)=>{
    connection.query("CREATE OR REPLACE VIEW id(id_locale, id_cliente, id_prenotazione,id_tipologia,data_prenotazione,quantita) AS SELECT id_locale, id_cliente, id_prenotazione,id_tipologia,data_prenotazione,quantita FROM prenotazione_tipologia_locale WHERE id_cliente='"+req.session.id_utente+"'", (err,PREN)=>{
     
        if(!err){
            connection.query("SELECT * FROM id WHERE id_cliente='"+req.session.id_utente+"'", (err,PREN)=>{  
            //console.log(req.session.id_utente);

            if(req.session.id_utente!=undefined){

            connection.query("SELECT id.id_locale, id_cliente, id_prenotazione,id.id_tipologia,data_prenotazione,id.quantita, nome_locale, nome_tipologia, costo FROM id,utente_locale,tipologia WHERE id.id_cliente='"+req.session.id_utente+"' && id.id_locale=utente_locale.id_locale && id.id_tipologia = tipologia.id_tipologia;", (err,UTLOC)=>{
                //console.log(PREN);
                if(!err){       
                    UTLOC.forEach(r =>{
                        r.data_prenotazione=formatDate(r.data_prenotazione);
                    })
                        res.status(200);
                        res.render("pages/elencoprenotazioni", {PREN,UTLOC, utente: req.session.id_utente});
                    }else{
                        //console.log("elenco prenotazioni- query error");
                        res.status(400);
                    }
                })
            }else{
                res.redirect("/login");
            }
        })

        }else{
            //console.log("error");
            res.status(400);
        }
    })
})

/**
* @swagger
* 
* 
* /infopren:
*   get:
*     tags:
*     - "Cliente"
*     - "Gestore"
*     summary: Permette all'utente di tipo Cliente di visualizzare le informazioni di una determinata prenotazione da lui effettuata.
*     parameters:
*     - in: "query" 
*       name: "id"
*       description: "Indica l'id della prenotazione effettuata della quale si vogliono visualizzare le varie informazioni"
*       required: true
*     - in: "query" 
*       name: "utente"
*       description: "Indica l'id del cliente che ha effettuato la prenotazione che si vuole visualizzare"
*       required: true
*     responses: 
*         "200":
*           description: "Visualizzazione avvenuta correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/
//visualizza le informazioni di una singola prenotazione
app.get("/infopren", function (req,res){
    connection.query("CREATE OR REPLACE VIEW id(id_locale, id_cliente, id_prenotazione,id_tipologia,data_prenotazione,quantita) AS SELECT id_locale, id_cliente, id_prenotazione,id_tipologia,data_prenotazione,quantita FROM prenotazione_tipologia_locale WHERE id_cliente='"+req.query.utente+"' && id_prenotazione='"+req.query.id+"'", (err,PREN)=>{
        if(!err){
            connection.query("SELECT id.id_locale, id_cliente, id_prenotazione,id.id_tipologia,data_prenotazione,id.quantita, nome_locale, nome_tipologia, costo, email, numero_telefono, citta, indirizzo_locale FROM id,utente_locale,tipologia WHERE id.id_cliente='"+req.query.utente+"' && id_prenotazione='"+req.query.id+"' && id.id_locale=utente_locale.id_locale && id.id_tipologia = tipologia.id_tipologia;", (err,UTLOC)=>{
                res.status(200);
                UTLOC[0].data_prenotazione=formatDate(UTLOC[0].data_prenotazione);
                res.render("pages/infoprenotazione", {UTLOC, utente:  req.query.utente});
            });
            
        }else {res.status(400);}
    })
})


/**
* @swagger
* 
* 
* /annullapren:
*   delete:
*     tags:
*     - "Cliente"
*     - "Gestore"
*     summary: Permette all'utente di tipo Cliente di annullare una prenotazione da lui effettuata.
*     parameters:
*     - in: "query" 
*       name: "id_utente"
*       description: "Indica l'id del cliente che vuole annullare una sua prenotazione"
*       required: true
*     - in: "query" 
*       name: "id_prenotazione"
*       description: "Indica l'id della prenotazione che il cliente vuole annullare"
*       required: true
*     responses: 
*         "200":
*           description: "Eliminazione avvenuta correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/
//annulla un determinata prenotazione
app.delete("/annullapren" , (req,res)=>{
    connection.query("DELETE FROM prenotazione_tipologia_locale WHERE id_cliente='"+req.query.id_utente+"' && id_prenotazione='"+req.query.id_prenotazione+"'", (err, rows)=>{
        if(!err){
            res.sendStatus(200);
        }else{
            //console.log("error annulla");
            res.sendStatus(400);
        }
    })
})

//----------------------------------------------------------
//login
app.get("/login", function (req, res) {
    res.render("pages/login");
});

// registrazione utente
app.get("/registrazioneUtente", function (req, res) {
    res.render("pages/registrazioneUtente");
});

/**
* @swagger
* 
* 
* /tipologie:
*   get:
*     tags:  
*     - "Locale"
*     - "Gestore"
*     summary: Permette di visualizzare l'elenco delle tipologie di un certo locale.
*     parameters:
*     - in: "session" 
*       name: "is_locale"
*       description: "Indica se l'account è di tipo locale o no"
*       required: true
*     - in: "session" 
*       name: "id_utente"
*       description: "In caso l'utente sia di tipo locale viene usato l'id_utente della sessione per l'id del locale"
*       required: true
*     - in: "query" 
*       name: "id"
*       description: "In caso l'utente sia di tipo gestore l'id del locale sarà passato tramite url"
*       required: false
*     responses: 
*         "200":
*           description: "Tipologie visualizzate correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*
*/

app.get("/tipologie", async function (req, res) {
    //console.log(req.session)
    if(req.session.isLocale == 1){
      connection.query(
          `SELECT * FROM tipologia WHERE id_locale = "${req.session.id_utente}"`,
          (err, tipologie) => {
              if (err) throw err;
  
              //console.log("Data received from Db:");
              //console.log(tipologie);
              res.render("pages/tipologie", { tipologie });
          }
      );
    }else{
      connection.query(
          `SELECT * FROM tipologia WHERE id_locale = "${req.query.id}"`,
          (err, tipologie) => {
              if (err) throw err;
  
              //console.log("Data received from Db:");
              //console.log(tipologie);
              res.render("pages/tipologie", { tipologie });
          }
      );
    }
});

/**
* @swagger
* 
* 
* /registrazioneLocale:
*   get:
*     tags:  
*     - "Cliente"
*     - "Gestore"
*     summary: Permette il render della pagina per la registrazione di un locale.
*     responses: 
*         "200":
*           description: "Pagina renderizzata correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*
*/

app.get("/registrazioneLocale", async function (req, res) {
    res.render("pages/registrazioneLocale");
});

//---------------------------------------------
//sezione Homepage dei vari utenti
/**
* @swagger
* 
* 
* /home:
*   get:
*     tags:  
*     - "Cliente"
*     - "Gestore"
*     - "Locale"
*     summary: Reindirizza alla corretta homepage in base al tipo di utente.
*     parameters:
*     - in: "session" 
*       name: "isLocale"
*       description: "Indica se l'account è di tipo locale o no"
*       required: true
*     - in: "session" 
*       name: "isTipoGestore"
*       description: "Indica se l'utente è di tipo gestore o no"
*       required: true
*     responses: 
*         "200":
*           description: "Reindirizzamento eseguito correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*
*/

app.get("/home", async function (req, res){

    if(req.session.isLocale == 0){
      res.render("pages/homepage");
    }else{
      res.render("pages/homepageLocale");
    }
  })
  
  /**
  * @swagger
  * 
  * 
  * /homepage:
  *   get:
  *     tags:  
  *     - "Gestore"
  *     - "Cliente"
  *     summary: Permette il render della homepage.
  *     parameters:
  *     - in: "session" 
  *       name: "isTipoGestore"
  *       description: "Indica se l'utente è di tipo gestore o no"
  *       required: true
  *     responses: 
  *         "200":
  *           description: "Homepage visualizzata correttamente"
  *         "400":
  *           description: "Errore nell'esecuzione dell'API" 
  *
  */
  
  app.get("/homepage", async function (req, res) {
      res.render("pages/homepage");
  });
  
  /**
  * @swagger
  * 
  * 
  * /homepageLocale:
  *   get:
  *     tags:  
  *     - "Locale"
  *     summary: Permette il render della homepage per i clienti di tipo locale.
  *     responses: 
  *         "200":
  *           description: "HomepageLocale visualizzata correttamente"
  *         "400":
  *           description: "Errore nell'esecuzione dell'API" 
  *
  */

  app.get("/homepageLocale", async function (req, res) {
      res.render("pages/homepageLocale");
  });
  //---------------------------------------------
  /**
  * @swagger
  * 
  * 
  * /gestioneAccount:
  *   get:
  *     tags:  
  *     - "Cliente"
  *     - "Gestore"
  *     - "Locale"
  *     summary: Reindirizza alla corretta pagina per permettere all'utente di modificare le informazioni del proprio account.
  *     parameters:
  *     - in: "session"
  *       name: "isLocale"
  *       description: "Indica se l'account è di tipo locale o no"
  *       required: true
  *     - in: "session" 
  *       name: "id_utente"
  *       description: "Indica l'id dell'utente"
  *       required: true
  *     responses: 
  *         "200":
  *           description: "Informazioni modificate correttamente"
  *         "400":
  *           description: "Errore nell'esecuzione dell'API" 
  */

  app.get("/gestioneAccount", async function (req, res) {
    console.log("ID UTENTE: " + req.session.id_utente);
    if (req.session.isLocale == 0) {
        console.log("QUESTO UTENTE È UN CLIENTE/GESTORE");
        connection.query(
            `SELECT * FROM utente WHERE id_utente = "${req.session.id_utente}"`,
            (err, utente) => {
                if (err) throw err;

                console.log("Data received from Db:");
                console.log(utente);
                utente[0]["data_di_nascita"] = formatDate(
                    utente[0]["data_di_nascita"]
                );
                res.render("pages/gestioneAccount", { utente });
            }
        );
    } else {
        //console.log("QUESTO UTENTE È UN LOCALE");
        connection.query(
            `SELECT * FROM utente_locale WHERE id_locale = "${req.session.id_utente}"`,
            (err, utente) => {
                if (err) throw err;

                //console.log("Data received from Db:");
                //console.log(utente);
                res.render("pages/gestioneAccountLocale", { utente });
            }
        );
    }
});

  /**
  * @swagger
  * 
  * 
  * /aggiungiTipologia:
  *   get:
  *     tags:  
  *     - "Gestore"
  *     - "Locale"
  *     summary: Reindirizza alla pagina aggiungiTipologia e passa l'id_locale ottenuto tramite url.
  *     parameters:
  *     - in: "query" 
  *       name: "id"
  *       description: "Indica l'id del locale a cui vogliamo aggiungere una tipologia"
  *     responses: 
  *         "200":
  *           description: "Pagina reindirizzata correttamente"
  *         "400":
  *           description: "Errore nell'esecuzione dell'API" 
  */

app.get("/aggiungiTipologia", async function (req, res) {
  id_locale = req.query.id
  res.render("pages/aggiungiTipologia", {id_locale});
});

/**
  * @swagger
  * 
  * 
  * /modificaTipologia:
  *   get:
  *     tags:  
  *     - "Locale"
  *     - "Gestore"
  *     summary: Reindirizza alla pagina modificaTipologia e passa l'id_tipologia ottenuto tramite url.
  *     parameters:
  *     - in: "query"
  *       name: "id"
  *       description: "Indica l'id della tipologia di cui vogliamo modificare le informazioni"
  *     responses: 
  *         "200":
  *           description: "Pagina reindirizzata correttamente"
  *         "400":
  *           description: "Errore nell'esecuzione dell'API" 
*/

app.get("/modificaTipologia", async function (req, res) {
    //console.log(req.query.id);
    connection.query(
        `SELECT * FROM tipologia WHERE id_tipologia = "${req.query.id}"`,
        (err, tipologia) => {
            if (err) throw err;

            res.render("pages/modificaTipologia", { tipologia });
        }
    );
});

/**
* @swagger 
* 
* /eliminaTipologia:
*   delete:
*     tags:  
*     - "Locale"  
*     - "Gestore"
*     summary: Permette all'utente di tipo Locale di eliminare una determinata tipologia.
*     parameters:
*     - in: "query" 
*       name: "idT"
*       description: "Indica l'id della tipologia che si vuole eliminare"
*       required: true
*     - in: "query" 
*       name: "idL"
*       description: "Indica l'id del locale al quale la tipologia appartiene"
*       required: true
*     - in: "session" 
*       name: "isTipoGestore"
*       description: "Indica se l'utente è un gestore o no"
*       required: true
*     responses: 
*         "200":
*           description: "Tipologia eliminata correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.delete("/eliminaTipologia", (req, res) => {
    //console.log("ID DA ELIMINARE " + req.query.idT);
    if(req.session.isTipoGestore == 1){
      connection.query(
          `DELETE FROM tipologia WHERE id_tipologia = "${req.query.idT}"`,
          (err, tipologia) => {
              if (err) throw err;
              connection.query(
                  `SELECT * FROM tipologia WHERE id_locale = "${req.query.idL}"`,
                  (err, tipologie) => {
                      if (err) throw err;

                      //console.log("Data received from Db:");
                      //console.log(tipologie);
                      res.render("pages/tipologie", { tipologie });
                  }
              );
          }
      );
    }else{
      connection.query(
          `SELECT isGestore FROM tipologia WHERE id_tipologia = "${req.query.idT}"`,
          (err, risposta) => {
              if (err) throw err;
              //console.log(risposta[0].isGestore)
              if(risposta[0].isGestore == 0){
                connection.query(
                    `DELETE FROM tipologia WHERE id_tipologia = "${req.query.idT}"`,
                    (err, tipologia) => {
                        if (err) throw err;
                        connection.query(
                            `SELECT * FROM tipologia WHERE id_locale = "${req.query.idL}"`,
                            (err, tipologie) => {
                                if (err) throw err;

                                //console.log("Data received from Db:");
                                //console.log(tipologie);
                                res.render("pages/tipologie", { tipologie });
                            }
                        );
                    }
                );
              }else{
                //console.log("Solo il gestore può eliminare questa tipologia")
                connection.query(
                    `SELECT * FROM tipologia WHERE id_locale = "${req.query.idL}"`,
                    (err, tipologie) => {
                        if (err) throw err;

                        //console.log("Data received from Db:");
                        //console.log(tipologie);
                        res.render("pages/tipologie", { tipologie });
                    }
                );
              }
          }
      );
    }
});

app.get("/aggiungiServizi", (req, res) => {
    //console.log(req.session);
    id_tipologia = req.query.id;
    res.render("pages/aggiungiServizio", { id_tipologia });
});

/**
* @swagger 
* 
* /elencoServizi:
*   get:
*     tags:  
*     - "Locale"  
*     - "Gestore"
*     summary: Permette di visualizzare l'elenco dei servizi associati ad una tipologia.
*     parameters:
*     - in: "query" 
*       name: "id"
*       description: "Indica l'id della tipologia di cui vogliamo visualizzare i servizi"
*       required: true
*     responses: 
*         "200":
*           description: "Servizio visualizzati correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.get("/elencoServizi", async function (req, res) {
    //console.log(req.query.id);
    connection.query(
        `SELECT * FROM servizi WHERE id_tipologia = "${req.query.id}"`,
        (err, servizi) => {
            if (err) throw err;

            res.render("pages/servizi", { servizi });
        }
    );
});

/**
* @swagger 
* 
* /modificaServizio:
*   get:
*     tags:  
*     - "Locale"
*     - "Gestore"
*     summary: Reindirizza alla pagina modificaServizio e passa l'id del servizio ottenuto tramite url.
*     parameters:
*     - in: "query" 
*       name: "id"
*       description: "Indica l'id del servizio che vogliamo andare a modificare"
*       required: true
*     responses: 
*         "200":
*           description: "Pagina reindirizzata correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API"
*/

app.get("/modificaServizio", async function (req, res) {
    connection.query(
        `SELECT * FROM servizi WHERE id_servizi = "${req.query.id}"`,
        (err, servizio) => {
            if (err) throw err;

            res.render("pages/modificaServizio", { servizio });
        }
    );
});

/**
* @swagger 
* 
* /locali:
*   get:
*     tags:  
*     - "Gestore"  
*     summary: Reindirizza alla pagina elencoLocali e passa le informazioni dei locali di proprietà del gestore.
*     parameters:
*     - in: "session" 
*       name: "id_utente"
*       description: "Indica l'id del gestore"
*       required: true
*     responses: 
*         "200":
*           description: "Pagina reindirizzata correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API"
*/

app.get("/locali", async function (req, res) {
  connection.query(
      `SELECT * FROM utente_locale WHERE id_gestore = "${req.session.id_utente}"`,
      (err, locali) => {
          if (err) throw err;

          //console.log("Data received from Db:");
          //console.log(locali);
          res.render("pages/elencoLocali", { locali });
      }
  );
});

/**
* @swagger 
* 
* /modificaLocale:
*   get:
*     tags:  
*     - "Gestore"  
*     summary: Reindirizza alla pagina modificaLocale e passa le informazioni del locale con l'id uguale a quello passato tramite url.
*     parameters:
*     - in: "query" 
*       name: "id"
*       description: "Indica l'id del locale che vogliamo modificare"
*       required: true
*     responses: 
*         "200":
*           description: "Pagina reindirizzata correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API"
*/

app.get("/modificaLocale", async function (req, res) {
  //console.log(req.query.id);
  connection.query(
      `SELECT * FROM utente_locale WHERE id_locale = "${req.query.id}"`,
      (err, locale) => {
          if (err) throw err;

          res.render("pages/modificaLocale", { locale });
      }
  );
});

/**
* @swagger 
* 
* /eliminaServizio:
*   delete:
*     tags:  
*     - "Locale"  
*     - "Gestore"  
*     summary: Permette l'eliminazione di un servizio.
*     parameters:
*     - in: "query" 
*       name: "idS"
*       description: "Indica l'id del servizio che vogliamo eliminare"
*       required: true
*     - in: "query" 
*       name: "idT"
*       description: "Indica l'id della tipologia associata al servizio"
*       required: true
*     responses: 
*         "200":
*           description: "Servizio eliminato correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.delete("/eliminaServizio", (req, res) => {
    connection.query(
        `DELETE FROM servizi WHERE id_servizi = "${req.query.idS}"`,
        (err, tipologia) => {
            if (err) throw err;
            connection.query(
                `SELECT * FROM servizi WHERE id_tipologia = "${req.query.idT}"`,
                (err, servizi) => {
                    if (err) throw err;

                    // console.log("Data received from Db:");
                    // console.log(servizi);
                    res.render("pages/servizi", { servizi });
                }
            );
        }
    );
});

/**
* @swagger 
* 
* /eliminaLocale:
*   delete:
*     tags:  
*     - "Gestore"  
*     summary: Permette al gestore di eliminare un locale.
*     parameters:
*     - in: "query" 
*       name: "id"
*       description: "Indica l'id del locale che vogliamo eliminare"
*       required: true
*     - in: "session" 
*       name: "id_utente"
*       description: "Indica l'id del gestore"
*       required: true
*     responses: 
*         "200":
*           description: "Locale eliminato correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.delete("/eliminaLocale", (req, res) => {
    //console.log(req.session);
    //console.log("ID DA ELIMINARE " + req.query.id);
    connection.query(
        `DELETE FROM utente_locale WHERE id_locale = "${req.query.id}"`,
        (err, locale) => {
            if (err) throw err;
            connection.query(
                `SELECT * FROM utente_locale WHERE id_gestore = "${req.session.id_utente}"`,
                (err, locali) => {
                    if (err) throw err;

                    //console.log("Data received from Db:");
                    //console.log(locali);
                    res.render("pages/elencoLocali", { locali });
                }
            );
        }
    );
});


/**
* @swagger 
* 
* /modificaLocale/aggiorna:
*   post:
*     tags:  
*     - "Gestore"  
*     summary: Permette l'update dei dati modificati di un locale.
*     parameters:
*     - in: "body"
*       name: "body"
*       required: true
*       schema:
*         type: object
*         required:
*           - nome
*           - email
*           - numero_telefono
*           - id_locale
*         properties:
*           nome:
*             type: string
*           email:
*             type: string
*           numero_telefono:
*             type: string
*           id_locale:
*             type: string
*     - in: "session" 
*       name: "id_utente"
*       description: "Indica l'id del gestore"
*       required: true
*     responses: 
*         "200":
*           description: "Locale aggiornato correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.post("/modificaLocale/aggiorna", urlencodedParser, (req, res) => {
    //console.log("Aggiorna informazione locale");
    //console.log(req.body);
    connection.query(
        `UPDATE utente_locale SET nome_locale = "${req.body["nome"]}", email = "${req.body["email"]}", numero_telefono = "${req.body["numero_telefono"]}" WHERE id_locale = "${req.body["id_locale"]}"`,
        (err, res) => {
            if (err) throw err;
            //console.log("Last insert ID:", res.insertId);
        }
    );
    connection.query(
        `SELECT * FROM utente_locale WHERE id_gestore = "${req.session.id_utente}"`,
        (err, locali) => {
            if (err) throw err;

            //console.log("Data received from Db:");
            //console.log(locali);
            res.render("pages/elencoLocali", { locali });
        }
    );
});

/**
* @swagger 
* 
* /modificaServizio/aggiorna:
*   post:
*     tags:  
*     - "Locale"  
*     - "Gestore"  
*     summary: Permette l'update dei dati modificati di un servizio.
*     parameters:
*     - in: "body"
*       name: "body"
*       required: true
*       schema:
*         type: object
*         required:
*           - tipoServizio
*           - prezzoServizio
*           - id_servizi
*         properties:
*           tipoServizio:
*             type: string
*           prezzoServizio:
*             type: integer
*           id_servizi:
*             type: integer
*     responses: 
*         "200":
*           description: "Servizio aggiornato correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.post("/modificaServizio/aggiorna", urlencodedParser, (req, res) => {
    //console.log("Aggiorna informazione servizio");
    //console.log(req.body);
    connection.query(
        `UPDATE servizi SET tipo_servizio = "${req.body["tipoServizio"]}", prezzo_servizio = "${req.body["prezzoServizio"]}"
        WHERE id_servizi = "${req.body["id_servizi"]}"`,
        (err, res) => {
            if (err) throw err;
            //console.log("Last insert ID:", res.insertId);
        }
    );
    connection.query(
        `SELECT id_tipologia FROM servizi WHERE id_servizi = "${req.body["id_servizi"]}"`,
        (err, tipologia) => {
            if (err) throw err;

            //console.log("Data received from Db:");
            //console.log(tipologia[0].id_tipologia);
            connection.query(
                `SELECT * FROM servizi WHERE id_tipologia = "${tipologia[0].id_tipologia}"`,
                (err, servizi) => {
                    if (err) throw err;

                    //console.log("Data received from Db:");
                    //console.log(servizi);
                    res.render("pages/servizi", { servizi });
                }
            );
        }
    );
});

/**
* @swagger 
* 
* /aggiungiServizio:
*   post:
*     tags:  
*     - "Locale"  
*     - "Gestore"  
*     summary: Permette l'aggiunta di un servizio.
*     parameters:
*     - in: "body"
*       name: "body"
*       required: true
*       schema:
*         type: object
*         required:
*           - tipoServizio
*           - prezzoServizio
*           - id_tipologia
*         properties:
*           tipoServizio:
*             description: Indica il tipo di servizio
*             type: string
*           prezzoServizio:
*             description: Indica il prezzo del servizio
*             type: integer
*           id_tipologia:
*             description: Indica l'id della tipologia associata al servizio
*             type: integer
*     responses: 
*         "200":
*           description: "Servizio aggiunto correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.post("/aggiungiServizio", urlencodedParser, (req, res) => {
  //console.log(req.body)
  var newServizio = {
      id_tipologia: req.body["id_tipologia"],
      tipo_servizio: req.body["tipoServizio"],
      prezzo_servizio: req.body["prezzoServizio"],
  };

  connection.query("INSERT INTO servizi SET ?", newServizio, (err, rows) => {
      if (err) throw err;
      //console.log("Last insert ID:", rows.insertId);

      connection.query(
          `SELECT * FROM servizi WHERE id_tipologia = "${req.body["id_tipologia"]}"`,
          (err, servizi) => {
              if (err) throw err;

              //console.log("Data received from Db:");
              //console.log(servizi);
              res.render("pages/servizi", { servizi });
          }
      );
  });
});

/**
* @swagger 
* 
* /modificaTipologia/aggiorna:
*   post:
*     tags:  
*     - "Locale"  
*     - "Gestore"  
*     summary: Permette l'update dei dati modificati di un servizio.
*     parameters:
*     - in: "body"
*       name: "body"
*       required: true
*       schema:
*         type: object
*         required:
*           - nome
*           - quantita
*           - costo
*           - nMaxPersone
*           - zona_aperta
*           - id_tipologia
*           - id_locale
*         properties:
*           nome:
*             description: Indica il nome della tipologia
*             type: string
*           quantita:
*             description: Indica la quantità
*             type: integer
*           costo:
*             description: Indica il costo
*             type: integer
*           nMaxPersone:
*             description: Indica il numero massimo di persone
*             type: integer
*           zona_aperta:
*             description: Indica se è una zona aperta
*             type: integer
*           id_tipologia:
*             description: Indica l'id della tipologia che vogliamo aggiornare
*             type: integer
*           id_locale:
*             description: Indica l'id del locale associato alla tipologia
*             type: integer
*     responses: 
*         "200":
*           description: "Tipologia aggiornato correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.post("/modificaTipologia/aggiorna", urlencodedParser, (req, res) => {
    connection.query(
        `UPDATE tipologia SET nome_tipologia = "${req.body["nome"]}", quantita = "${req.body["quantita"]}",
        costo = "${req.body["costo"]}", numero_massimo_persone = "${req.body["nMaxPersone"]}",
        zona_aperta = "${req.body["zona_aperta"]}"
        WHERE id_tipologia = "${req.body["id_tipologia"]}"`,
        (err, res) => {
            if (err) throw err;
            //console.log("Last insert ID:", res.insertId);
        }
    );
    connection.query(
        `SELECT * FROM tipologia WHERE id_locale = "${req.body["id_locale"]}"`,
        (err, tipologie) => {
            if (err) throw err;

            //console.log("Data received from Db:");
            //console.log(tipologie);
            res.render("pages/tipologie", { tipologie });
        }
    );
});

/**
* @swagger 
* 
* /gestioneAccount/aggiorna:
*   post:
*     tags:  
*     - "Cliente"  
*     - "Gestore"  
*     summary: Permette l'update dei dati del proprio account.
*     parameters:
*     - in: "body"
*       name: "body"
*       required: true
*       schema:
*         type: object
*         required:
*           - nome
*           - cognome
*           - data_di_nascita
*           - email
*           - numero_telefono
*         properties:
*           nome:
*             description: Indica il nome dell'utente
*             type: string
*           cognome:
*             description: Indica il cognome
*             type: string
*           data_di_nascita:
*             description: Indica la data di nascita
*             type: string
*             pattern: '^\y{4}-\m{2}-\d{2}$'
*           email:
*             description: Indica l'indirizzo email
*             type: string
*           numero_telefono:
*             description: Indica il numero di telefono
*             type: string
*     - in: "session" 
*       name: "id_utente"
*       description: "Indica l'id dell'utente di cui vogliamo modificare le informazioni"
*       required: true
*     responses: 
*         "200":
*           description: "Account aggiornato correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.post("/gestioneAccount/aggiorna", urlencodedParser, (req, res) => {
    connection.query(
        `UPDATE utente SET nome = "${req.body["nome"]}", cognome = "${req.body["cognome"]}", data_di_nascita = "${req.body["dataNascita"]}", email = "${req.body["email"]}",  numero_telefono = "${req.body["telefono"]}" WHERE id_utente = "${req.session.id_utente}"`,
        (err, res) => {
            if (err) throw err;
            //console.log("Last insert ID:", res.insertId);
        }
    );
});

/**
* @swagger 
* 
* /gestioneAccountLocale/aggiorna:
*   post:
*     tags:  
*     - "Locale"  
*     summary: Permette l'update dei dati del proprio account.
*     parameters:
*     - in: "body"
*       name: "body"
*       required: true
*       schema:
*         type: object
*         required:
*           - nome_locale
*           - email
*           - numero_telefono
*         properties:
*           nome_locale:
*             description: Indica il nome del locale
*             type: string
*           email:
*             description: Indica l'indirizzo email
*             type: string
*           numero_telefono:
*             description: Indica il numero di telefono
*             type: string
*     - in: "session" 
*       name: "id_utente"
*       description: "Indica l'id del locale di cui vogliamo modificare le informazioni"
*       required: true
*       responses: 
*         "200":
*           description: "Informazioni Account aggiornato correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.post("/gestioneAccountLocale/aggiorna", urlencodedParser, (req, res) => {
    //console.log("Aggiorna informazione account");
    //console.log(req.body);
    connection.query(
        `UPDATE utente_locale SET nome_locale = "${req.body["nome"]}", email = "${req.body["email"]}", numero_telefono = "${req.body["telefono"]}" WHERE id_locale = "${req.session.id_utente}"`,
        (err, res) => {
            if (err) throw err;
            //console.log("Last insert ID:", res.insertId);
        }
    );
});

/**
* @swagger 
* 
* /api/registrazioneLocale:
*   post:
*     tags:  
*     - "Cliente"  
*     summary: Permette la registrazione di un locale da parte dell'utente.
*     parameters:
*     - in: "body"
*       name: "body"
*       required: true
*       schema:
*         type: object
*         required:
*           - nome_locale
*           - email
*           - password
*           - numero_telefono
*           - citta
*           - indirizzo
*         properties:
*           nome_locale:
*             description: Indica il nome del locale
*             type: string
*           email:
*             description: Indica l'indirizzo email
*             type: string
*           password:
*             description: Indica la password del locale
*             type: string
*           numero_telefono:
*             description: Indica il numero di telefono
*             type: string
*           citta:
*             description: Indica la città dove è situato il locale
*             type: string
*           indirizzo:
*             description: Indica l'indirizzo del locale
*             type: string
*     - in: "session" 
*       name: "id_utente"
*       description: "Indica l'id dell'utente gestore che vuole registrare il locale"
*       required: true
*       responses: 
*         "200":
*           description: "Locale registrato correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.post("/api/registrazioneLocale", urlencodedParser, (req, res) => {
    // SE SI TROVA UN MODO PER NON METTERE TUTTO DENTRO UN ORRIBILE FUNZIONE TANTO MEGLIO MA ATM NON SAPREI COME FARLO
    console.log(req.session);

    var newLocale = {
        id_gestore: req.session["id_utente"],
        nome_locale: req.body["nome"],
        email: req.body["email"],
        password: req.body["password"],
        numero_telefono: req.body["telefono"],
        citta: req.body["citta"],
        indirizzo_locale: req.body["indirizzo"],
    };

    connection.query(
        "INSERT INTO utente_locale SET ?",
        newLocale,
        (err, res) => {
            if (err) throw err;
            //console.log("Last insert ID:", res.insertId);
        }
    );

    if (req.session["isTipoGestore"] == 0) {
        //console.log("Da non gestore a gestore");
        connection.query(
            `UPDATE utente SET isTipoGestore = 1 WHERE id_utente = "${req.session.id_utente}"`,
            (err, res) => {
                if (err) throw err;
                //console.log("Last insert ID:", res.insertId);
            }
        );
    }
    res.redirect("/home")
});

/**
* @swagger 
* 
* /api/registrazioneUtente:
*   post:
*     tags:  
*     - "Utente non registrato"  
*     summary: Permette all'utente di registrarsi alla piattaforma.
*     parameters:
*     - in: "body"
*       name: "body"
*       required: true
*       schema:
*         type: object
*         required:
*           - nome
*           - cognome
*           - data_di_nascita
*           - email
*           - telefono
*           - password
*         properties:
*           nome:
*             description: Indica il nome dell'utente
*             type: string
*           cognome:
*             description: Indica il cognome dell'utente
*             type: string
*           dataNascita:
*             description: Indica la data di nascita
*             type: string
*             format: date
*           email:
*             description: Indica l'indirizzo email
*             type: string
*           telefono:
*             description: Indica il numero di telefono
*             type: string
*           password:
*             description: Indica la password del locale
*             type: string
*     responses: 
*         "200":
*           description: "Utente registrato correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.post("/api/registrazioneUtente", urlencodedParser, (req, res) => {
    console.log(req.body)
    let newUser = {
        nome: req.body["nome"],
        cognome: req.body["cognome"],
        data_di_nascita: req.body["dataNascita"],
        email: req.body["email"],
        numero_telefono: req.body["telefono"],
        password: req.body["password"],
    };
    connection.query("INSERT INTO utente SET ?", newUser, (err, risposta) => {
        if (err) throw err;
        res.render("pages/login");
    });
});

/**
* @swagger 
* 
* /api/utenti/login:
*   post:
*     tags:  
*     - "Utente non registrato"  
*     summary: Permette all'utente di effettuare l'accesso.
*     parameters:
*     - in: "body"
*       name: "body"
*       required: true
*       schema:
*         type: object
*         required:
*           - email
*           - password
*         properties:
*           email:
*             description: Indica l'indirizzo email dell'utente
*             type: string
*           password:
*             description: Indica la password
*             type: string
*     responses: 
*         "200":
*           description: "Accesso eseguito correttamente correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.post("/api/utenti/login", urlencodedParser, (req, res) => {
    connection.query(
        `SELECT * FROM utente WHERE email = "${req.body["email"]}" AND password = "${req.body["password"]}"`,
        (err, rows) => {
            // if (err) throw err;

            //console.log("Data received from Db:");
            //console.log(rows);

            if (rows.length > 0) {
                //console.log("QUESTO UTENTE È UN CLIENTE/GESTORE");
                req.session.login = true;
                req.session.id_utente = rows[0]["id_utente"];
                req.session.username = req.body["email"];
                req.session.isLocale = 0;
                req.session.isTipoGestore = rows[0]["isTipoGestore"];
                app.locals.isGestoreGlobale = rows[0]["isTipoGestore"];
                //console.log(req.session);
                //res.send("Logged in");
                res.redirect("/homepage");
            } else {
                connection.query(
                    `SELECT * FROM utente_locale WHERE email = "${req.body["email"]}" AND password = "${req.body["password"]}"`,
                    (err, rows) => {
                        // if (err) throw err;

                        //console.log("Data received from Db:");
                        //console.log(rows);

                        if (rows.length > 0) {
                            //console.log("QUESTO UTENTE È UN LOCALE");
                            //console.log(rows[0]["id_locale"]);
                            req.session.login = true;
                            req.session.id_utente = rows[0]["id_locale"];
                            req.session.username = req.body["email"];
                            req.session.isLocale = 1;
                            req.session.isTipoGestore = 0;
                            app.locals.isGestoreGlobale = 2;
                            //console.log(req.session);
                            // res.send("Logged in");
                            res.redirect("/homepageLocale");
                        } else {
                            // res.send("Incorrect email or password");
                            console.log("Incorrect email or password");
                        }
                    }
                );
            }
            // res.end();
        }
    );
});

/**
* @swagger 
* 
* /aggiungiTipologia:
*   post:
*     tags:  
*     - "Locale"  
*     - "Gestore"  
*     summary: Permette l'aggiunta di una tipologia.
*     parameters:
*     - in: "body"
*       name: "body"
*       required: true
*       schema:
*         type: object
*         required:
*           - nome_tipologia
*           - quantita
*           - costo
*           - nMaxPersone
*           - zona_aperta
*         properties:
*           nome_tipologia:
*             description: Indica il nome della tipologia
*             type: string
*           quantita:
*             description: Indica la quantita
*             type: integer
*           costo:
*             description: Indica il costo
*             type: integer
*           nMaxPersone:
*             description: Indica il numero massimo di persone
*             type: integer
*           zona_aperta:
*             description: Indica la presenza o meno di una zona aperta
*             type: integer
*           id_locale:
*             description: Indica l'id del locale associato alla tipologia
*             type: integer
*     - in: "session" 
*       name: "id_utente"
*       description: "Indica l'id dell'utente"
*     - in: "session" 
*       name: "isTipoGestore"
*       description: "Indica se l'utente è di tipo gestore o no"
*       required: true
*       
*     responses: 
*         "200":
*           description: "Servizio aggiunto correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/

app.post("/aggiungiTipologia", urlencodedParser, (req, res) => {
    if(req.session.isLocale == 1){
      var newLocale = {
          id_locale: req.session["id_utente"],
          nome_tipologia: req.body["nome"],
          quantita: req.body["quantita"],
          costo: req.body["costo"],
          numero_massimo_persone: req.body["nMaxPersone"],
          zona_aperta: req.body["zona_aperta"],
          isGestore: 0,
      };
    }else{
      var newLocale = {
          id_locale: req.body["id_locale"],
          nome_tipologia: req.body["nome"],
          quantita: req.body["quantita"],
          costo: req.body["costo"],
          numero_massimo_persone: req.body["nMaxPersone"],
          zona_aperta: req.body["zona_aperta"],
          isGestore: 1,
      };
    }

    connection.query("INSERT INTO tipologia SET ?", newLocale, (err, res) => {
        if (err) throw err;
        //console.log("Last insert ID:", res.insertId);
    });

    if (req.session["isTipoGestore"] == 0) {
        //console.log("Da non gestore a gestore");
        connection.query(
            `UPDATE utente SET isTipoGestore = 1 WHERE id_utente = "${req.session.id_utente}"`,
            (err, res) => {
                if (err) throw err;
                //console.log("Last insert ID:", res.insertId);
            }
        );
        connection.query(
            `SELECT * FROM tipologia WHERE id_locale = "${req.session.id_utente}"`,
            (err, tipologie) => {
                if (err) throw err;

                //console.log("Data received from Db:");
                //console.log(tipologie);
                res.render("pages/tipologie", { tipologie });
            }
        );
    }else{
      connection.query(
          `SELECT * FROM tipologia WHERE id_locale = "${req.body["id_locale"]}"`,
          (err, tipologie) => {
              if (err) throw err;

              //console.log("Data received from Db:");
              //console.log(tipologie);
              res.render("pages/tipologie", { tipologie });
          }
      );
    }
});

/**
* @swagger
* 
* 
* /prenotazioni:
*   get:
*     tags:  
*     - "Locale"  
*     summary: Permette all'utente di tipo Locale di visualizzare le prenotazioni dei vari clienti.
*     parameters:
*     - in: "session" 
*       name: "is_locale"
*       description: "Indica se l'account è di tipo locale o no"
*     - in: "session" 
*       name: "id_utente"
*       description: "Indica l'id dell'utente connesso"
*       required: true
*     responses: 
*         "200":
*           description: "Prenotazioni visualizzate correttamente"
*
*/


//-------------------------------------------------------------------------------------------- UTENTE LOCALE
//visualizzazione prenotazioni
//risolvere problema data
app.get('/prenotazioni', async function(req, res) { 

    var id_locale;
    if (req.session.isLocale == 1) id_locale = req.session.id_utente;
        //console.log(req.session.isLocale);
        connection.query(`SELECT p.id_prenotazione, t.nome_tipologia, uc.cognome, p.data_prenotazione FROM prenotazione_tipologia_locale AS p, utente_locale AS ul, utente AS uc, tipologia AS t WHERE  ul.id_locale= "${id_locale}"AND p.id_locale = ul.id_locale AND p.id_cliente = uc.id_utente AND t.id_tipologia = p.id_tipologia;`,(err,prenotazioni)=> {
            if (err) { console.log(res.status(400)); throw err;}
            else {
                
                prenotazioni.forEach(element =>{
                    element.data_prenotazione=formatDate(element.data_prenotazione);
                });


                res.status(200);    
               /* console.log("Data received from Db:");
                console.log(prenotazioni);*/
                res.render("pages/elencoPrenotazioniLocale", { prenotazioni });
            }
        });
})



/**
* @swagger
* 
* 
* /prenotazioni/prenotazione_spec/{id_prenotazione}:
*   get:
*     tags:  
*     - "Locale"  
*     summary: Permette all'utente di tipo Locale di visualizzare le informazioni di una determinata prenotazione di un cliente.
*     parameters:
*     - in: "path" 
*       name: "id_prenotazione"
*       description: "Indica l'id della prenotazione che si vuole visualizzare"
*       required: true
*     responses: 
*         "200":
*           description: "Prenotazione visualizzata correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*
*/

//visualizzazione prenotazioni specifiche
app.get('/prenotazioni/prenotazione_spec/:id_prenotazione', async function (req, res) { 

    
    var id_prenotazione = req.params.id_prenotazione;
    console.log(id_prenotazione); 
    connection.query(`SELECT p.id_prenotazione, t.nome_tipologia, p.data_prenotazione, t.quantita, t.numero_massimo_persone, uc.nome, uc.cognome, uc.numero_telefono, uc.email  FROM prenotazione_tipologia_locale AS p, utente AS uc, tipologia AS t WHERE p.id_prenotazione = "${id_prenotazione}" AND t.id_tipologia = p.id_tipologia AND p.id_cliente = uc.id_utente;`,(err,prenotazione)=> {
        if (err) { res.status(400); throw err;}
        else {
            prenotazione[0]["data_prenotazione"] = formatDate(prenotazione[0]["data_prenotazione"] );
            
            res.status(200);
           /* console.log("Data received from Db:");
            console.log(prenotazione);*/
            res.render("pages/elencoPrenotazioneSpec", { prenotazione });
            
        }
    });
});

/**
* @swagger 
* 
* /prenotazioni/prenotazione_spec/annulla/:
*   delete:
*     tags:  
*     - "Locale"  
*     summary: Permette all'utente di tipo Locale di eliminare una determinata prenotazione di un cliente.
*     parameters:
*     - in: "query" 
*       name: "idP"
*       description: "Indica l'id della prenotazione che si vuole annullare"
*       required: true
*     responses: 
*         "200":
*           description: "Prenotazione annullata correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*/
//risolvere problema data
app.delete('/prenotazioni/prenotazione_spec/annulla/', (req, res) => {
    var id_prenotazione = req.query.idP;
    //console.log("appdelete "+id_prenotazione);
 
    connection.query(`DELETE FROM prenotazione_tipologia_locale WHERE id_prenotazione = ?`,[id_prenotazione], (err,prenotazione)=> {
     if (err) { console.log(res.status(400)); throw err;}
         else {
             
            alert("Prenotazione annullata"); //tornare all'elenco locali
            res.status(200);

            connection.query(`SELECT p.id_prenotazione, t.nome_tipologia, uc.cognome, p.data_prenotazione FROM prenotazione_tipologia_locale AS p, utente_locale AS ul, utente AS uc, tipologia AS t WHERE  ul.id_locale= "${req.session.id_utente}"AND p.id_locale = ul.id_locale AND p.id_cliente = uc.id_utente AND t.id_tipologia = p.id_tipologia;`,(err,prenotazioni)=> {
                if (err) { console.log(res.status(400)); throw err;}
                else {
                    
                    prenotazioni.forEach(element =>{
                        element.data_prenotazione=formatDate(element.data_prenotazione);
                    });
    
                    res.status(200);    
                   /*console.log("Data received from Db:");
                    console.log(prenotazioni);*/
                    res.render("pages/elencoPrenotazioniLocale", { prenotazioni });
                }
            });
         }
     });   
     
 });

//-------------------------------------------------------------------------------------------- UTENTE GESTORE

/**
* @swagger
* 
* 
* /eliminaGestore:
*   delete:
*     tags:  
*     - "Gestore"  
*     summary: Permette all'utente di tipo Gestore di eliminare il proprio account.
*     parameters:
*     - in: "session" 
*       name: "isTipoGestore"
*       description: "Indica se l'utente è un gestore o no"
*       required: true
*     responses: 
*         "200":
*           description: "Account eliminato correttamente"
*         "400":
*           description: "Errore nell'esecuzione dell'API" 
*
*/
//elimina gestore
app.delete('/eliminaGestore', (req,res) => {
    //console.log("è gestore: "+req.session.isTipoGestore);

    connection.query(`DELETE FROM utente WHERE isTipoGestore = 1 AND id_utente = ?`,[req.session.id_utente], (err,cancellazione)=> {
        if (err) { console.log(res.status(400)); throw err;}
        else {
            res.render("pages/login");
            alert("Account eliminato"); //tornare al login/ricerca senza login
            res.status(200);
        }
    });   

});


//render profilo utente CLIENTE/GESTORE  (api di supporto)
app.get("/profiloUtente", function (req, res) {
    res.render("pages/profiloUtente");
});

app.listen(3535);
console.log("Server is listening on port 3535");

module.exports = app;
