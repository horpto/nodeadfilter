"strict"

var bodyParser = require('body-parser')
var errorhandler = require('errorhandler')
var express = require('express');

var config = require('./config');
var reloadWorkers = require('../utils/reload_workers').reloadWorkers;
var renewList = require('../utils/renew_lists');

var blacklist = require('../handlers/blacklist');
var whitelist = require('../handlers/whitelist');
var path = require('path');

var BLACK_LIST = 'black_list';
var WHITE_LIST = 'white_list';

module.exports = function initialize_routes(app) {

  app.use(bodyParser.urlencoded({extended: false}));

  app.get('/', function(req, res) {
    var mainPage = __dirname + '/../static/html/main.html';
    res.sendFile(path.resolve(mainPage));
  });
  app.use("/static", express.static('static'));

  app.get('/blacklist', blacklist.get);
  app.get('/whitelist', whitelist.get);

  app.post('/blacklist', blacklist.post, renewList(BLACK_LIST), reloadWorkers);
  app.post('/whitelist', whitelist.post, renewList(WHITE_LIST), reloadWorkers);

  app.delete('/blacklist', blacklist.delete, renewList(BLACK_LIST), reloadWorkers);
  app.delete('/whitelist', whitelist.delete, renewList(WHITE_LIST), reloadWorkers);

  app.delete('/blacklist/:id', blacklist.delete_item, renewList(BLACK_LIST), reloadWorkers);
  app.delete('/whitelist/:id', whitelist.delete_item, renewList(WHITE_LIST), reloadWorkers);

  app.use(errorhandler({
    log: console.error
  }));
};
