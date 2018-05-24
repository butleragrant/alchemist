/*
 * Measurement.js provides constants for the conversion between units, integer
 * codes for the units themselves, and an object constructor allowing the easy
 * storage of quantity/unit tuples.
 */

/*
 * A table of supported units. To convert between units, multiply the starting
 * unit by its conversion factor and divide by the target unit's conversion factor
 */
const UNITS_TABLE = [
  {
    name: "grams",
    abbrev: "g",
    conversionFactor: 1
  },

  {
    name:"ounces",
    abbrev: "oz.",
    conversionFactor: 28.3495
  }
];

/*
 * Measurement returns a simple object which stores some quantity along with
 * the quantity's unit. Measurements are immutable.
 * @param amount the numerical portion of the measurement
 * @param unit one of the keys for the above units
 */
function Measurement(amount, unit) {

  if(!UNITS_TABLE.hasOwnProperty(unit)) {
    unit = 0;
  }

  if(isNaN(amount) || amount < 0) {
    amount = 0;
  }

  this.amount = amount;
  this.unit = unit;



  if(this.constructor === Measurement) {
    Object.freeze(this);
  }
}

/*
 * Returns the amount in whatever unit.
 * @param targetUnit a unit key from UNITS_TABLE to convert to.
 */
Measurement.prototype.amountInUnit = function(targetUnit) {
  if(!UNITS_TABLE.hasOwnProperty(targetUnit)) {
    targetUnit = 0; //default grams
  }
  //Measurements are immutable, so we can rely on the object's
  //properties' validity
  return (this.amount * UNITS_TABLE[this.unit].conversionFactor) /
              UNITS_TABLE[targetUnit].conversionFactor;
}

const DEFAULT_MEASURE = new Measurement();

module.exports = {
  Measurement,
  UNITS_TABLE,
  DEFAULT_MEASURE
}
