/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */

/* global describe, it, before, beforeEach, afterEach */

const chai = require('chai');
const assert = chai.assert;
const superagent = require('superagent');

const Application = require('../../src/Application');

describe('Server', function () {
  const request = superagent;

  // Start the server
  let server;
  before(async () => {
    const app = await new Application().setup();
    server = app.server;
  });

  it('can be constructed', function () {
    assert.isNotNull(server);
  });

  describe('.start', function () {
    beforeEach(async () => {
      await server.start();
    });
    afterEach(async () => {
      await server.stop();
    });

    it('starts a http server on configured port', function () {
      // Now we should have a local server running.
      const statusURL = toURL('/system/status');
      const response = request.get(statusURL);

      return response.then((res) => {
        assert.strictEqual(res.status, 200);
      });
    });
  });

  function toURL (path) {
    return new URL(path, server.baseURL).href;
  }
});
