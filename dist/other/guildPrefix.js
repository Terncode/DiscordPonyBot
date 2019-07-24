"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataBase_1 = require("./DataBase");
function prefix(message) {
    let content = message.content;
    if (!message.guild)
        return content;
    const prefix = DataBase_1.DataBase.getPrefix(message.guild);
    if (!content.toLowerCase().startsWith(prefix))
        return '';
    return content.slice(prefix.length, content.length);
}
exports.prefix = prefix;
//# sourceMappingURL=guildPrefix.js.map