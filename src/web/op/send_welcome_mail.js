const errors = require('components/errors').factory;

/** POST /sendmail/welcome - Send a welcome email. 
 */
async function sendWelcomeMail(ctx, req, res) {

  // TODO: Extract parameters from request; req.params

  // TODO: Throw if req parms are missing
  
  // TODO: Actually send a mail (async/await)
  
  res
    .status(200)
    .json({status: 'ok'});
}

module.exports = sendWelcomeMail;
