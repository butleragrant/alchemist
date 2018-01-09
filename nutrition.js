/*
 * nutrition.js offers a function to acquire nutrition data for a recipe
 * and a mapping of nutrientIds in the USDA DB to their names, units, and daily
 * values.
 */
 var api = require('./api.js');
//not immutable unfortunately, look at facebook's immutable.js ?

/*
 * nutrientList just maps USDA DB nutrientIds to their names, daily values,
 * and their units.
 * Note: Added Sugars aren't a nutrient in the actual DB. Their presence in
 * in this list is for our convenience.
 */
const nutrientList = {
  //nutrientIds that are not present in ndb should be <= 0
  0: {
    name: "Added Sugars",
    dv: 50,
    unit: "g"
  },
  301: {
    name: "Calcium",
    dv: 1300,
    unit: "mg"
  },
  601: {
    name: "Cholesterol",
    dv: 300,
    unit: "mg"
  },
  291: {
    name: "Dietary Fiber",
    dv: 28,
    unit: "g"
  },
  208: {
    name: "Energy",
    dv: 2000,
    unit: "kcal"
  },
  303: {
    name: "Iron",
    dv: 18,
    unit: "mg"
  },
  306: {
    name: "Potassium",
    dv: 4700,
    unit: "mg"
  },
  203: {
    name: "Protein",
    dv: 0,
    unit: "g"
  },
  606: {
    name: "Saturated Fat",
    dv: 20,
    unit: "g"
  },
  307: {
    name: "Sodium",
    dv: 2300,
    unit: "mg"
  },
  205: {
    name: "Total Carbohydrate",
    dv: 275,
    unit: "g"
  },
  204: {
    name: "Total Fat",
    dv: 78,
    unit: "g"
  },
  269: {
    name: "Total Sugars",
    dv: 0,
    unit: "g"
  },
  605: {
    name: "Trans Fat",
    dv: 0,
    unit: "g"
  },
  328: {
    name: "Vitamin D",
    dv: 20,
    unit: "\u00b5g"
  }
};


/*
 * Gets the nutrition data for the recipe using a provided API object and
 * then calls the provided callback on the data
 * the nutrition data will be scaled to the recipe's serving size
 * @param recipeName the name of the recipe to acquire nutrition data for
 * @param recipeLibrary the library of all recipes
 * @param api the ApiSession object to send requests through
 * @param callback this function will be called on the nutrient totals after
 */
