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