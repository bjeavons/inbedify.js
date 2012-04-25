var request = require('request'),
    sys = require('util'),
    url = require('url'),
    http = require('http'),
    jsdom = require('jsdom');

function getPage (someUri, callback) {
  request({uri: someUri}, function (error, response, body) {
    debugger;
      console.log("Fetched " +someUri+ " OK!");
      callback(body);
    });
}

function modifyBody(uri, body, callback) {
  jsdom.env({
      html: body,
      scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
      done: function(errors, window, response) {
	$ = window.$;
	// Convert relative URLs to absolute.
	console.log('here be relative urls'+uri);
	// Rewrite same-domain URLs to run through InBedify.
	// "in bed"-ify
	$('h1').append(' in bed');
	//console.log(window.document.innerHTML);
	callback(window.document.innerHTML);
	//console.log('foo');
      }
  });
}

http.createServer(function (request, response) {
  requestedUri = url.parse(request.url).pathname;
  requestedUri = requestedUri.substring(1);
  console.log("Got request for " +requestedUri);
  if (!requestedUri.match('^http')) {
    console.log("requested URI is not a valid URL!  Dropping request...");
    response.writeHead(400, {"Content-Type": "text/html"})
    response.end("Invalid url");
  } else {
    getPage(requestedUri, function(body) {
      modifyBody(requestedUri, body, function(html) {
	response.writeHead(200, {"Content-Type": "text/html"}),
	response.end(html);
      });
    });
  }
}).listen(3000);

console.log("Server running at http://127.0.0.1:3000/");
