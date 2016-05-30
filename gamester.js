var request = require('request');
fs = require('fs');
var moment = require('moment');
var cheerio = require('cheerio');


var url = 'http://www.ca2016.com/matches';

request(url, function (error, response, html) {
    if (!error) {

        var set = [];

        var scan = cheerio.load(html);

        var matches = scan('.match');

        matches.each(function (i, element) {

            var date = element.children[0].next.children[0].data;

            var home = element.children[3].children[2].next.children[1].children[1].children[1].children[0].data

            var away = '';

            if (element.children[3].children[2].next.children[1].children[4] !== undefined) {




                away = element.children[3].children[2].next.children[1].children[4].next.children[3].children[0].data;
            }

            var location = element.children[3].children[5].children[1].children[0].data;

            console.log('' + home + ' v ' + away + ', ' + location + ', ' + date);
        })
    }
})