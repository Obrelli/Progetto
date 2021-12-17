const express = require("express");
var bodyParser = require("body-parser");
const app = express();
var session = require("express-session");
const alert = require("alert");
//----------------------------------------------------
//api documentation
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "API D5 Progetto gruppo G31",
            description: "API documentation",
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
    database: "book",
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

  
//ricerca locali -> sistemare con nuova tabella del DB
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
                                            connection.query("drop view bho, id;");
                                            res.render("pages/locali", {città: req.query.città, np:req.query.np, n: n, r:r, rr:rr, idloc:rrr, rnp});     
                                        }else{
                                            console.log("error");
                                        }   
                                    })
                                }) 
                                /*}else{
                                    console.log("non va un cazzo");
                                }
                            })*/
                        }else{
                            console.log("whyyyyyy???")
                        }                     
                    })
                })   
            })       
        }else{
            
            
        } 
    })
    
})

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
                                    connection.query("drop view bho, id;");
                                    res.render('pages/infolocale', {rows,rr,r});
                                }else{
                                    console.log("errore!");
                                }
                            })
                        }else{
                            console.log("errore");
                        }
                    })
                })
            })
        }
    })
})

//prenota
app.get("/pren", function(req,res){
    connection.query('CREATE OR REPLACE VIEW id(id_locale, nome_locale, descrizione) AS SELECT DISTINCT utente_locale.id_locale, nome_locale, descrizione FROM tipologia,utente_locale WHERE tipologia.id_locale= utente_locale.id_locale',(err,rows)=>{
        if(!err){
            connection.query('SELECT DISTINCT * FROM id WHERE id_locale="'+req.query.id_locale+'"' , (err, rows)=>{
                connection.query('CREATE OR REPLACE VIEW bho(id_locale, id_tipologia, nome_tipologia, tipo_servizio, quantita, id_servizi, np, costo) AS SELECT tipologia.id_locale, tipologia.id_tipologia, tipologia.nome_tipologia, tipo_servizio, quantita, id_servizi, numero_massimo_persone,tipologia.costo FROM tipologia,servizi WHERE (tipologia.id_locale IN (SELECT DISTINCT id_locale FROM id) )', (err,r)=>{
                    connection.query('SELECT DISTINCT id_tipologia, nome_tipologia, costo FROM bho WHERE id_locale="'+req.query.id_locale+'"', (err,rr)=>{
                        if(!err){
                                if(!err){
                                    connection.query("drop view bho, id;");
                                    //console.log(rr);
                                    res.render("pages/prenota", {id_locale: req.query.id_locale, rr, rows});
                                }else{
                                    console.log("errore!");
                                }
                        }else{
                            console.log("errore");
                        }
                    })
                })
            })
        }
    })
   
})


//INIZIO
app.post("/prenota", urlencodedParser, (req,res)=>{
    const nome_tipologia = req.body.tip.split(' ');
    if(req.session.id_utente!=undefined){
    connection.query("select id_tipologia from tipologia where nome_tipologia='"+nome_tipologia[0]+"' && id_locale='"+req.body.id_locale+"'", (err,rows)=>{
        if(!err){
            connection.query("INSERT INTO prenotazione_tipologia_locale (id_locale, id_cliente, id_tipologia, data_prenotazione, quantita) VALUES ('"+req.body.id_locale+"','"+req.session.id_utente+"','"+ rows[0].id_tipologia+"','"+req.body.data+"','"+req.body.quantita+"')", (err,rows)=>{
                if(!err){
                    res.redirect("/elencopre");
                }else{
                    console.log("DIo bestia");
                }
            })
        }else{
            console.log("errore");
        }
    })
}else{
    res.redirect("/login");
}
})

