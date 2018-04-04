// @flow

// Our convict configuration that determines the configuration schema. 

const convict = require('convict');

function produce() {
  const formats = {
    logLevel: [ 'debug', 'info', 'warn', 'error' ], 
  };
  
  return convict({
    config: {
      doc: 'Path to the server configuration file.', 
      format: String, 
      default: 'config/dev.json', 
      arg: 'config'
    },
    logs: {
      prefix: { default: '', format: String },
      console: {
        active: {
          doc: 'Should the server log to console?',
          format: Boolean, default: true
        },
        level: {
          doc: 'Log level for the console.',
          format: formats.logLevel, default: 'warn'
        },
        colorize: {
          doc: 'Should console output be colorized?',
          format: Boolean, default: true
        }
      },
      file: {
        active: {
          doc: 'Should the server log to a file?',
          format: Boolean, default: false
        },
        level: {
          doc: 'Log level for the log file.',
          format: formats.logLevel, default: 'error'
        },
        path: {
          doc: 'Where is the log file stored?', 
          format: String, default: 'server.log'
        },
        maxFileBytes: { format: 'nat', default: 4096 },
        maxNbFiles: { format: 'nat', default: 20 }
      },
      airbrake: {
        active: {
          doc: 'Should the server log to airbrake?',
          format: Boolean, default: false
        },
        key: {
          doc: 'Airbrake API key.',
          format: String, default: '',
        },
        projectId: {
          doc: 'Airbrake project id.',
          format: String, default: '',
        }
      }
    },
    http: {
      ip: {
        doc: 'IP address to bind the server to.', 
        format: String, default: '127.0.0.1', arg: 'http-ip'
      }, 
      port: {
        doc: 'Port to bind to.', 
        format: Number, default: 9000, arg: 'http-port'
      }
    },
    smtp: {
      host: {
        doc: 'Hostname of the SMTP API that will send the emails.',
        format: String, default: 'smtp.ethereal.email'
      },
      port: {
        doc: 'Port of the SMTP API.',
        format: Number, default: 587
      },
      auth: {
        user: {
          doc: 'Username on the SMTP API',
          format: String, default: ''
        },
        pass: {
          doc: 'Password on the SMTP API',
          format: String, default: ''
        }
      },
      sender: {
        doc: 'Email address of the sender.',
        format: String, default: 'no-reply@pryv.com'
      }
    }
  });
}

module.exports = produce;