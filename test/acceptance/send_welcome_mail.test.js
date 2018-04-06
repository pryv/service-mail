// Tests sending of emails.

/* global describe, it, before, after */
const chai = require('chai');
const assert = chai.assert; 
const request = require('supertest');
const nodemailer = require('nodemailer');

const {settings, logFactory} = require('./test-helpers');
const Context = require('../../src/context');
const Server = require('../../src/server')

describe('Sending emails', function() {
  
  // Set up a test account.
  let testAccount; 
  before(async () => {
    testAccount = await nodemailer.createTestAccount();
  });
  
  // Build the context
  let context;
  before(() => {
    const emailDefaults = settings.get('email.defaults').obj();
    let transportConfig = settings.get('smtp').obj();
    transportConfig.auth = {
      user: testAccount.user,
      pass: testAccount.pass
    }
    context = new Context(transportConfig, emailDefaults, logFactory);
  });
  
  // Now start the server.
  let server; 
  before(async () => {
    server = new Server(settings, context);
    server.start();
  });
  after(() => {
    server.stop(); 
  });

  it('should send valid welcome email', function () {
    const recipient = 'toto@test.com';
    return request(server.expressApp)
      .post('/sendmail/welcome')
      .send({
        to: recipient,
        substitutions: {name: 'toto'}
      })
      .expect(200)
      .then((res) => {
        assert.strictEqual(res.body.envelope.to[0], recipient);
        assert.isNotNull(res);
      });
  });

});
