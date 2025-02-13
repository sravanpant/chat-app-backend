// src/api/message/services/message.js
'use strict';

/**
 * message service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::message.message');