"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const guildPrefix_1 = require("./guildPrefix");
const DataBase_1 = require("./DataBase");
const sendMessage_1 = require("./sendMessage");
function help(message) {
    const p = guildPrefix_1.prefix(message).toLowerCase();
    if (!p)
        return false;
    if (p !== 'help')
        return false;
    const language = message.guild ? DataBase_1.DataBase.getLang()[DataBase_1.DataBase.getGuildLang(message.guild)].help : DataBase_1.DataBase.getLang()['en'].help;
    let guildPrefix = '';
    if (message.guild)
        guildPrefix = DataBase_1.DataBase.getPrefix(message.guild);
    const embed = new discord_js_1.RichEmbed();
    embed.setColor("WHITE");
    if (message.guild)
        embed.setAuthor(message.guild.name, message.guild.iconURL);
    embed.setTitle(language.help);
    let commands = '';
    commands += `${guildPrefix}help ${language.commands}.\n`;
    if (language.derpibooru)
        commands += `${guildPrefix}depibooru ${language.derpibooru}.\n`;
    if (language.randomFace)
        commands += `${guildPrefix}rd ${language.randomFace}.\n`;
    if (language.wordDeinition)
        commands += `${guildPrefix}define ${language.wordDeinition}.\n`;
    if (message.channel.nsfw && language.urbanDictonary)
        commands += `${guildPrefix}ud ${language.urbanDictonary}.\n`;
    if (language.translate)
        commands += `${guildPrefix}translate ${language.translate}.\n`;
    if (language.fact)
        commands += `${guildPrefix}fact ${language.fact}.\n`;
    if (language.joke)
        commands += `${guildPrefix}joke ${language.joke}.\n`;
    if (language.hugsYou)
        commands += `${guildPrefix}hugs ${language.hugsYou}.\n`;
    if (language.boopsYou)
        commands += `${guildPrefix}boops ${language.boopsYou}.\n`;
    embed.addField(language.commands, commands);
    sendMessage_1.embedSend(message.channel, embed);
    return true;
}
exports.help = help;
//# sourceMappingURL=help.js.map