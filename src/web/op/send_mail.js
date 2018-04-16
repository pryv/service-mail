
/** POST /sendmail/welcome - Send a welcome email. 
 */
async function sendMail(ctx, req, res) {
  
  const template = [req.params.template, req.params.lang].join('/')
  const substitutions = req.body.substitutions;
  const recipient = req.body.to;

  // If params are not there, abort. 
  // TODO: use custom errors through factory?
  if (substitutions == null) throw new Error('Missing substitution variables.');
  if (recipient == null) throw new Error('Missing recipient email address.');
  
  const mailing = ctx.mailing;
  
  const htmlTemplateExists = await mailing.templateExists(template+'/html.pug');
  const textTemplateExists = await mailing.templateExists(template+'/text.pug');
  if(htmlTemplateExists === false && textTemplateExists === false) {
    // TODO: take another default template
    throw new Error('No existing template found for: ' + template);
  }
    
  const result = await mailing.send({
    message: {to: recipient},
    template: template,
    locals: substitutions
  });
  
  res
    .status(200)
    .json(result);
}

module.exports = sendMail;
