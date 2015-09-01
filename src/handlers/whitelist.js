"strict"

var config = require('../config/config');
var list = config.white_list;

var maxId = 0;

for (var id in list) {
  if (id > maxId) {
    maxId = id;
  }
}

exports.get = function(req, res) {
  res.send({
    status: 'ok',
    result: list
  });
};


exports.post = function(req, res, next) {
  if (req.body.site === null) {
    console.log('fail');
    res.send({status: "fail"});
    return;
  }
  var id = maxId;
  maxId += 1;

  // TODO: валидация
  console.log(req.body);
  list[id] = req.body.site;
  var r = {}
  r[id] = req.body.site;
  res.send({status: 'ok', result: r});
  next();
};

exports.delete = function(req, res, next) {
  config.white_list = {};
  res.send({status: "ok"});
  next();
};

exports.delete_item = function(req, res, next) {
  var id = req.params.id;

  if (id in list){
    delete list[id];
    res.send({status: 'ok'});
    next();
  } else {
    res.send({status: 'fail'});
  }
};
