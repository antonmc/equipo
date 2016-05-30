var request = require('request');
fs = require('fs');
var moment = require('moment');
var cheerio = require('cheerio');

var games = [];

var url = 'http://www.ca2016.com/matches';

function write() {
    var output = JSON.stringify(games);
    filename = './public/data/games.json';
    fs.writeFile(filename, output, function () {})
}

request(url, function (error, response, html) {
    if (!error) {



        var scan = cheerio.load(html);

        var matches = scan('.match');

        matches.each(function (i, element) {

            var date = element.children[0].next.children[0].data;

            var home = element.children[3].children[2].next.children[1].children[1].children[1].children[0].data

            var away = '';

            if (element.children[3].children[2].next.children[1].children[4] !== undefined) {

                var location = element.children[3].children[5].children[1].children[0].data;
                away = element.children[3].children[2].next.children[1].children[4].next.children[3].children[0].data;

                if (home === 'USA') {
    home = 'United-States';
}

if (away === 'USA') {
    away = 'United-States';
}

                if (home === 'Costa Rica') {
                    home = 'Costa-Rica';
                }

                if (away === 'Costa Rica') {
                    away = 'Costa-Rica';
                }

                game = {
                    'home': home,
                    'away': away,
                    'location': location,
                    'date': date
                }

                console.log(game);

                games.push(game);


            }
        })

        write();

    }
})