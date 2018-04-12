const mailer = require('nodemailer');
const templater = require('email-templates');

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
    this.transporter = mailer.createTransport(transportConfig, emailConfig);
    
    const templatingConfig = settings.get('templates').obj();
    this.templating = new templater(templatingConfig);
  }
  
  async renderEmail(template, lang, recipient, substitutions) {
    const email = {
      to: recipient
    };
    const templatePath = [template, lang].join('/');
    const content = await this.templating.renderAll(templatePath, substitutions);
    email.subject = content.subject;
    email.html = content.html;
    email.text = content.text;
    return email;
  }
  
}
module.exports = Context;
