"use strict";
exports.__esModule = true;
var discord_js_1 = require("discord.js");
var guildPrefix_1 = require("../other/guildPrefix");
var sendMessage_1 = require("../other/sendMessage");
var DataBase_1 = require("../other/DataBase");
var maxPersonalRoles = 3;
var bannedRoleNames = ["anal", "anus", "arse", "ass", "assfuck", "asshole", "assfucker", "asshole", "assshole", "bastard", "bitch", "blackcock", "bloodyhell", "boong", "cock", "cockfucker", "cocksuck", "cocksucker", "coon", "coonnass", "crap", "cunt", "cyberfuck", "damn", "darn", "dick", "dirty", "douche", "dummy", "erect", "erection", "erotic", "escort", "fag", "faggot", "fuck", "Fuckoff", "fuckyou", "fuckass", "fuckhole", "goddamn", "gook", "hardcore", "hardcore", "homoerotic", "hore", "lesbian", "lesbians", "mother fucker", "motherfuck", "motherfucker", "negro", "nigger", "orgasim", "orgasm", "penis", "penisfucker", "piss", "pissoff", "porn", "porno", "pornography", "pussy", "retard", "sadist", "sex", "sexy", "shit", "slut", "sonofabitch", "suck", "tits", "viagra", "whore", "xxx"];
//ffff00 admin
//c8c8ff
//00c000 member
//80ff80 personal roles
var persionalRolesColor = '#80ff80';
var otherRolesColor = '#00ffd2';
function roleManager(message) {
    var p = guildPrefix_1.prefix(message).toLowerCase();
    if (!p)
        return false;
    if (!p.startsWith('role'))
        return false;
    var channel = message.channel;
    var guild = message.guild;
    var embed = new discord_js_1.RichEmbed();
    embed.setAuthor('Pony CodeLab', guild.iconURL);
    if (!channel.name.toLowerCase().includes('role-manager')) {
        var roleManagerChannel = guild.channels.find(function (c) { return c.name.toLowerCase().includes('role-manager'); });
        var roleManager_1 = roleManagerChannel ? roleManagerChannel : '#role-mamanger';
        embed.setColor("RED");
        if (roleManager_1)
            embed.addField('Error', "You can only use this command on inside " + roleManager_1 + " channel!");
        sendMessage_1.embedSend(channel, embed);
        return true;
    }
    var guildPrefix = DataBase_1.DataBase.getPrefix(guild);
    var string = p.slice(p.indexOf(' ')).trim();
    var type = string.trim();
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
            embed.addField('Something went wrong', "It looks like you are using commands wrong!");
            var help = [guildPrefix + "list  - shows available roles",
                guildPrefix + "add <role> - adds role",
                guildPrefix + "remove <role> - remove role",
                guildPrefix + "suggest <role> - suggest Role",
                guildPrefix + "request <role> - request role"];
            embed.addField('Help', help.join('\n'));
            sendMessage_1.embedSend(channel, embed);
            return false;
            break;
    }
}
exports.roleManager = roleManager;
function rolesList(message, embed) {
    var guild = message.guild;
    var guildPrefix = DataBase_1.DataBase.getPrefix(guild);
    var persionalRoles = guild.roles.filter(function (r) { return r.hexColor === persionalRolesColor; }).map(function (r) { return r.name; });
    embed.setTitle('Role List');
    embed.setDescription('Some roles can unlock special channels');
    if (persionalRoles)
        embed.addField("Personal roles (max " + maxPersonalRoles + ")", persionalRoles.join('\n'));
    var otherRoles = guild.roles.filter(function (r) { return r.hexColor === otherRolesColor; }).map(function (r) { return r.name; });
    if (otherRoles)
        embed.addField("Other roles", otherRoles.join('\n'));
    var specialRoles = getSpecialRoles(guild).map(function (r) { return r.name; });
    if (specialRoles.length !== 0)
        embed.addField("Spiecal roles (use " + guildPrefix + "role request [rolename])", specialRoles.join('\n'));
    embed.setColor("WHITE");
    sendMessage_1.embedSend(message.channel, embed);
}
function addRole(message, embed, roleName) {
    var guild = message.guild;
    var user = message.author;
    var guildMember = guild.members.find(function (m) { return m.user === user; });
    var role = guild.roles.find(function (r) { return r.name.toLowerCase() === roleName; });
    var guildPrefix = DataBase_1.DataBase.getPrefix(guild);
    if (!role) {
        embed.setColor("RED");
        embed.addField('Error', "Unable to find role: `" + roleName + "`");
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    else if (guildMember.roles.find(function (r) { return r === role; })) {
        embed.setColor("GOLD");
        embed.addField('Info', "You already have role: `" + roleName + "`");
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    var persionalRoles = guild.roles.filter(function (r) { return r.hexColor === persionalRolesColor; }).map(function (r) { return r; });
    var otherRoles = guild.roles.filter(function (r) { return r.hexColor === otherRolesColor; }).map(function (r) { return r; });
    var specialRoles = getSpecialRoles(guild);
    if (persionalRoles.includes(role)) {
        var memberRoles = guildMember.roles.filter(function (r) { return r.hexColor === persionalRolesColor; });
        if (memberRoles.size > maxPersonalRoles) {
            embed.setColor("RED");
            embed.addField('Error', "Limit reached. You can have only " + maxPersonalRoles + " personal roles");
            sendMessage_1.embedSend(message.channel, embed);
            return true;
        }
        else {
            guildMember.addRole(role)
                .then(function () {
                embed.setColor("GOLD");
                embed.addField('Info', "Personal role `" + role.name + "` has been suceffuly added to your account");
                sendMessage_1.embedSend(message.channel, embed);
            })["catch"](function (err) {
                embed.setColor("RED");
                embed.addField('ERROR', "Something went wrong " + err.message);
                sendMessage_1.embedSend(message.channel, embed);
            });
        }
    }
    else if (otherRoles.includes(role)) {
        guildMember.addRole(role)
            .then(function () {
            embed.setColor("GOLD");
            embed.addField('Info', "Role `" + role.name + "` has been suceffuly added to your account");
            sendMessage_1.embedSend(message.channel, embed);
        })["catch"](function (err) {
            embed.setColor("RED");
            embed.addField('ERROR', "Something went wrong " + err.message);
            sendMessage_1.embedSend(message.channel, embed);
        });
    }
    else if (specialRoles.includes(role)) {
        embed.setColor("RED");
        embed.addField('Info', "You cannot add this by userself but you can ask admin for it.\n Use  `" + guildPrefix + "role request <RoleName>`");
        sendMessage_1.embedSend(message.channel, embed);
    }
    else if (role.name.toLowerCase().includes('mod') || role.name.toLowerCase().includes('admin')) {
        embed.setColor("RED");
        embed.addField('Info', "Nice try \uD83D\uDE09");
        sendMessage_1.embedSend(message.channel, embed);
    }
    else {
        embed.setColor("RED");
        embed.addField('Info', "You cannot add this role by yourself. Sorry \uD83D\uDE36");
        sendMessage_1.embedSend(message.channel, embed);
    }
    return true;
}
function removeRole(message, embed, roleName) {
    var guild = message.guild;
    var user = message.author;
    var guildMember = guild.members.find(function (m) { return m.user === user; });
    var role = guild.roles.find(function (r) { return r.name.toLowerCase() === roleName; });
    if (!role) {
        embed.setColor("RED");
        embed.addField('Error', "Unable to find role: `" + roleName + "`");
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    else if (!guildMember.roles.find(function (r) { return r === role; })) {
        embed.setColor("GOLD");
        embed.addField('Info', "You don't have role: `" + roleName + "`");
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    var persionalRoles = guild.roles.filter(function (r) { return r.hexColor === persionalRolesColor; }).map(function (r) { return r; });
    var otherRoles = guild.roles.filter(function (r) { return r.hexColor === otherRolesColor; }).map(function (r) { return r; });
    var specialRoles = getSpecialRoles(guild);
    if (persionalRoles.includes(role)) {
        guildMember.removeRole(role)
            .then(function () {
            embed.setColor("GOLD");
            embed.addField('Info', "Personal role `" + role.name + "` has been suceffuly removed from your account");
            sendMessage_1.embedSend(message.channel, embed);
        })["catch"](function (err) {
            embed.setColor("RED");
            embed.addField('ERROR', "Something went wrong: " + err.message);
            sendMessage_1.embedSend(message.channel, embed);
        });
    }
    else if (otherRoles.includes(role)) {
        guildMember.removeRole(role)
            .then(function () {
            embed.setColor("GOLD");
            embed.addField('Info', "Role `" + role.name + "` has been suceffuly removed from your account");
            sendMessage_1.embedSend(message.channel, embed);
        })["catch"](function (err) {
            embed.setColor("RED");
            embed.addField('ERROR', "Something went wrong: " + err.message);
            sendMessage_1.embedSend(message.channel, embed);
        });
    }
    else if (role.name.toLowerCase().includes('cute')) {
        embed.setColor("RED");
        embed.addField('Info', "If you are cute you are cute as simple is that.\uD83D\uDE04");
        sendMessage_1.embedSend(message.channel, embed);
    }
    else if (specialRoles.includes(role)) {
        embed.setColor("RED");
        embed.addField('Info', "You can't just remove special role by yourself.\uD83D\uDE10");
        sendMessage_1.embedSend(message.channel, embed);
    }
    else if (role.name.toLowerCase().includes('mod')) {
        guildMember.removeRole(role)
            .then(function () {
            embed.setColor("RED");
            embed.addField('Info', "Okay...\uD83D\uDE2E\n\nRemoved moderator role.");
            sendMessage_1.embedSend(message.channel, embed);
        })["catch"](function (err) {
            embed.setColor("RED");
            embed.addField('ERROR', "Something went wrong: " + err.message);
            sendMessage_1.embedSend(message.channel, embed);
        });
    }
    else {
        embed.setColor("RED");
        embed.addField('Info', "You cannot add this role by yourself. Sorry \uD83D\uDE36");
        sendMessage_1.embedSend(message.channel, embed);
    }
    return true;
}
function requestRole(message, embed, roleName) {
    var guild = message.guild;
    var user = message.author;
    var guildMember = guild.members.find(function (m) { return m.user === user; });
    var role = guild.roles.find(function (r) { return r.name.toLowerCase() === roleName; });
    var guildPrefix = DataBase_1.DataBase.getPrefix(guild);
    if (!role) {
        embed.setColor("RED");
        embed.addField('Error', "Unable to find role: `" + roleName + "`");
        sendMessage_1.embedSend(message.channel, embed);
        return;
    }
    else if (guildMember.roles.find(function (r) { return r === role; })) {
        embed.setColor("GOLD");
        embed.addField('Info', "You already have role: `" + roleName + "`");
        sendMessage_1.embedSend(message.channel, embed);
        return;
    }
    var persionalRoles = guild.roles.filter(function (r) { return r.hexColor === persionalRolesColor; }).map(function (r) { return r; });
    var otherRoles = guild.roles.filter(function (r) { return r.hexColor === otherRolesColor; }).map(function (r) { return r; });
    var specialRoles = getSpecialRoles(guild);
    if (persionalRoles.includes(role) || otherRoles.includes(role)) {
        embed.setColor('WHITE');
        embed.addField('info', "You don't have to request this roll you can add it by yourself\n `" + guildPrefix + "role add " + role.name + "`");
        sendMessage_1.embedSend(message.channel, embed);
    }
    else if (specialRoles.includes(role)) {
        embed.setColor('GOLD');
        embed.addField('info', "Request sent to admin");
        var botLog = guild.channels.find(function (c) { return c.name.toLowerCase().includes('bot-logs'); });
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category')
            botLog.send("User " + message.author + " wants role " + role.name);
        sendMessage_1.embedSend(message.channel, embed);
    }
    else if (role.name.toLowerCase().includes('admin') || role.name.toLowerCase().includes('mod')) {
        embed.setColor("RED");
        embed.addField('Error', "Nope");
        var botLog = guild.channels.find(function (c) { return c.name.toLowerCase().includes('bot-logs'); });
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category')
            botLog.send("User " + message.author + " wants role " + role.name);
        sendMessage_1.embedSend(message.channel, embed);
        return;
    }
    else {
        embed.setColor('GOLD');
        embed.addField('info', "Hmm will think about that...");
        var botLog = guild.channels.find(function (c) { return c.name.toLowerCase().includes('bot-logs'); });
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category')
            botLog.send("User " + message.author + " wants role " + role.name);
        sendMessage_1.embedSend(message.channel, embed);
    }
}
function suggestRole(message, embed, roleName) {
    var guild = message.guild;
    var user = message.author;
    var guildMember = guild.members.find(function (m) { return m.user === user; });
    var role = guild.roles.find(function (r) { return r.name.toLowerCase() === roleName; });
    var guildRoles = guild.roles.map(function (r) { return r; });
    var guildPrefix = DataBase_1.DataBase.getPrefix(guild);
    if (guildRoles.includes(role)) {
        embed.setColor("RED");
        embed.addField('Error', "Cannot suggest existing role");
        sendMessage_1.embedSend(message.channel, embed);
        return true;
    }
    else {
        if (roleName.length < 5) {
            embed.setColor('RED');
            embed.addField('Error', "Role name must be longer than 4 charaters!...");
            sendMessage_1.embedSend(message.channel, embed);
            return;
        }
        for (var _i = 0, bannedRoleNames_1 = bannedRoleNames; _i < bannedRoleNames_1.length; _i++) {
            var bannedName = bannedRoleNames_1[_i];
            if ((roleName.toLowerCase().replace(/[^a-zA-Z:,]+/g, '').includes(bannedName))) {
                embed.setColor('RED');
                embed.addField('Error', "Blocked role Name!");
                sendMessage_1.embedSend(message.channel, embed);
                return;
            }
        }
        embed.setColor('GOLD');
        embed.addField('info', "Role suggested...");
        var botLog = guild.channels.find(function (c) { return c.name.toLowerCase().includes('suggestion'); });
        if (botLog && botLog.type !== 'voice' && botLog.type !== 'category')
            botLog.send("User " + message.author + " suggest role " + roleName);
        sendMessage_1.embedSend(message.channel, embed);
    }
}
function getSpecialRoles(guild) {
    var specialRoles = [];
    var devRole = guild.roles.find(function (r) { return r.name.toLowerCase().includes('dev'); });
    var artist = guild.roles.find(function (r) { return r.name.toLowerCase().includes('artist'); });
    var bestFriend = guild.roles.find(function (r) { return r.name.toLowerCase().includes('writer'); });
    var memeMaster = guild.roles.find(function (r) { return r.name.toLowerCase().includes('best friend'); });
    var codeLabDj = guild.roles.find(function (r) { return r.name.toLowerCase().includes('dj'); });
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
