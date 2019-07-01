import { Client } from 'discord.js';

import { onMessage, onGuildJoin, onGuildLeave, clientGuildJoin } from './main';
import { enableServerFeature, disableServerFeatures, shutDownMessage, bootMessage } from './ourServer/ourServer';
import { setUp } from './other/DataBase';
export const client = new Client();

const token = process.env.BOT_TOKEN;
const debug = process.env.DEBUG
//process.env.GUILD_ID
//process.env.OWNER_ID

const version = 'v29.6.2019 Build';



client.on('ready', async () => {
    setUp()
    console.info(`logined as ${client.user.tag}`);
    console.info(`Access to ${client.guilds.size} guilds`);
    await enableServerFeature()
    if (client.user.bot) console.info(`Invite link: https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`);
    bootMessage(version);
    updateActivity();
});

client.on('message', message => { onMessage(message) });
client.on('guildCreate', guild => {
    updateActivity();
    clientGuildJoin(guild);
});
client.on('guildDelete', guild => {
    updateActivity();
});
client.on('guildMemberAdd', memeber => { onGuildJoin(memeber); });
client.on('guildMemberRemove', memeber => { onGuildLeave(memeber); });

client.on('debug', bug => { if (debug) console.log(bug); });
client.on('error', error => { if (debug) console.log(error); });

process.on('beforeExit', () => destroy());
process.on('SIGINT', () => destroy());
//process.on('SIGKILL', () => destroy());
process.on('SIGTERM', () => destroy());


process.on('uncaughtException', () => destroy());
process.on('unhandledRejection', () => { });


function updateActivity() {
    client.user.setActivity(`-help in ${client.guilds.size} Servers`, {
        type: 'WATCHING'
    });
}


async function destroy() {
    await disableServerFeatures()
    await shutDownMessage();
    await client.destroy();
    process.exit(1);
}

client.login(token);