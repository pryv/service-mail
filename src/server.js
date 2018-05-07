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
    const logSettings = settings.get('logs');
    const logFactory = logging(logSettings);
    
    this.logger = logFactory.getLogger('mailing-server');
    this.errorLogger = logFactory.getLogger('errors');
    this.settings = settings; 
    
    this.context = context;
    this.expressApp = this.setupExpress();
    
    const ip = settings.get(KEY_IP); 
    const port = settings.get(KEY_PORT); 
    this.baseUrl = `http://${ip}:${port}/`;
    
    this.logger.info('constructed.');
  }
  
  /**
   * Starts the HTTP server. 
   * 
   */
  async start() {
    this.logger.info('starting...');
    
    const settings = this.settings;
    const app = this.expressApp;
    
    const ip = settings.get(KEY_IP); 
    const port = settings.get(KEY_PORT); 
    
    const server = this.server = http.createServer(app);
    const serverListen = bluebird.promisify(server.listen, {context: server});
    
    await serverListen(port, ip);
    
    const addr = this.server.address(); 
    this.logger.info(`started. (http://${addr.address}:${addr.port})`);
  }
  
  /** 
   * Stops a running server instance. 
   * 
   */
  async stop() {
    const server = this.server;
      
    this.logger.info('stopping...');
    
    const serverClose = bluebird.promisify(server.close, {context: server}); 
    await serverClose();
    
    this.logger.info(`stopped.`);
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
          error: err.message,
          data: err.data,
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
    
    app.post('/sendmail/:template/:lang', c.sendMail);

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