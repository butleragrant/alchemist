const meas = require('./Measurement.js');
const rec = require('./Recipe.js');
const fd = require('./Food.js');
const nut = require('./Nutrition.js');





function RecipeForest(saveString) {
  let nextRid, nextFid;
  let recipeList = {};
  let foodList = {};
  console.log("initializing with saveString: " + saveString);

  if(saveString == null) {
    nextRid = 0;
    recipeList = {};
    nextFid = 0;
    foodList = {};
  } else {
    try {
      console.log("saveString isn't null");
      let saveData = JSON.parse(saveString);
      let savedRecipes = saveData.recipeList;
      let savedFoods = saveData.foodList;
      nextRid = saveData.nextRid;

      if(nextRid == null) {
        nextRid = 0;
      }

      for(rid in savedRecipes) {
        if(savedRecipes.hasOwnProperty(rid)) {
          recipeList[rid] = new rec.Recipe(savedRecipes[rid]);
        }
      }



      nextFid = saveData.nextFid;
      if(nextFid == null) {
        nextFid = 0;
      }

      for(fid in savedFoods) {
        if(savedFoods.hasOwnProperty(fid)) {
          foodList[fid] = new fd.Food(savedFoods[fid]);
        }
      }


    } catch(error) {
      console.log("Malformed recipe data file, resetting to defaults.");
      RecipeForest();
    }
  }

  function getInvalidChildren(parentRid) {
    let invalidChildren = new Set();
    invalidChildren.add(parseInt(parentRid));
    Object.keys(recipeList).forEach(function(rid) {
      if(!invalidChildren.has(parseInt(rid)) && hasInvalidChild(rid, invalidChildren)) {
        console.log("adding rid " + rid + " to invalid children");
        invalidChildren.add(parseInt(rid));
      }
    });

    function hasInvalidChild(descRid, invalidChildren) {
      console.log("checking if rid " + descRid + " has any invalidChildren");
      let recipe = recipeList[descRid];
      for(let subRid in recipe.subRecipes) {
        if(recipe.subRecipes.hasOwnProperty(subRid)) {
          console.log("investigating subRid: " + subRid);
          if(invalidChildren.has(parseInt(subRid))) {
            console.log("subRid " + subRid + " is an invalid child, returning true");
            return true;
          } else {
            return hasInvalidChild(subRid, invalidChildren);
          }
        }
      }


      return false;
    }

    return invalidChildren;
  }


  this.saveString = function() {
    let newSaveData = {};
    newSaveData.nextRid = nextRid;
    newSaveData.recipeList = recipeList;
    newSaveData.nextFid = nextFid;
    newSaveData.foodList = foodList;
    return JSON.stringify(newSaveData);
  },

  this.newRecipe = function() {
    let newRid = nextRid;
    nextRid++;
    recipeList[newRid] = rec.EMPTY_RECIPE;
    return newRid;
  },

  this.isRecipe = function(rid) {
    return recipeList.hasOwnProperty(rid);
  },

  this.getRecipe = function(rid) {
    if(this.isRecipe(rid)) {
      return recipeList[rid];
    } else {
      return null;
    }

  },

  this.saveRecipe = function(rid, recipe) {
    if(recipe != null && (typeof recipe === typeof rec.EMPTY_RECIPE)) {
      recipeList[rid] = recipe;
    }
  },

  this.deleteRecipe = function(rid) {
    delete recipeList[rid];
  },

  this.allRecipes = function() {
    let results = {};
    for(rid in recipeList) {
      if(recipeList.hasOwnProperty(rid)) {
        results[rid] = recipeList[rid];
      }
    }
    console.log("All recipes: " + JSON.stringify(results));
    return results;
  },

  this.searchRecipes = function(searchString, parent) {
    let results = {};
    let noReturn;
    if(parent == null) {
      noReturn = new Set();
    } else {
      noReturn = getInvalidChildren(parent);
    }

    console.log("no return is: " + JSON.stringify(Array.from(noReturn)));
    Object.keys(recipeList).forEach(function(validChildRid) {
      if(!noReturn.has(parseInt(validChildRid))) {
        let name = recipeList[validChildRid].name;
        if(name.toUpperCase().startsWith(searchString.toUpperCase())) {
          results[validChildRid] = name;
        }
      }
    });

    return results;


  },

  this.newFood = function() {
    let newFid = nextFid;
    nextFid++;
    foodList[newFid] = fd.EMPTY_FOOD;
    return newFid;
  },

  this.isFood = function(fid) {
    return foodList.hasOwnProperty(fid);
  },

  this.getFood = function(fid) {
    return foodList[fid];
  },



  this.saveFood = function(fid, food) {
    if(food!= null && (typeof food === typeof fd.EMPTY_FOOD)) {
      foodList[fid] = food;
    }
  },

  this.deleteFood = function(fid) {
    delete foodList[fid];
  }

  this.searchFoods = function(searchString) {
    console.log("searching foods with search string: " + searchString);
    console.log("foodList is: " + JSON.stringify(foodList));
    let results = {};
    for(fid in foodList) {
      if(foodList.hasOwnProperty(fid) && foodList[fid].name.toUpperCase().startsWith(searchString.toUpperCase())) {
        console.log("adding fid " + fid + " with name + " + foodList[fid].name + " to results");
        results[fid] = foodList[fid].name;
      }
    }
    return results;
  }

  this.allFoods = function() {
    return this.searchFoods("");
  }

  this.ingredientString = function(rid) {
    let recipe = recipeList[rid];
    let ingredients = "";

    let sortedSubRecipes = Object.keys(recipe.subRecipes);
    sortedSubRecipes.sort(function(rid1, rid2) {
      return recipe.subRecipes[rid1].amountInUnit(0) -
                recipe.subRecipes[rid2].amountInUnit(0);
    });

    let sortedSubFoods = Object.keys(recipe.subFoods);
    sortedSubFoods.sort(function(fid1, fid2) {
      return recipe.subFoods[fid1].amountInUnit(0) -
                recipe.subFoods[fid2].amountInUnit(0);
    });

    console.log("subRecipes is: " + JSON.stringify(recipe.subRecipes));
    console.log("subFoods is: " + JSON.stringify(recipe.subFoods));
    console.log("sortedSubFoods is: " + JSON.stringify(sortedSubFoods));
    while(sortedSubRecipes.length > 0 || sortedSubFoods.length > 0) {
      console.log("sortedSubFoods length is: " + sortedSubFoods.length);
      let recipeAmount = -1;
      let foodAmount = -1;
      if(sortedSubRecipes.length > 0) {
        recipeAmount = recipe.subRecipes[sortedSubRecipes[sortedSubRecipes.length - 1]].amountInUnit(0);
      }

      if(sortedSubFoods.length > 0) {
        foodAmount = recipe.subFoods[sortedSubFoods[sortedSubFoods.length - 1]].amountInUnit(0);
      }

      if(recipeAmount > foodAmount) {
        let rid = sortedSubRecipes.pop();
        let name = recipeList[rid].name;
        ingredients += name + "(" + this.ingredientString(rid) + "), ";
      } else {
        let fid = sortedSubFoods.pop();
        let name = foodList[fid].name;
        ingredients += name + ", ";
      }

    }
    return ingredients.slice(0, -2);

  }


  this.calcNutrition = function(rid) {
    if(recipeList.hasOwnProperty(rid)) {
      let recipe = recipeList[rid];
      let foodTotals = totalFoods(rid, recipe.servingSize.amountInUnit(0));

      let nutrients = totalNutrients(foodTotals);
      console.log("returning nutrients");
      return nutrients;
    } else {
      console.log("returning null");
      return null;
    }

    function totalFoods(rid, amount) {
      let recipe = recipeList[rid];
      let foodTotals = {};

      let totalGrams = 0;

      //
      Object.keys(recipe.subFoods).forEach(function(subFid) {
        let amountInGrams = recipe.subFoods[subFid].amountInUnit(0);
        if(foodTotals.hasOwnProperty(subFid)) {
          foodTotals[subFid] += amountInGrams;
        } else {
          foodTotals[subFid] = amountInGrams;
        }

        totalGrams += amountInGrams;
      });

      Object.keys(recipe.subRecipes).forEach(function(subRid) {
        let amountInGrams = recipe.subRecipes[subRid].amountInUnit("grams");
        let subRecipeFoods = totalFoods(subRid, amountInGrams);
        Object.keys(subRecipeFoods).forEach(function(subRecipeFid) {
          if(foodTotals.hasOwnProperty(subRecipeFid)) {
            foodTotals[subRecipeFid] += subRecipeFoods[subRecipeFid];
          } else {
            foodTotals[subRecipeFid] = subRecipeFoods[subRecipeFid];
          }
        });

        totalGrams += amountInGrams;
      });

      //Now we need to scale down to the proper amount:
      //make sure no rounding:
      let conversionFactor = amount * 1.0 / totalGrams;

      let scaledFoods = {};
      Object.keys(foodTotals).forEach(function(fid) {
        scaledFoods[fid] = foodTotals[fid] * conversionFactor;
      });

      return scaledFoods;
    }

    function totalNutrients(foodTotals) {
      console.log("totalNutrients starting");
      console.log("foodTotals is: " + JSON.stringify(foodTotals));
      let nutrients = {};
      Object.keys(nut.NUTRIENT_LIST).forEach(function(nutrient) {
        nutrients[nutrient] = 0;
      });

      Object.keys(foodTotals).forEach(function(fid) {
        let food = foodList[fid];
        let scalingFactor = foodTotals[fid] * 1.0 / food.servingSize.amountInUnit(0);
        Object.keys(food.nutrients).forEach(function(nutrient) {
          nutrients[nutrient] += food.nutrients[nutrient] * scalingFactor;
        });
      });

      return nutrients;
    }
  }

}

module.exports = {
  RecipeForest
}
