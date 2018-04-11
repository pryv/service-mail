const http = require('http');
const express = require('express');
const bluebird = require('bluebird');
const bodyParser = require('body-parser');

const logging = require('./logging');
const controllerFactory = require('./web/controller');

const KEY_IP = 'http.ip';
const KEY_PORT = 'http.port';  

/**
 * HTTP server responsible for the REST api that the mailing server exposes. 
 */
class Server {
  
  constructor(settings, context) {
    const logSettings = settings.get('logs').obj();
    const logFactory = logging(logSettings);
    
    this.logger = logFactory.getLogger('mailing-server');
    this.errorLogger = logFactory.getLogger('errors');
    this.settings = settings; 
    
    this.context = context;
    this.expressApp = this.setupExpress();
    
    const ip = settings.get(KEY_IP).str(); 
    const port = settings.get(KEY_PORT).num(); 
    this.baseUrl = `http://${ip}:${port}/`;
    
    this.logger.info('constructed.');
  }
  
  /**
   * Starts the HTTP server. 
   * 
   * @return {Promise<true>} A promise that will resolve once the server is 
   *    started and accepts connections.
   */
  start() {
    this.logger.info('starting...');
    
    const settings = this.settings;
    const app = this.expressApp;
    
    const ip = settings.get(KEY_IP).str(); 
    const port = settings.get(KEY_PORT).num(); 
    
    const server = this.server = http.createServer(app);
    const serverListen = bluebird.promisify(server.listen, {context: server});
    return serverListen(port, ip)
      .then(this.logStarted.bind(this));
  }
  
  /** Logs that the server has started.
   */
  logStarted(arg) {
    const addr = this.server.address(); 
    this.logger.info(`started. (http://${addr.address}:${addr.port})`);
    
    // passthrough of our single argument
    return arg;
  }
  
  /** 
   * Stops a running server instance. 
   * 
   * @return {Promise<true>} A promise that will resolve once the server has 
   *    stopped. 
   */
  stop() {
    const server = this.server;
      
    this.logger.info('stopping...');
    
    const serverClose = bluebird.promisify(server.close, {context: server}); 
    return serverClose();
  }
  
  /** 
   * Sets up the express application, injecting middleware and configuring the 
   * instance. 
   * 
   * @return express application.
   */
  setupExpress() {        
    var app = express(); 
    
    // Preprocessing middlewares
    app.use(bodyParser.json());
    
    this.defineApplication(app); 
    
    // Postprocessing middlewares
    app.use((err, req, res, next) => {
      this.errorLogger.error(err);
      res
        .status(err.httpStatus || 500)
        .json({
          error: err,
          request: req.body
        });
    });

    return app; 
  }
  
  /** Defines all the routes that we serve from this server. 
   */   
  defineApplication(app) {
    
    const ctx = this.context
    const c = controllerFactory(ctx); 
    
    app.get('/system/status', systemStatus);
    
    app.post('/sendmail/:template', c.sendMail);

  }
}

/** GET /system/status - Answers the caller with a status of the application. 
 */ 
function systemStatus(req, res) {
  res
    .status(200)
    .json({
      status: 'ok',
    });
}

module.exports = Server;