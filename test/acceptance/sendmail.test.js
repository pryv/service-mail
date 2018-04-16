// Tests sending of emails.

/* global describe, it, before, after */
const chai = require('chai');
const assert = chai.assert; 
const request = require('supertest');
const lodash = require('lodash');
const path = require('path');

const Application = require('../../src/application');

describe('Sending emails through SMTP', function() {
  
  // Run the app
  let app;
  before(async () => {
    const overrideSettings = {
      templates: {
        root: fixture_path('templates'),
        defaultLang: 'fr'
      }
    };
    app = await new Application().setup(overrideSettings);
    await app.run(); 
  });
  
  after(async () => {
    await app.close(); 
  });

  it('answers 200 OK', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/welcome/fr')
      .send({
        to: 'toto@test.com',
        substitutions: {
          name: 'toto',
          surname: 'yota'
        }
      })
      .expect(200);
  });
  
  it('throws if there is no template available for email content', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/nocontent/fr')
      .send({
        to: 'toto@test.com',
        substitutions: {
          name: 'toto',
          surname: 'yota'
        }
      })
      .expect(500);
  });
  
  it('chooses default language (fr) if there is no template available for requested language (en)', async () => {
    const result = await request(app.server.expressApp)
      .post('/sendmail/welcome/en')
      .send({
        to: 'toto@test.com',
        substitutions: {
          name: 'toto',
          surname: 'yota'
        }
      })
      .expect(200);
      
      const emailBody = result.body;
      assert.isNotNull(emailBody);
      emailContent = JSON.parse(emailBody.message);
      const frenchWord = 'bonjour';
      assert.include(emailContent.subject, frenchWord);
  });
  
  it('throws if there is no template available for email subject', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/nosubject/fr')
      .send({
        to: 'toto@test.com',
        substitutions: {
          name: 'toto',
          surname: 'yota'
        }
      })
      .expect(500);
  });
  
  it('throws if substitution variables are missing', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/welcome/fr')
      .send({
        to: 'toto@test.com'
      })
      .expect(500);
  });
  
  it('throws if recipient is missing', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/welcome/fr')
      .send({
        substitutions: {
          name: 'toto',
          surname: 'yota'
        }
      })
      .expect(500);
  });
  
  describe('Validation of the sent email', async () => {
    
    const template = 'welcome/fr';
    const recipient = 'toto@test.com';
    const substitutions = {
      name: 'toto',
      surname: 'yota'
    };
    
    // Send a test email
    let emailEnvelope, emailContent;
    before(async () => {
      // NOTE: For some reason, email-templates library is adding
      // properties to the substitutions object we pass as parameter here.
      // Thus we clone it so that the original substitutions stay untouched.
      const subs = lodash.cloneDeep(substitutions);
      const result = await request(app.server.expressApp)
        .post('/sendmail/' + template)
        .send({
          to: recipient,
          substitutions: subs
        })
        .expect(200);
        assert.isNotNull(result);
        const emailBody = result.body;
        assert.isNotNull(emailBody);
        emailEnvelope = emailBody.envelope;
        assert.isNotNull(emailEnvelope);
        emailContent = JSON.parse(emailBody.message);
        assert.isNotNull(emailContent);
    });
    
    it('has a valid envelope (from/to)', async () => {
      const expectedFrom = app.settings.get('email.from');
      assert.isNotNull(emailEnvelope.to);
      assert.strictEqual(emailEnvelope.to.length, 1);
      assert.strictEqual(emailEnvelope.to[0], recipient);
      assert.strictEqual(emailEnvelope.from, expectedFrom);
    });
    
    it('has a valid content (subject/text/html)', async () => {
      assert.isNotNull(emailContent.subject);
      assert.isNotNull(emailContent.text);
      assert.isNotNull(emailContent.html);
    });
    
    it('is written in the correct language (french)', async () => {
      const frenchWord = 'bonjour';
      assert.include(emailContent.subject, frenchWord);
      assert.include(emailContent.text, frenchWord);
      assert.include(emailContent.html, frenchWord);
    });
    
    it('contains all the substituted variables', async () => {
      for (sub of Object.values(substitutions)) {
        assert.include(emailContent.text, sub);
        assert.include(emailContent.html, sub);
      }
    });
    
  });
});

function fixture_path(...fragments) {
  return path.join(__dirname, '../fixtures', ...fragments);
}