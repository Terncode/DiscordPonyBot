"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
function embedSend(channel, embed) {
    channel.stopTyping();
    addClient(embed);
    channel.send(embed).catch(err => {
        index_1.client.emit('error', err);
        channel.send('⛔ ' + err.message + '\nMake sure that I have permission `Embed links` otherwize some of my features are not going to work!');
        console.log(err);
    });
}
exports.embedSend = embedSend;
function textSend(channel, text, embed) {
    channel.stopTyping();
    if (text)
        channel.send(text);
    else if (embed) {
        channel.send('This is not supported yet').catch(err => {
            index_1.client.emit('error', err);
        });
    }
}
function addClient(embed) {
    embed.setFooter(index_1.client.user.tag, index_1.client.user.avatarURL);
    embed.setTimestamp(new Date());
    return embed;
}
exports.addClient = addClient;
function errorEmbed(text) {
    const embed = new discord_js_1.RichEmbed();
    embed.setColor("RED");
    embed.addField("Error", text);
    return embed;
}
exports.errorEmbed = errorEmbed;
function infoEmbed(text) {
    const embed = new discord_js_1.RichEmbed();
    embed.setColor("GOLD");
    embed.addField("Info", text);
    return embed;
}
exports.infoEmbed = infoEmbed;
//# sourceMappingURL=sendMessage.js.map