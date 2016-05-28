     /* scheme 1 */

     var water = "#a0c4d5";
     var landscape = "#ffffff";
     var maplabel = "#a3a8ab";

     /* scheme 2 */

     var water = "#30acd2";
     var landscape = "#95d1e1";
     var maplabel = "#ffffff";

     /* scheme 3 */



     var landscape = "#3f3f3f";
     var water = "#212121";
     var maplabel = "#696969";


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

     function clearSelection() {
         var teamlist = document.getElementsByClassName('item');

         for (count = 0; count < teamlist.length; count++) {
             teamlist[count].style.border = 'none';
         }
     }

     function makePlayer(p, country) {

         var images = 'images/player/';

         var player = newDiv('player');
         var playerImage = document.createElement('img');
         playerImage.src = images + country + '.svg';
         playerImage.className = 'playericon';

         var label = newlabel('playerlabel');

         label.innerHTML = p.Name;

         player.appendChild(playerImage);
         player.appendChild(label);

         player.onclick = function () {
             showPlayer(p);
         }

         return player;
     }

     function makeListItem(team) {

         var item = newDiv('item');
         var flag = flagBlock(team.flag);
         var nation = nationBlock(team.team);

         var teaminfo = newDiv('teaminfo');
         teaminfo.appendChild(infoBlock('Avg Age', team.AverageAge));
         teaminfo.appendChild(infoBlock('Avg Height', team.AverageHeight));

         item.appendChild(flag);
         item.appendChild(nation);
         item.appendChild(teaminfo);

         item.onclick = function () {
             console.log('clicked ' + team.team);

             clearSelection();
             item.style.border = '1px solid #dd4131';

             showInfo([team], 3);

             var playerArea = document.getElementById('players');

             clearPlayers();

             var keeper = document.getElementById('Goalkeeper');
             var defender = document.getElementById('Defender');
             var midfielder = document.getElementById('Midfielder');
             var forward = document.getElementById('Forward');

             var count = 0;

             team.players.forEach(function (player) {

                 if (count < 23) {

                     var playerElement = makePlayer(player, team.team);
                     playerArea.appendChild(playerElement);

                     switch (player.Position) {

                     case 'Goalkeeper':
                         keeper.appendChild(playerElement);
                         break;

                     case 'Defender':
                         defender.appendChild(playerElement);
                         break;

                     case 'Midfielder':
                         midfielder.appendChild(playerElement);
                         break;

                     case 'Forward':
                         forward.appendChild(playerElement);
                         break;
                     }
                 }

                 count++;
             })
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


     function clearPlayers() {
         var keeper = document.getElementById('Goalkeeper');
         var defender = document.getElementById('Defender');
         var midfielder = document.getElementById('Midfielder');
         var forward = document.getElementById('Forward');

         keeper.innerHTML = "";
         defender.innerHTML = "";
         midfielder.innerHTML = "";
         forward.innerHTML = "";
     }

     function showPlayer(player) {
         var mapOptions = {
             mapTypeControlOptions: {
                 mapTypeIds: ['Styled']
             },
             center: new google.maps.LatLng(player.Lat, player.Lng),
             zoom: 5,
             mapTypeId: 'Styled'
         };

         map = new google.maps.Map(document.getElementById("map"), mapOptions);

         var styledMapType = new google.maps.StyledMapType(styles);

         map.mapTypes.set('Styled', styledMapType);

         var lat = player.Lat;

         var longitude = player.Lng;

         var position = new google.maps.LatLng(player.Lat, player.Lng);

         var cardinalRed = '#dd4131';

         var marker = new google.maps.Marker({
             position: position,
             icon: {
                 path: google.maps.SymbolPath.CIRCLE,
                 fillOpacity: 1,
                 fillColor: cardinalRed,
                 strokeOpacity: 1,
                 strokeColor: cardinalRed,
                 strokeWeight: 1,
                 scale: 3 //pixels
             },
             map: map
         });

         createInfoWindow(marker, player);

         markers.push(marker);
     }

     function showInfo(teams, zoom) {

         var mapzoom = 3;

         // 8.7832° S, 55.4915° W

         if (zoom) {
             mapzoom = zoom;
         }

         var mapOptions = {
             mapTypeControlOptions: {
                 mapTypeIds: ['Styled']
             },
             center: new google.maps.LatLng(8.7832, -55.4915),
             zoom: mapzoom,
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

                 var cardinalRed = '#dd4131';

                 var marker = new google.maps.Marker({
                     position: position,
                     icon: {
                         path: google.maps.SymbolPath.CIRCLE,
                         fillOpacity: 1,
                         fillColor: cardinalRed,
                         strokeOpacity: 1,
                         strokeColor: cardinalRed,
                         strokeWeight: 1,
                         scale: 2 //pixels
                     },
                     map: map
                 });

                 createInfoWindow(marker, player, team);

                 markers.push(marker);
             })
         })
     }

     function addGames() {

         var teamlist = document.getElementById('gamelist');

         for (g = 0; g < 20; g++) {
             var game = newDiv('game');
             gamelist.appendChild(game);
         }
     }

     window.onload = function () {
         var teamlist = document.getElementById('teamlist');

         var competitors = document.getElementById('competitors');

         var details = document.getElementById('details');

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

                 details.style.height = competitors.offsetHeight - 20 + 'px';

                 showInfo(teams);

                 addGames();
             };
         }

         xmlhttp.open("GET", copa, true);
         xmlhttp.send();



     }