//File utilizzato per il testing delle API dell'applicazione Book&Party

var test = require('tape');
var request = require('supertest');
var app = require('../server');



test('Test login: login avvenuto  con successo', function (assert) {
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

//testing elenco prenotazioni /prenotazioni //fare
test('Test prenotazioni: elenco prenotazioni restituito correttamente',function(assert){
    request(app)
        .get('/prenotazioni')
        .expect('Content-Type', "text/html; charset=utf-8")
        .expect(200)
        .end(function (err,res){
            console.log(res.body.length);
            var numeroPrenotazioni = res.body.length;
            var result = false;
            if (numeroPrenotazioni == 0) {
                result = true;
            }

            assert.error(err, 'No error');
            assert.notEqual(true, result, 'elenco prenotazioni restituito correttamente');
            assert.end();
        });

});

//visualizza elenco info prenotazione specifica
test('Test prenotazioni: elenco info prenotazione specifica restituito correttamente',function(assert){
    request(app)
    
    .get('/prenotazioni/prenotazione_spec/8')
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




//testing modificaServizio
test('Test modificaServizio: elenco servizi restituito correttamente',function(assert){
    request(app)
        .get('/modificaServizio')
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



//testing modificaServizio
test('Test modificaServizio: elenco servizi restituito correttamente',function(assert){
    request(app)
        .get('/modificaServizio')
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



//testing elencoServizi
test('Test elencoServizi: elenco servizi restituito correttamente',function(assert){
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