'use strict'

const express = require('express')
const path = require('path')
const http = require('http')
const bodyParser = require('body-parser')
const socketIo = require('socket.io')
const { Client } = require('pg')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
var urlencodedParser = bodyParser.urlencoded({ extended: true });
client.connect();

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

// Set the server port
var port = process.env.PORT || 8080

app.use(express.static(path.join(__dirname, 'public')))
app.get('/hello', function (req, res) {
  res.send('hello world')
});
app.get('/form', function (req, res) {
  var html='';
  html +="<body>";
  html += "<form action='/thank'  method='post' name='form1'>";
  html += "Name:</p><input type= 'text' name='name'>";
  html += "Email:</p><input type='text' name='email'>";
  html += "address:</p><input type='text' name='address'>";
  html += "Mobile number:</p><input type='text' name='mobilno'>";
  html += "<input type='submit' value='submit'>";
  html += "<INPUT type='reset'  value='reset'>";
  html += "</form>";
  html += "</body>";
  res.send(html);
});
app.post('/action',urlencodedParser, function(req, res) {
  res.send('You sent the name "' + req.body.phone + '".');
});
app.post('/thank', urlencodedParser, function (req, res){
  var reply='';
  reply += "Your name is" + req.body.name;
  reply += "Your E-mail id is" + req.body.email;
  reply += "Your address is" + req.body.address;
  reply += "Your mobile number is" + req.body.mobilno;
  res.send(reply);
 });
io.on('connection', socket => {
	locationMap.set(socket.id, {lat: null, lng: null})
	socket.on('updateLocation', pos => {
		if (locationMap.has(socket.id)) {
			locationMap.set(socket.id, pos)
			console.log(socket.id, pos)
		}
	})

	socket.on('disconnect', () => {
		locationMap.delete(socket.id)
	})
})

server.listen(port, err => {
	if (err) {
		throw err
	}
	console.log('server started on port ' + port)
})
