// src/api/message/controllers/message.js
"use strict";

/**
 * message controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::message.message");
