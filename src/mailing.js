const EmailDelivery = require('email-templates');
const errors = require('./errors');
const Templating = require('./templating');

// Class that encapsulates the configuration of the emails transport
// and provides the sending method.
// 
class Mailing {
  
  constructor(settings, logFactory) {
    const logger = logFactory('Mailing');
    const emailSettings = settings.get('email');
    const templatesSettings = settings.get('templates');
    const transportSettings = loadTransport(settings, logger);
            
    this.deliveryService = new EmailDelivery({
      message: emailSettings.message,
      views: templatesSettings,
      transport: transportSettings,
      preview: emailSettings.preview, // If true, it will open a webpage with a preview
      send: emailSettings.send // Activate/deactivate the actual sending (prod/test env)
    });
    
    this.templates = new Templating(templatesSettings, logFactory, this.deliveryService.templateExists);
  }
  
  async send(template, lang, substitutions, recipient) {
    
    const email = recipient.email;
    const name = recipient.name;
    if (email == null) throw errors.invalidRequestStructure('Missing recipient email.');
    if (name == null) throw errors.invalidRequestStructure('Missing recipient name.');
    
    const loadedTemplate = await this.templates.load(template, lang);
    
    return await this.deliveryService.send({
      message: {
        to: {
          name: name,
          address: email
        }
      },
      template: loadedTemplate,
      locals: substitutions
    });
  }
    
}

// Load the transport method (sendmail method or SMTP)
function loadTransport(settings, logger) {
  // Using sendmail command
  if(settings.get('sendmail.active')) {
    logger.info('Using sendmail command to send emails.');
    return {
      sendmail: true,
      path: settings.get('sendmail.path')
    };
  }
  // Using SMTP
  else {
    logger.info('Using SMTP to send emails.');
    return settings.get('smtp');
  }
}

module.exports = Mailing;
