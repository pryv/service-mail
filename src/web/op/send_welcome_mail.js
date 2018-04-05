
/** POST /sendmail/welcome - Send a welcome email. 
 */
async function sendWelcomeMail(ctx, req, res) {
  
  const substitutions = req.body.substitutions;
  const recipient = req.body.to;

  // If params are not there, abort. 
  if (substitutions == null) throw new Error('Missing substitution variables.');
  if (recipient == null) throw new Error('Missing recipient email address.');
    
  const email = {
    to: recipient
  };
  
  const transport = ctx.transporter;
  const template = ctx.templater;
  
  const content = await template.renderAll('welcome', substitutions);
  email.subject = content.subject;
  email.html = content.html;
  email.text = content.text;

  const result = await transport.sendMail(email);
  
  res
    .status(200)
    .json(result);
}

module.exports = sendWelcomeMail;
