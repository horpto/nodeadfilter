"use strict"
var url = require("url");
var http = require("http");

class RequestHandler {
  constructor (req, res, index) {
    this.req = req;
    this.res = res;
    this.index = `#${index}`;
    this.host = null;
    this.origin_req = null;
    this.origin_res = null;

    this.initialize();
  }

  initialize() {
    let req = this.req;
    let index = this.index;
    console.info("Request event", index, req.method, req.url);

    let origin_url = url.parse(req.url);
    this.host = origin_url.host;

    let origin_req = this.makeRequest(origin_url);

    origin_req.on("error", (err) => {
      console.error("Origin server", origin_url.host, index, "request error:", err.stack);
      console.error("HEAD:", req.headers);
      origin_req.abort();
    });
    origin_req.on("response", this.responseHandled.bind(this));
    this.origin_req = origin_req;
    req.pipe(origin_req);

    this.res.on("error", this.clientError.bind(this));
    this.res.on("close", this.clientEnd.bind(this));
  }

  makeRequest(origin_url) {
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
    let req = this.req;
    let origin_req = http.request({
      method: req.method,
      hostname: origin_url.hostname,
      path: origin_url.path,
      auth: origin_url.auth,
      port: origin_url.port,
      headers: req.headers,
      keepAlive: req.headers['connection'] != 'close',
    });
    origin_req.setNoDelay();
    return origin_req;
  }

  clientError(err) {
    console.error("Client error", this.index, ":", err.stack);
    this.res.unpipe();
    if (origin_res != null) {
      this.origin_res.unpipe();
    }
    this.end();
  }

  clientEnd() {
    this.end();
  }

  end() {
    if (this.origin_req != null) {
      this.origin_req.abort();
    }
    if (this.origin_res != null) {
      this.origin_res.close();
    }
    this.res.end();
  };

  responseHandled(origin_res) {
    this.origin_res = origin_res;
    let index = this.index;
    let statusCode = origin_res.statusCode;
    let headers = origin_res.headers;
    let origin_req = this.origin_req;
    let res = this.res;

    console.info("Origin server response:", this.host, statusCode, index);
    console.log("Headers: %j", headers);

    res.writeHead(statusCode, http.STATUS_CODES[statusCode], headers);
    origin_res.on("error", (err) => {
      console.error("Origin server", this.host, index, "response error:", err.stack);
      res.unpipe();
      origin_res.unpipe();
      this.end();
    });

    origin_res.on("close", () => {
      console.log("Origin server", this.host, index, "closed");
      this.end();
    });

    origin_res.pipe(res);
    res.pipe(origin_res);
  }
}

module.exports = RequestHandler
