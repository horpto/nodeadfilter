"strict"

var ICAPServer = require('nodecap').ICAPServer;

require('./config/logging');

module.exports = function (options) {
  // небольшой хак для логов
  console.verbose = console.log;

  var server = new ICAPServer({
    debug: console
  });

  console.log('Start ICAP server');

  require('./config/icap_routes')(server);

  var port = config.port;
  server.listen(port, function(port) {
    console.log('Listen on', port);
  });
}
