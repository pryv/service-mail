/**
 * @license
 * Copyright (C) 2018–2023 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const errors = require('../../errors');

const { getLogger } = require('@pryv/boiler');
const logger = getLogger('sendmail');

/** POST /sendmail/welcome - Send a welcome email.
 */
async function sendMail (ctx, req, res) {
  const lang = req.params.lang;
  const template = req.params.template;
  const substitutions = req.body.substitutions;
  const recipient = req.body.to;
  const key = req.body.key;

  // If requested service is not authenticated, abort.
  if (key !== ctx.authKey) {
    throw errors.forbidden('Authorization key is missing or invalid.');
  }

  // If params are not there, abort.
  if (substitutions == null) throw errors.invalidRequestStructure('Missing substitution variables.');
  if (recipient == null) throw errors.invalidRequestStructure('Missing recipient.');
  if (recipient.email == null) throw errors.invalidRequestStructure('Missing recipient email.');
  if (recipient.name == null) throw errors.invalidRequestStructure('Missing recipient name.');

  const loadedTemplate = await ctx.templateRepository.find(template, lang);
  const result = await ctx.sender.renderAndSend(loadedTemplate, substitutions, recipient);

  logger.info('Email sent:', {recipient, template, response: result?.context?.response, rejected: result?.context?.rejected});

  res
    .status(200)
    .json(result);
}

module.exports = sendMail;
