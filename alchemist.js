const stor = require('./Storage.js');
const set = require('./Settings.js');
const recFor = require('./RecipeForest.js');
const rec = require('./Recipe.js');
const recEdit = require('./RecipeEditor.js');
const fd = require('./Food.js');
const fdEdit = require('./FoodEditor.js');
const api = require('./API.js');
const nut = require('./Nutrition.js');

/*
 * The Alchemist object, once constructed, serves as a controller, providing
 * methods to control and access the model.
 */
function Alchemist() {
  let settingsStorage = new stor.Storage(); //Use default electron path for now, maybe command line argument in future?
  let settings = new set.Settings(settingsStorage.readFile('alchemist-settings.json'));

  let recipeStorage = new stor.Storage(settings["recipePath"]);
  let recipes = new recFor.RecipeForest(recipeStorage.readFile('alchemist-recipes.json'));

  let apiSearcher = new api.API(api.DEFAULT_API_DOMAIN, settings.getSetting("apiKey"));
  settings.hookSettingChange("apiKey", function(newValue) {
    apiSearcher = new api.API(api.DEFAULT_API_DOMAIN, newValue);
  });

  this.allRecipes = function() {
    let results = {};
    let allRecipes = recipes.allRecipes();
    for(let rid in allRecipes) {
      if(allRecipes.hasOwnProperty(rid)) {
        results[rid] = allRecipes[rid].name;
      }
    }
    console.log("alchemists all recipes: " + JSON.stringify(results));
    return results;
  }

  this.allFoods = function() {
    let results = {};
    let allFoods = recipes.allFoods();
    console.log("All foods model: " + JSON.stringify(allFoods));
    for(let fid in allFoods) {
      if(allFoods.hasOwnProperty(fid)) {
        results[fid] = allFoods[fid];
      }
    }
    console.log("All foods: " + JSON.stringify(results));
    return results;
  }

  this.newRecipe = function() {
    let newRid = recipes.newRecipe();
    console.log("created new recipe: " + newRid);
    return newRid;
  }

  this.newFood = function() {
    let newFid = recipes.newFood();
    return newFid;
  }

  this.editRecipe = function(rid) {
    if(recipes.isRecipe(rid)) {
      return new recEdit.RecipeEditor(rid, recipes);
    } else {
      return null;
    }
  }

  this.editFood = function(fid) {
    if(recipes.isFood(fid)) {
      return new fdEdit.FoodEditor(fid, recipes, apiSearcher);
    } else {
      return null;
    }

  }

  this.deleteRecipe = function(rid) {
    console.log("called delete recipe");
    if(recipes.isRecipe(rid)) {
      console.log("deleting recipe");
      recipes.deleteRecipe(rid);
    }
  }

  this.deleteFood = function(fid) {
    if(recipes.isFood(fid)) {
      recipes.deleteFood(fid);
    }
  }

  this.saveRecipeData = function(callback) {
    recipeStorage.writeFile('alchemist-recipes.json', recipes.saveString(), callback);
  }

  this.getRecipeName = function(rid) {
    let recipe = recipes.getRecipe(rid);
    return recipe.name;
  }

  this.getNutrition = function(rid) {
    let recipe = recipes.getRecipe(rid);
    let nutrients = recipes.calcNutrition(rid);
    console.log("nutrients are: " + JSON.stringify(nutrients));
    let roundedNutrients = nut.roundNutrients(nutrients);
    console.log("roundedNutrients are: " + JSON.stringify(roundedNutrients));
    let dailyValues = nut.dailyValues(nutrients);
    console.log("Daily Values are: " + JSON.stringify(dailyValues));

    return {
      nutrients: roundedNutrients,
      dailyValues: dailyValues,
      servingSize: recipe.servingSize
    };
  }

  this.ingredientString = function(rid) {
    return recipes.ingredientString(rid);
  }

  this.getSettings = function() {
    let settingList = {};
    Object.keys(set.SETTINGS_DESC).forEach(function(setting) {
      settingList[setting] = settings.getSetting(setting);
    });
    return settingList;
  }

  this.setSetting = function(setting, newValue) {
    console.log("changing setting to: " + newValue);
    settings.setSetting(setting, newValue);
    settingsStorage.writeFile('alchemist-settings.json', settings.saveString(), function() {});
  }

}

module.exports = {
  Alchemist
}
