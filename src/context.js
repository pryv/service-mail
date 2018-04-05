const mailer = require('nodemailer');
const templater = require('email-templates');

// Application context object, holding references to all major subsystems. Once
// the system is initialized, these instance references will not change  any
// more and together make up the configuration of the system.  
// 
class Context {
  
  constructor(transportConfig, emailDefaults, logFactory) {
    this.transporter = mailer.createTransport(transportConfig, emailDefaults);
    this.templater = new templater();
  }
  
}
module.exports = Context;
