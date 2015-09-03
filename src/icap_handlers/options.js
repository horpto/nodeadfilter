"strict"

var config = require('../config/config');

module.exports.request = function request(icapReq, icapRes, next) {
  icapRes.setIcapStatusCode(200);
  icapRes.setIcapHeaders({
    'Service': config.service,
    'ISTag': '5BDEEEA9-12E4-2', // got from RFC3507
    'Methods': 'REQMOD',

    'Preview': '0',
    'Transfer-Preview': '*',
    'Options-TTL': 3600,
    'Max-Connections': '100',
    'Allow': '204'
  });
  icapRes.writeHeaders(false);
  icapRes.end();
};

module.exports.response = function response(icapReq, icapRes, next) {
  icapRes.setIcapStatusCode(200);
  icapRes.setIcapHeaders({
    'Service': config.service,
    'ISTag': '5BDEEEA9-12E4-2', // got from RFC3507
    'Methods': 'RESPMOD',

    'Preview': '0',
    'Transfer-Preview': '*',
    'Options-TTL': 3600,
    'Max-Connections': '100',
    'Allow': '204'
  });
  icapRes.writeHeaders(false);
  icapRes.end();
};

module.exports.other = function other(icapReq, icapRes, next) {
  if (!icapRes.done) {
    icapRes.setIcapStatusCode(404);
    icapRes.writeHeaders(false);
    icapRes.end();
    return;
  }
  next();
};
