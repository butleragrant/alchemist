const meas = require('./Measurement.js');
const nutrition = require('./Nutrition.js');

const EMPTY_FOOD = new Food();

function Food(foodData) {
  if(foodData == null) {
    this.name = "A Food";
    this.servingSize = new meas.Measurement(100, 0);
    this.nutrients = {};
    for(nid in nutrition.NUTRIENT_LIST) {
      if(nutrition.NUTRIENT_LIST.hasOwnProperty(nid)) {
        this.nutrients[nid] = 0;
      }
    }
  } else {
    try {
      this.name = foodData.name;
      this.servingSize = new meas.Measurement(foodData.servingSize.amount,
          foodData.servingSize.unit);

      let nutrientQuantities = {};
      for(nid in nutrition.NUTRIENT_LIST) {
        if(nutrition.NUTRIENT_LIST.hasOwnProperty(nid)) {
          let nutrientQuant = foodData.nutrients[nid];
          if(nutrientQuant == null || isNaN(nutrientQuant)) {
            nutrientQuantities[nid] = 0;
          } else {
            nutrientQuantities[nid] = nutrientQuant;
          }
        }
      }

      //Do a couple checks:
      //UI shouldn't allow these two checks to fail but if they do, make sure
      //things are kept sensical

      if(nutrientQuantities["Added Sugars"] > nutrientQuantities["Total Sugars"]) {
        nutrientQuantities["Total Sugars"] = nutrientQuantities["Added Sugars"];
      }

      if(nutrientQuantities["Saturated Fat"] + nutrientQuantities["Trans Fat"] > nutrientQuantities["Total Fat"]) {
        nutrientQuantities["Total Fat"] = nutrientQuantities["Satured Fat"] + nutrientQuantities["Trans Fat"];
      }


      this.nutrients = nutrientQuantities;
    } catch(error) {
      console.log("Error constructing food, resorting to a zeroed one");
      this();
    }
  }

  //Foods are immutable
  if(this.constructor === Food) {
    Object.freeze(this);
    Object.freeze(this.nutrients);
  }
}

module.exports = {
  Food,
  EMPTY_FOOD
}
