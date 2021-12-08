const express = require("express");
const mysql = require("mysql");
const alert = require("alert");
const http = require("http");
const arr =[];
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "book&party"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


http.createServer(function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    console.log('POSTed: ' + body);
    res.writeHead(200);
    res.end(postHTML);
  
  });
});

const app = express();
app.set("view engine", "ejs");
// index page
app.get('/', function (req, res) {
    res.render('pages/index');
});



// departments page
app.get('/login', async function (req, res) {
    con.query('SELECT email, password FROM utente WHERE email="'+req.query.email+'" && password="'+req.query.password+'"', (err, rows) => {
    if (rows[0] != undefined) {
        res.render('pages/home');
    } else {
        alert("Account non trovato!");
        console.log(rows);
        res.render('pages/index');
    }   
    })
});

app.get('/ric', async function(req,res){
  res.render('pages/ricerca.ejs');
})

app.get('/ricerca', async function(req,res){
  con.query('SELECT DISTINCT tipologia.id_locale  FROM tipologia,utente_locale WHERE città="'+req.query.città+'" && date_disponibili="'+req.query.data+'" && tipologia.numero_massimo_persone="'+req.query.np+'"', (err, rows,fields) => {
    if(!err){
      if (rows[0] != undefined) {
        var i =0;
        for(var i=0; i<rows.length; i++){
          con.query('SELECT * FROM utente_locale WHERE id_locale="'+rows[i].id_locale+'"',(err,rows) => {
            if(!err){              
            //arr[i]=rows[i].id_locale;
              res.render('pages/locali');
            }else{
              alert('Errore del server');
              res.render('pages/home');
            }
          })
        }
         
      } else {
          alert("Account non trovato!");
          console.log(rows);
          res.render('pages/index');
      }  
    }else{
      alert('Errore del server');
      res.render('pages/index');
    } 
  })
})


app.listen(8080);
console.log('Server is listening on port 8080');