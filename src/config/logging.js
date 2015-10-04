"strict"

var config = require('./config');
var debug = config.debug;

if (debug == null || debug == "all") {
  debug = "debug";
  var longjohn = require('longjohn');
  longjohn.async_trace_limit = -1;
}

var LEVELS = {
  "debug": 0,
  "info": 1,
  "warn": 2,
  "error": 3
}

console.debug = console.log;
log("debug");
log("debug", "log");
log("info");
log("warn");
log("error");

function noop(){}

function log(level, method) {
  if (method == null) {
    method = level;
  }
  if (LEVELS[level] < LEVELS[debug]) {
    console[method] = noop;
  } else {
    var origin_method = console[method];

    console[method] = function () {
      var args = Array.prototype.slice.call(arguments, 0);

      args[0] = new Date().toISOString() + ': ' + args[0];
      origin_method.apply(this, args);
    }
  }
}
