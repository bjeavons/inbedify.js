var sys = require('util'),
    url = require('url'),
    fs = require('fs'),
    htmlFile, favicon,
    express = require('express'),
    winston = require('winston'),
    request = require('request'),
    //fetch = require('./lib/fetcher'),
    inbed = require('./lib/inbedify');

fs.readFile('./static/inbed.html', function (err, data) {
  if (err) {
    htmlFile = 'Error';
  }
  htmlFile = data;
});
fs.readFile('./static/favicon.ico', function (err, data) {
  if (err) {
    favicon = '';
  }
  favicon = data;
});

function getPage(inbedURL, callback) {
  request({uri: inbedURL}, function (error, response, body) {
      winston.info('Fetched', { url: inbedURL.host });
      callback(body);
    });
}

function validate(inbedURL) {
  if (!inbedURL.match(/^http/)) {
    inbedURL = 'http://' + inbedURL;
  }
  inbedURL = url.parse(inbedURL)
  if (!inbedURL.host || !inbedURL.host.match(/\./)) {
    return false;
  }
  return inbedURL;
}

var app = require('express').createServer();

app.get('/', function(req, res) {
  if (typeof req.query.q == 'undefined') {
    res.contentType('html');
    res.send(htmlFile);
  }
  else {
    inbedURL = req.query.q;
    winston.info('Incoming request', { method: req.method, url: req.url });
    inbedURL = validate(inbedURL);
    if (!inbedURL) {
      res.send('Bad Request', 400);
    }
    else {
      getPage(inbedURL, function(body) {
        inbed.inbedify(body, function(html) {
          res.contentType('html');
          res.send(html);
        });
      });
    }
  }
});

app.get('/favicon.ico', function(req, res) {
  res.send(favicon);
});

app.get(/\/(.*)/, function(req, res) {
  inbedURL = req.params[0]
  winston.info('Incoming request', { method: req.method, url: req.url });
  inbedURL = validate(inbedURL);
  if (!inbedURL) {
    res.send('Bad Request', 400);
  }
  else {
    getPage(inbedURL, function(body) {
      inbed.inbedify(inbedURL, body, function(html) {
        res.contentType('html');
        res.send(html);
      });
    });
  }
});

app.get('*', function(req, res){
  res.send('Not Found', 404);
});

app.listen('3000');
console.log('server listening at http://127.0.0.1:3000');