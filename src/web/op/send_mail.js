
/** POST /sendmail/welcome - Send a welcome email. 
 */
async function sendMail(ctx, req, res) {
  
  const template = req.params.template;
  const lang = req.params.lang;
  const substitutions = req.body.substitutions;
  const recipient = req.body.to;

  // If params are not there, abort. 
  // TODO: use custom errors through factory?
  if (substitutions == null) throw new Error('Missing substitution variables.');
  if (recipient == null) throw new Error('Missing recipient email address.');
  
  const mailing = ctx.mailing;
    
  const result = await mailing.send({
    message: {to: recipient},
    template: [template, lang].join('/'),
    locals: substitutions
  });
  
  res
    .status(200)
    .json(result);
}

module.exports = sendMail;
