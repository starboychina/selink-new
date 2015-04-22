
var center = new google.maps.LatLng(35.64557,139.7459661);
var markerWidth = 260;
var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      maxZoom:17,
      minZoom:15,
      center: center,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      // This is where you would paste any style found on Snazzy Maps.
      styles: [
            {
                "featureType": "all",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "landscape.natural",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "landscape.natural",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#e0efef"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#c0e8e8"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {
                        "saturation": "19"
                    },
                    {
                        "lightness": "-12"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "weight": "1.41"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "lightness": "41"
                    },
                    {
                        "color": "#23ff00"
                    },
                    {
                        "weight": "3.78"
                    },
                    {
                        "saturation": "-41"
                    },
                    {
                        "gamma": "2.22"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#1b7c1c"
                    },
                    {
                        "saturation": "-39"
                    },
                    {
                        "lightness": "39"
                    }
                ]
            },
            {
                "featureType": "transit.station",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit.station.airport",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit.station.bus",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit.station.rail",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "hue": "#00ffd1"
                    },
                    {
                        "saturation": "-64"
                    },
                    {
                        "lightness": "16"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            }
        ]
});

var markerOption = {
	map: map,
	//draggable: true,
	flat: true,
	anchor: RichMarkerPosition.MIDDLE
};

$(function(){
	$("#map").height($(document).height());


	$.getJSON( "/mobile/stations?name=JR山手線", function( data ) {
		var markers = [];
	    for (var i = 0; i < data.length; i++) {
	    	for (var j = data[i].stations.length - 1; j >= 0; j--) { 
	    		var station = data[i].stations[j];
	    		var latLng = new google.maps.LatLng(station.lat,station.lon);

	    		var marker = $.extend( true, markerOption, {
		    		position: latLng,
					content: serMarkerView(station)
		    	} );
		    	markers.push(new RichMarker(marker));
	    	};
	    }
	    var mcOptions = {gridSize: 150, maxZoom: 17};
	    var markerCluster = new MarkerClusterer(map, markers,mcOptions);
	});
});

function serMarkerView(station){
	var markerImg = $("<div></div>");
	markerImg.html('<img src="http://lorempixel.com/400/200/" width="'+markerWidth+'">');
	var markerTab = $("<ul></ul>").css({
		"background":"#DDD",
		"margin":"0",
		"float": "left",
		"padding": "0",
		"height": "auto"
	});

	var markerTabItem = $("<li></li>").css({
		"float":"left",
		"width":(markerWidth/4-4)+"px",
		"height":"46px",
		"list-style":"none",
		"background":"#FFF",
		"margin":"2px",
		"text-align": "center"
	});
	var icon = $("<i></i>").addClass("fa").css({"font-size":"25px"});
	var icon_group = icon.clone().addClass("fa-group");
	var icon_user = icon.clone().addClass("fa-user");
	var icon_post = icon.clone().addClass("fa-edit");
	var icon_post1 = icon.clone().addClass("fa-edit");



	var group = markerTabItem.clone().append(icon_group,'<br /> Group');
	var user = markerTabItem.clone().append(icon_user,'<br /> User');
	var post = markerTabItem.clone().append(icon_post,'<br /> HOT');
	var post1 = markerTabItem.clone().append(icon_post1,'<br /> 吐');
	markerTab.append(group,user,post,post1);

	var div = document.createElement('div');
	$(div).attr({"id":station._id}).css({
		"float": "left",
		"width": markerWidth +"px"
	}).append(markerImg,markerTab);

	$.getJSON( "/mobile/stations/users?nearestSt="+station.name, function( data ) {
		icon_user.text(data.length);
		var count_group = 0;
		var count_post = 0;
		for (var i = data.length - 1; i >= 0; i--) {
			var user = data[i];
			count_group += user.groups.length;
			count_post += user.posts.length;
		};
		icon_group.text(count_group);
		icon_user.text(data.length);
		icon_post.text(count_post);
		icon_post1.text(count_post);
		console.log(station._id );
	});

	return div;

}