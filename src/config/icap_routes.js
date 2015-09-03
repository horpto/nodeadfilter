"strict"

var options = require('../icap_handlers/options');
var request = require('../icap_handlers/request');
var response = require('../icap_handlers/response');

var config = require('./config');

var DomainList = require('nodecap').DomainList;

function transformListToDomainList(list){
  var result = new DomainList();
  for (var id in list) {
    try {
      result.add(list[id]);
    } catch(err) {
      console.error('Cannot add ', err.message);
    }
  }

  return result;
}

module.exports = function initialize_routes(server) {
  server.options('/analyze_request', options.request);
  server.options('/analyze_response', options.response);
  server.options('*', options.other);

  if (config.white_list != null) {
    var white_list = transformListToDomainList(config.white_list);
    server.request(white_list, request.accept);
    server.response(white_list, response.accept);
  }

  if (config.black_list != null) {
    var black_list = transformListToDomainList(config.black_list);
    server.request(black_list, request.reject);
    server.response(black_list, response.reject);
  }

  server.request('*', request.analyze);
  server.response('*', response.analyze);

  server.error(function(err, icapReq, icapRes, next) {
    console.error(err);
    if (!icapRes.done) {
      icapRes.setIcapStatusCode(500);
      icapRes.writeHeaders(false);
      icapRes.end();
    }
    next();
  });

};
