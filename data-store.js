/*
* data-store.js provides functions to load and save objects to files in JSON format
*/
const electron = require('electron');
const path = require('path');
const fs = require('fs');

var userDataPath = electron.remote.app.getPath('userData');

/*
 * loadData returns an object representing parsed JSON contents of the given file
 * If the file doesn't exist, {} is returned
 * @param fileName {string} The name of the file to load an object from within
 * the userData directory
 */
function loadData(fileName) {
  let filePath = path.join(userDataPath, fileName);
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    return {};
  }
}

/*
 * saveData saves an object to a file in the userData directory and then calls
 * a callback function
 * @param data The object to save to a file
 * @param fileName {String} The name of the file within the userData directory
 * to save to
 * @param callback The function to call when saving is complete
 */
function saveData(data, fileName, callback) {
  let filePath = path.join(userDataPath, fileName);
  fs.writeFile(filePath, JSON.stringify(data), function(error) {
    if(error) {
      throw error;
    } else {
      callback();
    }
  });
}

module.exports = {
  loadData,
  saveData
};
