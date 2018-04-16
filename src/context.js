const mailing = require('email-templates');
const lodash = require('lodash');

// Application context object, holding references to all major subsystems. Once
// the system is initialized, these instance references will not change  any
// more and together make up the configuration of the system.  
// 
class Context {
  
  constructor(settings, logger) {
    const emailConfig= settings.get('email');
    
    let transportConfig;
    // Using sendmail command as transport
    if(settings.get('sendmail.active')) {
      transportConfig = {
        sendmail: true,
        path: settings.get('sendmail.path')
      }
    }
    // Using SMTP as transport
    else {
      transportConfig = settings.get('smtp');
    }
        
    const templatesConfig = settings.get('templates');
    
    this.defaultLang = templatesConfig.defaultLang;
    this.authKey = settings.get('http.auth');
    
    this.mailing = new mailing({
      message: emailConfig,
      views: templatesConfig,
      transport: transportConfig,
      preview: false, // If true, it will open a webpage with a preview
    });
  }
  
}
module.exports = Context;
