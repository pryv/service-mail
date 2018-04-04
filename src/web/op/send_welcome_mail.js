const mailer = require('nodemailer');
const templater = require('email-templates');

async function buildEmail (sender, recipient, locals) {
  const email = {
    from: sender,
    to: recipient,
    subject: 'Message title',
    text: 'Plaintext version of the message',
    html: '<p>HTML version of the message -name-</p>',
  };
  
  // TODO: templater should be instantiated in context
  const content = await new templater().renderAll('welcome', locals);
  email.subject = content.subject;
  email.text = content.text;
  email.html = content.html;

  return email;
}

/** POST /sendmail/welcome - Send a welcome email. 
 */
async function sendWelcomeMail(ctx, req, res) {
  
  const substitutions = req.body.substitutions;
  const recipient = req.body.to;

  // If params are not there, abort. 
  if (substitutions == null) throw new Error('Missing substitution variables.');
  if (recipient == null) throw new Error('Missing recipient email address.');
  
  // TODO: transporter should be instantiated in context
  const transporter = mailer.createTransport(ctx.transportConfig);
  
  // TODO: sender can be set by default in context
  const email = await buildEmail(ctx.sender, recipient, substitutions);
  
  const result = await transporter.sendMail(email);
  
  res
    .status(200)
    .json(result);
}

module.exports = sendWelcomeMail;
