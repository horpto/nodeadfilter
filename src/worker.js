"strict"

var config = require("./config/config");
var cluster = require("cluster");

if (cluster.isWorker) {
  load(config.plugins);
}

module.exports.loadPlugin = loadPlugin;
module.exports.load = load;

function loadPlugin(plugin, options){
  if (typeof plugin == 'function') {
    plugin(options);
    return;
  }
  if (typeof plugin == 'object') {
    plugin.init(options);
    return;
  }
  throw new Error("Don't know how to load plugin");
}

function load(plugins) {
  var _plugin, options;
  for (var plugin in config.plugins) {
    options = config.plugins[plugin];

    if (options == null ||
        options.status == null || options.status === "off") {
      continue;
    }
    try {
      _plugin = require('./' + plugin);
      loadPlugin(_plugin, config.plugins[plugin]);
    } catch (err) {
      console.warn("Cannot load plugin:", plugin);
      console.warn(err.stack);
    }
  }
}
