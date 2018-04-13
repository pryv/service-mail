const mailing = require('email-templates');
const lodash = require('lodash');

// Application context object, holding references to all major subsystems. Once
// the system is initialized, these instance references will not change  any
// more and together make up the configuration of the system.  
// 
class Context {
  
  constructor(settings, logger) {
    const emailConfig= settings.get('email').obj();
    
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
        
    const templatesConfig = settings.get('templates').obj();
    
    this.mailing = new mailing({
      message: emailConfig,
      views: templatesConfig,
      transport: transportConfig,
      preview: false // If true, it will open a webpage with a preview
    });
  }
  
}
module.exports = Context;
