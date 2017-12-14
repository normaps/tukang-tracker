let map

document.addEventListener('DOMContentLoaded', () => {
	const socket = io('/')
})

function initMap() {
	navigator.geolocation.getCurrentPosition(pos => {
		const { latitude: lat, longitude: lng} = pos.coords	
		map = new google.maps.Map(document.getElementById('map'), {
		  center: {lat, lng},
		  zoom: 8
		})
	}, err => {
		console.log(err)
	})
}