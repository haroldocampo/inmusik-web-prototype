var express = require('express');
var request = require('request');
var fs = require('fs');
var http = require('http');
const app = express();
const spotify = require('spotify-web-api-node');
var spotifyClientId = '2fa6370449d5470f8b09881d9b455dc7';
var spotifyClientSecret = 'c4d8d7a7564b4192ab72392787540526';
var scopes = 'user-read-private user-read-email user-read-birthdate user-top-read playlist-read-private playlist-read-collaborative';
var authstring = 'Basic ' + Buffer.from((spotifyClientId + ':' + spotifyClientSecret)).toString('base64');

// credentials are optional
var spotifyApi = new spotify({
    clientId: spotifyClientId,
    clientSecret: spotifyClientSecret,
    redirectUri: 'http://localhost:9000'
});
app.use(express.static(__dirname + '/web'));

app.get('/', (req, res) => {
    if (!spotifyApi.getAccessToken()) {
        res.redirect('/login');
    }

    res.sendFile(__dirname + '/web/views/index.html');
});

app.get('/login', function (req, res) {

    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + spotifyClientId +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent('http://localhost:9000/getauthtoken'));
});

app.get('/getauthtoken', function (req, res) {
    request.post({
        "headers": { "content-type": "application/x-www-form-urlencoded", 'Authorization': authstring },
        "url": "https://accounts.spotify.com/api/token",
        "body": 'grant_type=authorization_code' +
            '&code=' + req.query.code +
            '&redirect_uri=' + encodeURIComponent('http://localhost:9000/getauthtoken')
    }, (error, response, body) => {
        var bod = JSON.parse(body);
        var token = bod.access_token;
        spotifyApi.setAccessToken(token);
        spotifyApi.setRefreshToken(bod.refresh_token);
        // Get the authenticated user
        res.redirect('/');
    });

});


app.get('/usertoptracks', (req, res) => {
    spotifyApi.getTopTracks('tracks')
        .then(function (data) {
            res.json(data.body);
        }, function (err) {
            console.log('Something went wrong!', err);
        });
});

app.get('/top50', (req, res) => {
    spotifyApi.getPlaylistTracks('37i9dQZEVXbMDoHDwVN2tF')
        .then(function (data) {
            res.json(data.body);
        }, function (err) {
            console.log('Something went wrong!', err);
        });
});

app.listen(9000, () => {
    console.log('ABC');
});