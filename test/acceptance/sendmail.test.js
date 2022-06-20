/**
 * @license
 * Copyright (C) 2018–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* global describe, it, before, after */

const chai = require('chai');
const assert = chai.assert;
const request = require('supertest');
const lodash = require('lodash');
const path = require('path');

const Application = require('../../src/Application');

const authKey = 'adminKey';

describe('Sending emails through SMTP', function () {
  // Run the app
  let app;
  before(async () => {
    const overrideSettings = {
      templates: {
        root: fixturePath('templates'),
        defaultLang: 'fr'
      },
      http: {
        auth: authKey
      },
      email: {
        send: false
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
        to: {
          name: 'toto',
          email: 'toto@test.com'
        },
        substitutions: {
          name: 'toto',
          surname: 'yota'
        },
        key: authKey
      })
      .expect(200);
  });

  it('throws if authorization key is missing', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/welcome/fr')
      .send({
        to: {
          name: 'toto',
          email: 'toto@test.com'
        },
        substitutions: {
          name: 'toto',
          surname: 'yota'
        }
      })
      .expect(403);
  });

  it('throws if authorization key is invalid', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/welcome/fr')
      .send({
        to: {
          name: 'toto',
          email: 'toto@test.com'
        },
        substitutions: {
          name: 'toto',
          surname: 'yota'
        },
        key: 'notvalid'
      })
      .expect(403);
  });

  it('throws if there is no template available for email content', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/nocontent/fr')
      .send({
        to: {
          name: 'toto',
          email: 'toto@test.com'
        },
        substitutions: {
          name: 'toto',
          surname: 'yota'
        },
        key: authKey
      })
      .expect(404);
  });

  it('chooses default language (fr) if there is no template available for requested language (en)', async () => {
    const result = await request(app.server.expressApp)
      .post('/sendmail/welcome/en')
      .send({
        to: {
          name: 'toto',
          email: 'toto@test.com'
        },
        substitutions: {
          name: 'toto',
          surname: 'yota'
        },
        key: authKey
      })
      .expect(200);

    const emailBody = result.body;
    assert.isNotNull(emailBody);
    assert.isNotNull(emailBody.message);
    const emailContent = JSON.parse(emailBody.message);
    const frenchWord = 'bonjour';
    assert.include(emailContent.subject, frenchWord);
  });

  it('throws if there is no template available for email subject', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/nosubject/fr')
      .send({
        to: {
          name: 'toto',
          email: 'toto@test.com'
        },
        substitutions: {
          name: 'toto',
          surname: 'yota'
        },
        key: authKey
      })
      .expect(404);
  });

  it('throws if substitution variables are missing', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/welcome/fr')
      .send({
        to: {
          name: 'toto',
          email: 'toto@test.com'
        },
        key: authKey
      })
      .expect(400);
  });

  it('throws if recipient is missing', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/welcome/fr')
      .send({
        substitutions: {
          name: 'toto',
          surname: 'yota'
        },
        key: authKey
      })
      .expect(400);
  });

  it('throws if recipient email is missing', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/welcome/fr')
      .send({
        to: {
          name: 'toto'
        },
        substitutions: {
          name: 'toto',
          surname: 'yota'
        },
        key: authKey
      })
      .expect(400);
  });

  it('throws if recipient name is missing', async () => {
    await request(app.server.expressApp)
      .post('/sendmail/welcome/fr')
      .send({
        to: {
          email: 'toto@test.com'
        },
        substitutions: {
          name: 'toto',
          surname: 'yota'
        },
        key: authKey
      })
      .expect(400);
  });

  describe('Validation of the sent email', async () => {
    const template = 'welcome/fr';
    const recipient = {
      name: 'toto',
      email: 'toto@test.com'
    };
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
          substitutions: subs,
          key: authKey
        })
        .expect(200);
      assert.isNotNull(result);
      const emailBody = result.body;
      assert.isNotNull(emailBody);
      emailEnvelope = emailBody.envelope;
      assert.isNotNull(emailEnvelope);
      assert.isNotNull(emailBody.message);
      emailContent = JSON.parse(emailBody.message);
      assert.isNotNull(emailContent);
    });

    it('has a valid envelope (from/to)', async () => {
      const expectedFrom = app.settings.get('email.message.from');
      assert.isNotNull(emailEnvelope.to);
      assert.strictEqual(emailEnvelope.to.length, 1);
      assert.strictEqual(emailEnvelope.to[0], recipient.email);
      assert.strictEqual(emailEnvelope.from, expectedFrom.address);
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
      for (const sub of Object.values(substitutions)) {
        assert.include(emailContent.text, sub);
        assert.include(emailContent.html, sub);
      }
    });
  });
});

describe('Sending emails through sendmail command', function () {
  // Run the app
  let app;
  before(async () => {
    const overrideSettings = {
      templates: {
        root: fixturePath('templates')
      },
      http: {
        auth: authKey
      },
      sendmail: {
        active: true,
        path: 'sendmail'
      },
      email: {
        send: false
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
        to: {
          name: 'toto',
          email: 'toto@test.com'
        },
        substitutions: {
          name: 'toto',
          surname: 'yota'
        },
        key: authKey
      })
      .expect(200);
  });
});

function fixturePath (...fragments) {
  return path.join(__dirname, '../fixtures', ...fragments);
}
