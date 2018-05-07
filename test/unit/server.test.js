/* global describe, it, beforeEach, afterEach */

const chai = require('chai');
const assert = chai.assert;
const superagent = require('superagent');
const url = require('url');

const Application = require('../../src/application');

describe('Server', function() {
  const request = superagent;
  
  // Start the server
  let server;
  before(async () => {
    const app = await new Application().setup(); 
    server = app.server;
  });
  
  function toUrl(path) {
    const baseUrl = server.baseUrl; 
      
    return url.resolve(baseUrl, path);
  }

  it('can be constructed', function() {
    assert.isNotNull(server);
  });
  
  describe('.start', function() {    
    beforeEach( async () => {
      await server.start(); 
    });
    afterEach( async () => {
      await server.stop(); 
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

