const assert = require('assert');
const util = require('./TestUtil.js')
const meas = require('../model/Measurement.js');

describe('Measurement', function() {

  describe('Construction', function() {
    it('should return the values it is constructed with, assuming they are valid', function() {
      let measure1 = new meas.Measurement(25.3, 1);
      let measure2 = new meas.Measurement(0, 0);

      util.assertNumberEqual(measure1.amount, 25.3);
      util.assertNumberEqual(measure2.amount, 0);

      assert.equal(measure1.unit, 1);
      assert.equal(measure2.unit, 0);
    });

    it('should set amount to 1 if the amount it is constructed with is below 0', function() {
      let measure1 = new meas.Measurement(-12, 0);
      let measure2 = new meas.Measurement(-0.1, 1);

      util.assertNumberEqual(measure1.amount, 1);
      util.assertNumberEqual(measure2.amount, 1);
    });

    it('should default to 1 if the amount constructed with is not a number', function() {
      let measure1 = new meas.Measurement("not a number", 0);
      let measure2 = new meas.Measurement([1, 3, 4], 0);

      assert.equal(measure1.amount, 1);
      assert.equal(measure2.amount, 1);
    });

    it('should default to unit 0 (grams) if the given unit is not in the UNITS_TABLE', function() {
      let measure1 = new meas.Measurement(23, -5);
      let measure2 = new meas.Measurement(22, 999);
      let measure3 = new meas.Measurement(22, "not even an index");

      assert.equal(measure1.unit, 0);
      assert.equal(measure2.unit, 0);
      assert.equal(measure3.unit, 0);
    });

  });

  describe('Immutability', function() {
    it('should not allow the amount or the unit to change after construction', function() {
      let initialAmount = 22.1;
      let initialUnit = 0;
      let measure = new meas.Measurement(initialAmount, initialUnit);
      measure.amount = 2;
      measure.unit = 1;

      util.assertNumberEqual(measure.amount, initialAmount);
      assert.equal(measure.unit, initialUnit)
    });
  });

  describe('#amountInUnit()', function() {
    it('should return the value converted to any unit in the UNITS_TABLE ', function() {
      let random1 = Math.random() * 100;
      let measure1 = new meas.Measurement(random1, 0);

      //convert random1 to oz.:
      let convertedRandom1 = random1 / 28.3495;

      util.assertNumberEqual(measure1.amountInUnit(0), random1);
      util.assertNumberEqual(measure1.amountInUnit(1), convertedRandom1);

      //go the other direction:
      let random2 = Math.random() * 100;
      let measure2 = new meas.Measurement(random2, 1);

      //convert random2 to g:
      let convertedRandom2 = random2 * 28.3495;

      util.assertNumberEqual(measure2.amountInUnit(1), random2);
      util.assertNumberEqual(measure2.amountInUnit(0), convertedRandom2);
    });

    it('should default to converting to grams if given an invalid unit', function() {
      let random = Math.random() * 100;
      let measure = new meas.Measurement(random, 1);

      let convertedRandom = random * 28.3495;

      util.assertNumberEqual(measure.amountInUnit("string"), convertedRandom);
      util.assertNumberEqual(measure.amountInUnit(), convertedRandom);
      util.assertNumberEqual(measure.amountInUnit(100), convertedRandom);
      util.assertNumberEqual(measure.amountInUnit(0.5), convertedRandom);
      util.assertNumberEqual(measure.amountInUnit(-4), convertedRandom);
    });
  });

});
