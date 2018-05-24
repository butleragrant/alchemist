const assert = require('assert');
const meas = require('../Measurement.js');

describe('Measurement', function() {

  describe('Proper construction', function() {
    it('should return the values it is constructed with, assuming they are valid', function() {
      let measure1 = new meas.Measurement(25.3, 1);
      let measure2 = new meas.Measurement(0, 0);

      assert.equal(measure1.amount, 25.3);
      assert.equal(measure2.amount, 0);

      assert.equal(measure1.unit, 1);
      assert.equal(measure2.unit, 0);
    });
  });

  describe('Negative amount construction', function() {
    it('should set amount to 0 if the amount it is constructed with is below 0', function() {
      let measure1 = new meas.Measurement(-12, 0);
      let measure2 = new meas.Measurement(-0.1, 1);

      assert.equal(measure1.amount, 0);
      assert.equal(measure2.amount, 0);
    });
  });

  describe('NaN amount construction', function() {
    it('should default to 0 if the amount constructed with is not a number', function() {
      let measure1 = new meas.Measurement("not a number", 0);
      let measure2 = new meas.Measurement([1, 3, 4], 0);

      assert.equal(measure1.amount, 0);
      assert.equal(measure2.amount, 0);
    });
  });

  describe('Invalid unit construction', function() {
    it('should default to unit 0 (grams) if the given unit is not in the UNITS_TABLE', function() {
      let measure1 = new meas.Measurement(23, -5);
      let measure2 = new meas.Measurement(22, 999);
      let measure3 = new meas.Measurement(22, "not even an index");

      assert.equal(measure1.unit, 0);
      assert.equal(measure2.unit, 0);
      assert.equal(measure3.unit, 0);
    });
  });

  describe('#amountInUnit() - proper usage', function() {
    it('should return the value converted to any unit in the UNITS_TABLE ', function() {
      let random1 = Math.random() * 100;
      let measure1 = new meas.Measurement(random1, 0);

      //convert random1 to oz.:
      let convertedRandom1 = random1 / 28.3495;

      assert.equal(measure1.amountInUnit(0), random1);
      assert.equal(measure1.amountInUnit(1), convertedRandom1);

      //go the other direction:
      let random2 = Math.random() * 100;
      let measure2 = new meas.Measurement(random2, 1);

      //convert random2 to g:
      let convertedRandom2 = random2 * 28.3495;

      assert.equal(measure2.amountInUnit(1), random2);
      assert.equal(measure2.amountInUnit(0), convertedRandom2);
    });
  });

  describe('#amountInUnit() - invalid unit', function () {
    it('should default to converting to grams if given an invalid unit', function() {
      let random = Math.random() * 100;
      let measure = new meas.Measurement(random, 1);

      let convertedRandom = random * 28.3495;

      assert.equal(measure.amountInUnit("string"), convertedRandom);
      assert.equal(measure.amountInUnit(), convertedRandom);
      assert.equal(measure.amountInUnit(100), convertedRandom);
      assert.equal(measure.amountInUnit(0.5), convertedRandom);
      assert.equal(measure.amountInUnit(-4), convertedRandom);
    });
  });

});
