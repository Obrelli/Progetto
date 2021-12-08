const express = require("express");
const mysql = require("mysql");
const alert = require("alert");
const http = require("http");
const fs = require("fs");
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
    con.query('SELECT nome,email, password FROM utente WHERE email="'+req.query.email+'" && password="'+req.query.password+'"', (err, rows) => {
    if (rows[0] != undefined) {
        //res.send(rows[0].nome);
        res.render('pages/home', {nome: rows[0].nome});
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
  con.query('CREATE VIEW id(id_locale, città, date, np) AS SELECT tipologia.id_locale, città, date_disponibili, numero_massimo_persone FROM tipologia,utente_locale WHERE città="'+req.query.città+'" && date_disponibili="'+req.query.data+'" && numero_massimo_persone="'+req.query.np+'"; SELECT id_locale FROM id',(err,rows) =>{
    console.log(rows);
    con.query('DROP IF EXISTS id;');
    /*
    if (rows[0] != undefined) {
      console.log(rows);
      //res.render('pages/home', {nome: rows[0].nome});
  } else {
      alert("Account non trovato!");
      console.log(rows);
      //res.render('pages/index');
  } */  
  })
})


app.listen(8080);
console.log('Server is listening on port 8080');



/*
fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
});
*/