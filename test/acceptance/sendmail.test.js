// Tests sending of emails.

/* global describe, it, before, after */
const chai = require('chai');
const assert = chai.assert; 
const request = require('supertest');
const nodemailer = require('nodemailer');

const Context = require('../../src/context');
const Application = require('../../src/application');

describe('Sending emails through SMTP', function() {
  
  // Run the app
  let app;
  before(async () => {
    app = await new Application().setup();
    app.run(); 
  });
  
  after(() => {
    app.server.stop(); 
  });

  it('should send valid welcome email', async function () {
    const recipient = 'toto@test.com';
    const substitutions = {name: 'Toto', email: recipient, user: 'toto'};
    
    const emailInfo = await request(app.server.expressApp)
      .post('/sendmail/welcome/en')
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
    const expectedFrom = app.settings.get('email.from').str();
    assert.isNotNull(envelope);
    assert.strictEqual(envelope.to[0], to);
    assert.strictEqual(envelope.from, expectedFrom);
    
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
