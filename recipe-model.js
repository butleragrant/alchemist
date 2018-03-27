/*
 * recipe-model.js exports two modules: Recipe, which allows the live editing of
 * a recipe, and RecipeLibrary, which stores recipes for later access.
 */
const measure = require('./measurement.js');

/*
 * Recipe allows the editing and interaction with recipe objects.
 * Recipe is constructed from a recipe name and it's raw data as stored
 * in a RecipeLibrary
 * RecipeLibrary will construct these for you.
 * @param recipeName the name of the recipe
 * @param recipeData the raw data representing the recipe object
 */
function Recipe(recipeName, recipeData) {
  let subRecipes = {};
  let subFoods = {};
  let servingSize = measure.Measurement(recipeData.servingSize.quantity,
    recipeData.servingSize.unit);

  let subRecipeData = recipeData.subRecipes;
  let subFoodData = recipeData.subFoods;

  //Generate subRecipes:
  for(let subRecipeName in subRecipeData) {
    if(subRecipeData.hasOwnProperty(subRecipeName)) {
      let currentSubRecipeData = subRecipeData[subRecipeName];
      subRecipes[subRecipeName] = measure.Measurement(currentSubRecipeData.quantity,
        currentSubRecipeData.unit);
    }
  }

  //Generate subFoods:
  for(let subFoodId in subFoodData) {
    if(subFoodData.hasOwnProperty(subFoodId)) {
      let currentSubFoodData = subFoodData[subFoodId];
      subFoods[subFoodId] = {
        name: currentSubFoodData.name,
        amount: measure.Measurement(currentSubFoodData.amount.quantity,
          currentSubFoodData.amount.unit),
        addedSugars: currentSubFoodData.addedSugars
      };
    }
  }


  return {

    get name() {
      return recipeName;
    },

    //servingSize is a measure.Measurement
    get servingSize() {
      return servingSize;
    },

    //servingSize is a measure.Measurement
    set servingSize(newSize) {
      servingSize = newSize;
    },


    deleteSubRecipe: function(name) {
      delete subRecipes[name];
    },

    deleteSubFood: function(ndbno) {
      delete subFoods[ndbno];
    },

    /*
     * Adds a sub-recipe to this recipe
     * @param recipeName the name of the recipe to be added
     * @param measurement the measure of the sub-recipe
     */
    addSubRecipe: function(recipeName, measurement) {
      subRecipes[recipeName] = measurement;
    },

    /*
     * Adds a sub-food to this recipe
     * @param ndbno The DB Id of the added food
     * @param name The name of the food(note this doesn't have to match the DB)
     * @param measurement The measure of the sub-food
     * @param addedSugars A flag noting whether this food is a source of added
     * sugar.
     */
    addSubFood: function(ndbno, name, measurement, addedSugars) {
      subFoods[ndbno] = {
        name: name,
        amount: measurement,
        addedSugars: addedSugars
      };
    },

    get subRecipes() {
      return subRecipes;
    },

    get subFoods() {
      return subFoods;
    },

    /*
     * Returns a version of this object without the methods for storage
     */
    get saveData() {
      let newSubRecipesData = {};
      let newSubFoodsData = {};

      //Generate sub recipe data:
      for(let subRecipeName in subRecipes) {
        if(subRecipes.hasOwnProperty(subRecipeName)) {
          newSubRecipesData[subRecipeName] = subRecipes[subRecipeName].saveData;
        }
      }

      //Generate subfood data:
      for(let subFoodId in subFoods) {
        if(subFoods.hasOwnProperty(subFoodId)) {
          newSubFoodsData[subFoodId] = {
            name: subFoods[subFoodId].name,
            amount: subFoods[subFoodId].amount.saveData,
            addedSugars: subFoods[subFoodId].addedSugars
          }
        }
      }

      return {
        servingSize: servingSize.saveData,
        subRecipes: newSubRecipesData,
        subFoods: newSubFoodsData
      };
    }
  }

}

