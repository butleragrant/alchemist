/*
 * measurement.js provides constants for the conversion between units, integer
 * codes for the units themselves, and a module allowing the storage of quantity/
 * unit tuples.
 */

const GRAMS_PER_OUNCE = 28.3495;

const GRAMS = 0;
const OUNCES = 1;

/*
 * Measurement returns a simple object which stores some quantity along with
 * the quantity's unit.
 * @param quantity the numerical portion of the measurement
 * @param unit one of the above unit codes (GRAMS/OUNCES/etc.)
 */
function Measurement(quantity, unit) {
  return {
    /*
     * quantity returns the quantity portion of the measurement as a float
     */
    get quantity() {
      return parseFloat(quantity);
    },
    /*
     * unit returns the unit portion of the measurement
     */
    get unit() {
      return unit;
    },

    /*
     * saveData returns a version of the measurement without the methods for
     * storage on disk
     */
    get saveData() {
      return {
        quantity: quantity,
        unit: unit
      };
    },

    /*
     * quantityAsGrams returns the quantity converted to grams.
     */
    get quantityAsGrams() {
      if(unit == GRAMS) {
        return this.quantity;
      } else if(unit == OUNCES) {
        return this.quantity * GRAMS_PER_OUNCE;
      } else {
        console.log("Measurement converting unkown units!");
        return;
      }
    }
  }
}

module.exports = {
  Measurement,
  GRAMS,
  OUNCES,
  GRAMS_PER_OUNCE
}
