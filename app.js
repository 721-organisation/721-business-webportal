var app = require('express')();
var http = require('http').createServer(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var request = require('request');
var fs = require('fs');
var io = require('socket.io')(http);

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
            console.log(res);
            cb(latLong);
        } else {
            console.log(err);
            cb(null);
        }
    });
};

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('newEventSubmitted', function(data){
        var eventData = data.event;
        var venueAddress = data.address;
        getLatLongFromAddress(venueAddress, function (latLong) {
            eventData.venueLat = latLong.latitude;
            eventData.venueLong = latLong.longitude;
            console.log(eventData);
        });
    });
});

http.listen(80, function () {
    console.log('listening on *:80');
});