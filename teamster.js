var wikipedia = require("node-wikipedia");
var request = require('request');
fs = require('fs');
var moment = require('moment');

var cheerio = require('cheerio');

var template = {
    "shirt": {
        "colors": [""],
        "style": ""
    },
    "shorts": "",
    "socks": "",
    "coach": ""
};

function newTeam(name, id) {
    var team = template;
    team.name = name;
    team.id = id;
    return team;
}

function structure(team) {
    team.shirt = {
        colors: [],
        style: ''
    };
    team.shorts = '';
    team.socks = '';
    team.coach = '';
}

var teams = [{
        team: 'Argentina',
        id: 202,
        flag: 'ar'
    }, {
        team: 'Brazil',
        id: 205,
        flag: 'br'
    },
    {
        team: 'United-States',
        id: 660,
        flag: 'us'
    },
    {
        team: 'Chile',
        id: 207,
        flag: 'cl'
    },
    {
        team: 'Bolivia',
        id: 204,
        flag: 'bo'
    },
    {
        team: 'Costa-Rica',
        id: 214,
        flag: 'cr'
    },
    {
        team: 'Ecuador',
        id: 209,
        flag: 'ec'
    },
    {
        team: 'Haiti',
        id: 2654,
        flag: 'ht'
    },
    {
        team: 'Jamaica',
        id: 1038,
        flag: 'jm'
    },
    {
        team: 'Panama',
        id: 2659,
        flag: 'pa'
    },
    {
        team: 'Paraguay',
        id: 210,
        flag: 'py'
    },
    {
        team: 'Peru',
        id: 211,
        flag: 'pe'
    },
    {
        team: 'Venezuela',
        id: 213,
        flag: 've'
    },
    {
        team: 'Mexico',
        id: 203,
        flag: 'mx'
    },
    {
        team: 'Colombia',
        id: 208,
        flag: 'co'
    },
    {
        team: 'Uruguay',
        id: 212,
        flag: 'uy'
    }];

var filename;

teams.forEach(function (team) {
    buildTemplate(team)
});

function newPlayer(name) {

    var player = {
        Name: name
    }

    return player;
}

function cleanPlayers(set) {
    var newArray = [];
    for (var i = 0; i < set.length; i++) {
        if (set[i] !== undefined && set[i] !== null && set[i] !== "") {
            newArray.push(set[i]);
        }
    }
    return newArray;
}

var prefix = 'https://en.wikipedia.org';


function parseDMS(input) {
    var parts = input.split(/[^\d\w]+/);

    var point;

    if (parts.length === 8) {
        var lat = convertDMSToDD(parts[0], parts[1], parts[2], parts[3]);
        var lng = convertDMSToDD(parts[4], parts[5], parts[6], parts[7]);
    } else if (parts.length === 6) {
        var lat = convertDMSToDD(parts[0], parts[1], '0', parts[2]);
        var lng = convertDMSToDD(parts[3], parts[4], '0', parts[5]);
    }

    if (lat != null && lng != null) {
        point = {
            "lat": lat,
            "lng": lng
        };
    }

    return point;
}


function convertDMSToDD(degrees, minutes, seconds, direction) {

    degrees = parseInt(degrees);
    minutes = parseInt(minutes);
    seconds = parseInt(seconds);

    var dd = degrees + minutes / 60 + seconds / (60 * 60);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}

function write() {
    var output = JSON.stringify(teams);
    filename = './public/data/copa.json';
    fs.writeFile(filename, output, function () {})
}

function calculateAverages() {

    console.log('calculating averages');

    teams.forEach(function (team) {

        var ages = 0;
        var heights = 0;
        var agecount = 0;
        var heightcount = 0;

        team.players.forEach(function (player) {

            if (player.Age != undefined) {
                ages = ages + parseInt(player.Age);
                agecount++;
            }

            if (player.Height != undefined) {
                heights = heights + parseInt(player.Height);
                heightcount++;
            }
        });

        team.AverageAge = Math.round(ages / agecount);
        team.AverageHeight = Math.round(heights / heightcount);

        console.log('Average Age: ' + team.AverageAge);
    });

    write();
}

