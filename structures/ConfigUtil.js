'use strict';

class ConfigUtil {
    
    config = {};
    CommandType = { UNSET: 'unset', CHAT: 'chat', SLASH: 'slash', SLASH_APPLICATION: 'slash_application', CTX_USER: 'context_user', CTX_MESSAGE: 'context_message' };
    CommandCategory = { UNSET: 'unset', BOT: 'bot', SERVER: 'server', ADMIN: 'admin'};
    strings = {};

    constructor() {
        this.config = require("../config.json");
        this.config.strings = require("../strings.json");
        this.config.CommandType = this.CommandType;
        this.config.CommandCategory = this.CommandCategory;
        return this.config;
    }
}

module.exports = ConfigUtil;
