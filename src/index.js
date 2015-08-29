"strict"

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

var numCPUs = require("os").cpus().length;
var config = require("./config/config");
var express = require("express");
var cluster = require("cluster");

/*
var app = express();

require("./config/routes")(app);

app.listen(config.port, function() {
  console.log("listening on port:", config.port);
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
      console.log("Worker commit suicide:", worker.id);
      return;
    }
    console.log("Worker send code:", code || signal);
    cluster.fork();
  });
}

process.on('SIGINT', function() {
  console.log('Got SIGINT.');
  for (var id in cluster.workers) {
    cluster.workers[id].kill();
  }
  process.exit();
});
