// Tests sending of emails.

/* global describe, it, before, after */
const chai = require('chai');
const assert = chai.assert; 
const request = require('supertest');
const lodash = require('lodash');

const Application = require('../../src/application');

describe('Sending emails through SMTP', function() {
  
  // Run the app
  let app;
  before(async () => {
    const overrideSettings = {
      templates: {
        root: fixture_path('templates')
      }
    };
    app = await new Application().setup(overrideSettings);
    app.run(); 
  });
  
  after(() => {
    app.server.stop(); 
  });

  it('should send valid welcome email', async function () {
    
    const recipient = 'toto@test.com';
    const substitutions = {
      name: 'toto',
      surname: 'yota'
    };
    
    // NOTE: For some reason, email-templates library is adding
    // properties to the substitutions object we pass as parameter here.
    // Thus we clone it so that the original substitutions stay untouched.
    const subs = lodash.cloneDeep(substitutions);
    const emailInfo = await request(app.server.expressApp)
      .post('/sendmail/welcome/fr')
      .send({
        to: recipient,
        substitutions: subs
      })
      .expect(200);
    return emailValidation(emailInfo, recipient, substitutions);
  });
  
  it('throws if there is no template available', async () => {
    assert.throws(async () => {
      const template = "notFound/eo";
      // TODO: sendmail
    });
  });
  
  it('throws if some substitution variables are not provided', async () => {
    assert.throws(async () => {
      const substitutions = {};
      // TODO: sendmail
    });
  });
  
  function emailValidation(result, to, subs) {
    const email = result.body;
    assert.isNotNull(email);
    
    // Validate that email was sent from/to the right sender/recipient
    const envelope = email.envelope;
    const expectedFrom = app.settings.get('email.from');
    assert.isNotNull(envelope);
    assert.isNotNull(envelope.to);
    assert.strictEqual(envelope.to.length, 1);
    assert.strictEqual(envelope.to[0], to);
    assert.strictEqual(envelope.from, expectedFrom);
    
    // Validate email content
    const content = JSON.parse(email.message);
    assert.isNotNull(content.subject);
    assert.isNotNull(content.text);
    assert.isNotNull(content.html);
    
    // Validate email language (fr)
    const frenchWord = 'bonjour';
    assert.include(content.subject, frenchWord);
    assert.include(content.text, frenchWord);
    assert.include(content.html, frenchWord);
    
    // Validate email subsitution of variables
    for (sub of Object.values(subs)) {
      assert.include(content.text, sub);
      assert.include(content.html, sub);
    }
  }
});

const path = require('path');

function fixture_path(...fragments) {
  return path.join(__dirname, '../fixtures', ...fragments);
}