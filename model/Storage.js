const electron = require('electron');
const path = require('path');
const fs = require('fs');

const CONF_FILE = "alch-conf.json";
const RECIPE_FILE = "alch-recipe-data.json";
const DEFAULT_DATA_DIR = electron.remote.app.getPath('userData');

/*
 * Storage just represents a location to save things and saves files there.
 */
function Storage(dataDir) {
  if(dataDir == null) {
    dataDir = DEFAULT_DATA_DIR;
  }

  this.readFile = function(fileName) {
    let filePath = path.join(dataDir, fileName);
    try {
      return fs.readFileSync(filePath, "utf8");
    } catch(error) {
      return "{}";
    }
  };

  this.writeFile = function(fileName, dataString, callback) {
    let filePath = path.join(dataDir, fileName);
    fs.writeFile(filePath, dataString, "utf8", callback);
  };
}

module.exports = {
  Storage
}
