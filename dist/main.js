"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const guildAdmin_1 = require("./other/guildAdmin");
const DataBase_1 = require("./other/DataBase");
const sendMessage_1 = require("./other/sendMessage");
const index_1 = require("./index");
const roll_1 = require("./other/roll");
const stats_1 = require("./other/stats");
const translate_1 = require("./other/translate");
const urbanDictonary_1 = require("./other/urbanDictonary");
const dictonary_1 = require("./other/dictonary");
const help_1 = require("./other/help");
const others_1 = require("./other/others");
const ourServer_1 = require("./ourServer/ourServer");
const factAndJokes_1 = require("./other/factAndJokes");
const chatMonitor_1 = require("./other/chatMonitor");
const derpiboo_1 = require("./other/derpiboo");
const Jimp = require('jimp');
const ColorThief = require('color-thief-jimp');
const path = require("path");
const fs = require("fs");
const ownerID = process.env.OWNER_ID;
async function onMessage(message) {
    backup(message);
    if (ourServer_1.ourServer(message))
        return;
    if (message.author.bot)
        return;
    if (guildAdmin_1.guildAdmin(message))
        return;
    if (help_1.help(message))
        return;
    if (roll_1.roll(message))
        return;
    if (stats_1.stats(message))
        return;
    if (translate_1.translate(message))
        return;
    if (derpiboo_1.derpibooru(message))
        return;
    if (urbanDictonary_1.urbanDictonary(message))
        return;
    if (dictonary_1.dictonary(message))
        return;
    if (others_1.others(message))
        return;
    if (factAndJokes_1.factAndJokes(message))
        return;
    chatMonitor_1.chatMonitor(message);
    if (message.isMentioned(index_1.client.user)) {
        const guildLang = DataBase_1.DataBase.getGuildLang(message.guild);
        const msg = `${DataBase_1.DataBase.getLang()[guildLang].info.prefixInfo}: \`${DataBase_1.DataBase.getPrefix(message.guild)}\``;
        return message.channel.send(msg);
    }
}
exports.onMessage = onMessage;
async function clientGuildJoin(guild) {
    const guildMemeber = guild.members.find(m => m.user === index_1.client.user);
    if (!guildMemeber)
        return;
    const embed = guildMemeber.hasPermission("EMBED_LINKS") ? '' : "\nI don't have \`embed link\` Most of my features are not going to work please fix that....";
    let channel = guild.defaultChannel;
    if (!channel)
        channel = guild.channels.find(c => c.name.toLowerCase() === 'general' && c.type === 'text');
    if (!channel)
        channel = guild.channels.find(c => c.name.toLowerCase().includes('general') && c.type === 'text');
    if (!channel)
        channel = guild.channels.find(c => c.type === 'text');
    guild.createChannel('pony-logs').catch(() => { });
    const prefix = DataBase_1.DataBase.getPrefix(guild);
    const info = `Thank you for adding me :).`;
    let error = false;
    if (channel) {
        channel.send(`${info}${embed}`).catch(() => {
            error = true;
        });
    }
    if (!channel || error) {
        const owner = guild.owner;
        let DMChannel;
        if (owner)
            DMChannel = await owner.createDM();
        if (DMChannel)
            DMChannel.send(`${guild.name}: ${info}${embed}`);
    }
}
exports.clientGuildJoin = clientGuildJoin;
function onGuildJoin(member) {
    ourServer_1.ourServerJoin(member);
    const guild = member.guild;
    const channel = guild.channels.find(c => c.name.toLowerCase().includes('pony-log'));
    if (!channel)
        return;
    let language = DataBase_1.DataBase.getLang()[DataBase_1.DataBase.getGuildLang(member.guild)].guild;
    const embed = new discord_js_1.RichEmbed();
    embed.setAuthor(member.guild.name, member.guild.iconURL);
    embed.addField('Info', `${member.user.tag} ${language.join}`);
    embed.addField(language.accountAge, stats_1.formatDate(member.user.createdAt));
    embed.setColor("RANDOM");
    embed.setThumbnail(member.user.avatarURL);
    if (!member.guild.iconURL)
        return sendMessage_1.embedSend(channel, embed);
    Jimp.read(member.guild.iconURL, (err, image) => {
        if (err)
            sendMessage_1.embedSend(channel, embed);
        try {
            embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
            sendMessage_1.embedSend(channel, embed);
        }
        catch (err) {
            sendMessage_1.embedSend(channel, embed);
        }
    });
}
exports.onGuildJoin = onGuildJoin;
function onGuildLeave(member) {
    const guild = member.guild;
    const channel = guild.channels.find(c => c.name.toLowerCase().includes('pony-log'));
    if (!channel)
        return;
    let language = DataBase_1.DataBase.getLang()[DataBase_1.DataBase.getGuildLang(member.guild)].guild;
    const embed = new discord_js_1.RichEmbed();
    embed.setAuthor(member.guild.name, member.guild.iconURL);
    embed.addField(language.info, `${member.user.tag} ${language.left}`);
    if (!member.guild.iconURL)
        return sendMessage_1.embedSend(channel, embed);
    embed.setThumbnail(member.user.avatarURL);
    Jimp.read(member.guild.iconURL, (err, image) => {
        if (err)
            sendMessage_1.embedSend(channel, embed);
        try {
            embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
            sendMessage_1.embedSend(channel, embed);
        }
        catch (err) {
            sendMessage_1.embedSend(channel, embed);
        }
    });
}
exports.onGuildLeave = onGuildLeave;
async function backup(message) {
    if (message.channel.type !== 'dm')
        return;
    if (message.author.id !== ownerID)
        return;
    if (message.content === 'backup') {
        fs.readdir(path.resolve('languages'), async (err, files) => {
            if (err)
                console.error('Unable to scan directory: ' + err);
            let languageNames = [];
            files.forEach(file => {
                languageNames.push(file);
            });
            const dm = await message.author.createDM().catch(err => console.error(err));
            if (dm) {
                await dm.send(`\`${languageNames.join(', ')}\``, {
                    files: [
                        path.resolve('GuildData', 'data.json')
                    ]
                }).catch(err => {
                    console.error(err);
                });
            }
        });
    }
    else if (message.content === 'shutdown') {
        await ourServer_1.disableServerFeatures();
        process.exit(1);
    }
}
//# sourceMappingURL=main.js.map