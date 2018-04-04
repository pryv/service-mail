// Load configuration file and start the server. 

const logging = require('./logging');

const Context = require('./context');
const Settings = require('./settings');
const Server = require('./server'); 

function createSettings() {
  try {
    return Settings.load(); 
  } catch(err) {
    if (err.code == 'ENOENT') {
      console.error('Configuration file not found. '     // eslint-disable-line no-console
        + 'Default location is \'./dev.json\'. '
        + 'Use --config to modify expected location.');
      process.exit(1);
      // NOT REACHED
    }
    
    throw err; 
  }
}

function createLogFactory(settings) {
  const logSettings = settings.get('logs').obj();
  return logging(logSettings).getLogger;
}

function createContext(settings, logFactory) {
  // TODO: For now Context is empty but will probably contain templating
  return new Context(settings, logFactory);
}

/** The mailing application holds references to all subsystems and ties everything
 * together. 
 */
class Application {
  
  init(settings) {
    this.settings = settings || createSettings(); 
    this.logFactory = createLogFactory(this.settings);
    
    this.context = createContext(this.settings, this.logFactory);
    
    this.server = new Server(this.settings);
    
    return this; 
  }
  
  start() {
    this.server.start(); 
    
    return this; 
  }
  
  run() {
    this.init(); 
    this.start(); 
  }
}

module.exports = Application; 
