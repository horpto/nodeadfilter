"strict"

module.exports.accept = function accept(icapReq, icapRes, req, res) {
  if (!icapRes.hasFilter() && icapReq.hasPreview()) {
    icapRes.allowUnchanged();
    return;
  }
  icapRes.setIcapStatusCode(200);
  icapRes.setIcapHeaders(icapReq.headers);
  icapRes.setHttpMethod(res);
  icapRes.setHttpHeaders(res.headers);
  icapRes.writeHeaders(icapReq.hasBody());
  icapReq.pipe(icapRes);
};

module.exports.reject = require('./request').reject;

module.exports.analyze = function analyze(icapReq, icapRes, req, res) {
  
};
