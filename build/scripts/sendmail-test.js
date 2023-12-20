const config = require('/app/conf/mail.json');
console.log(config?.sendmail?.active ? "TRUE": "FALSE");