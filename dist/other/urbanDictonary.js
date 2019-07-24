"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const urban_dictionary_1 = require("urban-dictionary");
const guildPrefix_1 = require("./guildPrefix");
const sendMessage_1 = require("./sendMessage");
const urbanDictonaryIco = 'https://firebounty.com/image/635-urban-dictionary';
const urbanDictonaryUrl = 'https://www.urbandictionary.com';
function urbanDictonary(message) {
    const p = guildPrefix_1.prefix(message).toLowerCase();
    if (!p)
        return false;
    if (!p.startsWith('ud') && !p.startsWith('urbandictonary'))
        return false;
    if (!message.channel.nsfw) {
        if (message.channel.type !== 'dm')
            sendMessage_1.embedSend(message.channel, sendMessage_1.errorEmbed('This command only works in nsfw channels!'));
        else {
            sendMessage_1.embedSend(message.channel, sendMessage_1.errorEmbed('This command do not works in dm channels!'));
        }
        return true;
    }
    if (p.indexOf(' ') === -1)
        return randomWord(message);
    let string = p.slice(p.indexOf(' ')).trim();
    dictionary(message, string);
    return true;
}
exports.urbanDictonary = urbanDictonary;
function randomWord(message) {
    message.channel.startTyping();
    const embed = new discord_js_1.RichEmbed();
    embed.setAuthor('UrbanDictonary', urbanDictonaryIco, urbanDictonaryUrl);
    urban_dictionary_1.random((error, entries) => {
        message.channel.stopTyping();
        if (error) {
            embed.setColor("RED");
            embed.addField('Error', error.message.toString());
            sendMessage_1.embedSend(message.channel, embed);
        }
        else {
            embed.setColor([240, 145, 21]);
            embed.setTitle(entries.word);
            embed.addField('Definition', bold(entries.definition.slice(0, 1024)));
            embed.addField('Example', bold(entries.example.slice(0, 1024)));
            embed.addField('Source', `https://www.urbandictionary.com/define.php?term=${entries.word.replace(/ /g, '+')}`);
            sendMessage_1.embedSend(message.channel, embed);
        }
    });
}
function dictionary(message, word) {
    message.channel.startTyping();
    const embed = new discord_js_1.RichEmbed();
    embed.setAuthor('UrbanDictonary', urbanDictonaryIco, urbanDictonaryUrl);
    urban_dictionary_1.term(word, (error, entries) => {
        message.channel.stopTyping();
        if (error) {
            embed.setColor("RED");
            embed.addField('Error', error.message.toString());
            sendMessage_1.embedSend(message.channel, embed);
        }
        else {
            embed.setColor([240, 145, 21]);
            embed.setTitle(entries[0].word);
            embed.addField('Definition', bold(entries[0].definition.slice(0, 1024)));
            embed.addField('Example', bold(entries[0].example.slice(0, 1024)));
            embed.addField('Source', `https://www.urbandictionary.com/define.php?term=${entries[0].word.replace(/ /g, '+')}`);
            sendMessage_1.embedSend(message.channel, embed);
        }
    });
}
function bold(msg) {
    while (msg.includes("["))
        msg = msg.replace("[", "**");
    while (msg.includes("]"))
        msg = msg.replace("]", "**");
    return msg;
}
//# sourceMappingURL=urbanDictonary.js.map