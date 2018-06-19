const rec = require('./Recipe.js');
const meas = require('./Measurement.js');

/*
 * RecipeEditor offers an API for the editing of Recipe objects. It is constructed
 * with an rid and a reference to the RecipeBook to which the recipe belongs
 */
function RecipeEditor(rid, book) {
  let recipe = book.getRecipe(rid);
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

    Object.keys(subRecipes).forEach((subRid) => {
      let subRecipe = book.getRecipe(subRid);
      subRecipeList[subRid] = {
        name: subRecipe.name,
        amount: subRecipes[subRid].amount,
        unit: subRecipes[subRid].unit
      }
    });

    return subRecipeList;
  }

  this.listSubFoods = function() {
    //should be fid -> name, amount, unit
    let subFoodList = {};
    Object.keys(subFoods).forEach((subFid) => {
      let subFood = book.getFood(subFid);
      subFoodList[subFid] = {
        name: subFood.name,
        amount: subFoods[subFid].amount,
        unit: subFoods[subFid].unit
      }
    });

    return subFoodList;
  }

  this.addSubRecipe = function(rid, amount, unit) {
    if(book.getRecipe(rid) != null) {
      if(amount == null || unit == null) {
        subRecipes[rid] = new meas.Measurement();
      } else {
        subRecipes[rid] = new meas.Measurement(amount, unit);
      }
    }
  }

  this.addSubFood = function(fid, amount, unit) {
    if(book.getFood(fid) != null) {
      if(amount == null || unit == null) {
        subFoods[fid] = new meas.Measurement();
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
    return book.searchRecipes(searchString, rid);
  }

  this.searchFoods = function(searchString) {
    return book.searchFoods(searchString);
  }

  this.save = function() {
    let newRecipeData = {
      name: name,
      servingSize: servingSize,
      subRecipes: subRecipes,
      subFoods: subFoods
    };

    book.saveRecipe(rid, new rec.Recipe(newRecipeData));
  }
}

module.exports = {
  RecipeEditor
}
