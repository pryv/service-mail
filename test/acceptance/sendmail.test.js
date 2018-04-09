// Tests sending of emails.

/* global describe, it, before, after */
const chai = require('chai');
const assert = chai.assert; 
const request = require('supertest');
const nodemailer = require('nodemailer');

const {settings, logFactory} = require('./test-helpers');
const Context = require('../../src/context');
const Server = require('../../src/server');

describe('Sending emails through SMTP', function() {
  
  // Build the context
  let context, emailDefaults, transportConfig;
  before(() => {
    emailDefaults = settings.get('email.defaults').obj();
    transportConfig = settings.get('smtp').obj();
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

  it('should send valid welcome email', async function () {
    const recipient = 'toto@test.com';
    const substitutions = {name: 'toto'};
    
    const emailInfo = await request(server.expressApp)
      .post('/sendmail/welcome')
      .send({
        to: recipient,
        substitutions: substitutions
      })
      .expect(200);
      
    return emailValidation(emailInfo, recipient, substitutions);
  });
  
  function emailValidation(result, to, subs) {
    const email = result.body;
    assert.isNotNull(email);
    
    // Check email envelope
    const envelope = email.envelope;
    assert.isNotNull(envelope);
    assert.strictEqual(envelope.to[0], to);
    assert.strictEqual(envelope.from, emailDefaults.from);
    
    // Check content of the email, i.e. the substitution of variables
    const validationURL = nodemailer.getTestMessageUrl(email);
    assert.isNotNull(validationURL);
    assert.isNotFalse(validationURL);
    
    return request(validationURL)
      .get('/')
      .expect(200)
      .then((res) => {
        for (sub in subs) {
          assert.include(res.text, sub);
        }
      });
  }
});
