"strict"

var cluster = require('cluster');

module.exports.eachWorker = function eachWorker(callback) {
  for (var id in cluster.workers) {
    callback(cluster.workers[id]);
  }
}

module.exports.reloadWorkers = function reloadWorkers(req, res) {
  eachWorker(function(worker){
      worker.kill(); // die, my darling
  });
};
