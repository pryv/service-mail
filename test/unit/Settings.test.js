/**
 * @license
 * Copyright (C) 2018–2022 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/* global describe, it, beforeEach */

const chai = require('chai');
const assert = chai.assert;
const path = require('path');

const Settings = require('../../src/Settings');

describe('Settings', () => {
  describe('loadFromFile(json_file_path)', () => {
    let settings;
    beforeEach(() => {
      settings = new Settings();
    });

    it('loads settings from an extended JSON file', async () => {
      await settings.loadFromFile(fixturePath('settings/extended.json'));

      const format = settings.get('format');
      assert.strictEqual(format, 'Normal JSON');
    });

    it('loads settings from an extended HJSON file', async () => {
      await settings.loadFromFile(fixturePath('settings/extended.hjson'));

      const format = settings.get('format');
      assert.strictEqual(format, 'HJSON');
    });

    it('loads settings from an extended YAML file', async () => {
      await settings.loadFromFile(fixturePath('settings/extended.yaml'));

      const format = settings.get('format');
      assert.strictEqual(format, 'YAML');
    });
  });
});

function fixturePath (...fragments) {
  return path.join(__dirname, '../fixtures', ...fragments);
}
