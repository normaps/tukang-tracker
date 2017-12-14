'use strict'

const express = require('express')
const path = require('path')
const http = require('http')
const bodyParser = require('body-parser')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const locationMap = new Map()

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
	res.send('Hello world')
})

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

server.listen(3000, err => {
	if (err) {
		throw err
	}
	console.log('server started on port 3000')
})

// const config = {
// 	apiKey: "AIzaSyDBbrSoij9t2JcbXYbPFXWfFEGCwQLEj20",
// 	authDomain: "tukang-tracker-186902.firebaseapp.com",
// 	databaseURL: "https://tukang-tracker-186902.firebaseio.com",
// 	projectId: "tukang-tracker-186902",
// 	storageBucket: "tukang-tracker-186902.appspot.com",
// 	messagingSenderId: "267471250627"
// };

// firebase.initializeApp(config);
// // Get elements
// const preObject = document.getElementById('object');

// // Create preferences
// const dbRefObject = firebase.database().ref().child('object');

// // Sync object changes
// dbRefObject.on('value', snap => {
// 	preObject.innerText = JSON.stringify(snap.val(), null, 3);
// });