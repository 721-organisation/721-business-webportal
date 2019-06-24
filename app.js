var app = require('express')();
var http = require('http').createServer(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var request = require('request');
var fs = require('fs');
var io = require('socket.io')(http);
var userDetails = JSON.parse(fs.readFileSync('loginDetails.json', 'utf8'));


var googleAccessToken = fs.readFileSync('googleAccessToken', 'utf8');

var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: googleAccessToken, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

// Using callback
var getLatLongFromAddress = function (address, cb) {
    geocoder.geocode(address, function (err, res) {
        var latLong =
            {
                latitude: 0,
                longitude: 0,
            };

        if (err === null) {
            latLong.latitude = res[0].latitude;
            latLong.longitude = res[0].longitude;
            cb(latLong);
        } else {
            cb(null);
        }
    });
};

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('newEventSubmitted', function (data) {
        var eventData = data.event;
        var venueAddress = data.address;
        getLatLongFromAddress(venueAddress, function (latLong) {
            eventData.venueLat = latLong.latitude;
            eventData.venueLong = latLong.longitude;
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 16;
            var randomstring = '';
            for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
            }
            eventData.eventSourceId = randomstring;
            eventData.eventSourceTag = "BUSINESS";
            console.log("test");
            try {
                var request = require("request");

                var options = {
                    method: 'POST',
                    url: 'https://temp-243314.appspot.com/api/Users/login',
                    headers:
                        {
                            'cache-control': 'no-cache',
                            Connection: 'keep-alive',
                            'accept-encoding': 'gzip, deflate',
                            Accept: '*/*',
                            'Content-Type': 'application/json'
                        },
                    body: {email: userDetails.email, password: userDetails.password},
                    json: true
                };

                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                    var accessToken = body.id;
                    var settings = { method: 'POST',
                        url: 'https://temp-243314.appspot.com/api/requestedEvents',
                        qs: { access_token: accessToken },
                        headers:
                            { 'cache-control': 'no-cache',
                                Connection: 'keep-alive',
                                'accept-encoding': 'gzip, deflate',
                                Accept: '*/*',
                                'Content-Type': 'application/json' },
                        body: eventData,
                        json: true };

                    request(settings, function (error, response, b)  {
                        if (error) throw new Error(error);
                        console.log(b);
                    });
                });

            } catch (error) {
                console.log(error);
            }
        });
    });
    socket.on('newHiddenGemSubmitted', function (data) {
        var hiddenGemData = data.event;
        var venueAddress = data.address;
        getLatLongFromAddress(venueAddress, function (latLong) {
            hiddenGemData.venueLat = latLong.latitude;
            hiddenGemData.venueLong = latLong.longitude;
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 16;
            var randomstring = '';
            for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
            }
            hiddenGemData.eventSourceId = randomstring;
            hiddenGemData.eventSourceTag = "BUSINESS";
            console.log("test");
            try {
                var request = require("request");

                var options = {
                    method: 'POST',
                    url: 'https://temp-243314.appspot.com/api/Users/login',
                    headers:
                        {
                            'cache-control': 'no-cache',
                            Connection: 'keep-alive',
                            'accept-encoding': 'gzip, deflate',
                            Accept: '*/*',
                            'Content-Type': 'application/json'
                        },
                    body: {email: userDetails.email, password: userDetails.password},
                    json: true
                };

                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                    var accessToken = body.id;
                    var settings = { method: 'POST',
                        url: 'https://temp-243314.appspot.com/api/requestedHiddenGem',
                        qs: { access_token: accessToken },
                        headers:
                            { 'cache-control': 'no-cache',
                                Connection: 'keep-alive',
                                'accept-encoding': 'gzip, deflate',
                                Accept: '*/*',
                                'Content-Type': 'application/json' },
                        body: hiddenGemData,
                        json: true };

                    request(settings, function (error, response, b)  {
                        if (error) throw new Error(error);
                        console.log(b);
                    });
                });

            } catch (error) {
                console.log(error);
            }
        });
    });
});

http.listen(80, function () {
    console.log('listening on *:80');
});