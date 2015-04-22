
var center = new google.maps.LatLng(35.645736,139.747575);

var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      maxZoom:17,
      minZoom:12,
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
			"margin": "-40px 0"
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
/////////////////////////////
var iconMark = $("<i></i>").addClass("fa").css({
	"font-size":"20px",
	"margin-top":"10px",
	"float":"left",
	"width":"0",
	"width":"100%"
});
function showGroups(detail_wp,station){
	var icon = iconMark.clone().addClass("fa-group");

	var id = "wp_group_"+station._id;
	var view_users = ($("#"+id).size()>0) ? $("#"+id) :$("<div />")
		.attr({"id":id})
		.css(defaultCss)
		.append(icon,'<br /> Group')
		.appendTo(detail_wp);

	$.getJSON( "/mobile/stations/groups?nearestSt="+station.name, function( data ) {
		icon.text(data.length);
	}).error(function() { icon.text(0); });

}
function showUsers(detail_wp,station){
	var icon = iconMark.clone().addClass("fa-user");
	var id = "wp_user_"+station._id;
	var view_users = ($("#"+id).size()>0) ? $("#"+id) :$("<div />")
		.attr({"id":id})
		.css(defaultCss)
		.append(icon,'<br /> User')
		.appendTo(detail_wp);

	$.getJSON( "/mobile/stations/users?nearestSt="+station.name, function( data ) {
		icon.text(data.length);
	}).error(function() { icon.text(0); });

}
function showPosts(detail_wp,station){
	var icon = iconMark.clone().addClass("fa-edit");
	var id = "wp_post_"+station._id;
	var view_users = ($("#"+id).size()>0) ? $("#"+id) :$("<div />")
		.attr({"id":id})
		.css(defaultCss)
		.append(icon,'<br /> HOT')
		.appendTo(detail_wp);

	$.getJSON( "/mobile/stations/posts?nearestSt="+station.name, function( data ) {
		icon.text(data.length);
	}).error(function() { icon.text(0); });

}
function showPosts1(detail_wp,station){
	var icon = iconMark.clone().addClass("fa-edit");
	var id = "wp_post1_"+station._id;
	var view_users = ($("#"+id).size()>0) ? $("#"+id) :$("<div />")
		.attr({"id":id})
		.css(defaultCss)
		.append(icon,'<br /> 吐')
		.appendTo(detail_wp);
	$.getJSON( "/mobile/stations/posts?nearestSt="+station.name, function( data ) {
		icon.text(data.length);
	}).error(function() { icon.text(0); });

}
////////////////////////////////
var cwidth = 70;
function setAnime(viewid){
	var marker = $("#marker_"+viewid);
	var space = 0 ;
	var x_left = (cwidth + space ) *-1;
	var x_right = space + marker.height();
	var y_top = (cwidth + space ) *-1;
	var y_bottom = space + marker.width();

	var detailList = {
		"group":x_left+"px 0 0 "+y_top+"px",
		"user":x_right+"px 0 0 "+y_top+"px",
		"post":x_left+"px 0 0 "+y_bottom+"px",
		"post1":x_right+"px 0 0 "+y_bottom+"px",
	};
	for (var index in detailList) {
		var cid = "#wp_" + index + "_" + viewid;
		var view = $(cid);
		if(view.size()>0){
			var css = getAnimeCssOption(view,detailList[index]);
			if(css.width != "0"){
				marker.attr({"data-detail":"show"});
			}else{
				marker.attr({"data-detail":"hide"});
			}
			var animate = getAnimeOption(viewid);
			view.animate(css,animate);
		}
	};
}
var defaultCss = $.extend( defaultCssAnime, {
			"float":"left",
			"position": "absolute",
			"font-size":"20px",
			"text-align":"center",
			"border-radius":"10px",
			"border":"1px solid rgba(98, 234, 194, 0.5)",
			"background":"rgba(141, 205, 186, 0.5)",
		});
var defaultCssAnime = {
			"width":"0",
			"height":"0",
			"margin": "0",
		};
function getAnimeCssOption(view,openmargin){
	return view.width() == cwidth ? defaultCssAnime:{
			"margin": openmargin,
			"width":cwidth+"px",
			"height":cwidth+"px",
		}
}
function getAnimeOption(viewid){
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
//////////////////////////////////



function setMarkerView1(station){
	var markerWidth = 200;
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
		"height":"36px",
		"list-style":"none",
		"background":"#FFF",
		"margin":"2px",
		"text-align": "center"
	});
	var icon = $("<i></i>").addClass("fa").css({"font-size":"20px"});
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

	$.getJSON( "/mobile/stations/posts?nearestSt="+station.name, function( data ) {
		count_post.text(data.length);
		var count_group = 0;
		var count_post = 0;
		var users = Array();
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