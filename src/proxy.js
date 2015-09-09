"strict"

var http = require("http");
var url = require("url");
var net = require("net");
var extend = require('util')._extend;

module.exports.init = init;

function init(options) {
  http.globalAgent.maxSockets = 20000;
  var proxy = http.createServer(function (req, res) {
    console.info("Connection event", req.method, req.url);
    /*
    host: A domain name or IP address of the server to issue the request to. Defaults to 'localhost'.
    hostname: To support url.parse() hostname is preferred over host
    port: Port of remote server. Defaults to 80.
    localAddress: Local interface to bind for network connections.
    socketPath: Unix Domain Socket (use one of host:port or socketPath)
    method: A string specifying the HTTP request method. Defaults to 'GET'.
    path: Request path. Defaults to '/'. Should include query string if any. E.G. '/index.html?page=12'. An exception is thrown when the request path contains illegal characters. Currently, only spaces are rejected but that may change in the future.
    headers: An object containing request headers.
    auth: Basic authentication i.e. 'user:password' to compute an Authorization header.
    agent: Controls Agent behavior. When an Agent is used request will default to Connection: keep-alive. Possible values:
        undefined (default): use global Agent for this host and port.
        Agent object: explicitly use the passed in Agent.
        false: opts out of connection pooling with an Agent, defaults request to Connection: close.
    keepAlive: {Boolean} Keep sockets around in a pool to be used by other requests in the future. Default = false
    keepAliveMsecs: {Integer} When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000. Only relevant if keepAlive is set to true.
    */
    var origin_url = url.parse(req.url);
    var origin_req = http.request({
      method: req.method,
      hostname: origin_url.hostname,
      path: origin_url.path,
      auth: origin_url.auth,
      port: origin_url.port,
      headers: req.headers,
      keepAlive: req.headers['connection'] != 'close',
    },  function (origin_res) {
      var statusCode = origin_res.statusCode;
      var headers = origin_res.headers;

      console.info("Origin server response:", origin_url.hostname, statusCode);
      console.log("Headers: %j", headers);

      res.writeHead(statusCode, http.STATUS_CODES[statusCode], headers);
      origin_res.on("error", function(err) {
        console.error("Origin server", origin_url.hostname, "response error:", err.stack);
        origin_req.abort();
        origin_res.end();
        res.end();
      });
      origin_res.pipe(res);
      res.pipe(origin_res);
    });
    origin_req.on("error", function (err) {
      console.error("Origin server", origin_url.hostname, "request error:", err.stack);
      console.error("HEAD:", req.headers);
      origin_req.abort();
    });

    origin_req.setNoDelay();
    req.pipe(origin_req);
  });

  proxy.on("connect", function(req, cltSocket, head) {
    // connect to an origin server
    console.info("Connect", req.url);

    var srvUrl = url.parse("http://" + req.url);
    var srvSocket = net.connect(srvUrl.port, srvUrl.hostname, function() {
      cltSocket.write("HTTP/1.1 200 Connection Established\r\n" +
                      "Proxy-agent: Node-Proxy\r\n" +
                      "\r\n");
      srvSocket.write(head);
      srvSocket.pipe(cltSocket);
      cltSocket.pipe(srvSocket);
    });
  });

  proxy.on("error", function(err, socket){
    console.error("Proxy error:", err.stack);
    socket.end();
  });

  proxy.on("clientError", function(err, socket) {
    console.error("Proxy client error:", err.stack);
    socket.end();
  });

  proxy.on("close", function() {
    console.info("Proxy server closing");
  });

  proxy.listen(options.port, function() {
    console.info("Listen port:", options.port);
  });

}