app.get("/elencopre", (req,res)=>{
    console.log("ollllllllll");
    connection.query("CREATE OR REPLACE VIEW id(id_locale, id_cliente, id_prenotazione,id_tipologia,data_prenotazione,quantita) AS SELECT id_locale, id_cliente, id_prenotazione,id_tipologia,data_prenotazione,quantita FROM prenotazione_tipologia_locale WHERE id_cliente='"+req.session.id_utente+"'", (err,PREN)=>{
     
        if(!err){
            connection.query("SELECT * FROM id WHERE id_cliente='"+req.session.id_utente+"'", (err,PREN)=>{  
            console.log(req.session.id_utente);
            if(req.session.id_utente!=undefined){
            connection.query("SELECT id.id_locale, id_cliente, id_prenotazione,id.id_tipologia,data_prenotazione,id.quantita, nome_locale, nome_tipologia, costo FROM id,utente_locale,tipologia WHERE id.id_cliente='"+req.session.id_utente+"' && id.id_locale=utente_locale.id_locale && id.id_tipologia = tipologia.id_tipologia;", (err,UTLOC)=>{
                console.log(PREN);
                if(!err){       
                    UTLOC.forEach(r =>{
                        r.data_prenotazione=formatDate(r.data_prenotazione);
                    })
                        res.render("pages/elencoprenotazioni", {PREN,UTLOC, utente: req.session.id_utente});
                    }else{
                        console.log("elenco prenotazioni- query error");
                    }
                })
        }else{
            res.redirect("/login");
        }
    })
        }else{
            console.log("hmmm");
        }
    })
})

app.get("/infopren", function (req,res){
    connection.query("CREATE OR REPLACE VIEW id(id_locale, id_cliente, id_prenotazione,id_tipologia,data_prenotazione,quantita) AS SELECT id_locale, id_cliente, id_prenotazione,id_tipologia,data_prenotazione,quantita FROM prenotazione_tipologia_locale WHERE id_cliente='"+req.query.utente+"' && id_prenotazione='"+req.query.id+"'", (err,PREN)=>{
        if(!err){
            connection.query("SELECT id.id_locale, id_cliente, id_prenotazione,id.id_tipologia,data_prenotazione,id.quantita, nome_locale, nome_tipologia, costo, email, numero_telefono, citta, indirizzo_locale FROM id,utente_locale,tipologia WHERE id.id_cliente='"+req.query.utente+"' && id_prenotazione='"+req.query.id+"' && id.id_locale=utente_locale.id_locale && id.id_tipologia = tipologia.id_tipologia;", (err,UTLOC)=>{
                //console.log("info");
                //console.log(UTLOC);
                UTLOC[0].data_prenotazione=formatDate(UTLOC[0].data_prenotazione);
                res.render("pages/infoprenotazione", {UTLOC, utente:  req.query.utente});
            });
        }
    })
})


app.delete("/annullapren" , (req,res)=>{
    console.log("bho");
    /*connection.query("DELETE FROM prenotazione_tipologia_locale WHERE id_cliente='"+req.query.id_utente+"' && id_prenotazione='"+req.query.id_prenotazione+"'", (err, rows)=>{
        if(!err){
            res.redirect("/elencopre");
            //res.render("pages/locali");
        }else{
            console.log("error annulla");
        }
    })*/
    res.redirect("/elencopre");
})
//FINE

//----------------------------------------------------------
//login
app.get("/login", function (req, res) {
    res.render("pages/login");
});

// registrazione utente
app.get("/registrazioneUtente", function (req, res) {
    res.render("pages/registrazioneUtente");
});

app.get("/tipologie", async function (req, res) {
  console.log(req.session)
    connection.query(
        `SELECT * FROM tipologia WHERE id_locale = "${req.session.id_utente}"`,
        (err, tipologie) => {
            if (err) throw err;

            console.log("Data received from Db:");
            console.log(tipologie);
            res.render("pages/tipologie", { tipologie });
        }
    );
});

app.get("/registrazioneLocale", async function (req, res) {
    res.render("pages/registrazioneLocale");
});

//---------------------------------------------
//sezione Homepage dei vari utenti
app.get("/home", async function (req, res){
    if(req.session.isLocale == 0){
      isGestore = req.session.isTipoGestore;
      res.render("pages/homepage", { isGestore });
    }else{
      res.render("pages/homepageLocale");
    }
  })
  
  app.get("/homepage", async function (req, res) {
      isGestore = req.session.isTipoGestore;
      res.render("pages/homepage", {isGestore});
  });


app.get("/homepageLocale", async function (req, res) {
    res.render("pages/homepageLocale");
});
//---------------------------------------------

