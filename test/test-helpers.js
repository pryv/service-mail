// Helper methods and setup for all tests. 

const path = require('path');

function fixturePath(...args) {
  return path.join(__dirname, './fixtures', ...args).normalize(); 
}
  
const Settings = require('../src/settings');
const settings = Settings.loadFromFile(fixturePath('config.json'));

const logging = require('../src/logging');
const logSettings = settings.get('logs').obj();
const logFactory = logging(logSettings).getLogger;

module.exports = {
  settings: settings,
  logFactory: logFactory
};
