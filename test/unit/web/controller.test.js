const should = require('should');
/* global describe, it */

require('../test-helpers');

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
        should.not.exist(res);
        should.exist(err);
        // TODO: should(err).be.instanceof(APIError);
        // TODO: should(err.id).be.equal(ErrorIds.MissingHeader);
        done();
      });
    });

    it('should reject if substitution variables are missing', (done) => {
      const req = {
        params: {},
        headers: {to: 'test@test.com'}
      };

      controller.storeSeriesData(req, {}, (err, res) => {
        should.not.exist(res);
        should.exist(err);
        // TODO: should(err).be.instanceof(APIError);
        // TODO: should(err.id).be.equal(ErrorIds.InvalidItemId);
        done();
      });
    });

  });
});