//File utilizzato per il testing delle API dell'applicazione Book&Party

var test = require('tape');
var request = require('supertest');
var app = require('../server');


//-------------------------------------------------------------------------------------------------------
//TESTING GET

//visualizza elenco info prenotazione specifica
test('TEST prenotazioni: elenco info prenotazione specifica restituito',function(assert){
    request(app)
    
    .get('/prenotazioni/prenotazione_spec/5')
    .expect('Content-Type', "text/html; charset=utf-8")
        .expect(200)
        .end(function (err,res){
            var rispostaQuery = JSON.parse(JSON.stringify(res["text"]));
            //console.log(rispostaQuery); // contiene il contenuto della query con [{}] se si usa il send, con il render contiene tutta la pagina html
            var lengthPrenotazione = rispostaQuery.length; //tiene conto di [{}]
           // console.log(lengthPrenotazione); 
            
            var result = false;
            if (lengthPrenotazione = 0) {
                result = true;
            }
            
            assert.error(err, 'No error');
            assert.notEqual(true, result, 'Elenco info prenotazione specifica restituito correttamente');
            assert.end();
        });
});

//elenco tipologie
test("TEST: tipologie", function (assert) {
    request(app)
        .get("/tipologie?id=5")
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect(200)
        .end(function (err, res) {
            var result = false;
            if (res.body.length == 0) {
                result = true;
            }
            assert.error(err, "No error");
            assert.notEqual(true, result, "Tipologie retrieved Correctly");
            assert.end();
        });
});

//testing modificaServizio
test('TEST modificaServizio: elenco servizi restituito',function(assert){
    request(app)
        .get('/modificaServizio?id=1')
        .expect('Content-Type', "text/html; charset=utf-8")
        .expect(200)
        .end(function (err,res){
            console.log(res.body.length);
            var elencoServizi = res.body.length;
            var result = false;
            if (elencoServizi == 0) {
                result = true;
            }

            assert.error(err, 'No error');
            assert.notEqual(true, result, 'Elenco sevizio restituito correttamente');
            assert.end();
        });

});


//testing elencoServizi
test('TEST elencoServizi: elenco servizi restituito',function(assert){
    request(app)
        .get('/elencoServizi')
        .expect('Content-Type', "text/html; charset=utf-8")
        .expect(200)
        .end(function (err,res){
            console.log(res.body.length);
            var elencoServizi = res.body.length;
            var result = false;
            if (elencoServizi == 0) {
                result = true;
            }

            assert.error(err, 'No error');
            assert.notEqual(true, result, 'elenco sevizio restituito correttamente');
            assert.end();
        });

});

//-------------------------------------------------------------------------------------------------------
//TESTING POST

//login
test('Test login: login avvenuto ', function (assert) {  
    request(app)
        .post('/api/utenti/login')
        .send({
            "email": "mario@gmail.com", "password": "123", 
        })
        .end((err, res) => {

            if (err) {
                reject(new Error('Errore durante il login, err: ' + err))
            }
            console.log("risposta -- " +res["text"]);
            var risposta = res["text"];
            var loginUtente = "Found. Redirecting to /homepage";
            var loginLocale = "Found. Redirecting to /homepageLocale";

            assert.error(err, 'No error');
            if (risposta == loginUtente) assert.isEqual(res["text"], loginUtente ,"Login avvenuto correttamente");
            else if (risposta == loginLocale) assert.isEqual(res["text"], loginLocale ,"Login avvenuto correttamente");
            
            assert.end();
        });
});

