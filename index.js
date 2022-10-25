const express = require('express')
const sqlite3 = require('sqlite3').verbose();
const app = express()
const port = 3000
const db = new sqlite3.Database('./db.sqlite');

app.set('view engine', 'ejs');

app.use(express.urlencoded())
app.use(express.json());

db.serialize(function() {
    console.log('Creating databases if they don\'t exist');
    db.run('CREATE TABLE if not exists users (id integer primary key, username text not null, password text not null)');
    db.run('CREATE TABLE if not exists pings (id integer primary key, hostname text not null, rtt integer, datetime integer)');
});

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/users', (req, res) => {
    const user = [req.body.username_field, req.body.password_field]
    db.serialize(function() {
        const newUser = "INSERT INTO users (username, password) VALUES ('" + user[0] + "','" + user[1] + "');"
        db.run(newUser); 
        res.json({ users: user });                                     
      });
});

app.post('/pings', (req, res) => {
    const ping = [req.body.hostname_field, 1234, Date.now()]
    db.serialize(function() {
        const newPing = "INSERT INTO pings (hostname, rtt, datetime) VALUES ('" + ping[0] + "','" + ping[1] + "'," + ping[2] + ");"
        db.run(newPing); 
        res.json({ pings: ping });                                     
      });
});

app.get('/api/v1/users', (req, res, next) => {
    try {
      db.serialize(function() {
        db.all("SELECT * FROM users", function(err, data){
          res.json({ users: data });
        });
      });
    } catch(err) {
      console.error(`Error while getting users `, err.message);
      next(err);
    };
});

app.get('/api/v1/pings', (req, res, next) => {
    try {
      db.serialize(function() {
        db.all("SELECT * FROM pings", function(err, data){
          res.json({ pings: data });
        });
      });
    } catch(err) {
      console.error(`Error while getting pings `, err.message);
      next(err);
    };
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
