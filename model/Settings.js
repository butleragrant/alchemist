const path = require('path');
const electron = require('electron');

const SETTINGS_DESC = {
  "recipePath": {
    "default": electron.remote.app.getPath('userData'),
    "isValid": function(settingVal) {
      try {
        path.parse(settingVal);
        return true;
      } catch(error) {
        return false;
      }
    }
  },

  "apiKey": {
    "default": "DEMO_KEY",
    "isValid": function(settingVal) {
      return typeof settingVal === typeof "";
    }
  }
}

/*
 * Settings is constructed with a string representing a JSON object. The string
 * should have been previously generated with the saveString function. Settings
 * offers functions to get/set settings as well as save functions that will be
 * called when a specified setting changes.
 */
function Settings(dataString) {
  let settings = {};
  Object.keys(SETTINGS_DESC).forEach(function(setting) {
    settings[setting] = {
      value: SETTINGS_DESC[setting].default,
      hooks: []
    }
  });

  if(dataString != null) {
    try {
      let savedSettings = JSON.parse(dataString);
      Object.keys(SETTINGS_DESC).forEach(function(setting) {
        if(savedSettings.hasOwnProperty(setting) && SETTINGS_DESC[setting].isValid(savedSettings[setting])) {
          settings[setting] = {
            value: savedSettings[setting],
            hooks: []
          }
        }
      });
    } catch(error) {
      console.log("Error parsing settings, using defaults");
      Settings();
    }
  }

  this.saveString = function() {
    let newSaveData = {};
    Object.keys(settings).forEach(function(setting) {
      newSaveData[setting] = settings[setting].value;
    });
    return JSON.stringify(newSaveData);
  }

  this.getSetting = function(setting) {
    if(settings.hasOwnProperty(setting)) {
      return settings[setting].value;
    } else {
      return null;
    }
  }

  this.setSetting = function(setting, newValue) {
    if(settings.hasOwnProperty(setting) && SETTINGS_DESC[setting].isValid(newValue)) {
      settings[setting].value = newValue;
      settings[setting].hooks.forEach(function(changeFunction) {
        changeFunction(newValue);
      });
    }
  }

  this.hookSettingChange = function(setting, changeFunction) {
    settings[setting].hooks.push(changeFunction);
  }

}

module.exports = {
  Settings,
  SETTINGS_DESC
}
