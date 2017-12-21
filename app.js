'use strict'

const express = require('express')
const path = require('path')
const http = require('http')
const bodyParser = require('body-parser')
const socketIo = require('socket.io')
const pg = require('pg')
const Pool = require('pg-pool');
const url = require('url')
let session = require('express-session');
// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true,
// });
var urlencodedParser = bodyParser.urlencoded({
    extended: true
});
var params = url.parse("postgres://ixesqaaioopbko:ca9d034b06e19878f28837d72f93005f2e2d62c0fa7b10af2c5c1895dfa02d25@ec2-54-83-35-31.compute-1.amazonaws.com:5432/d3ub25m81r7vep")
const auth = params.auth.split(':');
const config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true
};
const pool = new Pool(config);
// pool.connect(function(err, client, done) {
//     client.query('insert into merchants (id,name,phone,category_id,merchant_name,start_time,end_time,description,image) values(3,\'Abang\',\'123456789\',1,\'Nasi Goreng\',\'08:00\',\'17:00\',\'Enak Nasi Goreng\',\'www.selerasa.com/images/nasi/nasi_goreng/Resep-Dan-Cara-Membuat-Nasi-Goreng-Rumahan-Spesial-Enak-Gurih-Simpel-Dan-Praktis.jpg\');', function(err, result) {
//         done();
//         if (err) return console.error(err);
//         console.log(result.rows);
//     });
// });
// pool.connect(function(err, client, done) {
//     client.query('select * from merchants;', function(err, result) {
//         done();
//         if (err) return console.error(err);
//         console.log(result.rows);
//     });
// });
//console.log(process.env.db);

// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//   if (err) throw err;
//   for (let row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
//   client.end();
// });

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const locationMap = new Map()
var id = 1;
// Set the server port
var port = process.env.PORT || 8080

app.use(express.static(path.join(__dirname, 'public')))
app.get('/logout', function(req, res) {
  var merchant_id = res.locals.merchant;
  console.log(merchant_id);
  // console.log(req.session.user);
  io.on('connection', socket => {
    socket.emit('disconnect', merchant_id)
  })
  res.redirect('/');
});
app.use(
    session({
        cookie: {
            maxAge: 36000000000
        },
        secret: 'woot',
        resave: false,
        saveUninitialized: false
    })
);
var id = 4;
app.post('/register', urlencodedParser, function(req, res) {
    var phone = req.body.phone;
    var name = req.body.name;
    var category = req.body.category;
    var merchant_name = req.body.merchant_name;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;
    var description = req.body.description;
    var photo = null;
    var password = req.body.password;

    pool.connect(function(err, client, done) {
        client.query('insert into merchants (name,phone,category_id,merchant_name,start_time,end_time,description,image,password) values(' + '\'' + name + '\',\'' + phone + '\',\'' + category + '\',\'' + merchant_name + '\',\'' + start_time + '\',\'' + end_time + '\',\'' + description + '\',\'' + photo + '\',\'' + password + '\');', function(err, result) {
            done();
            if (result) {
                console.log('cihuuyyyy');
                res.redirect('/register-success.html');
                // console.log(result.rows[0]);
            } else {
                console.log('whyyy');
                console.error(err);
            }
        });
    });
});
app.post('/login',urlencodedParser, function(req, res) {
  var phone = req.body.phone;
  var password = req.body.password;
  pool.connect(function(err,client,done){
    client.query('select * from merchants where phone=\''+ phone + '\' AND password=\'' + password + '\';',function(err,result){
      done();
      if(result) {
        req.session.user = result;
      	var merchant_id = result.rows[0].id;
      	locationMap.set(merchant_id, {lat: null, lng: null})
      	io.on('connection', socket => {
      		socket.emit('myID', merchant_id)
      	})
        res.locals.merchant = merchant_id;
        res.redirect('tracker.html');
        console.log(res.locals.merchant);
      }
      else {

            }
        });
    });
});
// console.log("hi");
// res.send(req.body.phone);
// io.on('connection', socket => {
// 	locationMap.set(merchant_id, {lat: null, lng: null})
// 	socket.on('updateLocation', pos => {
// 		if (locationMap.has(merchant_id)) {
// 			locationMap.set(merchant_id, pos)
// 			console.log(merchant_id, pos)
//       arr.push(pos)
//       console.log(arr);
// 		}
// 	})
//
// 	socket.on('disconnect', () => {
// 		locationMap.delete(merchant_id)
// 	})
// })
//res.redirect('tracker.html')
app.get('/merchant_categories', urlencodedParser, function(req, res) {
    pool.connect(function(err, client, done) {
        client.query('select * from merchant_categories;', function(err, result) {
            done();
            if (result) {
                res.send(result.rows);
            } else {
                throw err;
            }
        });
    });
});
app.get('/merchant/:id', urlencodedParser, function(req, res) {
    var id = req.params.id
    pool.connect(function(err, client, done) {
        client.query('select * from merchants where id=' + id + ';', function(err, result) {
            done();
            if (result) {
                res.send(result.rows);
            } else {
                throw err;
            }
        });
    });
});
app.get('/view', function(req, res) {
    res.redirect('viewer.html');
});
io.on('connection', socket => {

    socket.on('updateLocation', data => {
        data.forEach(([merchant_id, pos]) => {
            const {
                lat,
                lng
            } = pos
            if (locationMap.has(merchant_id)) {
                locationMap.set(merchant_id, {
                    lat,
                    lng
                })
                const tmp = locationMap.size
            }
        })
    })

    socket.on('requestLocations', () => {
        socket.emit('locationsUpdate', Array.from(locationMap))
    })

    socket.on('disconnect', merchant_id => {
        io.emit('trackerDisconnected', merchant_id)
        locationMap.delete(merchant_id)
    })
})

server.listen(port, err => {
    if (err) {
        throw err
    }
    console.log('server started on port ' + port)
})
