const mailer = require('nodemailer');
const templater = require('email-templates');
const path = require('path');

// Some options
const FROM = 'sender@sendgrid.net';
const TO = 'tmodoux@pryv.com';
const TEMPLATE = 'welcome';
const LOCALS = {name: 'Thiébaud'};
const LOGO = '2393992';
const SENDGRID = {
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: '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'
  }
};
const USEATTACHEMENT = true;
const USETEMPLATING = true;
const TESTING = true;

async function buildEmail () {
  const email = {
    from: FROM,
    to: TO,
    subject: 'Message title',
    text: 'Plaintext version of the message',
    html: '<p>HTML version of the message -name-</p>',
  };
      
  if(USEATTACHEMENT) {
    email.attachments = [{
      filename: LOGO+'.png',
      path: path.resolve('./build/'+LOGO+'.png'),
      cid: LOGO
    }];
  }
  
  if(USETEMPLATING) {
    // Testing with headers
    // email.headers['X-SMTPAPI'] = {sub: { '-name-': ['you','him'] } }
    
    const content = await new templater({
      // optional if using default build folder
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.resolve('build')
        }
      }
    }).renderAll(TEMPLATE, LOCALS);
    email.subject = content.subject;
    email.text = content.text;
    email.html = content.html;
  }
  
  return email;
}

async function buildTestConfig () {
  const testAccount = await mailer.createTestAccount();
  const mailConfig = {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  };
  return mailConfig;
}

exports.sendmail = async function sendmail () {
  try {
    const transportConfig = TESTING? await buildTestConfig(): SENDGRID;
    const transporter = mailer.createTransport(transportConfig);
    
    const email = await buildEmail();
    
    const res = await transporter.sendMail(email);
    console.log(res);
    
    if(TESTING) {
      console.log(mailer.getTestMessageUrl(res));
    }
  } catch(err) {
    console.log(err);
  }
}