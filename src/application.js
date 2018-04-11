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
  }
  
  initLogger() {
    const settings = this.settings;
    const logSettings = settings.get('logs').obj();
    const logFactory = this.logFactory = logging(logSettings).getLogger;
    
    const logger = this.logger = logFactory('application');
    
    const consoleLevel = settings.get('logs.console.level').str();
    logger.info(`Console logging is configured at level '${consoleLevel}'`);
  }
  
  initContext() {    
    this.context = new Context(this.settings, this.logFactory('context'));
    this.logger.info('Context initialized.')
  }
  
  async setup(overrideSettings) {
    
    await this.initSettings(overrideSettings);
    assert(this.settings != null, 'AF: settings init has succeeded');

    this.initLogger();
    assert(this.logger != null, 'AF: logger init has succeeded');

    this.initContext();
    assert(this.context != null, 'AF: context init has succeeded');
    
    this.server = new Server(this.settings, this.context);
    
    return this; 
  }
  
  run() {
    this.logger.info('Starting the server...')
    this.server.start(); 
  }
}

module.exports = Application; 
