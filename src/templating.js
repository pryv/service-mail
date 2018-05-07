const errors = require('./errors');

//  Class that handles loading of templates and eventually missing templates.
// 
class Templating {
      
  constructor(settings, logFactory, templateExists) {
    this.logger = logFactory('Templating');
    this.exists = templateExists;
    this.defaultLang = settings.defaultLang;
  }
  
  async load(template, lang) {
    
    const contentTemplate = templatePath(template, lang, 'html.pug');
    const subjectTemplate = templatePath(template, lang, 'subject.pug');
    
    // Check if templates are available for requested language.
    // If not, we will try with default language configured by the mail service.
    if (lang == null || ! await this.exists(contentTemplate) || ! await this.exists(subjectTemplate)) {
      const defaultLang = this.defaultLang;
      // If default language is the same than requested language (or null) then
      // it will not save us..
      if (lang === defaultLang) {
        throw errors.unknownResource(`Failed to load templates; missing template files for default language: ${defaultLang}`);
      }
      // Trying again with default language.
      else {
        this.logger.warn(`Missing template files for requested language '${lang}', trying with default language: '${defaultLang}'`);
        return await this.load(template, defaultLang);
      }
    }
    // Finally, we found available templates
    return templatePath(template, lang);
  }
}

function templatePath(template, lang, file) {
  let items = [template, lang];
  if(file != null) {
    items.push(file);
  }
  return items.join('/');
}

module.exports = Templating;

