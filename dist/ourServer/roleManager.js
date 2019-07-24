"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const guildPrefix_1 = require("../other/guildPrefix");
const sendMessage_1 = require("../other/sendMessage");
const DataBase_1 = require("../other/DataBase");
const maxPersonalRoles = 3;
const bannedRoleNames = ["anal", "anus", "arse", "ass", "assfuck", "asshole", "assfucker", "asshole", "assshole", "bastard", "bitch", "blackcock", "bloodyhell", "boong", "cock", "cockfucker", "cocksuck", "cocksucker", "coon", "coonnass", "crap", "cunt", "cyberfuck", "damn", "darn", "dick", "dirty", "douche", "dummy", "erect", "erection", "erotic", "escort", "fag", "faggot", "fuck", "Fuckoff", "fuckyou", "fuckass", "fuckhole", "goddamn", "gook", "hardcore", "hardcore", "homoerotic", "hore", "lesbian", "lesbians", "mother fucker", "motherfuck", "motherfucker", "negro", "nigger", "orgasim", "orgasm", "penis", "penisfucker", "piss", "pissoff", "porn", "porno", "pornography", "pussy", "retard", "sadist", "sex", "sexy", "shit", "slut", "sonofabitch", "suck", "tits", "viagra", "whore", "xxx"];
const persionalRolesColor = '#80ff80';
const otherRolesColor = '#00ffd2';
function roleManager(message) {
    const p = guildPrefix_1.prefix(message).toLowerCase();
    if (!p)
        return false;
    if (!p.startsWith('role'))
        return false;
    const channel = message.channel;
    const guild = message.guild;
    const embed = new discord_js_1.RichEmbed();
    embed.setAuthor('Pony CodeLab', guild.iconURL);
    if (!channel.name.toLowerCase().includes('role-manager')) {
        const roleManagerChannel = guild.channels.find(c => c.name.toLowerCase().includes('role-manager'));
        const roleManager = roleManagerChannel ? roleManagerChannel : '#role-mamanger';
        embed.setColor("RED");
        if (roleManager)
            embed.addField('Error', `You can only use this command on inside ${roleManager} channel!`);
        sendMessage_1.embedSend(channel, embed);
        return true;
    }
    const guildPrefix = DataBase_1.DataBase.getPrefix(guild);
    let string = p.slice(p.indexOf(' ')).trim();
    let type = string.trim();
    if (string.indexOf(' ') !== -1)
        type = string.slice(0, string.indexOf(' '));
    switch (type) {
        case 'list':
            rolesList(message, embed);
            return true;
        case 'add':
            addRole(message, embed, string.toLowerCase().slice(type.length, string.length).trim());
            return true;
        case 'remove':
            removeRole(message, embed, string.toLowerCase().slice(type.length, string.length).trim());
            return true;
        case 'request':
            requestRole(message, embed, string.toLowerCase().slice(type.length, string.length).trim());
            return true;
        case 'suggest': {
            suggestRole(message, embed, string.toLowerCase().slice(type.length, string.length).trim());
            return true;
        }
        default:
            embed.setColor("RED");
            embed.addField('Something went wrong', `It looks like you are using commands wrong!`);
            const help = [`${guildPrefix}list  - shows available roles`,
                `${guildPrefix}add <role> - adds role`,
                `${guildPrefix}remove <role> - remove role`,
                `${guildPrefix}suggest <role> - suggest Role`,
                `${guildPrefix}request <role> - request role`];
            embed.addField('Help', help.join('\n'));
            sendMessage_1.embedSend(channel, embed);
            return false;
            break;
    }
}
exports.roleManager = roleManager;
function rolesList(message, embed) {
    const guild = message.guild;
    const guildPrefix = DataBase_1.DataBase.getPrefix(guild);
    const persionalRoles = guild.roles.filter(r => r.hexColor === persionalRolesColor).map(r => r.name);
    embed.setTitle('Role List');
    embed.setDescription('Some roles can unlock special channels');
    if (persionalRoles)
        embed.addField(`Personal roles (max ${maxPersonalRoles})`, persionalRoles.join('\n'));
    const otherRoles = guild.roles.filter(r => r.hexColor === otherRolesColor).map(r => r.name);
    if (otherRoles)
        embed.addField(`Other roles`, otherRoles.join('\n'));
    const specialRoles = getSpecialRoles(guild).map(r => r.name);
    if (specialRoles.length !== 0)
        embed.addField(`Spiecal roles (use ${guildPrefix}role request [rolename])`, specialRoles.join('\n'));
    embed.setColor("WHITE");
    sendMessage_1.embedSend(message.channel, embed);
}
function addRole(message, embed, roleName) {
    const guild = message.guild;
    const user = message.author;
    const guildMember = guild.members.find(m => m.user === user);
    const role = guild.roles.find(r => r.name.toLowerCase() === roleName);
    const guildPrefix = DataBase_1.DataBase.getPrefix(guild);
    if (!role) {
        embed.setColor("RED");
        embed.addField('Error', `Unable to find role: \`${roleName}\``);
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    else if (guildMember.roles.find(r => r === role)) {
        embed.setColor("GOLD");
        embed.addField('Info', `You already have role: \`${roleName}\``);
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    const persionalRoles = guild.roles.filter(r => r.hexColor === persionalRolesColor).map(r => r);
    const otherRoles = guild.roles.filter(r => r.hexColor === otherRolesColor).map(r => r);
    const specialRoles = getSpecialRoles(guild);
    if (persionalRoles.includes(role)) {
        const memberRoles = guildMember.roles.filter(r => r.hexColor === persionalRolesColor);
        if (memberRoles.size > maxPersonalRoles) {
            embed.setColor("RED");
            embed.addField('Error', `Limit reached. You can have only ${maxPersonalRoles} personal roles`);
            sendMessage_1.embedSend(message.channel, embed);
            return true;
        }
        else {
            guildMember.addRole(role)
                .then(() => {
                embed.setColor("GOLD");
                embed.addField('Info', `Personal role \`${role.name}\` has been suceffuly added to your account`);
                sendMessage_1.embedSend(message.channel, embed);
            })
                .catch(err => {
                embed.setColor("RED");
                embed.addField('ERROR', `Something went wrong ${err.message}`);
                sendMessage_1.embedSend(message.channel, embed);
            });
        }
    }
    else if (otherRoles.includes(role)) {
        guildMember.addRole(role)
            .then(() => {
            embed.setColor("GOLD");
            embed.addField('Info', `Role \`${role.name}\` has been suceffuly added to your account`);
            sendMessage_1.embedSend(message.channel, embed);
        })
            .catch(err => {
            embed.setColor("RED");
            embed.addField('ERROR', `Something went wrong ${err.message}`);
            sendMessage_1.embedSend(message.channel, embed);
        });
    }
    else if (specialRoles.includes(role)) {
        embed.setColor("RED");
        embed.addField('Info', `You cannot add this by userself but you can ask admin for it.\n Use  \`${guildPrefix}role request <RoleName>\``);
        sendMessage_1.embedSend(message.channel, embed);
    }
    else if (role.name.toLowerCase().includes('mod') || role.name.toLowerCase().includes('admin')) {
        embed.setColor("RED");
        embed.addField('Info', `Nice try 😉`);
        sendMessage_1.embedSend(message.channel, embed);
    }
    else {
        embed.setColor("RED");
        embed.addField('Info', `You cannot add this role by yourself. Sorry 😶`);
        sendMessage_1.embedSend(message.channel, embed);
    }
    return true;
}
function removeRole(message, embed, roleName) {
    const guild = message.guild;
    const user = message.author;
    const guildMember = guild.members.find(m => m.user === user);
    const role = guild.roles.find(r => r.name.toLowerCase() === roleName);
    if (!role) {
        embed.setColor("RED");
        embed.addField('Error', `Unable to find role: \`${roleName}\``);
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    else if (!guildMember.roles.find(r => r === role)) {
        embed.setColor("GOLD");
        embed.addField('Info', `You don't have role: \`${roleName}\``);
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    const persionalRoles = guild.roles.filter(r => r.hexColor === persionalRolesColor).map(r => r);
    const otherRoles = guild.roles.filter(r => r.hexColor === otherRolesColor).map(r => r);
    const specialRoles = getSpecialRoles(guild);
    if (persionalRoles.includes(role)) {
        guildMember.removeRole(role)
            .then(() => {
            embed.setColor("GOLD");
            embed.addField('Info', `Personal role \`${role.name}\` has been suceffuly removed from your account`);
            sendMessage_1.embedSend(message.channel, embed);
        })
            .catch(err => {
            embed.setColor("RED");
            embed.addField('ERROR', `Something went wrong: ${err.message}`);
            sendMessage_1.embedSend(message.channel, embed);
        });
    }
    else if (otherRoles.includes(role)) {
        guildMember.removeRole(role)
            .then(() => {
            embed.setColor("GOLD");
            embed.addField('Info', `Role \`${role.name}\` has been suceffuly removed from your account`);
            sendMessage_1.embedSend(message.channel, embed);
        })
            .catch(err => {
            embed.setColor("RED");
            embed.addField('ERROR', `Something went wrong: ${err.message}`);
            sendMessage_1.embedSend(message.channel, embed);
        });
    }
    else if (role.name.toLowerCase().includes('cute')) {
        embed.setColor("RED");
        embed.addField('Info', `If you are cute you are cute as simple is that.😄`);
        sendMessage_1.embedSend(message.channel, embed);
    }
    else if (specialRoles.includes(role)) {
        embed.setColor("RED");
        embed.addField('Info', `You can't just remove special role by yourself.😐`);
        sendMessage_1.embedSend(message.channel, embed);
    }
    else if (role.name.toLowerCase().includes('mod')) {
        guildMember.removeRole(role)
            .then(() => {
            embed.setColor("RED");
            embed.addField('Info', `Okay...😮\n\nRemoved moderator role.`);
            sendMessage_1.embedSend(message.channel, embed);
        })
            .catch(err => {
            embed.setColor("RED");
            embed.addField('ERROR', `Something went wrong: ${err.message}`);
            sendMessage_1.embedSend(message.channel, embed);
        });
    }
    else {
        embed.setColor("RED");
        embed.addField('Info', `You cannot add this role by yourself. Sorry 😶`);
        sendMessage_1.embedSend(message.channel, embed);
    }
    return true;
}
function requestRole(message, embed, roleName) {
    const guild = message.guild;
    const user = message.author;
    const guildMember = guild.members.find(m => m.user === user);
    const role = guild.roles.find(r => r.name.toLowerCase() === roleName);
    const guildPrefix = DataBase_1.DataBase.getPrefix(guild);
    if (!role) {
        embed.setColor("RED");
        embed.addField('Error', `Unable to find role: \`${roleName}\``);
        sendMessage_1.embedSend(message.channel, embed);
        return;
    }
    else if (guildMember.roles.find(r => r === role)) {
        embed.setColor("GOLD");
        embed.addField('Info', `You already have role: \`${roleName}\``);
        sendMessage_1.embedSend(message.channel, embed);
        return;
    }
    const persionalRoles = guild.roles.filter(r => r.hexColor === persionalRolesColor).map(r => r);
    const otherRoles = guild.roles.filter(r => r.hexColor === otherRolesColor).map(r => r);
    const specialRoles = getSpecialRoles(guild);
    if (persionalRoles.includes(role) || otherRoles.includes(role)) {
        embed.setColor('WHITE');
        embed.addField('info', `You don't have to request this roll you can add it by yourself\n \`${guildPrefix}role add ${role.name}\``);
        sendMessage_1.embedSend(message.channel, embed);
    }
    else if (specialRoles.includes(role)) {
        embed.setColor('GOLD');
        embed.addField('info', `Request sent to admin`);
        const botLog = guild.channels.find(c => c.name.toLowerCase().includes('bot-logs'));
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category')
            botLog.send(`User ${message.author} wants role ${role.name}`);
        sendMessage_1.embedSend(message.channel, embed);
    }
    else if (role.name.toLowerCase().includes('admin') || role.name.toLowerCase().includes('mod')) {
        embed.setColor("RED");
        embed.addField('Error', `Nope`);
        const botLog = guild.channels.find(c => c.name.toLowerCase().includes('bot-logs'));
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category')
            botLog.send(`User ${message.author} wants role ${role.name}`);
        sendMessage_1.embedSend(message.channel, embed);
        return;
    }
    else {
        embed.setColor('GOLD');
        embed.addField('info', `Hmm will think about that...`);
        const botLog = guild.channels.find(c => c.name.toLowerCase().includes('bot-logs'));
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category')
            botLog.send(`User ${message.author} wants role ${role.name}`);
        sendMessage_1.embedSend(message.channel, embed);
    }
}
function suggestRole(message, embed, roleName) {
    const guild = message.guild;
    const user = message.author;
    const guildMember = guild.members.find(m => m.user === user);
    const role = guild.roles.find(r => r.name.toLowerCase() === roleName);
    const guildRoles = guild.roles.map(r => r);
    const guildPrefix = DataBase_1.DataBase.getPrefix(guild);
    if (guildRoles.includes(role)) {
        embed.setColor("RED");
        embed.addField('Error', `Cannot suggest existing role`);
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    else {
        if (roleName.length < 5) {
            embed.setColor('RED');
            embed.addField('Error', `Role name must be longer than 4 charaters!...`);
            sendMessage_1.embedSend(message.channel, embed);
            return;
        }
        for (const bannedName of bannedRoleNames) {
            if ((roleName.toLowerCase().replace(/[^a-zA-Z:,]+/g, '').includes(bannedName))) {
                embed.setColor('RED');
                embed.addField('Error', `Blocked role Name!`);
                sendMessage_1.embedSend(message.channel, embed);
                return;
            }
        }
        embed.setColor('GOLD');
        embed.addField('info', `Role suggested...`);
        const botLog = guild.channels.find(c => c.name.toLowerCase().includes('suggestion'));
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category')
            botLog.send(`User ${message.author} suggest role ${roleName}`);
        sendMessage_1.embedSend(message.channel, embed);
    }
}
function getSpecialRoles(guild) {
    const specialRoles = [];
    const devRole = guild.roles.find(r => r.name.toLowerCase().includes('dev'));
    const artist = guild.roles.find(r => r.name.toLowerCase().includes('artist'));
    const bestFriend = guild.roles.find(r => r.name.toLowerCase().includes('writer'));
    const memeMaster = guild.roles.find(r => r.name.toLowerCase().includes('best friend'));
    const codeLabDj = guild.roles.find(r => r.name.toLowerCase().includes('dj'));
    if (devRole)
        specialRoles.push(devRole);
    if (artist)
        specialRoles.push(artist);
    if (bestFriend)
        specialRoles.push(bestFriend);
    if (memeMaster)
        specialRoles.push(memeMaster);
    if (codeLabDj)
        specialRoles.push(codeLabDj);
    return specialRoles;
}
//# sourceMappingURL=roleManager.js.map