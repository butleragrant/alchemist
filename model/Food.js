const meas = require('./Measurement.js');
const nutrition = require('./Nutrition.js');
const fdCost = require('./FoodCost.js');

/*
 * Food constructs an object representing a single food type and its nutrition
 * information. A Food has fields: "name" of type string, "servingSize" of type
 * Measurement, and "nutrients" which is an object with one key/value pair per
 * tracked nutrient. foodData should have these exact properties. The purpose
 * of this constructor is to ensure foodData represents a Food with valid
 * values for each property, and to utilize Object.freeze() to make Foods
 * immutable.
 */
function Food(foodData) {
  if(foodData == null) {
    this.name = "A Food";
    this.servingSize = new meas.Measurement();
    this.nutrients = {};
    this.cost = new fdCost.FoodCost();
    Object.keys(nutrition.NUTRIENT_LIST).forEach((nid) => {
      this.nutrients[nid] = 0;
    });

  } else {
    try {
      this.name = foodData.name;
      this.servingSize = new meas.Measurement(foodData.servingSize.amount,
          foodData.servingSize.unit);
      this.cost = new fdCost.FoodCost(foodData.cost.costNumerator,
        new meas.Measurement(foodData.cost.costDenominator.amount, foodData.cost.costDenominator.unit));

      let nutrientQuantities = {};
      Object.keys(nutrition.NUTRIENT_LIST).forEach((nid) => {
        let nutrientQuant = foodData.nutrients[nid];
        if(nutrientQuant == null || isNaN(nutrientQuant)) {
          nutrientQuantities[nid] = 0;
        } else {
          nutrientQuantities[nid] = nutrientQuant;
        }
      });

      //Do a couple checks:
      //UI shouldn't allow these two checks to fail but if they do, make sure
      //things are kept sensical
      if(nutrientQuantities["Added Sugars"] > nutrientQuantities["Total Sugars"]) {
        nutrientQuantities["Total Sugars"] = nutrientQuantities["Added Sugars"];
      }

      if(nutrientQuantities["Saturated Fat"] + nutrientQuantities["Trans Fat"] > nutrientQuantities["Total Fat"]) {
        nutrientQuantities["Total Fat"] = nutrientQuantities["Saturated Fat"] + nutrientQuantities["Trans Fat"];
      }


      this.nutrients = nutrientQuantities;
    } catch(error) {
      //If we get down here, foodData is missing some properties
      console.log("Error constructing food, returning a default one");
      Food();
    }
  }

  //Foods are immutable
  if(this.constructor === Food) {
    Object.freeze(this);
    Object.freeze(this.nutrients);
  }
}

module.exports = {
  Food
}
