"strict"

var merge = require("merge");
var path = require("path");
var fs = require("fs");
var Config = require("key-value-conf");

var config_file = process.env.CONFIG || (__dirname + "/json/config.json");
var flag = fs.existsSync(config_file);

var config  = new Config(flag ? config_file : {});
// FIXME: это хак
merge.recursive(config.get(), {
  "config_file": config_file,
  "plugins": {
    "icap_server": {
      "status": "off", // on
      "port": 1344
    },
    "proxy": {
      "status": "on",
      "port": 8081
    }
  },
  "cluster": -1,
  "port": 8888,
  "debug": "info",
  "service": "NodeAdFilter",
  "white_list": "./json/white_list.json",
  "black_list": "./json/black_list.json"
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
      console.error("Cannot read file:", name, err.stack);
    }
  }
  return {};
}
