 var markers = [];
 var clubs;
 var allteams;
 var migrations = false;
 var selected = null;
 var selectedColor = '#dd4131';
 var styles;

 function newElement(classname, content, type) {
     var element = document.createElement(type);
     element.className = classname;
     if (content) {
         element.innerHTML = content;
     }
     return element;
 }

 function newDiv(classname, content) {
     var div = newElement(classname, content, 'div');
     return div;
 }

 function newlabel(classname, content) {
     var label = newElement(classname, content, 'label');
     return label;
 }

 function flagBlock(flagImage) {
     var flag = document.createElement('img');
     flag.src = './flags/4x3/' + flagImage + '.svg';
     flag.className = 'flag';
     return flag;
 }

 function flagBlockSmall(flagImage) {
     var flag = document.createElement('img');
     flag.src = './flags/1x1/' + flagImage + '.svg';
     flag.className = 'flagSmall';
     return flag;
 }

 function nationBlock(name, flagImage) {
     var nation = newDiv('nation');
     var teamname = newlabel('teamname', name);
     nation.appendChild(teamname);
     return nation;
 }

 function infoBlock(words, value, color) {
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
         teamlist[count].style.opacity = 0.3;
     }
 }

 function makePlayer(p, team) {

     var images = 'images/player/';

     var player = newDiv('player');

     var playerImage = document.createElement('img');
     playerImage.src = images + team.team + '.svg';
     playerImage.className = 'playericon';

     var label = newlabel('playerlabel');

     label.innerHTML = p.Name;

     player.appendChild(playerImage);
     player.appendChild(label);

     player.onclick = function () {
         showPlayer(p, team);
     }

     return player;
 }

 function displayTeamArea() {


     var geoArea = document.getElementById('geoArea');

     var currentHeight = geoArea.style.height;
     geoArea.style.height = currentHeight - 200 + 'px';
     geoArea.style.minHeight = currentHeight - 200 + 'px';

     var teamArea = document.getElementById('teamArea');
     teamArea.style.visibility = 'visible'; //     teamArea.style.height = '200px';
     teamArea.style.minHeight = '200px';

 }

 function hideTeamArea() {
     var teamArea = document.getElementById('teamArea');
     teamArea.style.visibility = 'hidden';

     var geoArea = document.getElementById('geoArea');

     var currentHeight = geoArea.style.height;
     //     geoArea.style.height = currentHeight + 200 + 'px';//     geoArea.style.minHeight = currentHeight + 200 + 'px';

     //     var currentHeight = geoArea.style.height;//     geoArea.style.height = screen.height * 0.85 + 'px';
     //     geoArea.style.minHeight = screen.height * 0.85 + 'px';

     //     window.resizeTo(
     //         window.screen.availWidth window.screen.availHeight
     //     );

     //     var geoArea = document.getElementById('geoArea');
     //     geoArea.style.height = '90%';
     //     geoArea.style.minHeight = '90%';

     //     var details = document.getElementById('details');//     details.style.height = competitors.offsetHeight - 90 + 'px';
 }

 function makeListItem(team, teams) {

     var item = newDiv('item');
     var flag = flagBlock(team.flag);
     var nation = nationBlock(team.team);

     var teaminfo = newDiv('teaminfo');
     teaminfo.style.color = team.shirt.colors[0];

     var age = infoBlock('Avg Age', team.AverageAge, team.shirt.colors[0]);

     var height = infoBlock('Avg Height', team.AverageHeight, team.shirt.colors[0]);

     teaminfo.appendChild(age);
     teaminfo.appendChild(height);

     item.appendChild(flag);
     item.appendChild(nation);
     item.appendChild(teaminfo);

     item.onclick = function () {

         console.log('clicked ' + team.team);

         displayTeamArea();

         clearSelection();
         item.style.border = '1px solid #' + team.shirt.colors[0];
         item.style.opacity = 1;

         var lead = document.getElementById('lead');
         var leadb = document.getElementById('leadb');

         lead.style.color = '#' + team.shirt.colors[0];
         leadb.style.color = '#' + team.shirt.colors[0];

         var title = document.getElementById('title');
         title.style.color = '#' + team.shirt.colors[0];

         var about = document.getElementById('about');
         about.style.color = '#' + team.shirt.colors[0];

         title.innerHTML = 'Players of Copa America 2016 - ' + '<b>' + team.team + '</b>';

         var playerArea = document.getElementById('players');

         clearPlayers();

         var squad = getSquad();
         colorTypes(team.shirt.colors[0]);

         team.players.forEach(function (player) {
             var playerElement = makePlayer(player, team);
             playerArea.appendChild(playerElement);
             squad[player.Position].appendChild(playerElement);
             count++;
         })

         //         var details = document.getElementById('details');//         details.style.height = geoArea.offsetHeight - 110 + 'px';

         selected = [team];

         selectedColor = '#' + team.shirt.colors[0];

         showInfo(5);

         addGames(teams, team.team);
     }

     return item;
 }

 function colorTypes(color) {

     var newcolor = '#' + color;
     var newline = '1px solid ' + newcolor;

     var types = ['gtype', 'dtype', 'mtype', 'ftype'];

     types.forEach(function (type) {
         var t = document.getElementById(type);
         t.style.borderTop = newline;
         t.style.color = newcolor;
     })
 }

 function initMap() {
     // Create a map object and specify the DOM element for display.

     var mapElement = document.getElementById('map');

     var map = new google.maps.Map(mapElement, {
         center: {
             lat: -34.397,
             lng: 150.644
         },
         scrollwheel: false,
         zoom: 8
     });
     var mapElement = document.getElementById('map');
     var details = document.getElementById('details');
     mapElement.style.height = details.offsetHeight - 90 + 'px';
 }

 function createInfoWindow(marker, data, team) {

     var contentString = '<div id="content">' +
         '<h2 id="firstHeading" class="firstHeading">' + data.Name + '</h2>' +
         '<div id="bodyContent">' +
         '<p><b>' + data.Position + '</b></p>' +
         '<p><b>Nationality:</b> ' + team.team + '</p>' +
         '<p><b>Club:</b> ' + data.Club + '</p>' +
         '<p><b>Birth Place:</b> ' + data.Home + '</p>' +
         '<p><b>Birthday:</b> ' + data.BirthDate + '</p>' +
         '<p><b>Age:</b> ' + data.Age + '</p>' +
         '<p><b>Height:</b> ' + data.Height + '</p>' +
         '<p><a target="_blank" href=' + data.Wikipedia + '> Biography </a></p > ' +
         '<p><a target="_blank" href="https://twitter.com/search?q=' + encodeURIComponent(data.Name) + '">Social Comments</a></p>' +
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

     return marker.infowindow;
 }

 function getSquad() {
     var squad = [];
     squad['Goalkeeper'] = document.getElementById('Goalkeeper');
     squad['Defender'] = document.getElementById('Defender');
     squad['Midfielder'] = document.getElementById('Midfielder');
     squad['Forward'] = document.getElementById('Forward');
     return squad;
 }

 function clearPlayers() {
     var squad = getSquad();
     for (var key in squad) {
         squad[key].innerHTML = ""
     }
 }

 function createPin(map, player, team, color, scale, window) {

     var position = new google.maps.LatLng(player.Lat, player.Lng);

     var marker = new google.maps.Marker({
         position: position,
         icon: {
             path: google.maps.SymbolPath.CIRCLE,
             fillOpacity: 1,
             fillColor: color,
             strokeOpacity: 1,
             strokeColor: color,
             strokeWeight: 1,
             scale: scale
         },
         map: map
     });

     var infoWindow = createInfoWindow(marker, player, team);

     if (window === true) {
         infoWindow.open(map, marker);
     }

     showMigrations(player, map, color);

     markers.push(marker);
 }

 function createMap(details) {

     var map;

     var anchor = document.getElementById(details.anchor);

     var mapOptions = {
         mapTypeControlOptions: {
             mapTypeIds: ['Styled']
         },
         center: new google.maps.LatLng(details.lat, details.lng),
         zoom: details.zoom,
         mapTypeId: 'Styled'
     };

     map = new google.maps.Map(anchor, mapOptions);

     var styledMapType = new google.maps.StyledMapType(styles, {
         name: details.label
     });

     map.mapTypes.set('Styled', styledMapType);
     //     var anchor = document.getElementById(details.anchor);
     //     var details = document.getElementById('details');
     //     anchor.style.height = details.offsetHeight + 'px';

     resizeMap();

     return map;
 }

 function showPlayer(player, team) {

     var color = '#' + team.shirt.colors[0];

     var mapObject = {
         anchor: "map",
         style: styles,
         lat: team.center[0],
         lng: team.center[1],
         label: player.Name,
         zoom: 5
     }

     var map = createMap(mapObject);
     createPin(map, player, team, color, 6, true);
 }

 function showMigrations(player, map, teamcolor) {
     if (migrations === true) {

         clubs.forEach(function (club) {

             if (player.Club === club.name) {

                 if (club.lat && club.lng && player.Lat && player.Lng) {

                     var flightPlanCoordinates = [{
                             lat: player.Lat,
                             lng: player.Lng
                                              },
                         {
                             lat: club.lat,
                             lng: club.lng
                                              }];

                     var lineSymbol = {
                         path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                     };

                     var flightPath = new google.maps.Polyline({
                         path: flightPlanCoordinates,
                         icons: [{
                             icon: lineSymbol,
                             scale: 4,
                             offset: '100%'
                                             }],
                         geodesic: true,
                         strokeColor: teamcolor,
                         strokeOpacity: 0.5,
                         strokeWeight: 1
                     });

                     flightPath.setMap(map);
                 }
             }
         })
     }
 }

 function showInfo(zoom) {

     teams = selected;

     var scale = 3;

     var mapObject = {
         anchor: "map",
         style: styles,
         lat: 8.7832,
         lng: -55.4915,
         label: 'Players of Copa America',
         zoom: 3
     }

     if (zoom) {
         mapObject.zoom = zoom;
         mapObject.lat = teams[0].center[0];
         mapObject.lng = teams[0].center[1];
         mapObject.label = teams[0].team;
         scale = 4;
     }

     var map = createMap(mapObject);

     var mappedPlayers = 0;

     var teamcolor = selectedColor;

     teams.forEach(function (team) {
         team.players.forEach(function (player) {

             if (zoom) {
                 teamcolor = '#' + team.shirt.colors[0];
             }

             createPin(map, player, team, teamcolor, scale);

             mappedPlayers++;
         })
     })

     console.log('Mapped Players: ' + mappedPlayers);
 }

 function getFlag(teams, team) {

     var flag;

     teams.forEach(function (t) {

         if (team === t.team) {
             flag = t.flag;
         }

     })

     return flag;
 }

 function buildGame(teams, data) {
     var game = newDiv('game');

     var nations = newDiv('nations');

     var home = newDiv('nation');

     var homeflag = newDiv('teamFlag');
     var hflag = getFlag(teams, data.home);
     homeflag.appendChild(flagBlockSmall(hflag));

     var homeName = newDiv('teamName');
     homeName.innerHTML = data.home;

     home.appendChild(homeflag);
     home.appendChild(homeName);

     var away = newDiv('nation');

     var awayflag = newDiv('teamFlag');

     var aflag = getFlag(teams, data.away);
     awayflag.appendChild(flagBlockSmall(aflag));

     var awayName = newDiv('teamName');
     awayName.innerHTML = data.away;

     away.appendChild(awayflag);
     away.appendChild(awayName);

     var versus = newDiv('versus');
     versus.innerHTML = 'v';

     nations.appendChild(home);
     nations.appendChild(versus);
     nations.appendChild(away);

     game.appendChild(nations);

     var matchdate = newDiv('matchdate');
     matchdate.innerHTML = data.date;

     var matchlocation = newDiv('matchlocation');
     matchlocation.innerHTML = data.location;

     game.appendChild(matchdate);
     game.appendChild(matchlocation);

     game.onclick = function (element) {

         console.log(element);

         console.log('clicked ' + data.home + ' v ' + data.away);

         var match = [];

         teams.forEach(function (team) {
             if (team.team === data.home || team.team === data.away) {
                 match.push(team);
             }
         })

         selected = match;
         //         hideTeamArea();
         display(3);
         element.target.style.border = '1px solid #' + selectedColor;
         element.target.style.opacity = 1;
     }

     return game;
 }

 function showClub(choice) {

     var clubselect = document.getElementById('clubselect');

     var clubplayers = [];

     teams.forEach(function (team) {
         team.players.forEach(function (player) {

             player.Team = team.team;

             if (player.Club === clubselect.value) {
                 clubplayers.push(player);
             }
         })
     })

     clubs.forEach(function (club) {

         if (club.name == clubselect.value) {

             var mapObject = {
                 anchor: "map",
                 style: styles,
                 lat: club.lat,
                 lng: club.lng,
                 label: "Players from " + clubselect.value,
                 zoom: 2
             }

             var map = createMap(mapObject);

             clubplayers.forEach(function (player) {
                 var teamcolor = selectedColor;
                 createPin(map, player, player.Team, teamcolor, 2);
             })
         }
     })

     console.log("Number of players at: " + clubselect.value + " = " + clubplayers.length);
 }

 function loadClubData() {

     var clublist = './data/clubs.json'

     get('./data/clubs.json', function (c) {

         clubs = c;

         clubs.sort(function (a, b) {
             if (a.name < b.name) return -1;
             if (a.name > b.name) return 1;
             return 0;
         })

         console.log("Club count: " + clubs.length);

         var coordinatated = 0;

         var clubselect = document.getElementById('clubselect');

         var option = document.createElement('option');
         option.innerHTML = "All Clubs";
         clubselect.appendChild(option);

         clubs.forEach(function (item) {

             if (item.lat != undefined) {
                 option = newElement('', item.name, 'option');
                 clubselect.appendChild(option);
                 coordinatated++;
             }
         });

         reset();

         console.log("Clubs with coordinates: " + coordinatated);

         console.log("Coverage percentage: " + 100 / clubs.length * coordinatated);
     })
 }

 function addGames(teams, chosen) {

     var teamlist = document.getElementById('gamelist');

     teamlist.innerHTML = "";

     var games = './data/games.json'

     get('./data/games.json', function (data) {
         data.forEach(function (item) {
             if (chosen) {
                 if (chosen === item.home || chosen === item.away) {
                     var game = buildGame(teams, item)
                     gamelist.appendChild(game);
                 }
             } else {
                 var game = buildGame(teams, item)
                 gamelist.appendChild(game);
             }
         });
     });
 }

 function toggle(context) {

     if (migrations === false) {
         migrations = true;
     } else {
         migrations = false
     };

     display();
 }

 function display(zoom) {

     teamlist.innerHTML = '';

     selected.forEach(function (team) {
         teamlist.appendChild(makeListItem(team, selected));
     })

     if (selected.team != undefined) {
         addGames(allteams, selected.team);
     } else {
         addGames(allteams);
     }

     showInfo(zoom);
 }

 function get(path, callback) {
     var xmlhttp = new XMLHttpRequest();
     xmlhttp.onreadystatechange = function () {
         if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
             callback(JSON.parse(xmlhttp.responseText));
         }
     }
     xmlhttp.open("GET", path, true);
     xmlhttp.send();
 }

 function reset() {

     var competitors = document.getElementById('competitors');

     clubselect.value = "All Clubs";

     hideTeamArea();

     get('./data/copa.json', function (teams) {

         allteams = teams;

         teams.sort(function (a, b) {
             if (a.team < b.team) return -1;
             if (a.team > b.team) return 1;
             return 0;
         })

         selected = teams;
         display();
     })
 }

 function mapStyle() {
     get('./data/styles.json', function (data) {
         styles = data;
         loadClubData();
     })
 }

 function resizeMap() {
     var anchor = document.getElementById('map');
     var location = document.getElementById('location');

     if (window.innerWidth > 1200) {
         anchor.style.height = location.offsetHeight - 90 + 'px';
     } else {
         anchor.style.height = location.offsetHeight + 'px';
     }
 }

 function reload() {
     location.reload();
 }

 window.onload = mapStyle;

 window.onresize = resizeMap;