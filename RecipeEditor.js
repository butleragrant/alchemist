const rec = require('./Recipe.js');
const recForest = require('./RecipeForest.js');
const meas = require('./Measurement.js');

function RecipeEditor(rid, forest) {
  let recipe = forest.getRecipe(rid);
  let name = recipe.name;
  let servingSize = recipe.servingSize;
  let subRecipes = {};
  Object.keys(recipe.subRecipes).forEach(function(rid) {
    subRecipes[rid] = recipe.subRecipes[rid];
  });
  let subFoods = {};
  Object.keys(recipe.subFoods).forEach(function(fid) {
    subFoods[fid] = recipe.subFoods[fid];
  });

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

  this.listSubRecipes = function() {
    //should be rid -> name, amount, unit
    let subRecipeList = {};
    for(let subRid in subRecipes) {
      if(subRecipes.hasOwnProperty(subRid)) {
        let subRecipe = forest.getRecipe(subRid);
        subRecipeList[subRid] = {
          name: subRecipe.name,
          amount: subRecipes[subRid].amount,
          unit: subRecipes[subRid].unit
        }
      }
    }
    return subRecipeList;
  }

  this.listSubFoods = function() {
    //should be fid -> name, amount, unit
    let subFoodList = {};
    for(let subFid in subFoods) {
      if(subFoods.hasOwnProperty(subFid)) {
        let subFood = forest.getFood(subFid);
        subFoodList[subFid] = {
          name: subFood.name,
          amount: subFoods[subFid].amount,
          unit: subFoods[subFid].unit
        }
      }
    }

    return subFoodList;
  }

  this.addSubRecipe = function(rid, amount, unit) {
    if(forest.getRecipe(rid) != null) {
      if(amount == null || unit == null) {
        subRecipes[rid] = meas.DEFAULT_MEASURE;
      } else {
        subRecipes[rid] = new meas.Measurement(amount, unit);
      }
    }
  }

  this.addSubFood = function(fid, amount, unit) {
    if(forest.getFood(fid) != null) {
      console.log("food exists, continuing");
      if(amount == null || unit == null) {
        console.log("adding food with default measure");
        subFoods[fid] = meas.DEFAULT_MEASURE;
        console.log("subFoods is now: " + JSON.stringify(subFoods));
      } else {
        subFoods[fid] = new meas.Measurement(amount, unit);
      }
    }
  }

  this.deleteSubRecipe = function(rid) {
    if(subRecipes.hasOwnProperty(rid)) {
      delete subRecipes[rid];
    }
  }

  this.deleteSubfood = function(fid) {
    if(subFoods.hasOwnProperty(fid)) {
      delete subFoods[fid];
    }
  }

  this.searchRecipes = function(searchString) {
    console.log("searching recipes for: " + searchString);
    return forest.searchRecipes(searchString, rid);
  }

  this.searchFoods = function(searchString) {
    return forest.searchFoods(searchString);
  }

  this.save = function() {
    let newRecipeData = {
      name: name,
      servingSize: servingSize,
      subRecipes: subRecipes,
      subFoods: subFoods
    };

    forest.saveRecipe(rid, new rec.Recipe(newRecipeData));
  }
}

module.exports = {
  RecipeEditor
}
