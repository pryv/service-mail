/**
 * @license
 * Copyright (C) 2018–2024 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const EmailTemplates = require('email-templates');
const TemplateRepository = require('./mail/TemplateRepository.js');
const Sender = require('./mail/Sender');

// Application context object, holding references to all major subsystems. Once
// the system is initialized, these instance references will not change anymore
// and together make up the configuration of the system.
//
class Context {
  constructor (settings, logger) {
    this.logger = logger;
    const defaultLanguage = this.defaultLanguage = settings.get('templates:defaultLang');

    this.authKey = settings.get('http:auth');

    const delivery = this.deliveryService = this.configureDelivery(settings, logger);
    this.templateRepository = new TemplateRepository(defaultLanguage, delivery.templateExists);
    this.sender = new Sender(delivery);
  }

  configureTransport (settings, logger) {
    if (settings.get('sendmail:active')) {
      // Using sendmail command
      logger.info('Using sendmail command to send emails.');
      return {
        sendmail: true,
        path: settings.get('sendmail:path')
      };
    } else {
      // Using SMTP
      logger.info('Using SMTP to send emails.');
      return settings.get('smtp');
    }
  }

  configureDelivery (settings, logger) {
    const emailSettings = settings.get('email');
    const templatesSettings = settings.get('templates');
    const transportSettings = this.configureTransport(settings, logger);

    return new EmailTemplates({
      message: emailSettings.message,
      views: templatesSettings,
      transport: transportSettings,
      // If true, it will open a webpage with a preview
      preview: emailSettings.preview,
      // Activate/deactivate the actual sending (prod/test env)
      send: emailSettings.send
    });
  }
}

module.exports = Context;