app.get("/gestioneAccount", async function (req, res) {
    // Find all employees
    console.log("ID UTENTE: " + req.session.id_utente);
    if (req.session.isLocale == 0) {
        console.log("QUESTO UTENTE È UN CLIENTE/GESTORE");
        connection.query(
            `SELECT * FROM utente WHERE id_utente = "${req.session.id_utente}"`,
            (err, utente) => {
                if (err) throw err;

                console.log("Data received from Db:");
                console.log(utente);
                // utente[0]["data_di_nascita"] = new Date();
                // utente[0]["data_di_nascita"].toISOString().split('T')[0];
                utente[0]["data_di_nascita"] = formatDate(
                    utente[0]["data_di_nascita"]
                );
                res.render("pages/gestioneAccount", { utente });
            }
        );
    } else {
        console.log("QUESTO UTENTE È UN LOCALE");
        connection.query(
            `SELECT * FROM utente_locale WHERE id_locale = "${req.session.id_utente}"`,
            (err, utente) => {
                if (err) throw err;

                console.log("Data received from Db:");
                console.log(utente);
                // utente[0]["data_di_nascita"] = new Date();
                // utente[0]["data_di_nascita"].toISOString().split('T')[0];
                utente[0]["data_di_nascita"] = formatDate(
                    utente[0]["data_di_nascita"]
                );
                res.render("pages/gestioneAccountLocale", { utente });
            }
        );
    }
});

app.get("/aggiungiTipologia", async function (req, res) {
    res.render("pages/aggiungiTipologia");
});

app.get("/modificaTipologia", async function (req, res) {
    console.log(req.query.id);
    connection.query(
        `SELECT * FROM tipologia WHERE id_tipologia = "${req.query.id}"`,
        (err, tipologia) => {
            if (err) throw err;

            console.log("Data received from Db:");
            console.log(tipologia);
            res.render("pages/modificaTipologia", { tipologia });
            // res.render("pages/gestioneAccountLocale", { utente });
        }
    );
});

app.get("/eliminaTipologia", (req, res) => {
  console.log("IMPLEMENTARE IL FATTO CHE IL LOCALE NON PUO' ELIMINARE LE TIPOLOGIE CREATE DAL GESTORE")
  console.log(req.session)
    console.log("ID DA ELIMINARE " + req.query.id);
    connection.query(
        `DELETE FROM tipologia WHERE id_tipologia = "${req.query.id}"`,
        (err, tipologia) => {
            if (err) throw err;
            connection.query(
                `SELECT * FROM tipologia WHERE id_locale = "${req.session.id_utente}"`,
                (err, tipologie) => {
                    if (err) throw err;

                    console.log("Data received from Db:");
                    console.log(tipologie);
                    res.render("pages/tipologie", { tipologie });
                }
            );
        }
    );
});

app.get("/aggiungiServizi", (req, res) => {
    console.log(req.session);
    console.log("ID DELLA TIPOLOGIA " + req.query.id);
    id_tipologia = req.query.id;
    res.render("pages/aggiungiServizio", { id_tipologia });
});

app.post("/aggiungiServizio", urlencodedParser, (req, res) => {
  var newServizio = {
      id_tipologia: req.body["id_tipologia"],
      tipo_servizio: req.body["tipoServizio"],
      prezzo_servizio: req.body["prezzoServizio"],
  };

  connection.query("INSERT INTO servizi SET ?", newServizio, (err, res) => {
      if (err) throw err;
      console.log("Last insert ID:", res.insertId);
  });
});

app.post("/modificaTipologia/aggiorna", urlencodedParser, (req, res) => {
    console.log("Aggiorna informazione tipologia");
    console.log(req.body);
    connection.query(
        `UPDATE tipologia SET nome_tipologia = "${req.body["nome"]}", quantita = "${req.body["quantita"]}",
        costo = "${req.body["costo"]}", numero_massimo_persone = "${req.body["nMaxPersone"]}",
        zona_aperta = "${req.body["zona_aperta"]}"
        WHERE id_tipologia = "${req.body["id_tipologia"]}"`,
        (err, res) => {
            if (err) throw err;
            console.log("Last insert ID:", res.insertId);
        }
    );
    connection.query(
        `SELECT * FROM tipologia WHERE id_locale = "${req.session.id_utente}"`,
        (err, tipologie) => {
            if (err) throw err;

            console.log("Data received from Db:");
            console.log(tipologie);
            res.render("pages/tipologie", { tipologie });
        }
    );
});

