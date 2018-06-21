const stor = require('./Storage.js');
const set = require('./Settings.js');
const recBook = require('./RecipeBook.js');
const rec = require('./Recipe.js');
const recEdit = require('./RecipeEditor.js');
const fd = require('./Food.js');
const fdEdit = require('./FoodEditor.js');
const api = require('./APIRequester.js');
const nut = require('./Nutrition.js');

/*
 * The Alchemist object, once constructed, serves as a controller, providing
 * methods to control and access the recipe model.
 */
function Alchemist() {
  let settingsStorage = new stor.Storage(); //Use default electron path for now, maybe command line argument in future?
  let settings = new set.Settings(settingsStorage.readFile('alchemist-settings.json'));

  let recipeStorage = new stor.Storage(settings["recipePath"]);
  let recipes = new recBook.RecipeBook(recipeStorage.readFile('alchemist-recipes.json'));

  let apiSearcher = new api.APIRequester(settings.getSetting("apiKey"));
  settings.hookSettingChange("apiKey", (newValue) => {
    apiSearcher = new api.APIRequester(newValue);
  });

  this.allRecipes = function() {
    let results = {};
    let allRecipes = recipes.allRecipes();
    for(let rid in allRecipes) {
      if(allRecipes.hasOwnProperty(rid)) {
        results[rid] = allRecipes[rid].name;
      }
    }
    return results;
  }

  this.allFoods = function() {
    let results = {};
    let allFoods = recipes.allFoods();
    for(let fid in allFoods) {
      if(allFoods.hasOwnProperty(fid)) {
        results[fid] = allFoods[fid];
      }
    }
    return results;
  }

  this.newRecipe = function() {
    let newRid = recipes.newRecipe();
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
    if(recipes.isRecipe(rid)) {
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

  this.getRecipeInfo = function(rid) {
    let recipe = recipes.getRecipe(rid);
    let nutrients = recipes.calcNutrition(rid);
    let roundedNutrients = nut.roundNutrients(nutrients);
    let dailyValues = nut.dailyValues(nutrients);

    return {
      nutrients: roundedNutrients,
      dailyValues: dailyValues,
      servingSize: recipe.servingSize,
    };
  }

  this.getFoodCost = function(rid, amount) {
    return recipes.calcCost(rid, amount);
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
    settings.setSetting(setting, newValue);
    settingsStorage.writeFile('alchemist-settings.json', settings.saveString(), function() {});
  }

}

module.exports = {
  Alchemist
}
