var GoogleSpreadsheet = require('google-spreadsheet');

var request = require('request');
fs = require('fs');
var moment = require('moment');

var cheerio = require('cheerio');
//var async = require('async');

// spreadsheet key is the long id in the sheets URL 

// copa america

//var doc = new GoogleSpreadsheet('1YsH-_xA2naXgdIA9WeZJ5_G1TQToGispLtGisa2mok0');

var doc = new GoogleSpreadsheet('18TnvRyU2rHwt2xyUfH97nkOaRHhG-K7u3kht7MSiRv0');

var sheet;

var teams;
var info;

var clubs = [];

function writeClubs() {
    var uniqueClubs = [];

    for (var i in clubs) {
        if (uniqueClubs.indexOf(clubs[i]) === -1) {
            uniqueClubs.push(clubs[i]);
        }
    }

    var clublist = []

    uniqueClubs.forEach(function (club) {

        var clubObject = {
            'name': club
        };

        clublist.push(clubObject);

    })

    output = JSON.stringify(clublist);
    filename = './public/data/clubs.json';
    fs.writeFile(filename, output, function () {})
}

function write() {
    var output = JSON.stringify(teams);
    filename = './public/data/euro.json';
    fs.writeFile(filename, output, function () {})
}


fs = require('fs')
fs.readFile('public/data/euro-teams.json', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    teams = JSON.parse(data);
    getInfoAndWorksheets();
});

function getInfoAndWorksheets(step) {
    doc.getInfo(function (err, info) {
        console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
        sheet = info.worksheets[0];


        info.worksheets.forEach(function (squad) {


                teams.forEach(function (team) {

                    if (team.team === squad.title) {

                        workWithRows(squad, team);
                    }
                })
            })
            //
            //        console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount);
    });
}

//getInfoAndWorksheets();

function workWithRows(sheet, team) {
    // google provides some query options 

    team.players = [];
    sheet.getRows({
        offset: 1,
        limit: 23
    }, function (err, rows) {
        rows.forEach(function (row) {

            var player = {
                'Name': row.name
            }


            if (row._cpzh4) {
                player.Wikipedia = row._cpzh4;
            } else if (row.wikipedia) {
                player.Wikipedia = row.wikipedia;
            }


            player.Position = presentPosition(row.position);

            if (row.birthday) {

                var age = row.birthday.split(' (');

                player.BirthDate = age[0];

                age = age[1].split('age ');
                age = age[1].split(')');

                player.Age = parseInt(age[0]);

            }

            player.Club = row.club;

            clubs.push(row.club);

            var index = sheet.length;

            team.players.push(player);

            buildPlayerData(player);
        })
    });
}


function presentPosition(pos) {

    var position;

    switch (pos) {
    case 'GK':
        position = 'Goalkeeper';
        break;

    case 'DF':
        position = 'Defender';
        break;

    case 'MF':
        position = 'Midfielder';
        break;

    case 'FW':
        position = 'Forward';
        break;
    }

    return position;

}

function calculateAverages() {

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
    });

    write();
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

var prefix = 'https://en.wikipedia.org';

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

function buildPlayerData(player) {

    console.log(player.Name);

    var url = player.Wikipedia;

    request(url, function (error, response, html) {
        if (!error) {

            var scan = cheerio.load(html);

            var geo;

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

            //            calculateAverages();
        }
    });
}