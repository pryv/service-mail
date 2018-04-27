const errors = require('../../errors');

/** POST /sendmail/welcome - Send a welcome email. 
 */
async function sendMail(ctx, req, res) {
  const logger = ctx.logFactory('sendmail');
  
  let lang = req.params.lang;
  const template = req.params.template;
  const substitutions = req.body.substitutions;
  const recipient = req.body.to;
  const key = req.body.key;

  if(key !== ctx.authKey) {
    throw errors.forbidden('Authorization key is missing or invalid.');
  }

  // If params are not there, abort. 
  if (substitutions == null) throw errors.invalidRequestStructure('Missing substitution variables.');
  if (recipient == null) throw errors.invalidRequestStructure('Missing recipient.');
  if (recipient.email == null) throw errors.invalidRequestStructure('Missing recipient email.');
  if (recipient.name == null) throw errors.invalidRequestStructure('Missing recipient name.');

  const mailing = ctx.mailing;
  
  const htmlTemplate = templatePath(template, lang, 'html.pug');
  const defaultTemplate = templatePath(template, ctx.defaultLang, 'html.pug');
  let templateFound = await mailing.templateExists(htmlTemplate);

  // No template found for requested language, trying with default language
  if(templateFound === false) {
    if(ctx.defaultLang != null) {
      const defaultTemplateExists = await mailing.templateExists(defaultTemplate);
      if(defaultTemplateExists !== false) {
        lang = ctx.defaultLang;
        templateFound = true;
        logger.warn(`Template not found: ${htmlTemplate}, using default language: ${defaultTemplate}`);
      }
    }
  }
  
  // Still no template found, give up
  if(templateFound === false) {
    throw errors.unknownResource(`Template not found: ${htmlTemplate}, default language not found neither: ${defaultTemplate}`);
  }
  
  const subjectTemplate = templatePath(template, lang, 'subject.pug');
  const subjectTemplateExists = await mailing.templateExists(subjectTemplate);
  if(subjectTemplateExists === false) {
    throw errors.unknownResource(`Template not found : ${subjectTemplate}`);
  }
    
  const result = await mailing.send({
    message: {
      to: {
        name: recipient.name,
        address: recipient.email
      }
    },
    template: templatePath(template, lang),
    locals: substitutions
  });
  
  logger.info('Email sent:', result);
  
  res
    .status(200)
    .json(result);
}

function templatePath(template, lang, file) {
  let items = [template, lang];
  if(file != null) {
    items.push(file);
  }
  return items.join('/');
}

module.exports = sendMail;
