var assert = require('assert');

const NUM_EQUAL_THRESHOLD = 0.00001;

function assertNumberEqual(number1, number2) {
  assert(Math.abs(number1 - number2) < NUM_EQUAL_THRESHOLD);
}


module.exports = {
  assertNumberEqual
}
