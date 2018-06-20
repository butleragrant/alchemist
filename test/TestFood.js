const fd = require('../model/Food.js');
const assert = require('assert');
const nut = require('../model/Nutrition.js');
const meas = require('../model/Measurement.js');

const ZEROED_NUTRIENTS = {};
Object.keys(nut.NUTRIENT_LIST).forEach((nid) => {
  ZEROED_NUTRIENTS[nid] = 0;
});

function randomNutrients() {
  let nutrients = {};
  Object.keys(nut.NUTRIENT_LIST).forEach((nid) => {
    nutrients[nid] = Math.random() * 100;
  });
  if(nutrients["Added Sugars"] > nutrients["Total Sugars"]) {
    nutrients["Total Sugars"] = nutrients["Added Sugars"];
  }

  if(nutrients["Saturated Fat"] + nutrients["Trans Fat"] > nutrients["Total Fat"]) {
    nutrients["Total Fat"] = nutrients["Saturated Fat"] + nutrients["Trans Fat"];
  }
  return nutrients;
}

function randomServingSize() {
  return new meas.Measurement(Math.random()* 500, Math.round(Math.random()));
}

describe('Food', function() {
  describe('Construction', function() {
    it('should return the values it is constructed with, assuming they are valid', function () {
      let nutrients = randomNutrients();
      let servingSize = randomServingSize();
      let foodName = "a food";
      let food = new fd.Food({
        name: foodName,
        servingSize: servingSize,
        nutrients: nutrients
      });

      assert.equal(food.name, foodName);
      assert.deepEqual(food.servingSize, servingSize);
      assert.deepEqual(food.nutrients, nutrients);
    });

    it('should construct itself with default values when constructed with no parameters', function() {
      let food = new fd.Food();
      assert.equal(food.name, "A Food");
      assert.deepEqual(food.servingSize, new meas.Measurement());
      assert.deepEqual(food.nutrients, ZEROED_NUTRIENTS);
    });

    it('should self-correct when constructed with invalid sugar amounts (added sugars > total sugars)', function() {
      let invalidSugarNutrients = randomNutrients();
      invalidSugarNutrients["Added Sugars"] = invalidSugarNutrients["Total Sugars"] + 5;
      let food1 = new fd.Food({
        name: "food1",
        servingSize: new meas.Measurement(),
        nutrients: invalidSugarNutrients
      });
      assert.equal(food1.nutrients["Total Sugars"], food1.nutrients["Added Sugars"]);
    });

    it('should self-correct when constructed with invalid fat amounts (trans fat + sat fat > total fat)', function() {
      let invalidFatNutrients = randomNutrients();
      let transFat = 5 + Math.random() * 10;
      let saturatedFat = 5 + Math.random() * 10;
      let totalFat = transFat + saturatedFat - (Math.random() * 3);
      invalidFatNutrients["Trans Fat"] = transFat;
      invalidFatNutrients["Saturated Fat"] = saturatedFat;
      invalidFatNutrients["Total Fat"] = totalFat;
      let food1 = new fd.Food({
        name: "food1",
        servingSize: new meas.Measurement(),
        nutrients: invalidFatNutrients
      });

      assert.equal(food1.nutrients["Total Fat"], transFat + saturatedFat);
    });


  });

  describe('Immutability', function() {
    it('should not allow fields to be changed after construction', function() {
      let name = "food1";
      let servingSize = new meas.Measurement(50, 0);
      let nutrients = randomNutrients();
      let food1 = new fd.Food({
        name: name,
        servingSize: servingSize,
        nutrients: nutrients
      });

      food1.name = "not food1";
      food1.servingSize = new meas.Measurement(23, 1);
      food1.nutrients = ZEROED_NUTRIENTS;
      assert.equal(food1.name, name);
      assert.deepEqual(food1.servingSize, servingSize);
      assert.deepEqual(food1.nutrients, nutrients);

      //One more test, we shouldn't be able to change the passed nutrients object
      //to indirectly change the food
      let copyOfNutrients = {};
      Object.keys(nutrients).forEach((nid) => {
        copyOfNutrients[nid] = nutrients[nid];
      });

      nutrients["Total Sugars"] = nutrients["Total Sugars"] + 1;
      assert.deepEqual(food1.nutrients, copyOfNutrients);
    });
  });
});
