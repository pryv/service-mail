/* global describe, it, beforeEach, afterEach */

const chai = require('chai');
const assert = chai.assert;
const superagent = require('superagent');
const url = require('url');

const { settings } = require('./test-helpers');

const Application = require('../../src/application');

describe('Server', function() {
  const request = superagent;

  const application = new Application().init(settings); 
  const server = application.server; 
  
  function toUrl(path) {
    const baseUrl = server.baseUrl; 
      
    return url.resolve(baseUrl, path);
  }

  it('can be constructed', function() {
    assert.isNotNull(server);
  });
  
  describe('.start', function() {    
    beforeEach(function() {
      server.start(); 
    });
    afterEach(function() {
      server.stop(); 
    });
    
    it('starts a http server on configured port', function() {
      // Now we should have a local server running. 
      const statusUrl = toUrl('/system/status');
      var response = request.get(statusUrl);

      return response.then((res) => {
        assert.strictEqual(res.status, 200);
      });
    });
  });
}); 

