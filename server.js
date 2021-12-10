const express = require("express");
const mysql = require("mysql");
const alert = require("alert");
const http = require("http");
const bodyParser = require("body-parser");
var arr=[];
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
// index page
app.get('/', function (req, res) {
    res.render('pages/index');
});

app.use( express.static( "views" ) );

function formatDate(date) {
  var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

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
  con.query('CREATE OR REPLACE VIEW id(id_locale, nome_locale, costo, email, nome_tipologia, città, data, np) AS SELECT DISTINCT tipologia.id_locale, nome_locale, costo, email, nome_tipologia, città, date_disponibili, numero_massimo_persone FROM tipologia,utente_locale WHERE tipologia.id_locale=utente_locale.id_locale && città="'+req.query.città+'" && date_disponibili="'+req.query.data+'" && numero_massimo_persone="'+req.query.np+'"',(err,rows) =>{
    con.query('SELECT DISTINCT * FROM id',(err,rows)=>{
      con.query('SELECT DISTINCT COUNT(*) AS num FROM id', (err,r)=>{
        if (rows[0] != undefined) {
          rows.forEach(rows=>{
            rows.data = formatDate(rows.data);             
          })
          res.render('pages/locali', {rows,r});
          //res.send(r);  
        } else {
          alert("Account non trovato!");
          console.log(rows);
          //res.render('pages/index');
      }
      })  
    })
      con.query('DROP IF EXISTS id;', (err,r)=>{
        if(err){

        }else{

        }
      });
  })
})

app.get('/info', (req,rec) => {
  con.query('DROP IF EXISTS id;', (err,r)=>{
  con.query('CREATE OR REPLACE VIEW id(id_locale, nome_locale, descrizione) AS SELECT DISTINCT tipologia.id_locale, nome_locale, descrizione FROM utente_locale WHERE utente_locale.id_locale="'+req.query.id_locale+'" && id_tipologia="'+req.query.id_tipologia+'"', (err, rows)=>{
    con.query('SELECT DISTINCT id_locale, nome_locale, descrizione FROM id', (err,r1)=>{
      con.query('SELECT DISTINCT tipo_servizio FROM servizi WHERE id_tipologia="'+req.query.id_tipologia+'"', (err,r2)=>{
        console.log(r1,r2);
      })
    })
  })
})
})


app.listen(8080);
console.log('Server is listening on port 8080');



/*

*/