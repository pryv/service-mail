
/** POST /sendmail/welcome - Send a welcome email. 
 */
async function sendMail(ctx, req, res) {
  
  let lang = req.params.lang;
  const template = req.params.template;
  const substitutions = req.body.substitutions;
  const recipient = req.body.to;
  const key = req.body.key;

  if(key !== ctx.authKey) {
    throw new Error('Not authorized.');
  }

  // If params are not there, abort. 
  // TODO: use custom errors through factory?
  if (substitutions == null) throw new Error('Missing substitution variables.');
  if (recipient == null) throw new Error('Missing recipient email address.');
  
  const mailing = ctx.mailing;
  
  const htmlTemplate = templatePath(template, lang, 'html.pug');
  let templateFound = await mailing.templateExists(htmlTemplate);

  // No template found for requested language, trying with default language
  if(templateFound === false) {
    if(ctx.defaultLang != null) {
      const defaultTemplate = templatePath(template, ctx.defaultLang, 'html.pug');
      const defaultTemplateExists = await mailing.templateExists(defaultTemplate);
      if(defaultTemplateExists !== false) {
        lang = ctx.defaultLang;
        templateFound = true;
      }
    }
  }
  
  // Still no template found, give up
  if(templateFound === false) {
    throw new Error(`No available template found for content: ${templatePath(template, lang)}`);
  }
  
  const subject = templatePath(template, lang, 'subject.pug');
  const subjectTemplateExists = await mailing.templateExists(subject);
  if(subjectTemplateExists === false) {
    throw new Error(`No available template found for subject: ${subject}`);
  }
    
  const result = await mailing.send({
    message: {to: recipient},
    template: templatePath(template, lang),
    locals: substitutions
  });
  
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
