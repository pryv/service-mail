/* global describe, it */

const chai = require('chai');
const assert = chai.assert; 

const Application = require('../../src/application');

describe('Templates', () => {
  
  describe('renderEmail', () => {
    
    const recipient = 'toto';
    const template = 'welcome';
    const lang = 'fr';
    const substitutions = {
      name: 'toto',
      surname: 'yota'
    };
    
    // Build the app context, which contains the templating
    let ctx;
    before(async () => {
      const overrideSettings = {
        templates: {
          views: {
            root: fixture_path('templates')
          }
        }
      };
      const app = await new Application().setup(overrideSettings);
      ctx = app.context;
    });

    it('renders all available templates, while using user language', async () => {
      const email = await ctx.renderEmail(template, lang, recipient, substitutions);

      assert.isNotNull(email.subject);
      assert.isNotNull(email.text);
      assert.isNotNull(email.html);
      
      // Validate email recipient
      assert.strictEqual(email.to, recipient);
      
      // Validate email language (fr)
      const frenchWord = 'bonjour';
      assert.include(email.subject, frenchWord);
      assert.include(email.text, frenchWord);
      assert.include(email.html, frenchWord);
      
      // Validate email content (subsitution of variables)
      for (sub of Object.values(substitutions)) {
        assert.include(email.text, sub);
        assert.include(email.html, sub);
      }
      
    });
    
    it('throws if there is no template available', async () => {
      assert.throws(async () => {
        const template = "notFound";
        const lang = "eo";
        await ctx.renderEmail(template, lang, recipient, substitutions);
      });
    });
    
    it('throws if some substitution variables are not provided', async () => {
      assert.throws(async () => {
        const substitutions = {};
        await ctx.renderEmail(template, lang, recipient, substitutions);
      });
    });
  });
});

const path = require('path');

function fixture_path(...fragments) {
  return path.join(__dirname, '../fixtures', ...fragments);
}
