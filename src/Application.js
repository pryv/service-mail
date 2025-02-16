/**
 * @license
 * Copyright (C) Pryv S.A. https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
// Load configuration file and start the server.

const path = require('path');

const { getLogger, getConfig } = require('@pryv/boiler').init({
  appName: 'service-mail',
  baseFilesDir: path.resolve(__dirname, '../../../'),
  baseConfigDir: path.resolve(__dirname, '../config/')
});

const Context = require('./Context');
const Server = require('./Server');

/** The mailing application holds references to all subsystems and ties everything
 * together.
 */
class Application {
  async setup (testConfig) {
    this.settings = await getConfig();
    this.settings.injectTestConfig(testConfig || {});
    this.logger = getLogger('application');
    this.context = new Context(this.settings, getLogger('context'));
    this.server = new Server(this.settings, this.context);
    return this;
  }

  async run () {
    await this.server.start();
  }

  async close () {
    await this.server.stop();
  }
}

module.exports = Application;
