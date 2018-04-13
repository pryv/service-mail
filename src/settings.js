const fs = require('fs');
const bluebird = require('bluebird');
const lodash = require('lodash');
const Hjson = require('hjson');
const YAML = require('js-yaml');
const yargs = require('yargs');
const path = require('path');

const { ExistingValue, MissingValue } = require('./config');

// -----------------------------------------------------------------------------

// Settings of an application. 
// 
// Example:
//    
//    const val = settings.get('foo.bar.baz') // => ConfigValue
//    val.str()     // casts value to a string (or errors out).
// 
class Settings {
  
  // Constructs a settings object. If `override` is not null, it is merged 
  // on top of the defaults that are in place. 
  // 
  constructor(override) {
    this.config = this.defaults();
    
    if (override != null) 
      lodash.merge(this.config, override);
  }
  defaults() {
    return {
      logs: {
        prefix: '',
        console: { active: true, level: 'info', colorize: true }, 
        file: { active: false },
      },
      email: {
        from: "no-reply@pryv.com"
      },
      smtp: {
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: "btvryvs5al5mjpa3@ethereal.email",
          pass: "VfNxJctkjrURkyThZr"
        }
      },
      sendmail: {
        active: false,
        path: 'sendmail'
      },
      http: {
        ip: "127.0.0.1",
        port: 9000
      },
      templates: {
        views: {
          root: path.resolve('templates')
        }
      }
    };
  }
  
  // Loads settings from the file `path` and merges them with the settings in 
  // the current instance. 
  // 
  // This uses HJSON under the covers, but will also load from YAML files. 
  //  
  //    -> https://www.npmjs.com/package/hjson
  //    -> https://www.npmjs.com/package/js-yaml
  // 
  async loadFromFile(path) {
    const readFile = bluebird.promisify(fs.readFile);
    const text = await readFile(path, { encoding: 'utf8' });

    let obj;

    if (path.endsWith('.yaml')) 
      obj = YAML.safeLoad(text);
    else 
      obj = Hjson.parse(text);
    
    lodash.merge(this.config, obj);
    
    console.info(`Using configuration file at: ${path}`);
  }
  
  // Parses the configuration on the command line (arguments).
  // 
  async parseCLargs(argv) {
    const cli = yargs
      .option('c', {
        alias: 'config', 
        type: 'string', 
        describe: 'reads configuration file at PATH'
      })
      .usage('$0 [args] \n\n  starts a metadata service')
      .help();      
    
    const out = cli.parse(argv);
    
    if (out.config != null) {
      const configPath = path.resolve(out.config);
      await this.loadFromFile(configPath);
    }
  }
  
  // Merges settings in `other` with the settings stored here. 
  // 
  merge(other) {
    lodash.merge(this.config, other);
  }
  
  get(key) {
    const config = this.config;
    
    if (! lodash.has(config, key)) return new MissingValue(key);

    const val = lodash.get(config, key);
    return new ExistingValue(key, val);
  }
  
  has(key) {
    const config = this.config;

    return lodash.has(config, key);
  }
  
}

module.exports = Settings;

