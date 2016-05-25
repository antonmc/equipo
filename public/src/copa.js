     /* scheme 1 */

     var water = "#a0c4d5";
     var landscape = "#ffffff";
     var maplabel = "#a3a8ab";

     /* scheme 2 */

     var water = "#30acd2";
     var landscape = "#95d1e1";
     var maplabel = "#ffffff";


     var markers = [];

     var styles = [
         {
             "featureType": "landscape",
             "stylers": [{
                 "visibility": "simplified"
            }]
        },
         {
             "featureType": "water",
             "stylers": [{
                 "visibility": "simplified"
            }, {
                 "color": water
            }]
        },
         {
             "featureType": "landscape",
             "stylers": [{
                 "color": landscape
            }]
        },
         {
             "featureType": "road",
             "stylers": [{
                 "visibility": "off"
            }]
        },
         {
             "featureType": "poi",
             "stylers": [{
                 "visibility": "off"
            }]
        },
         {
             "featureType": "administrative.country",
             "elementType": "geometry.stroke",
             "stylers": [{
                 "color": maplabel
            }, {
                 "weight": 0.5
            }]
        },
         {
             "featureType": "administrative",
             "elementType": "labels",
             "stylers": [{
                 "color": maplabel
            }, {
                 "weight": 0.1
            }]
        },
         {
             "featureType": "administrative.province",
             "stylers": [{
                 "visibility": "off"
            }]
        }
	];

     function newDiv(classname, content) {
         var div = document.createElement('div');
         div.className = classname;
         if (content) {
             div.innerHTML = content;
         }
         return div;
     }

     function newlabel(classname, content) {
         var label = document.createElement('label');
         label.className = classname;
         if (content) {
             label.innerHTML = content;
         }
         return label;
     }

     function flagBlock(flagImage) {
         var flag = document.createElement('img');
         flag.src = './flags/4x3/' + flagImage + '.svg';
         flag.className = 'flag';
         return flag;
     }

     function nationBlock(name, flagImage) {
         var nation = newDiv('nation');
         var teamname = newlabel('teamname', name);
         nation.appendChild(teamname);
         return nation;
     }

     function infoBlock(words, value) {
         var info = newDiv('info');
         var label = newlabel('detailLabel');
         label.innerHTML = words;
         var content = newDiv('detailContent');
         content.innerHTML = value;
         info.appendChild(label);
         info.appendChild(content);
         return info;
     }

     function makeListItem(team) {

         var item = newDiv('item');
         var flag = flagBlock(team.flag);
         var nation = nationBlock(team.team);

         var teaminfo = newDiv('teaminfo');
         teaminfo.appendChild(infoBlock('Avg Age', 30));
         teaminfo.appendChild(infoBlock('Avg Height', 170));

         item.appendChild(flag);
         item.appendChild(nation);
         item.appendChild(teaminfo);

         item.onclick = function () {
             console.log('clicked ' + team.team);
             item.style.background = 'aliceblue';
         }

         return item;
     }



     function initMap() {
         // Create a map object and specify the DOM element for display.
         var map = new google.maps.Map(document.getElementById('map'), {
             center: {
                 lat: -34.397,
                 lng: 150.644
             },
             scrollwheel: false,
             zoom: 8
         });
     }


     function createInfoWindow(marker, data, team) {

         var contentString = '<div id="content">' +
             '<h2 id="firstHeading" class="firstHeading">' + data.Name + '</h2>' +
             '<div id="bodyContent">' +
             '<p><b>' + data.Position + '</b></p>' +
             '<p>Team: ' + team.team + '</p>' +
             '<p>Home: ' + data.Home + '</p>' +
             '<p>Birthday: ' + data.BirthDate + '</p>' +
             '<p><a target="_blank" href="http://en.wikipedia.org/wiki/' + data.Wikipedia + '">Biography</a></p>' +
             '<p><a target="_blank" href="https://twitter.com/search?q=' + encodeURIComponent(data.Name) + '">What people are saying</a></p>' +
             '</div>' +
             '</div>';

         marker.infowindow = new google.maps.InfoWindow({
             content: contentString,
             boxStyle: {
                 background: 'blue',
                 opacity: 0.75,
                 width: "280px"
             }
         });

         marker.index = markers.length;

         google.maps.event.addListener(marker, 'click', function () {
             for (var m in markers) {
                 markers[m].infowindow.close();
             }
             this.infowindow.open(map, this);
         });
     }

     function showInfo(teams) {


         var mapOptions = {
             mapTypeControlOptions: {
                 mapTypeIds: ['Styled']
             },
             center: new google.maps.LatLng(44.40565, 8.946256),
             zoom: 3,
             mapTypeId: 'Styled'
         };

         map = new google.maps.Map(document.getElementById("map"), mapOptions);

         //         var styledMapType = new google.maps.StyledMapType(styles, {
         //             name: 'Cardinals Of The 2013 Conclave'
         //         });

         var styledMapType = new google.maps.StyledMapType(styles);

         map.mapTypes.set('Styled', styledMapType);

         teams.forEach(function (team) {

             team.players.forEach(function (player) {

                 var lat = player.Lat;

                 var longitude = player.Lng;

                 var position = new google.maps.LatLng(lat, longitude);

                 var cardinalRed = '#FFFFFF';

                 var marker = new google.maps.Marker({
                     position: position,
                     icon: {
                         path: google.maps.SymbolPath.CIRCLE,
                         fillOpacity: 0.6,
                         fillColor: cardinalRed,
                         strokeOpacity: 0.7,
                         strokeColor: cardinalRed,
                         strokeWeight: 1.5,
                         scale: 6 //pixels
                     },
                     map: map
                 });

                 createInfoWindow(marker, player, team);

                 markers.push(marker);
             })
         })
     }

     window.onload = function () {
         var teamlist = document.getElementById('teamlist');

         var xmlhttp = new XMLHttpRequest();

         var copa = './data/copa.json'

         xmlhttp.onreadystatechange = function () {
             if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                 var teams = JSON.parse(xmlhttp.responseText);

                 teams.sort(function (a, b) {
                     if (a.team < b.team) return -1;
                     if (a.team > b.team) return 1;
                     return 0;
                 })

                 teams.forEach(function (team) {
                     teamlist.appendChild(makeListItem(team));
                 })

                 showInfo(teams);
             };
         }

         xmlhttp.open("GET", copa, true);
         xmlhttp.send();



     }