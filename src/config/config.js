"strict"

var util = require("util");
var path = require("path");
var fs = require("fs");
var Config = require("key-value-conf");

var config_file = process.env.CONFIG || (__dirname + "/json/config.json");
var flag = fs.existsSync(config_file);

var config  = new Config(flag ? config_file : {});
// FIXME: это хак
util._extend(config.get(), {
  "config_file": config_file,
  "plugin": {
    "icap_server": {
      "status": "off",
      "port": 1344
    },
    "proxy": {
      "status": "off"
    }
  },
 "options": {
    "port": 8888,
    "debug": false,
    "service": "NodeAdFilter",
    "white_list": "./json/white_list.json",
    "black_list": "./json/black_list.json"
  }
});

module.exports = config.get();
module.exports.white_list = readJsonSync(config.get("options.white_list"));
module.exports.black_list = readJsonSync(config.get("options.black_list"));


function readJsonSync(name) {
  if (!name) return {};

  name = name.trim();
  if (/\.js(?:on)?$/.test(name)) {
    try {
      return require(name);
    } catch (err) {
      console.log("Cannot read file:", name, err.stack);
    }
  }
  return {};
}
