"strict"

process.on('uncaughtException', function(err) {
  console.error('Caught exception: ' + err);
});

require('./config/logging');

var numCPUs = require("os").cpus().length;
var config = require("./config/config");
var express = require("express");
var cluster = require("cluster");

/*
var app = express();

require("./config/routes")(app);

app.listen(config.port, function() {
  console.info("listening on port:", config.port);
});
*/

var _workers = config.cluster;
if (_workers == null || _workers == 0) {
  require("./worker.js").load(config.plugins);
} else {
  cluster.setupMaster({
    exec: "./worker",
  });

  if (_workers < 0) {
    _workers = Math.max(numCPUs + 1 - _workers, numCPUs);
  }
  for (var i = 0; i < Math.min(numCPUs, _workers); i++) {
    cluster.fork();
  }

  cluster.on("exit", function(worker, code, signal) {
    if (worker.suicide === true) {
      console.info("Worker commit suicide:", worker.id);
      return;
    }
    console.error("Worker send code:", code || signal);
    cluster.fork();
  });
}

process.on('SIGINT', function() {
  console.error('Got SIGINT.');
  for (var id in cluster.workers) {
    cluster.workers[id].kill();
  }
  process.exit();
});
