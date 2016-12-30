;(function($){

	var $map, $marker, $infowindow, $coordinates, $geolocationMarker;

	$(function() {

		//slider
		$('.image-slider').slick({
			//'autoplay': true, 
			'autoplaySpeed': 4000,
			'dots': true, 
			'slidesToShow': 3, 
			'centerMode': true,
			'slide': '.image-slide',
			prevArrow: '.image-slide-prev',
			nextArrow: '.image-slide-next'
		});
		
		$('.image-slider').on('beforeChange', function(event, slick, currentSlide, nextSlide){
			$('.image-slider .image-slide').addClass('slide-changing');
		});
		
		$('.image-slider').on('afterChange', function(event, slick, currentSlide, nextSlide){
			$('.image-slider .image-slide').removeClass('slide-changing');
		});

		if ( typeof google !== 'underfined') {

			$coordinates = {lat: 46.486801,	lng: 30.732628};
			var $map_options = {
		        center: $coordinates,
		        zoom: 10,
		        mapTypeId: google.maps.MapTypeId.ROADMAP, //ROADMAP, HYBRID etc
				disableDefaultUI: true, //disable controls zooms icon
				scrollwheel: true, // disable map scroll
				draggable: true, // disable drag map with mouse
		    };

			var $map_div = $('#map')[0]; // [0] it is important, if you use jQuery for a map
			
			$map = new google.maps.Map($map_div, $map_options);

			// Marker
			$geolocationMarker = new google.maps.Marker({
			    map: $map, // variable of our map
			    title: 'Click to show address'
			});

			// Infowindow 
			$infowindow = new google.maps.InfoWindow();

			// Show infowindow on click to marker
			google.maps.event.addListener($geolocationMarker, 'click', function() {
				$infowindow.open($map, $geolocationMarker);
			});
		
			//Direction
			$(document).on('click', '.address-form__btn', function(event) {
				event.preventDefault();
				
				var directionsDisplay = new google.maps.DirectionsRenderer(),
					directionsService = new google.maps.DirectionsService(),
					start = $('.start-route').val(),
					end = $('.end-route').val();

				var request = {
				    origin:start,
				    destination:end,
				    travelMode: google.maps.TravelMode.DRIVING
				};

				directionsDisplay.setMap($map);

				directionsService.route(request, function(result, status) {
				    if (status == google.maps.DirectionsStatus.OK) {
				      directionsDisplay.setDirections(result);
				    }
				});
			}); //end click

			//Location
			populateCountries('map-country'); // List of countries

			// Custom select
			$('#map-country').select2();

			$(document).on('click', '.map-title', function(){
				$('.location-form').slideToggle();
			}); // end click

			// Show your location
			if (navigator.geolocation) {
				var request_link;

				navigator.geolocation.getCurrentPosition(function(position){						
					$coordinates = {
						lat: position.coords.latitude, 
						lng: position.coords.longitude
					};
					
					request_link = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + $coordinates.lat+ ',' + $coordinates.lng;
						
					showAddress(request_link);
				});
			}

			$(document).on('click', '.show-my-pos', function(e){
				e.preventDefault();
				if (navigator.geolocation){
					navigator.geolocation.getCurrentPosition(function(position){						
						$coordinates = {
							lat: position.coords.latitude, 
							lng: position.coords.longitude
						};

						request_link = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + $coordinates.lat+ ',' + $coordinates.lng;
						
						showAddress(request_link);
						
					});
				$('.location-form').slideUp();
				}
			});
				
			//  Show address
			$(document).on('submit', '.location-form form', function(e){
				e.preventDefault();
				var validated = true;
				var country = $('#map-country').val().trim();
				var city = $('#map-city').val().trim();
				var address = $('#map-address').val().trim();
				var zip = $('#map-zip').val().trim();
				var remember = $('#map-remember').prop('checked');

				// Cookies
				setCookies(zip, country, city, address, remember);
				
				if (isEmptyStr(country) || country == '-1') {
					$('#map-country').closest('.map-form-field').addClass('error');
					validated = false;
				} else {
					$('#map-country').closest('.map-form-field').removeClass('error');
				}
				
				if (isEmptyStr(city)) {
					$('#map-city').closest('.map-form-field').addClass('error');
					validated = false;
				} else {
					$('#map-city').closest('.map-form-field').removeClass('error');
				}
				
				if (isEmptyStr(address)) {
					$('#map-address').closest('.map-form-field').addClass('error');
					validated = false;
				} else {
					$('#map-address').closest('.map-form-field').removeClass('error');
				}
				
				if (isEmptyStr(zip) || zip.length != 5) {
					$('#map-zip').closest('.map-form-field').addClass('error');
					validated = false;
				} else {
					$('#map-zip').closest('.map-form-field').removeClass('error');
				}
				
				if (validated) {
					var request_address = getFormattedAddress(zip, country, city, address);
					request_link = 'https://maps.google.com/maps/api/geocode/json?address=' + request_address;
					
					showAddress(request_link);
					
				}
			}); // end submit
		}

		// Get cookies to form-result
		if ( $('.location-form').length > 0 && $('.location-form').is('.form-result') ) {
			var zip = Cookies.get('zipCookie');
			var address = Cookies.get('addressCookie');
			var country = Cookies.get('countryCookie');
			var city = Cookies.get('cityCookie');
			var remember = Cookies.get('rememberCookie');

			if (typeof zip != 'undefined') {
				$('#map-zip').val(zip);
			}

			if (typeof address != 'undefined') {
				$('#map-address').val(address);
			}

			if (typeof country != 'undefined') {
				$('#map-country').val(country);
			}

			if (typeof city != 'undefined') {
				$('#map-city').val(city);
			}

			if (typeof city != 'undefined') {
				$('#map-remember').prop('checked', 'true');
			}
		}

		// Custom checkbox
		$('#map-remember').iCheck({
			checkboxClass: 'icheckbox_minimal-aero',
		});

		// Modal
		$(document).on('click', '[data-toggle="modal"]', function(e){
			
			e.preventDefault();
			var el_selector = $(this).attr('data-target');
			$(el_selector).fadeIn();
			
		});
		
		$(document).on('click', '.close-modal', function(e){
			
			e.preventDefault();
			$(this).closest('.modal').fadeOut();
			
		});

		// Tiny MCE for textarea
		tinymce.init({ 
			selector:'textarea.mce-editor'
	    });

	}); // end ready

	$(window).load(function() {
		$(document).snowfall({
			collection : '.map-section',
			flakeCount : 150,
			minSize: 3
		});
	}); // end load


function isEmptyStr(str){
	return (str.length == 0);
}

function showAddress(requestLink) {
	$.post (
		requestLink, 
		{}, 
		function(response){
			if (typeof response.results != 'undefined' && response.status == 'OK'){
				$coordinates = response.results[0].geometry.location;
				$map.setZoom(18);					
				$map.setCenter($coordinates);
				$geolocationMarker.setPosition($coordinates);
				$infowindow.setContent('<p>' + response.results[0].formatted_address + '</p>');
				$('.location-form').slideUp();
			} else {
				alert('Address not found!');
			}
		}
	);
}

function getFormattedAddress(m_zip, m_country, m_city, m_address){
	var formatted_address = m_address + ', ' + m_city + ', ' + m_zip + ', ' + m_country;
	return encodeURI(formatted_address);
}

function getCoordinates(m_zip, m_country, m_city, m_address){
	var formatted_address = m_address + ', ' + m_city + ', ' + m_zip + ', ' + m_country;
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({
		'address': formatted_address
	}, function(result){
		console.log(result[0].geometry.location);
	});
}

function setTimeCookie(remember) {
	var date;

	if ( !remember ) {
		date = new Date(new Date().getTime() + 60 * 5000);

	} else {
		date = 30;
	}
	return date;
}

function setCookies(m_zip, m_country, m_city, m_address, m_remember) {
	var date = setTimeCookie(m_remember);

	Cookies.set('zipCookie', m_zip, {expires: date, path: '/'});
	Cookies.set('countryCookie', m_country, {expires: date, path: '/'});
	Cookies.set('cityCookie', m_city, {expires: date, path: '/'});
	Cookies.set('addressCookie', m_address, {expires: date, path: '/'});
	Cookies.set('rememberCookie', m_remember, {expires: date, path: '/'});
}


})(jQuery);
