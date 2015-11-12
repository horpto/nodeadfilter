"use strict"

var http = require("http");

const ConnectHandler = require('./proxy_handlers/connect');
const RequestHandler = require('./proxy_handlers/request');
module.exports.init = init;

class ProxyServer {
  constructor (options) {
    this.options = options;
    this.con_index = 0;
    this.req_index = 0;
    this.server = http.createServer();
  }

  initialize() {
    const server = this.server;

    server.on("error", this.errorHandler.bind(this));
    server.on("clientError", this.clientErrorHandler.bind(this));
    server.on("close", () => {
      console.info("Proxy server closing");
    });

    server.on("request", this.requestHandler.bind(this));
    server.on("connect", this.connectHandler.bind(this));
  }

  listen (port, cb) {
    this.server.listen(port, cb);
  }

  close() {
    this.server.close();
  }
  // HANDLERS
  errorHandler(err, socket) {
    console.error("Proxy error:", err.stack);
    socket.end();
    socket.destroy();
  }

  clientErrorHandler(err, socket) {
    console.error("Proxy client error:", socket.url||"url not set", err.stack);
    socket.end();
    socket.destroy();
  }

  requestHandler(req, res) {
    this.req_index++;
    return new RequestHandler(req, res, this.req_index);
  }

  connectHandler(req, cltSocket, head) {
    this.con_index++;
    return new ConnectHandler(req, cltSocket, head, this.con_index);
  }

}

function init(options) {
  const proxy = new ProxyServer(options);
  proxy.initialize();
  proxy.listen(options.port, () => {
    console.info("Listen port:", options.port);
  });
}
