const nut = require('./Nutrition.js');
const meas = require('./Measurement.js');
const api = require('./APIRequester.js');
const fd = require('./Food.js');

/*
 * FoodEditor provides an API for editing foods on the fly. FoodEditor is
 * constructed with the fid of the edited food, the RecipeBook the food belongs
 * to, and an APIRequester for sending api requests to a food composition database.
 */
function FoodEditor(fid, recipeBook, apiRequester) {
  let food = recipeBook.getFood(fid);
  let name = food.name;
  let cost = food.cost;
  let servingSize = food.servingSize;
  let nutrients = {};
  //We need our own copy of nutrients to edit
  Object.keys(food.nutrients).forEach((nid) => {
    nutrients[nid] = food.nutrients[nid];
  });

  //Returns name of the food
  this.getName = function() {
    return name;
  }

  //Sets the name of the food
  this.setName = function(newName) {
    if(typeof newName === typeof "") {
      name = newName;
    }
  }

  //Returns the servingSize for the food
  this.getServingSize = function() {
    return servingSize;
  }

  //Sets the servingSize for the food
  this.setServingSize = function(amount, unit) {
    if(amount <= 0) {
      amount = 1;
    }

    servingSize = new meas.Measurement(amount, unit);
  }

  //Returns the cost of the food, first value is the cost in $, second value
  //is a measurement representing the denominator of the cost ratio
  this.getFoodCost = function() {
    return cost;
  }

  this.setFoodCost = function(foodCost) {
    cost = foodCost;
  }

  //Returns an object with keys representing nutrient Ids and values representing
  //nutrient quantities
  this.getNutrients = function() {
    let retNutrients = {};
    Object.keys(nutrients).forEach((nid) => {
      retNutrients[nid] = nutrients[nid];
    });

    return retNutrients;
  }

  //Sets the nutrients for this food
  this.setNutrients = function(newNutrients) {
    Object.keys(nut.NUTRIENT_LIST).forEach((nid) => {
      if(newNutrients.hasOwnProperty(nid)) {
        nutrients[nid] = parseFloat(newNutrients[nid]);
      }
    });

    //Sanity checking:
    if(nutrients["Added Sugars"] > nutrients["Total Sugars"]) {
      nutrients["Total Sugars"] = nutrients["Added Sugars"];
    }

    if(nutrients["Saturated Fat"] + nutrients["Trans Fat"] > nutrients["Total Fat"]) {
      //these parseFloats shouldn't be necessary any more? TODO try removing them
      nutrients["Total Fat"] = parseFloat(nutrients["Saturated Fat"]) + parseFloat(nutrients["Trans Fat"]);
    }

  }

  //Save saves the editing food to the RecipeBook
  this.save = function() {
    let newFoodData = {
      name: name,
      servingSize: servingSize,
      cost: cost,
      nutrients: nutrients
    }

    recipeBook.saveFood(fid, new fd.Food(newFoodData));

  }

  //Returns error messages for each api response code
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

  /*
   * Searches the food database with the provided API for a food matching
   * searchString. searchDatabse calls callback on an object mapping ndb Ids
   * to their name and group and an errorMessage. errorMessage is left null
   * if the search was successful.
   */
  this.searchDatabase = function(searchString, callback) {
    apiRequester.foodSearch(searchString, (results, responseCode) => {
      let foods = {};
      for(let i = 0; i < results.length; i++) {
        foods[results[i].ndbno] = {
          name: results[i].name,
          group: results[i].group
        }
      }
      if(responseCode === api.API_CODES.SUCCESS) {
        callback(foods);
      } else {
        callback(foods, errorMessages(responseCode));
      }
    });
  }

  /*
   * importFood sets the nutrient data of the foodEditor to the database's
   * nutrition data for the given ndbno, then calls callback with an error message
   * if there was an error, or nothing if the request was successful
   */
  this.importFood = function(ndbno, callback) {
    apiRequester.nutritionInfo(ndbno, (results, responseCode) => {
      if(responseCode === api.API_CODES.SUCCESS) {
        Object.keys(results).forEach((nutrient) => {
          nutrients[nutrient] = results[nutrient];
        });
        servingSize = new meas.Measurement(100, 0);
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
