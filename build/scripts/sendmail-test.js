/**
 * @license
 * Copyright (C) Pryv S.A. https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const config = require('/app/conf/mail.json');
console.log(config?.sendmail?.active ? "TRUE": "FALSE");