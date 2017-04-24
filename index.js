'use strict';
/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */

var config = require('./config.json');
var https = require('https');
var crypto = require('crypto');
var querystring = require('querystring');

exports.zadarmaCallback = function zadarmaCallback (req, res) {
  if (req.query.from  && req.query.to) {
    sendCallback(req.query.from, req.query.to);
    res.send(200);
  }
  res.send(404);
};

function sendCallback (from, to) {
  var method = '/v1/request/callback/';
  var secret = config.SECRET;
  var userKey = config.USER_KEY;
  var paramsStr = querystring.stringify({ from: from, sip: from, to: '+' + to });
  var md5 = crypto.createHash('md5').update(paramsStr).digest("hex");

  var hex = crypto.createHmac('sha1', secret)
                   .update(method + paramsStr + md5)
                   .digest("hex");

  var sign = new Buffer(hex).toString('base64');

  var header = userKey + ':' + sign;

  var path = '/v1/request/callback/?' + paramsStr;

  var options = {
    hostname: 'api.zadarma.com',
    path: path,
    method: 'GET',
    headers: {
      Authorization: header
    },
  };

  var req = https.request(options, function (res) {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', function (d) {
      process.stdout.write(d);
    });
  });

  req.on('error', function (e) {
    console.error(e);
  });
  req.end();
}
