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

function Settings(dataString) {
  let settings = {};
  if(dataString == null) {
    for(let setting in SETTINGS_DESC) {
      settings[setting] = SETTINGS_DESC[setting].default;
    }
  } else {
    try {
      let savedSettings = JSON.parse(dataString);
      for(setting in SETTINGS_DESC) {
        if(SETTINGS_DESC.hasOwnProperty(setting)) {
          if(savedSettings.hasOwnProperty(setting) && SETTINGS_DESC[setting].isValid(savedSettings[setting])) {
            settings[setting] = savedSettings[setting];
          } else {
            settings[setting] = SETTINGS_DESC[setting].default;
          }
        }
      }
    } catch(error) {
      console.log("Error parsing settings, using defaults");
      this();
    }
  }

  this.getSetting = function(setting) {
    if(settings.hasOwnProperty(setting)) {
      return settings[setting];
    } else {
      return null;
    }
  }

  this.setSetting = function(setting, value) {
    if(settings.hasOwnProperty(setting) && SETTINGS_DESC[setting].isValid(value)) {
      settings[setting] = value;
    }
  }

}

module.exports = {
  Settings,
  SETTINGS_DESC
}
