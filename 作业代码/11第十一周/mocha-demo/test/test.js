import add from '../add'

var assert = require('assert');

describe('add function testing', function () {
  it('1 + 2 shoulde be 3', function () {
    assert.equal(add(1, 2), 3);
  });

  it('-5 + 2 shoulde be -3', function () {
    assert.equal(add(-5, 2), -3);
  });
})

