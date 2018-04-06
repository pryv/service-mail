/* global describe, it */

const chai = require('chai');
const assert = chai.assert;

const { settings } = require('./test-helpers');

describe('Settings', function() {
  it('should have been loaded for test execution', function() {
    assert.isNotNull(settings);
  });
});
