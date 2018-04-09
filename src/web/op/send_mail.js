
/** POST /sendmail/welcome - Send a welcome email. 
 */
async function sendMail(ctx, req, res) {
  
  const template = req.params.template;
  const substitutions = req.body.substitutions;
  const recipient = req.body.to;

  // If params are not there, abort. 
  if (substitutions == null) throw new Error('Missing substitution variables.');
  if (recipient == null) throw new Error('Missing recipient email address.');
    
  const email = {
    to: recipient
  };
  
  const transporter = ctx.transporter;
  const templating = ctx.templating;
  
  const content = await templating.renderAll(template, substitutions);
  email.subject = content.subject;
  email.html = content.html;
  email.text = content.text;

  const result = await transporter.sendMail(email);
  
  res
    .status(200)
    .json(result);
}

module.exports = sendMail;
