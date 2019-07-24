"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guildPrefix_1 = require("./guildPrefix");
const DataBase_1 = require("./DataBase");
function others(message) {
    const p = guildPrefix_1.prefix(message).toLowerCase();
    if (!p)
        return false;
    if (!p.startsWith('boop') && !p.startsWith(')')
        && !p.startsWith('hug'))
        return false;
    let language = message.guild ? DataBase_1.DataBase.getLang()[DataBase_1.DataBase.getGuildLang(message.guild)].other : DataBase_1.DataBase.getLang()['en'].other;
    if (p.startsWith('boop ') || p.startsWith(') ') ||
        p.startsWith('boops ') || p === 'boop' || p === 'boops' || p === ')') {
        const user = message.mentions.users.first();
        if (user)
            message.channel.send(`${language.boops} ${user}`).catch(() => { });
        else
            message.channel.send(`${language.boops} ${message.author}`).catch(() => { });
    }
    else if (p.startsWith('hug ') || p.startsWith('hug ') || p === 'hug' || p === 'hugs') {
        const user = message.mentions.users.first();
        if (user)
            message.channel.send(`${language.hugs} ${user}`).catch(() => { });
        else
            message.channel.send(`${language.hugs} ${message.author}`).catch(() => { });
    }
    return true;
}
exports.others = others;
//# sourceMappingURL=others.js.map