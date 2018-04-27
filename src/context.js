const mailing = require('email-templates');
const lodash = require('lodash');

// Application context object, holding references to all major subsystems. Once
// the system is initialized, these instance references will not change  any
// more and together make up the configuration of the system.  
// 
class Context {
  
  constructor(settings, logFactory) {

    const logger = logFactory('context');

    const emailConfig= settings.get('email');
    
    let transportConfig;
    // Using sendmail command as transport
    if(settings.get('sendmail.active')) {
      logger.info('Using sendmail command to send emails.');
      transportConfig = {
        sendmail: true,
        path: settings.get('sendmail.path')
      }
    }
    // Using SMTP as transport
    else {
      logger.info('Using SMTP to send emails.');
      transportConfig = settings.get('smtp');
    }
        
    const templatesConfig = settings.get('templates');
    
    this.logFactory = logFactory;
    this.defaultLang = templatesConfig.defaultLang;
    this.authKey = settings.get('http.auth');
    this.mailing = new mailing({
      message: emailConfig,
      views: templatesConfig,
      transport: transportConfig,
      preview: false, // If true, it will open a webpage with a preview
      send: true // Activate/deactivate the actual sending (prod/test env)
    });
  }
  
}
module.exports = Context;