function getNutritionData(recipeName, recipeLibrary, api, callback) {
  let recipe = recipeLibrary.getRecipe(recipeName);
  let foodTotals = totalFoodsInMeasure(recipe, recipeLibrary, recipe.servingSize);
  let foodList = Object.keys(foodTotals);

  api.nutritionDataRequest(foodList, function(response) {
    //Get an object mapping ndbno -> nutrition data for 100g of each food
    let nutrientTotalsByFood = nutritionResults(response);

    //now get total nutrients name -> quantity in appropriate unit
    //Set all totals to 0, allowing addition
    let nutrientTotals = {};
    for(let nutrientId in nutrientList) {
      if(nutrientList.hasOwnProperty(nutrientId)) {
        nutrientTotals[ nutrientId] = 0;
      }
    }

    console.log("BEFORE: " + JSON.stringify(nutrientTotals));
    console.log("FOOD TOTALS: " + JSON.stringify(foodTotals));
    console.log("NUTBYFOOD: " + JSON.stringify(nutrientTotalsByFood));

    for(let foodId in nutrientTotalsByFood) {
      if(nutrientTotalsByFood.hasOwnProperty(foodId)) {
        for(let nutrientId in nutrientTotalsByFood[foodId]) {
          if(nutrientTotalsByFood[foodId].hasOwnProperty(nutrientId)) {
            let scaledNutrient = nutrientTotalsByFood[foodId][nutrientId]
            * (1 / 100) * foodTotals[foodId].quantity;
            nutrientTotals[nutrientId] += scaledNutrient;

            if(foodTotals[foodId].addedSugars && nutrientId == 269) { //269 is sugars Id
              nutrientTotals[0] +=  scaledNutrient;
            }
          }
        }
      }
    }

    console.log("AFTER: " + JSON.stringify(nutrientTotals));
    nutrientTotals.servingSize = recipe.servingSize.quantityAsGrams;
    callback(nutrientTotals);

  });



  /* Given a response object from a ndb nutrition data request,
   * stores nutrition data for each food in the response and returns the results
   * Assumes 100g of the food, so this data must be multiplied later
   * @param nutritionResponse the response object from the USDA api
   */
  function nutritionResults(nutritionResponse) {
    //nutrient totals *by food*
    let foodNutrientTotals = {};

    let responseFoods = nutritionResponse.foods;
    for(let i = 0; i < responseFoods.length; i++) {
      let currentFood = responseFoods[i].food;

      let foodId = currentFood.desc.ndbno;
      //Initial values for this food:
      foodNutrientTotals[foodId] = {};
      for(let nutrientId in nutrientList) {
        if(nutrientList.hasOwnProperty(nutrientId)) {
          foodNutrientTotals[foodId][nutrientId] = 0;
        }
      }

      //Loop through nutrients and store relevant ones:
      let foodNutrients = currentFood.nutrients;
      for(let j = 0; j < foodNutrients.length; j++) {
        let nutrientId = foodNutrients[j].nutrient_id;
        if(nutrientId in nutrientList) {
          //Then we care about this nutrient:
          foodNutrientTotals[foodId][nutrientId] = foodNutrients[j].value;
          if(foodNutrients[j].unit !== nutrientList[nutrientId].unit) {
            console.log("UNIT MISMATCH for nutrient: " +
              nutrientList[nutrientId].name + ", we have " +
                nutrientList[nutrientId].unit + ", they have " + foodNutrients[j].unit);
          }
        }
      }
    }

    return foodNutrientTotals;
  }

  /*
   * Returns a recipe's summed food quantities in grams given an
   * measure of the recipe
   * Each food also has a flag noting whether it is a source of
   * added sugar
   * @param recipe the name of the recipe to total foods for
   * @param recipeLibrary the library of all recipes
   * @param measure The measure of the recipe to total foods for
   */
  function totalFoodsInMeasure(recipe, recipeLibrary, measure) {
    let totalGrams = 0; //How many grams in a full batch of this recipe
    let totalFoodSums = {}; //Food sums in a full batch of the recipe

    //Start with the recipe's food ingredients:
    for(let subFoodId in recipe.subFoods) {
      if(recipe.subFoods.hasOwnProperty(subFoodId)) {
        let subFoodQuantity = recipe.subFoods[subFoodId].amount.quantityAsGrams;
        totalFoodSums[subFoodId] = {
          quantity: subFoodQuantity,
          addedSugars: recipe.subFoods[subFoodId].addedSugars
        };

        totalGrams += subFoodQuantity;
      }
    }

    //For each sub recipe, total their food ingredients and add to totalFoods
    for(let subRecipeName in recipe.subRecipes) {
      if(recipe.subRecipes.hasOwnProperty(subRecipeName)) {
        let subRecipe = recipeLibrary.getRecipe(subRecipeName);
        let subRecipeFoods = totalFoodsInMeasure(subRecipe, recipeLibrary,
          recipe.subRecipes[subRecipeName]);

        totalGrams += recipe.subRecipes[subRecipeName].quantityAsGrams;

        for(let foodId in subRecipeFoods) {
          if(subRecipeFoods.hasOwnProperty(foodId)) {
            //If we have to combine food quantities:
            if(totalFoodSums.hasOwnProperty(foodId)) {
              totalFoodSums[foodId] = {
                quantity: subRecipeFoods[foodId].quantity + totalFoodSums[food].quantity,
                addedSugars: subRecipeFoods[foodId].addedSugars ?
                  subRecipeFoods[foodId].addedSugars : totalFoodSums[foodId].addedSugars
              };
            } else {
              //If we don't have to combine, we just take the child's food quantity
              totalFoodSums[foodId] = subRecipeFoods[foodId];
            }
          }
        }
      }
    }

    //now scale the food sums:
    let scaledFoodSums = {};
    let multiplier = measure.quantityAsGrams / totalGrams;


    for(let foodId in totalFoodSums) {
      if(totalFoodSums.hasOwnProperty(foodId)) {
        scaledFoodSums[foodId] = {
          quantity: totalFoodSums[foodId].quantity * multiplier,
          addedSugars: totalFoodSums[foodId].addedSugars
        }
      }
    }

    return scaledFoodSums;
  }

}

module.exports = {
  nutrientList,
  getNutritionData
}
