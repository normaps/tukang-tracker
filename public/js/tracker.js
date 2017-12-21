let positions = new Map()

document.addEventListener('DOMContentLoaded', () => {
	const socket = io('/')

	const positionOptions = {
		enableHighAccuracy: true,
		maximumAge: 0
	}
	
	var id = null
	socket.on('myID', merchant_id => {
		id = merchant_id
	})

	setInterval(() => {
		console.log('tick')
		navigator.geolocation.getCurrentPosition(pos => {
			const { latitude: lat, longitude: lng} = pos.coords	
			if (positions.has(id)) {
				positions.delete(id)
			}
			positions.set(id, {lat, lng})
			socket.emit('updateLocation', Array.from(positions))
		}, err => {
			console.log(err)
		}, positionOptions)
	}, 2000)
})