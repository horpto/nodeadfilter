"use strict"
const url = require("url");
const net = require("net");

class ConnectHandler {
  constructor (req, cltSocket, head, index) {
    // connect to an origin server
    this.req = req;
    this.cltSocket = cltSocket;
    this.head = head;

    this.srvSocket = null;
    this.index = `#${index}`;

    this.initialize();
  }

  initialize() {
    const _url = this.req.url;
    const index = `${_url} ${this.index}`;

    console.info("Connect", index);

    this.cltSocket.url = index;
    this.cltSocket.setNoDelay();

    this.cltSocket.on("error", this.clientError.bind(this));
    this.cltSocket.on("end", this.socketEnd.bind(this));

    let srvUrl = url.parse(`http://${_url}`);
    let srvSocket = net.connect(srvUrl.port, srvUrl.hostname);
    this.srvSocket = srvSocket;
    srvSocket.url = index;
    srvSocket.setNoDelay();

    srvSocket.on("connect", this.connectHandled.bind(this));
    srvSocket.on("error", this.originError.bind(this));
    srvSocket.on("end", this.socketEnd.bind(this));
  }

  end() {
    try {
      if (this.srvSocket != null) {
        this.srvSocket.unpipe();
        this.srvSocket.end();
        this.srvSocket.destroy();
      }
      this.cltSocket.unpipe();
      this.cltSocket.end();
      this.cltSocket.destroy();
    } catch(err) {
      console.error("Connect end throws", this.index, err.stack);
    }
  }

  socketEnd() {
    console.info("CLT SRV end", this.cltSocket.url, this.srvSocket.url);
    this.end();
  }

  clientError(err) {
    console.error("Client socket error:", this.cltSocket.url, err.stack);
    this.end();
  }

  originError(err) {
    if (['ECONNRESET', 'ETIMEDOUT'].indexOf(err.errno) == -1 ) {
      console.error("Origin socket error:", this.srvSocket.url, err.stack);
    }
    this.end();
  }

  connectHandled() {
    let srvSocket = this.srvSocket;
    let cltSocket = this.cltSocket;
    console.info("Connection established with:", srvSocket.url);
    cltSocket.write("HTTP/1.1 200 Connection Established\r\n" +
                    "Proxy-agent: Node-Proxy\r\n" +
                    "\r\n");
    srvSocket.write(this.head);

    srvSocket.pipe(cltSocket);
    cltSocket.pipe(srvSocket);
  }
}

module.exports = ConnectHandler
