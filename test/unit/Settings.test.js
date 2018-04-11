/* global describe, it, beforeEach */

const chai = require('chai');
const assert = chai.assert; 

const Settings = require('../../src/settings');

describe('Settings', () => {
  
  describe('#loadFromFile(json_file_path)', () => {
    let settings; 
    beforeEach(() => {
      settings = new Settings(); 
    });

    it('loads settings from an extended JSON file', async () => {
      await settings.loadFromFile(fixture_path('settings/extended.json'));
      
      const format = settings.get('format').str();
      assert.strictEqual(format, 'Normal JSON');
    });
    it('loads settings from an extended HJSON file', async () => {
      await settings.loadFromFile(fixture_path('settings/extended.hjson'));
      
      const format = settings.get('format').str();
      assert.strictEqual(format, 'HJSON');
    });
    it('loads settings from an extended YAML file', async () => {
      await settings.loadFromFile(fixture_path('settings/extended.yaml'));
      
      const format = settings.get('format').str();
      assert.strictEqual(format, 'YAML');
    });
  });
});

const path = require('path');

function fixture_path(...fragments) {
  return path.join(__dirname, '../fixtures', ...fragments);
}
