const Mailing = require('./mailing.js');

// Application context object, holding references to all major subsystems. Once
// the system is initialized, these instance references will not change anymore
// and together make up the configuration of the system.  
// 
class Context {
  
  constructor(settings, logFactory) {
    this.logFactory = logFactory;
    this.authKey = settings.get('http.auth');
    this.mailing = new Mailing(settings, logFactory);
  }
  
}
module.exports = Context;