function buildLatLng(geo, player) {

    request(geo, function (error, georesponse, geohtml) {
        if (!error) {
            var geoscan = cheerio.load(geohtml);

            var latdegrees = geoscan('.latitude');
            var longdegrees = geoscan('.longitude');

            if (latdegrees != undefined && longdegrees != undefined) {

                if (latdegrees[0] != undefined && longdegrees[0] != undefined) {

                    var lat = latdegrees[0].children[0].data;
                    var lng = longdegrees[0].children[0].data;

                    var latlng = parseDMS(lat + ' ' + lng);

                    if (latlng != undefined) {
                        player.Lat = latlng.lat;
                        player.Lng = latlng.lng;
                    } else {
                        console.log('Failed to find coordinates for: ' + player.Name);
                    }
                }
            }

            calculateAverages();
        }
    })
}

function calculateAge(birthdate) {
    var age;
    return age;
}

function buildPlayerData(player) {

    var url = prefix + '/wiki/' + player.Wikipedia;

    console.log('Building data for: ' + player.Name);

    request(url, function (error, response, html) {
        if (!error) {

            var scan = cheerio.load(html);

            var geo;

            scan('.bday').each(function (i, element) {
                player.BirthDate = element.children[0].data;

                if (player.Name === 'Derlis González') {
                    player.BirthDate = '1994-03-23';
                }

                player.Age = moment().diff(player.BirthDate, 'years');
            });

            console.log('Added birth data for: ' + player.Name);

            scan('.birthplace').each(function (i, place) {

                if (place != undefined && place.children != undefined && place.children[0].children != undefined) {

                    player.Home = place.children[0].children[0].data;
                    geo = place.children[0].attribs.href;
                }

                if (place.parent.next.next != undefined) {

                    var size = place.parent.next.next.children[1].next.next.children[0].data;

                    if (size != undefined) {

                        var regexp = /1.[0-9][0-9]/gi;
                        var matches = size.match(regexp);

                        if (matches != undefined && matches[0] != undefined) {

                            player.Height = parseFloat(matches[0]) * 100;
                        }
                    }
                }
            });

            console.log('Added birth place for: ' + player.Name);

            var org = scan('.org');
            if (org != undefined) {
                if (org[0] != undefined) {
                    if (org[0].children != undefined) {
                        if (org[0].children[0] != undefined) {
                            if (org[0].children[0].children != undefined) {
                                if (org[0].children[0].children[0] != undefined) {
                                    player.Club = org[0].children[0].children[0].data;
                                }
                            }
                        }
                    }
                }
            }

            var geourl = prefix + geo;
            var coordinates = buildLatLng(geourl, player);
        }
    });
}

function buildTemplate(team) {

    console.log('Building template for: ' + team.team);

    var url = 'http://www.espnfc.us/team/' + team.team + '/' + team.id + '/squad';

    request(url, function (error, response, html) {
            if (!error) {

                var set = [];

                var scan = cheerio.load(html);

                var players = scan('.pla')

                players.each(function (i, element) {

                        if (element.attribs['data-value']) {

                            if (newPlayer(element.attribs['data-value']) != null) {
                                set[i] = newPlayer(element.attribs['data-value']);

                                if (set[i].Name === 'Óscar Romero') {
                                    set[i].Wikipedia = 'Óscar_Romero_(footballer)';
                                } else if set[i].Name = 'José Velázquez') {
                                set[i].Wikipedia = 'José_Manuel_Velázquez';
                            } else {
                                set[i].Wikipedia = set[i].Name.replace(/ /g, "_");
                            }
                        }
                    }
                });

            var positions = scan('.pos')

            positions.each(function (i, element) {

                if (element.children[0].data) {

                    switch (element.children[0].data) {
                    case 'G':
                        set[i].Position = 'Goalkeeper';
                        break;

                    case 'D':
                        set[i].Position = 'Defender';
                        break;

                    case 'M':
                        set[i].Position = 'Midfielder';
                        break;

                    case 'F':
                        set[i].Position = 'Forward';
                        break;
                    }
                }
            });

            structure(team);

            //            var thisTeam = newTeam(team.team, team.id);

            team.players = cleanPlayers(set);

            team.players.forEach(function (player) {
                buildPlayerData(player)
            });
        }
    });
}