//aggiuntaServizio
test('Test aggiunta servizio: servizio aggiunto', function (assert) {  
    request(app)
        .post('/aggiungiServizio')
        .send({
            "id_tipologia": "1",
            "tipoServizio": "Dj", 
            "prezzoServizio": "20"
        })
        .end((err, res) => {

            if (err) {
                reject(new Error('Errore durante aggiunta del servizio, err: ' + err))
            }

            //console.log("risposta -- " +res["text"]);
            
            var rispostaApi = JSON.parse(JSON.stringify(res["text"])); //contiene pagina html
            
            var lengthAggiunta = rispostaApi.length; 
           // console.log(lengthAggiunta); 
            
            var result = false;
            if (lengthAggiunta = 0) {
                result = true;
            };

            assert.error(err, 'No error');
            assert.notEqual(true, result ,"Aggiunta servizio avvenuta correttamente");
            assert.end();
        });
});

//modificaServizio/aggiorna
test('Test modifica servizio: servizio modificato', function (assert) {  
    request(app)
        .post('/modificaServizio/aggiorna')
        .send({
            "id_servizi": "6",
            "tipoServizio": "Dj", 
            "prezzoServizio": "21"
        })
        .end((err, res) => {

            if (err) {
                reject(new Error('Errore durante aggiunta del servizio, err: ' + err))
            }

            //console.log("risposta -- " +res["text"]);
            
            var rispostaApi = JSON.parse(JSON.stringify(res["text"])); //contiene pagina html
            
            var lengthAggiorna = rispostaApi.length; 
           // console.log(lengthAggiunta); 
            
            var result = false;
            if (lengthAggiorna = 0) {
                result = true;
            };

            assert.error(err, 'No error');
            assert.notEqual(true, result ,"Modifica servizio avvenuta correttamente");
            assert.end();
        });
});

//modificaTipologia/aggiorna
test('Test modifica tipologia: tipologia modificato', function (assert) {  
    request(app)
        .post('/modificaTipologia/aggiorna')
        .send({
            "nome": "Tavolo",
            "quantita": "10", 
            "costo": "12",
            "nMaxPersone": "2",
            "zona_aperta": "0",
            "id_tipologia": "11"
        })
        .end((err, res) => {

            if (err) {
                reject(new Error('Errore durante aggiunta del servizio, err: ' + err))
            }

            //console.log("risposta -- " +res["text"]);
            
            var rispostaApi = JSON.parse(JSON.stringify(res["text"])); //contiene pagina html
            
            var lengthAggiorna = rispostaApi.length; 
           // console.log(lengthAggiunta); 
            
            var result = false;
            if (lengthAggiorna = 0) {
                result = true;
            };

            assert.error(err, 'No error');
            assert.notEqual(true, result ,"Modifica servizio avvenuta correttamente");
            assert.end();
        });
});

//-------------------------------------------------------------------------------------------------------
//TESTING DELETE

//elimana servizio
test("TEST servizi: eliminazione servizio", function (assert) {
    request(app)
        .del("/eliminaServizio?idS=36&idT=15")
        .end((err, res) => {
            if (err) {
                reject(
                    new Error(
                        "An error occured with the employee Adding API, err: " +
                            err
                    )
                );
            }

            var rispostaQuery = JSON.parse(JSON.stringify(res["text"]));
            var lengthPrenotazione = rispostaQuery.length;

            var result = false;
            if ((lengthPrenotazione = 0)) {
                result = true;
            }

            assert.error(err, "No error");
            assert.notEqual(true,result,"Servizio eliminato correttamente");
            assert.end();
        });
});


//annulla prenotazione
test("TEST prenotazioni: annullamento prenotazione", function (assert) {
    request(app)
        .del("/prenotazioni/prenotazione_spec/annulla?idP=2")
        .end((err, res) => {
            if (err) {
                reject(
                    new Error(
                        "An error occured with the employee Adding API, err: " +
                            err
                    )
                );
            }
            var rispostaQuery = JSON.parse(JSON.stringify(res["text"]));
            var lengthPrenotazione = rispostaQuery.length;

            var result = false;
            if ((lengthPrenotazione = 0)) {
                result = true;
            }

            assert.error(err, "No error");
            assert.notEqual(
                true,
                result,
                "Prenotazione annullata con successo"
            );
            assert.end();
        });
});