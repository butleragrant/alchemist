const meas = require('./Measurement.js');

const EMPTY_RECIPE = new Recipe();

function Recipe(recipeData) {
  if(recipeData == null) {
    this.name = "A Recipe";
    this.servingSize = new meas.Measurement(100, 0);
    this.subRecipes = {};
    this.subFoods = {};
  } else {
    try {
      this.name = recipeData.name;
      this.servingSize = new meas.Measurement(recipeData.servingSize.amount,
                            recipeData.servingSize.unit);

      let subRecipes = {};
      let subFoods = {};

      for(rid in recipeData.subRecipes) {
        if(recipeData.subRecipes.hasOwnProperty(rid)) {
          let subRecipe = recipeData.subRecipes[rid];
          subRecipes[rid] = new meas.Measurement(subRecipe.amount, subRecipe.unit);
        }
      }

      for(fid in recipeData.subFoods) {
        if(recipeData.subFoods.hasOwnProperty(fid)) {
          let subFood = recipeData.subFoods[fid];
          subFoods[fid] = new meas.Measurement(subFood.amount, subFood.unit);
        }
      }

      this.subRecipes = subRecipes;
      this.subFoods = subFoods;
    } catch(error) {
      //if there's some error just call self with no parameter, leading to the
      //default case above
      console.log("Error constructing recipe, returning an empty one");
      this();
    }
  }

  //Recipes are immutable
  if(this.constructor === Recipe) {
    Object.freeze(this);
    Object.freeze(this.subRecipes);
    Object.freeze(this.subFoods);
  }
}

module.exports = {
  Recipe,
  EMPTY_RECIPE
}
