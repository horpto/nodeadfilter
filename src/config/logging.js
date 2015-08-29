"strict"

var config = require('./config');
var debug = config.debug;

if (debug == null || debug == "all") {
  debug = "debug";
  require('longjohn');
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
  }
}
