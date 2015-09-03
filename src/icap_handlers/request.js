"strict"

module.exports.accept = function accept(icapReq, icapRes, req, res) {
  if (!icapRes.hasFilter() && icapReq.hasPreview()) {
    icapRes.allowUnchanged();
    return;
  }
  icapRes.setIcapStatusCode(200);
  icapRes.setIcapHeaders(icapReq.headers);
  icapRes.setHttpMethod(req);
  icapRes.setHttpHeaders(req.headers);
  icapRes.writeHeaders(icapReq.hasBody());
  icapReq.pipe(icapRes);
};

module.exports.reject = function reject(icapReq, icapRes, req, res) {
  var hasBody = false, headers = {};
  // do *not* set Content-Length: causes an issue with Squid
  if (req.headers && 'Accept' in req.headers && req.headers['Accept'].indexOf('text') >= 0) {
    hasBody = true;
    headers['Content-Type'] = 'text/html; charset=UTF-8';
  }

  icapRes.setIcapStatusCode(200);
  icapRes.setIcapHeaders(icapReq.headers);
  icapRes.setHttpStatus(403);
  icapRes.setHttpHeaders(headers);
  if (hasBody) {
    icapRes.writeHeaders(false);
    //icapRes.send();
    icapRes.writeHeaders(true);
    icapRes.send('OOLOLOL');
  } else {
    icapRes.writeHeaders(false);
  }
};

module.exports.analyze = function analyze(icapReq, icapRes, req, res) {


};
