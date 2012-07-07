var request = require('request'),
    winston = require('winston');

var fetcher = exports = module.exports = {};

fetcher.get = function(url, callback) {
  request({uri: url}, function (error, response, body) {
    winston.info('Fetched', { url: url });
    callback(body);
  });
}

fetcher.url = function(url) {
  
}