// Load configuration file and start the server. 

const assert = require('assert');

const logging = require('./logging');
const Context = require('./context');
const Settings = require('./settings');
const Server = require('./server'); 

/** The mailing application holds references to all subsystems and ties everything
 * together. 
 */
class Application {
  
  async initSettings(overrideSettings) {
    this.settings = new Settings(); 

    await this.settings.parseCLargs(process.argv);

    if (overrideSettings != null) {
      this.settings.merge(overrideSettings);
    }
    
    assert(this.settings != null, 'AF: settings init has succeeded');
  }
  
  initLogger() {
    const settings = this.settings;
    const logSettings = settings.get('logs').obj();
    const logFactory = this.logFactory = logging(logSettings).getLogger;
    const logger = this.logger = logFactory('application');
    const consoleLevel = settings.get('logs.console.level').str();
    
    assert(this.logger != null, 'AF: logger init has succeeded');
    logger.info(`Console logging is configured at level '${consoleLevel}'`);
  }
  
  initContext() {    
    this.context = new Context(this.settings, this.logFactory('context'));
    
    assert(this.context != null, 'AF: context init has succeeded');
    this.logger.info('Context initialized.');
  }
  
  async setup(overrideSettings) {
    
    await this.initSettings(overrideSettings);
    this.initLogger();
    this.initContext();
    
    this.server = new Server(this.settings, this.context);
    
    return this; 
  }
  
  run() {
    this.logger.info('Starting the server...')
    this.server.start(); 
  }
}

module.exports = Application; 
