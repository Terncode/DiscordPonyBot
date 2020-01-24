import { Client, PresenceStatus, Message } from 'discord.js';
import { onMessage, onStartUp, guildMemberAdd, guildMemberRemove, onShutDown, guildBanAdd, guildBanRemove } from './main';
import { clientGuildJoin } from './other/joinLeaves';
import { Config } from './interfaces';
import { reportErrorToOwner } from './until/errors';
import { connectToDB } from './until/database';
import { setup, loadLanguages, getALLImageDeliveryChannels, getAllPTUpdateChannels } from './until/guild';
import { ImageDelivery } from './other/derpibooru/imageDelivery';
import { hasPermissionInChannel } from './until/util';
import { PTUpdateChecker } from './other/ptown/updateChecker';

let idleTimeout: NodeJS.Timeout | undefined;
export const client = new Client();
export const version = 'v24.1.2020 Build v1';
export let inviteLink: string;
export let config: Config;
export let ptChecker: PTUpdateChecker;

let shouldUpdateActivity = true;
let ready = false;
try {
    config = require('../config.json');
} catch (_) {
    console.info('Failed to load config.json. Loading environment variables');
    config = {
        TOKEN: process.env.BOT_TOKEN || '',
        DEBUG: !!process.env.DEBUG,
        OWNER_ID: process.env.OWNER_ID,
        PREFIX: process.env.OWNER_ID || '-',
        DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || '',
        PT_UPDATER_DOMAIN: process.env.PT_UPDATER_DOMAIN || undefined,
        PT_UPDATER_LOGO: process.env.LOGO || undefined,
        PT_UPDATER_NAME: process.env.PT_UPDATER_NAME || undefined,
    };
}

client.on('ready', async () => {
    // setUp();
    console.info(`loggined as ${client.user.tag}`);
    console.info(`Access to ${client.guilds.size} guilds`);
    inviteLink = await client.generateInvite('ADMINISTRATOR');
    if (client.user.bot) console.info(`Invite link: ${inviteLink}`);
    updateActivity();
    onStartUp(client);
});

client.on('message', message => { if (ready) onMessage(message); });
client.on('guildCreate', guild => {
    if (shouldUpdateActivity) updateActivity();
    clientGuildJoin(guild);
});
client.on('guildDelete', () => {
    if (shouldUpdateActivity) updateActivity();
});
client.on('guildMemberAdd', member => { guildMemberAdd(member); });
client.on('guildMemberRemove', member => { guildMemberRemove(member); });
client.on('guildBanAdd', (guild, user) => { guildBanAdd(guild, user); });
client.on('guildBanRemove', (guild, user) => { guildBanRemove(guild, user); });
client.on('debug', bug => { if (config.DEBUG) console.log(bug); });
client.on('error', console.error);

// process.on('SIGKILL', () => destroy());
process.on('beforeExit', () => destroy());
process.on('SIGINT', () => destroy());
process.on('SIGTERM', () => destroy());

process.on('uncaughtException', async (err: Error) => {
    await reportErrorToOwner(client, err);
    // destroy()
});

process.on('unhandledRejection', async err => {
    if (err) await reportErrorToOwner(client, err);
    else await reportErrorToOwner(client, Error('unhandledRejection'));
});

export function idle(message: Message) {
    if (message.author === client.user) return;
    if (idleTimeout) clearTimeout(idleTimeout);
    setStatus('online');
    idleTimeout = setTimeout(() => {
        setStatus('idle');
    }, 150000);
}

export function setStatus(status?: PresenceStatus): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!status) status = 'online';

        client.user.setStatus(status)
            .then(() => resolve())
            .catch(err => reject(err));
    });
}

export function updateActivity(text?: string, type?: number | 'PLAYING' | 'STREAMING' | 'LISTENING' | 'WATCHING'): Promise<void> {
    return new Promise((resolve, reject) => {
        if (text || type) shouldUpdateActivity = false;
        else shouldUpdateActivity = true;

        text = text || `${config.PREFIX}help in ${client.guilds.size} Servers`;
        type = type || 'WATCHING';
        client.user.setActivity(text, {
            type,
        }).then(() => resolve()).catch(err => reject(err));
    });
}

export async function destroy() {
    await onShutDown(client);
    await client.destroy();
    process.exit(0);
}

function startServices() {
    const imageDelivery = new ImageDelivery();
    imageDelivery.on('update', async (embed, imageUrl) => {
        try {
            const channels = await getALLImageDeliveryChannels(client);
            for (const channel of channels) {
                if (hasPermissionInChannel(channel, 'SEND_MESSAGES')) {
                    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) {
                        channel.send(embed);
                    } else channel.send(imageUrl);
                }
            }
        } catch (error) {
            reportErrorToOwner(client, error);
        }
    });
    if (config.PT_UPDATER_NAME && config.PT_UPDATER_DOMAIN && config.PT_UPDATER_LOGO) {
        ptChecker = new PTUpdateChecker(config.PT_UPDATER_NAME, config.PT_UPDATER_DOMAIN, config.PT_UPDATER_LOGO);
        ptChecker.on('update', async (richEmbed, changeLog) => {

            try {
                const channels = await getAllPTUpdateChannels(client);
                for (const channel of channels) {
                    if (hasPermissionInChannel(channel, 'SEND_MESSAGES')) {
                        if (hasPermissionInChannel(channel, 'EMBED_LINKS')) {
                            channel.send(richEmbed);
                        } else {
                            const code = '```';
                            let chLog = `${changeLog.version}\n,${changeLog.changes.join('\n')}`;
                            chLog = chLog.slice(0, 2000);
                            const lastNewlineIndex = chLog.lastIndexOf('\n');
                            chLog = lastNewlineIndex === -1 ? `${chLog}...` : `${chLog.slice(0, lastNewlineIndex)}...`;
                            channel.send(`${code}\n${chLog}${code}`);
                        }
                    }
                }
            } catch (error) {
                reportErrorToOwner(client, error);
            }
        });
    }
}

async function boot() {
    try {
        console.info('Loading languages...');
        await loadLanguages();
        console.info('Connecting to database...');
        await connectToDB(config.DB_CONNECTION_STRING);
        console.info('Connecting to discord...');
        await client.login(config.TOKEN);
        console.info('Setting everything up...');
        await setup(client);
        console.info('Starting services.');
        startServices();
        ready = true;
        console.info('Done.');
    } catch (error) {
        console.error(error);
        await client.destroy();
        process.exit(1);
    }
}

boot();
