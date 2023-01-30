/**
 * @license
 * Copyright (C) 2018–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
class Sender {
  constructor (deliveryService) {
    this.deliveryService = deliveryService;
  }

  // (MailTemplate, Object, Object) -> void
  async renderAndSend (template, substitutions, recipient) {
    const sendOp = new SendOperation(recipient, substitutions, this.deliveryService);
    return await template.executeSend(sendOp);
  }
}

class SendOperation {
  constructor (recipient, substitutions, deliveryService) {
    this.recipient = recipient;
    this.substitutions = substitutions;
    this.deliveryService = deliveryService;
  }

  async sendMail (templateRoot) {
    return await this.deliveryService.send({
      message: {
        to: {
          name: this.recipient.name,
          address: this.recipient.email
        }
      },
      template: templateRoot,
      locals: this.substitutions
    });
  }
}

module.exports = Sender;
