var url = require('url'),
  jsdom = require('jsdom'),
  fs = require('fs');

var jquery = fs.readFileSync(__dirname + '/../static/jquery-1.6.2.min.js').toString();

var inbedify = function(inbedURL, body, callback) {
  var base = inbedURL.protocol + '//' + inbedURL.host + '/';
  jsdom.env({
      html: body,
      src: jquery,
      done: function(errors, window, response) {
        $ = window.$;
        // Convert relative URLs to absolute.
        $('link').each(function (i) {
          if ($(this).attr('href') && !$(this).attr('href').match(/^http/)) {
            $(this).attr('href', base + $(this).attr('href'));
          }
        });
        $('script').not('[class="jsdom"]').each(function (i) {
          if ($(this).attr('src') && (!$(this).attr('src').match(/^http/) || !$(this).attr('src').match(/^:\/\//))) {
            $(this).attr('src', base + $(this).attr('src'));
          }
        });
        $('style').each(function (i) {
          var st = $(this).text().match(/@import ?["\']\/(.*)/);
          if (st) {
            $(this).attr('src', base + st[1]);
          }
        });
        $('img').each(function (i) {
          if (!$(this).attr('src').match(/^http/)) {
            $(this).attr('src', base + $(this).attr('src'));
          }
        });
        // Rewrite same-domain URLs to run through InBedify.

        // "in bed"-ify
        $('h1').each(function(i) {
          inBedElement($(this), $);
        });
        $('h2').each(function(i) {
          inBedElement($(this), $);
        });
        $('h3').each(function(i) {
          inBedElement($(this), $);
        });
        callback(window.document.innerHTML);
      }
  });
}

var inBedElement = function (element, jQuery) {
  if (jQuery(element).find('a')) {
    element = jQuery(element).find('a');
  }
  var matches = jQuery(element).text().match(/(.*)([\?\.\!\*\)"])+/);
  if (matches) {
    element.text(matches[1] + ' in bed' + matches[2]);
  }
  //else if (element.text().match(/(.*)/)) { // stop empty header elements from being inbedified
  else {
    element.append(' in bed');
  }
}

module.exports.inbedify = inbedify