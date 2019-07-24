"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const guildPrefix_1 = require("./guildPrefix");
const DataBase_1 = require("./DataBase");
const sendMessage_1 = require("./sendMessage");
const index_1 = require("../index");
const Jimp = require('jimp');
const ColorThief = require('color-thief-jimp');
const defaultImage = 'https://cdn.discordapp.com/embed/avatars/0.png';
const botOwnerID = process.env.OWNER_ID;
function stats(message) {
    const p = guildPrefix_1.prefix(message).toLowerCase();
    if (!p)
        return false;
    if (!p.startsWith('stats') && !p.startsWith('status'))
        return false;
    let language = message.guild ? DataBase_1.DataBase.getLang()[DataBase_1.DataBase.getGuildLang(message.guild)].stats : DataBase_1.DataBase.getLang()['en'].stats;
    let string = p.slice(p.indexOf(' ')).trim();
    if (!message.guild)
        return userOnly(language, message);
    else if (string === 'server' || string === 'guild')
        return guildInfo(language, message);
    else if (string === 'bot')
        return botInfo(language, message);
    else if (message.mentions.users.size !== 0) {
        const user = message.mentions.users.first();
        return guildUser(language, message, user);
    }
    else
        return guildUser(language, message);
}
exports.stats = stats;
function userOnly(lang, message, embed, user) {
    message.channel.startTyping();
    if (!user)
        user = message.author;
    const avtar = user.avatarURL ? user.avatarURL : defaultImage;
    if (!embed)
        embed = new discord_js_1.RichEmbed();
    let status = user.presence.status;
    embed.setThumbnail(avtar);
    if (status === 'online')
        status = lang.status.online;
    else if (status === 'dnd')
        status = lang.status.dnd;
    else if (status === 'idle')
        status = lang.status.idle;
    else if (status === 'offline')
        status = lang.status.offline;
    embed.addField(lang.status.name, status, true);
    if (user.presence.game) {
        let type = lang.game.playing;
        if (user.presence.game.type == 1)
            type = lang.game.streaming;
        if (user.presence.game.type == 2)
            type = lang.game.listening;
        if (user.presence.game.type == 3)
            type = lang.game.watching;
        let game = `${lang.game.type}: ${type}`;
        game += `\n${lang.game.gameName}: ${user.presence.game.name}`;
        if (user.presence.game.details)
            game += `\n${lang.game.details}: ${user.presence.game.details}`;
        if (user.presence.game.state)
            game += `\n${lang.game.state}: ${user.presence.game.state}`;
        embed.addField(lang.game.name, game, true);
    }
    embed.setAuthor(user.tag, avtar);
    embed.setThumbnail(avtar);
    embed.addField(lang.time.accountCreation, formatDate(user.createdAt), true);
    embed.addField(lang.time.accountAge, getAge(user.createdAt, lang), true);
    if (embed.color) {
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    Jimp.read(avtar, (err, image) => {
        if (err)
            sendMessage_1.embedSend(message.channel, embed);
        try {
            embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
            sendMessage_1.embedSend(message.channel, embed);
        }
        catch (err) {
            sendMessage_1.embedSend(message.channel, embed);
        }
    });
}
function guildUser(lang, message, user) {
    if (!user)
        user = message.author;
    const guild = message.guild;
    const guildMember = guild.members.find(u => u.id === user.id);
    const embed = new discord_js_1.RichEmbed();
    let roles = guildMember.roles.map(r => r.name.replace('@everyone', '')).join('\n');
    if (guildMember.nickname)
        embed.addField(lang.guild.nickname, guildMember.nickname, true);
    embed.addField(lang.guild.roles, roles ? roles : '/', true);
    embed.addField(lang.guild.guildJoin, formatDate(guildMember.joinedAt), true);
    embed.addField(lang.guild.joinAge, getAge(guildMember.joinedAt, lang), true);
    if (guildMember.highestRole && guildMember.highestRole.color)
        embed.setColor(guildMember.highestRole.color);
    if (roles.length > 1000) {
        roles = roles.slice(0, 1024);
        roles = `${roles.slice(0, roles.lastIndexOf('\n'))}...)`;
    }
    userOnly(lang, message, embed, user);
}
function guildInfo(lang, message) {
    const guild = message.guild;
    const botUsers = guild.members.filter(m => m.user.bot);
    const humansUsers = guild.members.filter(m => !m.user.bot);
    const onlineUsers = guild.members.filter(m => m.presence.status === "online");
    const idleUsers = guild.members.filter(m => m.presence.status === "idle");
    const dndUsers = guild.members.filter(m => m.presence.status === "dnd");
    const offlineUsers = guild.members.filter(m => m.presence.status === "offline");
    const channels = guild.channels;
    const embed = new discord_js_1.RichEmbed();
    const splach = guild.splashURL ? guild.splashURL : guild.iconURL;
    const guildPic = splach ? splach : defaultImage;
    embed.setAuthor(guild.name, guildPic);
    embed.setThumbnail(guildPic);
    const online = onlineUsers.size === 0 ? lang.guild.noOne : onlineUsers.size;
    const dnd = dndUsers.size === 0 ? lang.guild.noOne : dndUsers.size;
    const idle = idleUsers.size === 0 ? lang.guild.noOne : idleUsers.size;
    const offline = offlineUsers.size === 0 ? lang.guild.noOne : offlineUsers.size;
    const userInfo = `${lang.status.online}: ${online}\n${lang.status.dnd}: ${dnd}\n${lang.status.idle}: ${idle}\n${lang.status.offline}: ${offline}`;
    embed.addField(`${lang.guild.members} (${guild.memberCount})`, userInfo, true);
    const categoryChannels = channels.filter(c => c.type === 'category');
    const textChannels = channels.filter(c => c.type === 'text');
    const voiceChannels = channels.filter(c => c.type === 'voice');
    const newsChannels = channels.filter(c => c.type === 'news');
    const storeChannels = channels.filter(c => c.type === 'store');
    const categoryCount = categoryChannels.size ? `Category: ${categoryChannels.size}\n` : ``;
    const textCount = textChannels.size ? `Text: ${textChannels.size}\n` : lang.guild.noTextChannels;
    const voiceCount = voiceChannels.size ? `Voice: ${voiceChannels.size}\n` : ``;
    const newsCount = newsChannels.size ? `News: ${newsChannels.size}\n` : ``;
    const storeCount = storeChannels.size ? `Store: ${storeChannels.size}` : ``;
    const channelsInfo = `${categoryCount}${textCount}${voiceCount}${newsCount}${storeCount}`;
    embed.addField(`${lang.guild.channels} (${guild.channels.size})`, channelsInfo, true);
    const bots = botUsers.size === 0 ? lang.guild.noBots : botUsers.size;
    embed.addField(`${lang.guild.bots} (${guild.channels.size})`, bots, true);
    const humans = humansUsers.size === 0 ? lang.guild.noHumans : humansUsers.size;
    embed.addField(lang.guild.humans, humans, true);
    embed.addField(lang.guild.guildCreated, formatDate(guild.createdAt), true);
    embed.addField(lang.guild.guildAge, getAge(guild.createdAt, lang), true);
    embed.addField(lang.guild.roles, guild.roles.size, true);
    embed.addField(lang.guild.emojis, guild.emojis.size, true);
    const region = guild.region;
    embed.addField(lang.guild.region, region, true);
    const owner = guild.owner ? guild.owner.user.tag : "Unknown";
    embed.addField("Owner", owner, true);
    embed.setColor("RANDOM");
    Jimp.read(guildPic, (err, image) => {
        if (err)
            sendMessage_1.embedSend(message.channel, embed);
        try {
            embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
            sendMessage_1.embedSend(message.channel, embed);
        }
        catch (err) {
            sendMessage_1.embedSend(message.channel, embed);
        }
    });
}
function formatDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return `${day}.${month}.${year}`;
}
exports.formatDate = formatDate;
function getAge(date, lang) {
    const dayString = lang.time.day ? lang.time.day : 'Day';
    const daysString = lang.time.days ? lang.time.days : 'Days';
    const yearsString = lang.time.years ? lang.time.years : 'Years';
    const yearString = lang.time.year ? lang.time.year : 'year';
    let today = new Date();
    let oneDay = 1000 * 60 * 60 * 24;
    let differenceMs = Math.abs(today.getTime() - date.getTime());
    let days = Math.round(differenceMs / oneDay);
    let yearDays = 365.2425;
    let dayText;
    let years;
    if (days > 365) {
        years = Math.floor(days / yearDays);
        days = Math.floor(days - yearDays * years);
        let yearText;
        if (years == 1)
            yearText = yearString;
        else
            yearText = yearsString;
        if (days == 1)
            dayText = dayString;
        else
            dayText = daysString;
        return `${years} ${yearText}, ${days} ${dayText}`;
    }
    if (days == 1)
        dayText = dayString;
    else
        dayText = daysString;
    return `${days} ${dayText}`;
}
exports.getAge = getAge;
function botInfo(lang, message) {
    const embed = new discord_js_1.RichEmbed();
    const channels = index_1.client.channels.filter(c => c.type === 'text').size;
    const guilds = index_1.client.guilds.size;
    const users = index_1.client.users.filter(c => c.bot === false).size;
    embed.addField(lang.bot.inviteLink, ` [${lang.bot.clickHere}](https://discordapp.com/oauth2/authorize?client_id=${index_1.client.user.id}&scope=bot&permissions=8)`);
    embed.addField(lang.bot.totalTextChannels, channels, true);
    embed.addField(lang.bot.totalGuilds, guilds, true);
    embed.addField(lang.bot.totalUsers, users, true);
    const ownerUser = index_1.client.users.find(u => u.id === botOwnerID);
    if (ownerUser)
        embed.addField(lang.bot.botOwner, ownerUser.tag, true);
    userOnly(lang, message, embed, index_1.client.user);
}
exports.botInfo = botInfo;
//# sourceMappingURL=stats.js.map