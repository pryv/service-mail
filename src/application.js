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
  const emailDefaults = settings.get('email.defaults').obj();
  
  let transportConfig;
  // Using sendmail command as transport
  if(settings.get('sendmail.active').bool()) {
    transportConfig = {
      sendmail: true,
      path: settings.get('sendmail.path').str()
    }
  }
  // Using SMTP as transport
  else {
    transportConfig = settings.get('smtp').obj();
  }
  return new Context(transportConfig, emailDefaults, logFactory);
}

/** The mailing application holds references to all subsystems and ties everything
 * together. 
 */
class Application {
  
  init(settings) {
    this.settings = settings || createSettings(); 
    this.logFactory = createLogFactory(this.settings);
    
    this.context = createContext(this.settings, this.logFactory);
    
    this.server = new Server(this.settings, this.context);
    
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