app.post("/gestioneAccount/aggiorna", urlencodedParser, (req, res) => {
    console.log("Aggiorna informazione account");
    console.log(req.body);
    connection.query(
        `UPDATE utente SET nome = "${req.body["nome"]}", cognome = "${req.body["cognome"]}", data_di_nascita = "${req.body["dataNascita"]}", email = "${req.body["email"]}",  numero_telefono = "${req.body["telefono"]}" WHERE id_utente = "${req.session.id_utente}"`,
        (err, res) => {
            if (err) throw err;
            console.log("Last insert ID:", res.insertId);
        }
    );
});

app.post("/gestioneAccountLocale/aggiorna", urlencodedParser, (req, res) => {
    console.log("Aggiorna informazione account");
    console.log(req.body);
    connection.query(
        `UPDATE utente_locale SET nome_locale = "${req.body["nome"]}", email = "${req.body["email"]}", numero_telefono = "${req.body["telefono"]}" WHERE id_locale = "${req.session.id_utente}"`,
        (err, res) => {
            if (err) throw err;
            console.log("Last insert ID:", res.insertId);
        }
    );
});

app.post("/api/registrazioneLocale", urlencodedParser, (req, res) => {
    // SE SI TROVA UN MODO PER NON METTERE TUTTO DENTRO UN ORRIBILE FUNZIONE TANTO MEGLIO MA ATM NON SAPREI COME FARLO
    console.log(req.session);

    var newLocale = {
        id_utente: req.session["id_utente"],
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
            console.log("Last insert ID:", res.insertId);
        }
    );

    if (req.session["isTipoGestore"] == 0) {
        console.log("Da non gestore a gestore");
        connection.query(
            `UPDATE utente SET isTipoGestore = 1 WHERE id_utente = "${req.session.id_utente}"`,
            (err, res) => {
                if (err) throw err;
                console.log("Last insert ID:", res.insertId);
            }
        );
    }
});

app.post("/api/registrazioneUtente", urlencodedParser, (req, res) => {
    // SE SI TROVA UN MODO PER NON METTERE TUTTO DENTRO UN ORRIBILE FUNZIONE TANTO MEGLIO MA ATM NON SAPREI COME FARLO
    console.log(req.session);

    let newUser = {
        nome: req.body["nome"],
        cognome: req.body["cognome"],
        data_di_nascita: req.body["dataNascita"],
        email: req.body["email"],
        numero_telefono: req.body["telefono"],
        password: req.body["password"],
    };
    connection.query("INSERT INTO utente SET ?", newUser, (err, res) => {
        if (err) throw err;

        console.log("Last insert ID:", res.insertId);
    });
});

