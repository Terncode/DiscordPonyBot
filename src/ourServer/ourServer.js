"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var discord_js_1 = require("discord.js");
var sendMessage_1 = require("../other/sendMessage");
var roleManager_1 = require("./roleManager");
var __1 = require("..");
var DataBase_1 = require("../other/DataBase");
var Jimp = require('jimp');
var ColorThief = require('color-thief-jimp');
var path = require("path");
var fs = require("fs");
var guildPrefix_1 = require("../other/guildPrefix");
var guildID = process.env.GUILD_ID;
var ownerID = process.env.OWNER_ID;
function ourServer(message) {
    if (!message.guild)
        return false;
    if (message.guild.id !== guildID)
        return false;
    if (help(message))
        return true;
    removeQuietRole(message);
    autoDeleteChannel(message);
    reactArt(message);
    artBackup(message);
    reactSuggestion(message);
    if (roleManager_1.roleManager(message))
        return true;
    return false;
}
exports.ourServer = ourServer;
function ourServerJoin(member) {
    if (member.user.bot)
        return;
    var guild = member.guild;
    var general = guild.channels.find(function (c) { return c.name.toLowerCase().includes('general'); });
    var roleManager = guild.channels.find(function (c) { return c.name.toLowerCase().includes('role-manager'); });
    var embed = new discord_js_1.RichEmbed();
    embed.setAuthor(guild.name, guild.iconURL);
    embed.setTitle(member.user.tag + " Joined the server");
    embed.addField('Welcome', "Welcome on Pony CodeLab\nUse " + roleManager + " to setup your roles!");
    embed.setThumbnail(member.user.avatarURL);
    var quietRole = guild.roles.find(function (r) { return r.name.toLowerCase().includes('quiet'); });
    if (quietRole)
        member.addRole(quietRole)["catch"](function (err) { return console.error(err); });
    var memberRole = guild.roles.find(function (r) { return r.name.toLowerCase().includes('member'); });
    if (memberRole)
        member.addRole(memberRole)["catch"](function (err) { return console.error(err); });
    if (!general || general.type === 'voice')
        return;
    Jimp.read(member.guild.iconURL, function (err, image) {
        if (err)
            sendMessage_1.embedSend(general, embed);
        try {
            embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
            sendMessage_1.embedSend(general, embed);
        }
        catch (err) {
            sendMessage_1.embedSend(general, embed);
        }
    });
}
exports.ourServerJoin = ourServerJoin;
function shutDownMessage() {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var guild, botLogs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    guild = __1.client.guilds.find(function (g) { return g.id === guildID; });
                    botLogs = guild.channels.find(function (c) { return c.name.toLowerCase().includes('bot-logs') && c.type === 'text'; });
                    if (!botLogs) return [3 /*break*/, 2];
                    return [4 /*yield*/, botLogs.send('Bot successfully shut down')["catch"](function (err) { return console.error(err); })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    console.info("Bot successfully shut down");
                    resolve('ok');
                    return [2 /*return*/];
            }
        });
    }); });
}
exports.shutDownMessage = shutDownMessage;
function bootMessage(version) {
    var guild = __1.client.guilds.find(function (g) { return g.id === guildID; });
    var botLogs = guild.channels.find(function (c) { return c.name.toLowerCase().includes('bot-logs') && c.type === 'text'; });
    if (botLogs)
        botLogs.send("Bot booted version: `" + version + "`")["catch"](function (err) { return console.error(err); });
    console.info("Bot booted version: " + version);
}
exports.bootMessage = bootMessage;
function disableServerFeatures() {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var guild, deleteChannels, roleManager, deffaultRole, _loop_1, _i, deleteChannels_1, deleteChannel, owner;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    guild = __1.client.guilds.find(function (g) { return g.id === guildID; });
                    deleteChannels = guild.channels.filter(function (c) { return c.name.toLowerCase().includes('auto-delete') && c.type === 'text'; }).map(function (c) { return c; });
                    roleManager = guild.channels.find(function (c) { return c.name.toLowerCase().includes('role-manager') && c.type === 'text'; });
                    deffaultRole = guild.defaultRole;
                    _loop_1 = function (deleteChannel) {
                        var messages, messageMap;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, deleteChannel.overwritePermissions(deffaultRole, { 'SEND_MESSAGES': false }, 'Bot ShutDown')
                                        .then(function () { return console.log(deleteChannel.name + ' disabled sending message'); })["catch"](function (err) { return console.error(err); })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, deleteChannel.fetchMessages({ limit: 100 })["catch"](function (err) { return console.log(err); })];
                                case 2:
                                    messages = _a.sent();
                                    if (!messages)
                                        return [2 /*return*/, "continue"];
                                    messageMap = messages.map(function (m) { return m; });
                                    if (messageMap.length !== 0) {
                                        messageMap.forEach(function (message) {
                                            if (message.deletable)
                                                message["delete"]()["catch"](function (err) { return console.log(err); });
                                        });
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, deleteChannels_1 = deleteChannels;
                    _a.label = 1;
                case 1:
                    if (!(_i < deleteChannels_1.length)) return [3 /*break*/, 4];
                    deleteChannel = deleteChannels_1[_i];
                    return [5 /*yield**/, _loop_1(deleteChannel)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (!roleManager) return [3 /*break*/, 6];
                    return [4 /*yield*/, roleManager.overwritePermissions(deffaultRole, { 'SEND_MESSAGES': false }, 'Bot ShutDown')
                            .then(function () { return console.log(roleManager.name + ' disabled sending message'); })["catch"](function (err) { return console.error(err); })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [4 /*yield*/, roleManager.setTopic("Bot offline. Channel dosen't work")
                        .then(function () { console.log(roleManager.name + " Topic Changed to 'Bot offline. Channel dosen't work'"); })["catch"](function (err) { return console.error(err); })
                    //sendbackup file
                    //const owner = client.users.find(u => u.id === ownerID)
                ];
                case 7:
                    _a.sent();
                    owner = null;
                    if (!owner) return [3 /*break*/, 9];
                    return [4 /*yield*/, fs.readdir(path.resolve('languages'), function (err, files) { return __awaiter(_this, void 0, void 0, function () {
                            var languageNames, dm;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (err)
                                            console.error('Unable to scan directory: ' + err);
                                        languageNames = [];
                                        files.forEach(function (file) {
                                            languageNames.push(file);
                                        });
                                        return [4 /*yield*/, owner.createDM()["catch"](function (err) { return console.error(err); })];
                                    case 1:
                                        dm = _a.sent();
                                        if (!dm) return [3 /*break*/, 3];
                                        return [4 /*yield*/, dm.send("`" + languageNames.join(', ') + "`", {
                                                files: [
                                                    path.resolve('GuildData', 'data.json')
                                                ]
                                            }).then(function () { resolve('ok'); })["catch"](function (err) {
                                                console.error(err);
                                                resolve('cannot send but ok');
                                            })];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    resolve('ok');
                    _a.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    }); });
}
exports.disableServerFeatures = disableServerFeatures;
function enableServerFeature() {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var guild, deleteChannels, roleManager, deffaultRole, _loop_2, _i, deleteChannels_2, deleteChannel, guildPrefix;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    guild = __1.client.guilds.find(function (g) { return g.id === guildID; });
                    console.log('Configuring guild' + guild.name);
                    deleteChannels = guild.channels.filter(function (c) { return c.name.toLowerCase().includes('auto-delete') && c.type === 'text'; }).map(function (c) { return c; });
                    roleManager = guild.channels.find(function (c) { return c.name.toLowerCase().includes('role-manager') && c.type === 'text'; });
                    deffaultRole = guild.defaultRole;
                    if (!(deleteChannels.length !== 0)) return [3 /*break*/, 4];
                    _loop_2 = function (deleteChannel) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, deleteChannel.overwritePermissions(deffaultRole, { 'SEND_MESSAGES': true }, 'Bot ShutDown')
                                        .then(function () { return console.log(deleteChannel.name + ' enabled sending message'); })["catch"](function (err) { return console.error(err); })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, deleteChannels_2 = deleteChannels;
                    _a.label = 1;
                case 1:
                    if (!(_i < deleteChannels_2.length)) return [3 /*break*/, 4];
                    deleteChannel = deleteChannels_2[_i];
                    return [5 /*yield**/, _loop_2(deleteChannel)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (!roleManager) return [3 /*break*/, 6];
                    return [4 /*yield*/, roleManager.overwritePermissions(deffaultRole, { 'SEND_MESSAGES': true }, 'Bot ShutDown')
                            .then(function () { return console.log(roleManager.name + ' enabled sending message'); })["catch"](function (err) { return console.error(err); })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    guildPrefix = DataBase_1.DataBase.getPrefix(guild);
                    return [4 /*yield*/, roleManager.setTopic(guildPrefix + "role[add / remove / request / suggest][Role name]")
                            .then(function () { console.log(roleManager.name + (" Topic Changed to '" + guildPrefix + "role [add/remove/request/suggest] [Role name]'")); })["catch"](function (err) { return console.error(err); })];
                case 7:
                    _a.sent();
                    resolve('ok');
                    return [2 /*return*/];
            }
        });
    }); });
}
exports.enableServerFeature = enableServerFeature;
function reactArt(message) {
    var channel = message.channel;
    if (!channel.name.toLowerCase().includes('art') || message.attachments.size === 0)
        return;
    message.react("👍");
    setTimeout(function () {
        message.react("👌");
    }, 500);
    setTimeout(function () {
        var neat = message.guild.emojis.find(function (r) { return r.name.toLowerCase() === "neat"; });
        if (neat != undefined)
            message.react(neat)["catch"](function () { });
    }, 100);
    return;
}
function reactSuggestion(message) {
    var channel = message.channel;
    if (!channel.name.toLowerCase().includes('suggestions'))
        return false;
    if (message.content.length < 10)
        return false;
    message.react("👍");
    setTimeout(function () {
        message.react("👎");
    }, 500);
    return false;
}
function autoDeleteChannel(message) {
    var channel = message.channel;
    if (!channel.name.toLowerCase().includes('auto-delete'))
        return;
    var channelName = channel.name.toLowerCase().replace(/auto-delete|[-]/g, '');
    var time = parseInt(channelName);
    if (isNaN(time))
        return false;
    if (channelName.includes('sec') && time > 5)
        deleteOnTime(message, time);
    else if (channelName.includes('min'))
        deleteOnTime(message, time * 60);
}
function deleteOnTime(message, time) {
    var timeEmoji = ["🕛", "🕘", "🕕", "🕒"];
    var endEmoji = "❌";
    time *= 1000;
    var timeSplit = time / timeEmoji.length;
    var _loop_3 = function (i) {
        setTimeout(function () {
            message.react(timeEmoji[i])["catch"](function () { });
        }, timeSplit * parseInt(i));
    };
    for (var i in timeEmoji) {
        _loop_3(i);
    }
    setTimeout(function () {
        message.react(endEmoji);
    }, time - 5000);
    setTimeout(function () {
        message["delete"]()["catch"](function () {
            message.channel.send('No permission to delete message :cry:')["catch"](function () { });
        });
    }, time);
    return true;
}
function artBackup(message) {
    var channel = message.channel;
    var guild = message.guild;
    if (!channel.name.toLowerCase().includes('art'))
        return false;
    if (message.attachments.size === 0)
        return false;
    var backupChannel = guild.channels.find(function (c) { return c.name.toLowerCase().includes('backup'); });
    if (!backupChannel || backupChannel.type === 'voice')
        return;
    var attachments = message.attachments;
    var url = [];
    attachments.forEach(function (e) {
        url.push(e.url);
    });
    backupChannel.send(message.author.tag + "\n " + url.join('\n'))["catch"](function (err) { return console.error(err); });
}
function removeQuietRole(message) {
    var guild = message.guild;
    var user = message.author;
    var guildMember = guild.members.find(function (m) { return m.id === user.id; });
    var quietRole = guildMember.roles.find(function (r) { return r.name.toLowerCase().includes('quiet'); });
    if (quietRole)
        guildMember.removeRole(quietRole)["catch"](function () { });
}
function help(message) {
    var p = guildPrefix_1.prefix(message).toLowerCase();
    if (!p)
        return false;
    if (p !== 'help')
        return false;
    var language = message.guild ? DataBase_1.DataBase.getLang()[DataBase_1.DataBase.getGuildLang(message.guild)].help : DataBase_1.DataBase.getLang()['en'].help;
    var guildPrefix = '';
    if (message.guild)
        guildPrefix = DataBase_1.DataBase.getPrefix(message.guild);
    var embed = new discord_js_1.RichEmbed();
    embed.setColor("WHITE");
    if (message.guild)
        embed.setAuthor(message.guild.name, message.guild.iconURL);
    var roleManager = message.guild.channels.find(function (c) { return c.name.toLowerCase().includes('role-manager'); });
    var helpInfo = [
        guildPrefix + "help - Shows this",
        guildPrefix + "hugs [user] - hugs user or you",
        guildPrefix + "boops [user] - boobs user or you",
        guildPrefix + "roll [min-[max]] - randomize a number",
        guildPrefix + "joke [category] - Tells you random joke",
        guildPrefix + "fact [category] - Tells you random fact",
        guildPrefix + "translate - [language] [message] - translate message to given lanugage",
        guildPrefix + "derpibooru - [tags,tags] - gives you random image from derpibooru",
        guildPrefix + "stats - [server/bot/user] - shows stats",
        guildPrefix + "ud [word] - get explanation from urbandictionary.com",
        guildPrefix + "define [word] - gives definition of word",
        guildPrefix + "role [add/remove] - add or remove roles work only in " + roleManager,
    ];
    embed.addField(language.help, helpInfo.join('\n'));
    sendMessage_1.embedSend(message.channel, embed);
    return true;
}