/*
 * RecipeLibrary generates an object which stores recipe data in a more
 * usable form. RecipeLibrary offers methods to retrieve a list of recipe names,
 * edit recipes, generate new recipes, save recipes, and delete recipes.
 * RecipeLibrary objects are constructed using the raw data alchemist stores on
 * disk.
 * @param recipeData The raw data to construct the library with
 */
function RecipeLibrary(recipeData) {

  let recipes = {};
  for(let recipeName in recipeData) {
    if(recipeData.hasOwnProperty(recipeName)) {
      recipes[recipeName] = Recipe(recipeName, recipeData[recipeName]);
    }
  }

  /*
   * Checks to see if a recipe object is valid and has no subrecipe cycles
   * @param recipe the recipe object to check for validity
   */
  function isValid(recipe) {
    let toExplore = [];
    for(let subRecipeName in recipe.subRecipes) {
      if(recipe.subRecipes.hasOwnProperty(subRecipeName)) {
        console.log("pushing subrecipe: " + subRecipeName);
        toExplore.push(subRecipeName);
      }
    }

    while(toExplore.length > 0) {
      let exploringName = toExplore.pop();
      if(recipes[exploringName] == null || exploringName === recipe.name) {
        //the parent is not valid if it has a non-existent sub recipe or has a
        //sub recipe child/grandchild etc. with the same name
        console.log("returning false, exploring name is: " + exploringName);
        return false;
      }
      let exploring = recipes[exploringName];
      for(let subRecipeName in exploring.subRecipes) {
        if(exploring.subRecipes.hasOwnProperty(subRecipeName)) {
          console.log("pushing subrecipe: " + subRecipeName);
          toExplore.push(subRecipeName);
        }
      }
    }

    return true;
  }

  function isValidChild(recipe, subRecipeName) {
    let toExplore = [subRecipeName];

    while(toExplore.length > 0) {
      let exploringName = toExplore.pop();
      if(exploringName === recipe.name) {
        return false;
      }
      let exploring = recipes[exploringName];
      for(let subRecipeName in exploring) {
        if(exploring.hasOwnProperty(subRecipeName)) {
          toExplore.push(subRecipeName);
        }
      }
    }

    return true;
  }

  return {
    //Returns a list of the recipes in the RecipeLibrary
    get recipeList() {
      return Object.keys(recipes);
    },

    //The save data for this RecipeLibrary
    get saveData() {
      let newRecipeData = {};
      for(let recipeName in recipes) {
        console.log("potentially adding recipe " + recipeName + " to newRecipeData");
        if(recipes.hasOwnProperty(recipeName)) {
          console.log("adding recipe " + recipeName + " to newRecipeData");
          newRecipeData[recipeName] = recipes[recipeName].saveData;
        }
      }

      console.log("newRecipeData looks like: " + JSON.stringify(newRecipeData));
      return newRecipeData;

    },

    /*
     * Generates an empty Recipe object
     * @param recipeName The name of the new recipe
     */
    newRecipe: function(recipeName) {
      return Recipe(recipeName, {
        servingSize: {
          quantity: 100,
          unit: measure.GRAMS
        },
        subRecipes: {},
        subFoods: {}
      });
    },

    /*
     * Returns a Recipe object for the given recipe
     * @param recipeName the name of the recipe to return a
     * Recipe object for
     */
    getRecipe: function(recipeName) {
      if(recipes[recipeName] == null) {
        return null;
      } else {
        //return a copy, not the original in case edits are discarded
        return Recipe(recipeName, recipes[recipeName].saveData);
      }
    },

    /*
     * Saves the Recipe object to the RecipeLibrary
     * @param newRecipe the Recipe object to save
     */
    saveRecipe: function(newRecipe) {
      console.log("the recipe being saved looks like: " + JSON.stringify(newRecipe));
      if(isValid(newRecipe)) {
        recipes[newRecipe.name] = newRecipe;
      }
    },

    /*
     * Deletes the recipe
     * @param recipeName The name of the recipe to delete
     */
    deleteRecipe: function(recipeName) {
      delete recipes[recipeName];
    },

    isValid,

    isValidChild
  }
}


module.exports = {
  RecipeLibrary,
  Recipe
}
