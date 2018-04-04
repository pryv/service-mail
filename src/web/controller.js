// ----------------------------------------------- (sync) express error handling

function mount(ctx, handler) {
  return catchAndNext(
    handler.bind(null, ctx)); 
}

function catchAndNext(handler) {
  return async (req, res, next) => {
    try {
      return await handler(req, res, next);
    }
    catch (err) {
      // TODO: do something whith the error?
      next(err);
    }
  };
}

// --------------------------------------------------------------------- factory

module.exports = function (ctx) {
  return {
    sendWelcomeMail: mount(ctx, require('./op/send_welcome_mail')),
  };
};