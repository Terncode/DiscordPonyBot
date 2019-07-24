"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const main_1 = require("./main");
const ourServer_1 = require("./ourServer/ourServer");
const DataBase_1 = require("./other/DataBase");
exports.client = new discord_js_1.Client();
const token = process.env.BOT_TOKEN;
const debug = process.env.DEBUG;
const version = 'v29.6.2019 Build';
exports.client.on('ready', async () => {
    DataBase_1.setUp();
    console.info(`logined as ${exports.client.user.tag}`);
    console.info(`Access to ${exports.client.guilds.size} guilds`);
    await ourServer_1.enableServerFeature();
    if (exports.client.user.bot)
        console.info(`Invite link: https://discordapp.com/oauth2/authorize?client_id=${exports.client.user.id}&scope=bot&permissions=8`);
    ourServer_1.bootMessage(version);
    updateActivity();
});
exports.client.on('message', message => { main_1.onMessage(message); });
exports.client.on('guildCreate', guild => {
    updateActivity();
    main_1.clientGuildJoin(guild);
});
exports.client.on('guildDelete', guild => {
    updateActivity();
});
exports.client.on('guildMemberAdd', memeber => { main_1.onGuildJoin(memeber); });
exports.client.on('guildMemberRemove', memeber => { main_1.onGuildLeave(memeber); });
exports.client.on('debug', bug => { if (debug)
    console.log(bug); });
exports.client.on('error', error => { if (debug)
    console.log(error); });
process.on('beforeExit', () => destroy());
process.on('SIGINT', () => destroy());
process.on('SIGTERM', () => destroy());
process.on('uncaughtException', () => destroy());
process.on('unhandledRejection', () => { });
function updateActivity() {
    exports.client.user.setActivity(`-help in ${exports.client.guilds.size} Servers`, {
        type: 'WATCHING'
    });
}
async function destroy() {
    await ourServer_1.disableServerFeatures();
    await ourServer_1.shutDownMessage();
    await exports.client.destroy();
    process.exit(1);
}
exports.client.login(token);
//# sourceMappingURL=index.js.map