// src/api/message/routes/message.js
'use strict';

/**
 * message router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::message.message');