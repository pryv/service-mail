# Service-mail documentation

## API

### POST /sendmail/:template/:lang

Request the sending of an email.
Template request parameter defines the type of email (e.g. welcome).
Lang request parameter defines the language in which the email should be written.

## Templates

The root folder where to look for templates can be defined in configuration by providing: 'templates.root'.

The structure below the root folder is the following: 'template/language', where template is the type of email (e.g. welcome)
and language is the code of the language in which the email is written (e.g. fr for french).

If the template with the requested language is not existing, the service will try to find another template for the same
email type but with a default language (e.g. english instead of french). Default language can be defined in configuration
by providing 'templates.defaultLang'

## Transport

The service-mail allows to define two types of transport, smtp or sendmail command.

### SMTP

SMTP transport is used by default, it allows to define an external mail delivery service through configuration:
- smtp.host: smtp host (e.g. smtp.ethereal.email)
- smtp.port: smtp port (e.g. 587)
- smtp.auth.user, smtp.auth.pass: credentials to authenticate against an external mail service (e.g. sendgrid)

### Sendmail

An alternative is to use the sendmail command of the machine on which service-mail is running.
It has to be explicitly activated through configuration:
- sendmail.active: true
- sendmail.path: path to the sendmail command on the machine
