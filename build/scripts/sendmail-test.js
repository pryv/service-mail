/**
 * @license
 * Copyright (C) 2018–2024 Pryv S.A. https://pryv.com - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const config = require('/app/conf/mail.json');
console.log(config?.sendmail?.active ? "TRUE": "FALSE");