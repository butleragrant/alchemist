const meas = require('./Measurement.js');

function FoodCost(costNumerator, costDenominator) {

  if(costNumerator == null) {
    costNumerator = 0;
  }

  if(costDenominator == null|| costDenominator.amount <= 0) {
    costDenominator = new meas.Measurement();
  }

  if(costNumerator < 0) {
    costNumerator = 0;
  }

  this.costNumerator = costNumerator;
  this.costDenominator = costDenominator;


  if(this.constructor === FoodCost) {
    Object.freeze(this);
  }
}

FoodCost.prototype.costPerGram = function() {
  return parseFloat(this.costNumerator) / this.costDenominator.amountInUnit(0);
}

module.exports = {
  FoodCost
}
