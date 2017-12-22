let map
let markers = new Map()
let origin

document.addEventListener('DOMContentLoaded', () => {
	const socket = io('/')
	socket.on('trackerDisconnected', id => {
		if (markers.has(id)) {
			const marker = markers.get(id)
			marker.setMap(null)
			markers.delete(id)
		}
	})

	socket.on('locationsUpdate', locations => {
		locations.forEach(([id, position]) => {
			if (position.lat && position.lng) {
				if (markers.has(id)) {
					const marker = markers.get(id)
					marker.setLocation(position)
				} else {
					const marker = new google.maps.Marker({
						position,
						map,
						title: ''+ id
					})
					addWindowMarker(marker, id, position)
				}
			}
		})
	})

	setInterval(() => {
		socket.emit('requestLocations')
	}, 2000)

	getMerchantCategories()
})

function callback(position) {
	return position.coords;
}

function addWindowMarker(marker, id, destination) {
	console.log('ini id masuk window ' + id)
	var request = new XMLHttpRequest();
	request.open('GET', '/merchant/' + id, true);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    // Success!
	    var data = JSON.parse(request.responseText);
	    var elements = '';
	    data.forEach(function (merchant) {
	    	elements += '<p class="text-red" style="font-size:14px">' + merchant.merchant_name + '<br><span class="text-blue" style="font-size:12px">' + merchant.start_time + ' - '+ merchant.end_time +
	    	'<br><i class="fa fa-user text-blue" aria-hidden="true" style="margin-left:3px">'+ merchant.name +'</i>' + 
	    	'<br><i class="fa fa-phone text-blue" aria-hidden="true" style="margin-left:3px">'+ merchant.phone +'</i></p>';
	    })
	    var origin = ''
	    navigator.geolocation.getCurrentPosition(callback, err => {
			console.log(err)
		})
		origin = {latitude:'-6.3656451999999994', longitude:'106.8243942'}
		console.log(origin + 'origin')
	    // duration = getLocation(origin, destination)
	    elements += '<br><span class="text-blue">3 minutes</span>'
	    var infowindow = new google.maps.InfoWindow({
	      content: elements
	    })
		marker.addListener('click', function() {
	     	infowindow.open(map, marker)
	    })
	  } else {
	    // We reached our target server, but it returned an error
	  }
	};
	request.onerror = function() {
	  // There was a connection error of some sort
	};
	request.send();
}

function initMap() {
	navigator.geolocation.getCurrentPosition(pos => {
		const { latitude: lat, longitude: lng} = pos.coords	
		map = new google.maps.Map(document.getElementById('map'), {
		  center: {lat, lng},
		  zoom: 15
		})
	}, err => {
		console.log(err)
	})
}

function getLocation(origin, destination) {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='+ origin.latitude + ','+ origin.longitude +'&destinations='+ destination.latitude+','+ destination.longitude+'&mode=bicycling&key=AIzaSyA-g4DhMSfwpk8ULJzTMTbDDcvvCR4SMBM', true);
	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    // Success!
	    var data = JSON.parse(request.responseText);
	    console.log(data)
	  } else {
	    // We reached our target server, but it returned an error
	  }
	};
	request.onerror = function() {
	  // There was a connection error of some sort
	};
	request.send();
}

function deleteMarkers(markersArray) {
	for (var i = 0; i < markersArray.length; i++) {
	  markersArray[i].setMap(null);
	}
	markersArray = [];
}

function getMerchantCategories() {
	var request = new XMLHttpRequest();
	request.open('GET', '/merchant_categories', true);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    // Success!
	    var data = JSON.parse(request.responseText);
	    var elements = '<div class="form-group"><label class="text-blue control-label col-lg-2"><b>Kategori Merchant</b></label><select required class="form-control col-lg-12" id="category_id" name="category" style="font-size:20px" required>';
	    elements += '<option value= "0"> Pilih Kategori </option>\n';
	    data.forEach(function (category) {
	    	elements += '<option value="'  + category.id + '">' + category.title + '</option>\n';
	    })
	    elements += '</select></div>';
	    document.getElementById('categories').innerHTML = elements;
	  } else {
	    // We reached our target server, but it returned an error
	  }
	};
	request.onerror = function() {
	  // There was a connection error of some sort
	};
	request.send();
}
