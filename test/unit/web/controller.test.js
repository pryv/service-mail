/* global describe, it */

const chai = require('chai');
const assert = chai.assert; 

const controllerFactory = require('../../../src/web/controller');
const controller = controllerFactory({});

describe('Controller', () => {

  describe('sendWelcomeMail', () => {

    it('should reject if recipient address is missing', (done) => {
      const req = {
        params: {},
        headers: {}
      };

      controller.sendWelcomeMail(req, {}, (err, res) => {
        assert.isNull(res);
        assert.isNotNull(err);
        // TODO: check error id/status
        done();
      });
    });

    it('should reject if substitution variables are missing', (done) => {
      const req = {
        params: {},
        headers: {to: 'test@test.com'}
      };

      controller.sendWelcomeMail(req, {}, (err, res) => {
        assert.isNull(res);
        assert.isNotNull(err);
        // TODO: check error id/status
        done();
      });
    });

  });
});