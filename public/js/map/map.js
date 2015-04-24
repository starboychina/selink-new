
var center = new google.maps.LatLng(35.645736,139.747575);

var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      maxZoom:17,
      minZoom:12,
      center: center,
      disableDefaultUI: true,               //取消默认的试图
      //navigationControl: true,              //true表示显示控件
      //mapTypeControl: false,                //false表示不显示控件
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
					content: setMarkerView(station)
		    	} );
		    	markers.push(new RichMarker(marker));
	    	};
	    }
	    var mcOptions = {gridSize: 80, maxZoom: 17};
	    var markerCluster = new MarkerClusterer(map, markers,mcOptions);
	});
});
//地図のmarker
function setMarkerView(station){
	//console.log(station );
	//map.setCenter(center);
	var div = document.createElement('div');

	$(div)
		.attr({"id":"marker_"+station._id})
		.addClass("fa fa-map-marker")
		.css({
			"float": "left",
			"font-size": "40px",
			"margin": "-40px 0",
			"text-shadow": "5px 5px 10px #888888",
		}).click(function(){
			showDetail($(this),station);
		});

	return div;
}
//地図markerをクリックした、場合の処理
function showDetail(el,station){
	var center = new google.maps.LatLng(station.lat,station.lon);
	map.panTo(center);	
	var sid = "wp_"+station._id;
	$(".detail_wp").each(function(index){//ほかのmarkerを非表示します
		var id = $(this).attr("id");
		if(id != sid){
			var temp_sid = id.replace("wp_","");
			setAnime(temp_sid);
		}
	});

	var detail_wp = $("#"+sid).size() > 0 ? $("#"+sid) : el.clone().attr({"id":sid,"class":"detail_wp"});
	el.after(detail_wp);

	showGroups(detail_wp,station);
	showUsers(detail_wp,station);
	showPosts(detail_wp,station);
	showPosts1(detail_wp,station);

	setAnime(station._id);
}

var defaultCss = $.extend( defaultCssAnime, {
			"float":"left",
			"position": "absolute",
			"font-size":"20px",
			"text-align":"center",
			"border-radius":"10px",
			"border":"1px solid rgba(98, 234, 194, 0.5)",
			"background":"rgba(178, 223, 199, 0.7)",
			"box-shadow": "5px 5px 10px #888888",
			"z-index": "9",
		});
var defaultCssAnime = {
			"width":"0",
			"height":"0",
			"margin": "0",
		};
////////////////////////////////
var cwidth = 70;		
var r = 120;//半径

var setAnime = function(viewid){
	var marker = $("#marker_"+viewid);
	var count_total = $("#wp_"+viewid).children().size()*2 - 1;
	var position_start = 2 ;
	$("#wp_"+viewid).children().each(function(index){
		var css = cssOption(marker,$(this),count_total, position_start+index);
		if(css.width != "0"){
			marker.attr({"data-detail":"show"});
		}else{
			marker.attr({"data-detail":"hide"});
		}
		var animate = getAnimeOption(viewid);
		$(this).animate(css,animate);
	});

}
var cssOption = function(marker,view,count_total,index){
	var center = {
		t:-marker.height()/2,
		l:-marker.width()
	}
	var point = {
		t:center.t + r*(Math.cos(-index*2*Math.PI/count_total)),
		l:center.l + r*(Math.sin(-index*2*Math.PI/count_total))
	}
	return view.width() == cwidth ? defaultCssAnime:{
			"margin":point.t+"px 0 0 "+point.l +"px",
			"width":cwidth+"px",
			"height":cwidth+"px",
		}
}
var getAnimeOption = function (viewid){
	return {
		duration: "10000",
		easing: "easeOutBounce",
		complete:function(){
			var marker = $("#marker_"+viewid);
			if( marker.attr("data-detail") == "hide"){
				$("#wp_"+viewid).remove();
			}
		}
	};
}


/////////////////////////////
var iconMark = $("<i></i>").addClass("fa").css({
	"font-size":"20px",
	"margin-top":"10px",
	"float":"left",
	"width":"0",
	"width":"100%"
});
var dataTemp = Array();
//データ数を取得	
function getDataCount(view,id,url){
	if(dataTemp[id]){
		view.text(dataTemp[id]);
		return dataTemp[id];
	}
	$.getJSON( url, function( data ) {
		dataTemp[id] = data.length == 0 ?"0":data.length;
		view.text(data.length);
	}).error(function() { 
		dataTemp[id] = "0";
		view.text(0); 
	});

}
function showGroups(detail_wp,station){
	var icon = iconMark.clone().addClass("fa-group");

	var id = "wp_group_"+station._id;
	var view_users = ($("#"+id).size()>0) ? $("#"+id) :$("<div />")
		.attr({"id":id})
		.css(defaultCss)
		.css({"background":"rgba(255, 248, 178, 0.7)"})
		.append(icon,'<br /> Group')
		.appendTo(detail_wp);

	getDataCount(icon,id,"/mobile/stations/groups?stations.name="+station.name);
}
function showUsers(detail_wp,station){
	var icon = iconMark.clone().addClass("fa-user");
	var id = "wp_user_"+station._id;
	var view_users = ($("#"+id).size()>0) ? $("#"+id) :$("<div />")
		.attr({"id":id})
		.css(defaultCss)
		.css({"background":"rgba(195, 209, 252, 0.7)"})
		.append(icon,'<br /> User')
		.appendTo(detail_wp);

	getDataCount(icon,id,"/mobile/stations/users?nearestSt="+station.name);
}
function showPosts(detail_wp,station){
	var icon = iconMark.clone().addClass("fa-edit");
	var id = "wp_post_"+station._id;
	var view_users = ($("#"+id).size()>0) ? $("#"+id) :$("<div />")
		.attr({"id":id})
		.css(defaultCss)
		.css({"background":"rgba(242, 197, 186, 0.7)"})
		.append(icon,'<br /> HOT')
		.appendTo(detail_wp);

	getDataCount(icon,id,"/mobile/stations/posts?stations.name="+station.name);
}
function showPosts1(detail_wp,station){
	var icon = iconMark.clone().addClass("fa-edit");
	var id = "wp_post1_"+station._id;
	var view_users = ($("#"+id).size()>0) ? $("#"+id) :$("<div />")
		.attr({"id":id})
		.css(defaultCss)
		.css({"background":"rgba(178, 223, 199, 0.7)"})
		.append(icon,'<br /> 吐')
		.appendTo(detail_wp);
	getDataCount(icon,id,"/mobile/stations/posts?stations.name="+station.name);
}