app.post("/api/utenti/login", urlencodedParser, (req, res) => {
    console.log("Got body:", req.body);
    connection.query(
        `SELECT * FROM utente WHERE email = "${req.body["email"]}" AND password = "${req.body["password"]}"`,
        (err, rows) => {
            // if (err) throw err;
            
            console.log("Data received from Db:");
            console.log(rows);

            if (rows.length > 0) {
                console.log("QUESTO UTENTE È UN CLIENTE/GESTORE");
                req.session.login = true;
                req.session.id_utente = rows[0]["id_utente"];
                req.session.username = req.body["email"];
                req.session.isLocale = 0;
                req.session.isTipoGestore = rows[0]["isTipoGestore"];
                console.log(req.session.isTipoGestore);
                // res.send("Logged in");
                res.redirect("/homepage");
            } else {
                connection.query(
                    `SELECT * FROM utente_locale WHERE email = "${req.body["email"]}" AND password = "${req.body["password"]}"`,
                    (err, rows) => {
                        // if (err) throw err;

                        console.log("Data received from Db:");
                        console.log(rows);

                        if (rows.length > 0) {
                            console.log("QUESTO UTENTE È UN LOCALE");
                            console.log(rows[0]["id_locale"]);
                            req.session.login = true;
                            req.session.id_utente = rows[0]["id_locale"];
                            req.session.username = req.body["email"];
                            req.session.isLocale = 1;
                            req.session.isTipoGestore = 0;
                            console.log(req.session);
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

app.post("/aggiungiTipologia", urlencodedParser, (req, res) => {
    // SE SI TROVA UN MODO PER NON METTERE TUTTO DENTRO UN ORRIBILE FUNZIONE TANTO MEGLIO MA ATM NON SAPREI COME FARLO
    console.log(req.session);
    console.log(req.body);

    var newLocale = {
        id_locale: req.session["id_utente"],
        nome_tipologia: req.body["nome"],
        quantita: req.body["quantita"],
        costo: req.body["costo"],
        numero_massimo_persone: req.body["nMaxPersone"],
        zona_aperta: req.body["zona_aperta"],
        isGestore: 0,
    };
    if (req.session.isLocale == 0) {
        newLocale.isGestore = 1;
    }

    connection.query("INSERT INTO tipologia SET ?", newLocale, (err, res) => {
        if (err) throw err;
        console.log("Last insert ID:", res.insertId);
    });

    if (req.session["isTipoGestore"] == 0) {
        console.log("Da non gestore a gestore");
        connection.query(
            `UPDATE utente SET isTipoGestore = 1 WHERE id_utente = "${req.session.id_utente}"`,
            (err, res) => {
                if (err) throw err;
                console.log("Last insert ID:", res.insertId);
            }
        );
    }
    connection.query(
        `SELECT * FROM tipologia WHERE id_locale = "${req.session.id_utente}"`,
        (err, tipologie) => {
            if (err) throw err;

            console.log("Data received from Db:");
            console.log(tipologie);
            res.render("pages/tipologie", { tipologie });
        }
    );
});

app.get("/api/utenti", (req, res) => {
    connection.query(
        `SELECT * FROM utente WHERE id_utente = "${req.session.id_utente}"`,
        (err, rows) => {
            if (err) throw err;

            console.log("Data received from Db:");
            console.log(rows);
        }
    );
});

//--------------------------------------------------------------------------------------------
//visualizzazione prenotazioni
app.get('/prenotazioni', async function(req, res) { 

    var id_locale;
    if (req.session.isLocale == 1) id_locale = req.session.id_utente;
    console.log(req.session.isLocale);
    connection.query(`SELECT p.id_prenotazione, t.nome_tipologia, uc.cognome, p.data_prenotazione FROM prenotazione_tipologia_locale AS p, utente_locale AS ul, utente AS uc, tipologia AS t WHERE  ul.id_locale= "${id_locale}"AND p.id_locale = ul.id_locale AND p.id_cliente = uc.id_utente AND t.id_tipologia = p.id_tipologia;`,(err,prenotazioni)=> {
        if (err) throw err;

       /* var i=0;  //errore con accesso a cella dell'array non esistente
        while(!(prenotazioni[i]["data_prenotazione"] === undefined)) {
            console.log(formatDate(prenotazioni[i]["data_prenotazione"]));
            prenotazioni[i]["data_prenotazione"] = formatDate(prenotazioni[i]["data_prenotazione"] );
            
            i++;
            }*/
        console.log("Data received from Db:");
        console.log(prenotazioni);
        res.render("pages/elencoPrenotazioniLocale", { prenotazioni });
    });
})

app.get('/prenotazioni/prenotazione_spec/:id_prenotazione', async function (req, res) { 

 //visualizzazione prenotazioni specifiche   
    var id_prenotazione = req.params.id_prenotazione;
    console.log(id_prenotazione); 
    connection.query(`SELECT p.id_prenotazione, t.nome_tipologia, p.data_prenotazione, t.quantita, t.numero_massimo_persone, uc.nome, uc.cognome, uc.numero_telefono, uc.email  FROM prenotazione_tipologia_locale AS p, utente AS uc, tipologia AS t WHERE p.id_prenotazione = "${id_prenotazione}" AND t.id_tipologia = p.id_tipologia AND p.id_cliente = uc.id_utente;`,(err,prenotazione)=> {
        if (err) throw err;

    prenotazione[0]["data_prenotazione"] = formatDate(prenotazione[0]["data_prenotazione"] );

    console.log("Data received from Db:");
    console.log(prenotazione);
    res.render("pages/elencoPrenotazioneSpec", { prenotazione });
   
    });
});

//annulla prenotazioni 
app.get('/prenotazioni/prenotazione_spec/annulla/:id_prenotazione', (req, res) => {
    var id_prenotazione = req.params.id_prenotazione;
    console.log(id_prenotazione);

   connection.query(`DELETE FROM prenotazione_tipologia_locale WHERE id_prenotazione = ?`,[id_prenotazione], (err,prenotazione)=> {
        if (err) throw err;
        else {
            alert("Prenotazione annullata"); //tornare all'elenco locali
            res.redirect('../../');
        }
    });    
    
}); 

app.listen(3535);
console.log("Server is listening on port 3535");
