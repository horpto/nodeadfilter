"strict"

var config = require('../config/config');
var fs = require('fs');

module.exports = function(list_name) {
  return function renew_list(req, res, next) {
    console.log(config[list_name]);
    fs.writeFile(config[list_name + '_path'], JSON.stringify(config[list_name], null, 4),
      function (err) {
        if (err) {
          console.error('Cannot write file', err.message);
          res.send({status: 'fail'});
          return;
        }
        next();
      });
  };
};
