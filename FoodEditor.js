const nut = require('./Nutrition.js');
const meas = require('./Measurement.js');
const api = require('./API.js');
const fd = require('./Food.js');

function FoodEditor(fid, forest, apiRequester) {
  let food = forest.getFood(fid);
  let name = food.name;
  let servingSize = food.servingSize;
  let nutrients = {};
  for(let nid in food.nutrients) {
    if(food.nutrients.hasOwnProperty(nid)) {
      nutrients[nid] = food.nutrients[nid];
    }
  }

  this.getName = function() {
    return name;
  }

  this.setName = function(newName) {
    if(typeof newName === typeof "") {
      name = newName;
    }
  }

  this.getServingSize = function() {
    return servingSize;
  }

  this.setServingSize = function(amount, unit) {
    if(amount <= 0) {
      amount = 1;
    }

    servingSize = new meas.Measurement(amount, unit);
  }

  this.getNutrients = function() {
    let retNutrients = {};
    for(nid in nutrients) {
      if(nutrients.hasOwnProperty(nid)) {
        retNutrients[nid] = nutrients[nid];
      }
    }

    return retNutrients;
  }

  this.setNutrients = function(newNutrients) {
    for(nid in nut.NUTRIENT_LIST) {
      if(nut.NUTRIENT_LIST.hasOwnProperty(nid) && newNutrients.hasOwnProperty(nid)) {
        nutrients[nid] = parseFloat(newNutrients[nid]); //working now
      }
    }

    if(nutrients["Added Sugars"] > nutrients["Total Sugars"]) {
      nutrients["Total Sugars"] = nutrients["Added Sugars"];
    }

    if(nutrients["Saturated Fat"] + nutrients["Trans Fat"] > nutrients["Total Fat"]) {
      nutrients["Total Fat"] = parseFloat(nutrients["Saturated Fat"]) + parseFloat(nutrients["Trans Fat"]);
    }

    console.log("After updates nutrients is: " + JSON.stringify(nutrients));
  }

  this.save = function() {
    console.log("Saving, nutrients are: " + JSON.stringify(nutrients));
    let newFoodData = {
      name: name,
      servingSize: servingSize,
      nutrients: nutrients
    }

    forest.saveFood(fid, new fd.Food(newFoodData));

  }

  function errorMessages(responseCode) {
    if(responseCode === api.API_CODES.INVALID_KEY) {
      return "Invalid API key, try re-entering it in the settings menu.";
    } else if(responseCode === api.API_CODES.NO_RESULTS) {
      return "No results, try another search.";
    } else if(responseCode === api.API_CODES.URL_NOT_FOUND) {
      return "Unable to access the NDB, check your internet connection.";
    } else {
      return "Success.";
    }
  }

  this.searchDatabase = function(searchString, branded, callback) {
    apiRequester.foodSearch(searchString, function(results, responseCode) {
      let foods = {};
      for(let i = 0; i < results.length; i++) {
        foods[results[i].ndbno] = {
          name: results[i].name,
          group: results[i].group
        }
      }
      console.log("API CODES is: " + JSON.stringify(api.API_CODES));
      if(responseCode === api.API_CODES.SUCCESS) {
        callback(foods);
      } else {
        callback(foods, errorMessages(responseCode));
      }
    }, branded);
  }

  this.importFood = function(ndbno, callback) {
    let editor = this;
    apiRequester.nutritionInfo(ndbno, function(results, responseCode) {
      console.log("we here");
      console.log("responseCode is: " + responseCode);
      console.log("results is: " + JSON.stringify(results));
      if(responseCode === api.API_CODES.SUCCESS) {
        Object.keys(results).forEach(function(nutrient) {
          nutrients[nutrient] = results[nutrient];
        });
        callback();

      } else {
        callback("Food Importing failed: " + errorMessages(responseCode));
      }
    });
  }
}

module.exports = {
  FoodEditor
}
