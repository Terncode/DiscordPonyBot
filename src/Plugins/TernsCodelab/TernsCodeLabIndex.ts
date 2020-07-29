
import { Message, GuildChannel, Guild, TextChannel, GuildMember, MessageEmbed, DMChannel, OverwriteResolvable, NewsChannel } from 'discord.js';

import { GuildPlugin } from '../GuildPlugin';
import { HELP_COMMANDS, helpEntries, sendHelpEmbed } from '../../other/misc/help';
import { getLanguage, getPrefix } from '../../until/guild';
import { checkCommand } from '../../until/commandsHandler';
import { urbanDictionary } from '../../other/dictionary/urbanDictionary';
import { derpibooruCommand } from '../../other/derpibooru/derpiboo';
import { hasPermissionInChannel } from '../../until/util';
import { roleManager } from './roleManager';
import * as Jimp from 'jimp';
import { version } from '../..';
import { stringifyEmbed } from '../../until/embeds';
import { reportErrorToOwner } from '../../until/errors';
const ColorThief = require('color-thief-jimp');


// https://discord.gg/HPvbWYp
export const ternsCodeLab = new GuildPlugin('621726901420949504');

ternsCodeLab.on('message', (message, doNotExecuteOtherCommands) => {
    if (help(message)) return doNotExecuteOtherCommands();
    if (urbanDictionary(message, true)) return doNotExecuteOtherCommands();
    if (derpibooruCommand(message, true)) return doNotExecuteOtherCommands();
    if (roleManager(message)) return doNotExecuteOtherCommands();
    removeQuietRole(message);
    autoDeleteChannel(message);
    reactArt(message);
    reactSuggestion(message);
});

ternsCodeLab.on('guildMemberAdd', guildMember => {
    ternsCodeLabOnServerJoin(guildMember);
});

ternsCodeLab.on('startup', (guild, callback) => {
    callback(new Promise(async resolve => {
        await enableServerFeature(guild);
        await bootMessage(guild);
        resolve();
    }));
});

ternsCodeLab.on('shutdown', (guild, callback) => {
    callback(new Promise<void>(async resolve => {
        await disableServerFeatures(guild);
        await shutDownMessage(guild);
        resolve();
    }));
});

function help(message: Message) {
    const prefix = getPrefix(message.guild);
    const language = getLanguage(message.guild);
    if (checkCommand(message, [...language.help.commands.helpCommands, ...HELP_COMMANDS])) {
        const content: string[] = [];
        helpEntries(language, prefix, true).forEach(e => content.push(e));
        content.push('\nCustom script is running on this guild....');
        sendHelpEmbed(message, content);
        return true;
    }
    return false;
}

async function removeQuietRole(message: Message) {
    const guild = message.guild!;
    const user = message.author;
    const guildMember = guild.members.cache.find(m => m.id === user.id);
    if (!guildMember) return;
    const quietRole = guildMember.roles.cache.find(r => r.name.toLowerCase().includes('quiet'));
    try {
        if (quietRole) await guildMember.roles.remove(quietRole);
    } catch (error) {
        reportErrorToOwner(message.client, error, `Unable to remove quite role`);
    }
}

async function reactArt(message: Message) {
    const channel = message.channel as GuildChannel;
    if (!channel.name.toLowerCase().includes('art') || message.attachments.size === 0) return;

    if (hasPermissionInChannel(message.channel, 'ADD_REACTIONS')) {
        try {
            await message.react('👍');
            await message.react('👌');
            const neat = message.guild!.emojis.cache.find(r => r.name.toLowerCase() === 'neat');
            if (neat) await message.react(neat);
        } catch (error) {
            reportErrorToOwner(message.client, error, `Message reaction failed`);
        }
    }
}
export function autoDeleteChannel(message: Message) {
    const channel = message.channel as GuildChannel;
    if (!channel.name.toLowerCase().includes('auto-delete')) return;

    const channelName = channel.name.toLowerCase().replace(/auto-delete|[-]/g, '');
    const time = parseInt(channelName);
    if (isNaN(time)) return false;

    if (channelName.includes('sec') && time > 5) deleteOnTime(message, time);
    else if (channelName.includes('min')) deleteOnTime(message, time * 60);
}

async function deleteOnTime(message: Message, time: number) {
    if (hasPermissionInChannel(message.channel, 'MANAGE_MESSAGES') && hasPermissionInChannel(message.channel, 'ADD_REACTIONS')) {
        const timeEmoji = ['🕛', '🕘', '🕕', '🕒'];
        const endEmoji = '❌';
        time *= 1000;
        const timeSplit = time / timeEmoji.length;
        for (const i in timeEmoji) {
            setTimeout(() => {
                if (!message.deleted && hasPermissionInChannel(message.channel, 'ADD_REACTIONS'))
                    message.react(timeEmoji[i]);
            }, timeSplit * parseInt(i));
        }
        setTimeout(() => {
            if (!message.deleted && hasPermissionInChannel(message.channel, 'ADD_REACTIONS'))
                message.react(endEmoji);
        }, time - 5000);
        setTimeout(() => {
            if (!message.deleted && hasPermissionInChannel(message.channel, 'MANAGE_MESSAGES'))
                message.delete();
        }, time);
    }
}

function reactSuggestion(message: Message) {
    const channel = message.channel as GuildChannel;
    if (!channel.name.toLowerCase().includes('suggestions')) return false;

    if (message.content.length < 10) return false;
    if (hasPermissionInChannel(message.channel, 'ADD_REACTIONS')) {
        setTimeout(async () => {
            try {
                await message.react('👍');
                await message.react('👎');
            } catch (error) {
                reportErrorToOwner(message.client, error, 'Unable to react');
            }
        }, 0);
        return true;
    }
    return false;
}

export async function enableServerFeature(guild: Guild) {
    const deleteChannels = guild.channels.cache.filter(c => c.name.toLowerCase().includes('auto-delete') && c.type === 'text').map(c => c);

    const roleManager = guild.channels.cache.find(c => c.name.toLowerCase().includes('role-manager') && c.type === 'text');
    const everyone = guild.roles.everyone;
    if (!everyone) return;
    const overwrites: OverwriteResolvable = {
        id: everyone.id,
        allow: 'SEND_MESSAGES'
    };

    if (deleteChannels.length !== 0)
        for (const deleteChannel of deleteChannels) {
            try {
                await deleteChannel.overwritePermissions([overwrites], 'Bot startup');
                guild.client.emit('debug', `${deleteChannel.name} enabled sending message`);
            } catch (error) {
                console.error(error);
            }
        }
    if (roleManager) {
        try {
            await roleManager.overwritePermissions([overwrites], 'Bot startup');
            guild.client.emit('debug', `${roleManager.name} enabled sending message`);
        } catch (error) {
            console.error(error);
        }
        const prefix = getPrefix(guild);
        try {
            await roleManager.setTopic(`${prefix}role[add / remove / request / suggest][Role name]`);
            guild.client.emit('debug', `${roleManager.name} Topic Changed to '${prefix}role [add/remove/request/suggest] [Role name]'`);
        } catch (error) {
            console.error(error);
        }
    }
}

export async function bootMessage(guild: Guild) {
    const botLogs = guild.channels.cache.find(c => c.name.toLowerCase().includes('bot-logs') && c.type === 'text') as TextChannel;
    try {
        if (botLogs) await botLogs.send(`Bot booted version: \`${version}\``);
    } catch (error) {
        console.error(error);
    }
}

export async function disableServerFeatures(guild: Guild) {
    const deleteChannels = guild.channels.cache.filter(c => c.name.toLowerCase().includes('auto-delete') && c.type === 'text').map(c => c) as TextChannel[];
    const roleManager = guild.channels.cache.find(c => c.name.toLowerCase().includes('role-manager') && c.type === 'text');
    const everyone = guild.roles.everyone;
    if (!everyone) return;

    const overwrites: OverwriteResolvable = {
        id: everyone.id,
        deny: 'SEND_MESSAGES'
    };
    for (const deleteChannel of deleteChannels) {
        try {
            await deleteChannel.overwritePermissions([overwrites], 'Bot shutdown');
            guild.client.emit('debug', `${deleteChannel.name} disabled sending message`);
        } catch (error) {
            console.error(error);
        }

        if (!hasPermissionInChannel(deleteChannel, 'READ_MESSAGE_HISTORY')) return;
        const messages = await deleteChannel.messages.fetch({ limit: 100 });
        if (!messages) continue;

        const messageMap = messages.map(m => m);

        if (messageMap.length !== 0) {
            messageMap.forEach(message => {
                if (message.deletable) message.delete().catch(err => console.error(err));
            });
        }
    }

    if (roleManager && hasPermissionInChannel(roleManager, 'MANAGE_CHANNELS')) {
        await roleManager.overwritePermissions([overwrites], 'Bot shutdown');
        await roleManager.setTopic("Bot offline. Channel doesn't work");
    }
}

export function shutDownMessage(guild: Guild): Promise<void> {
    return new Promise(async (resolve) => {
        const botLogs = guild.channels.cache.find(c => c.name.toLowerCase().includes('bot-logs') && c.type === 'text') as TextChannel;
        if (botLogs) await botLogs.send('Bot successfully shut down').catch(err => console.error(err));
        resolve();
    });
}

export async function ternsCodeLabOnServerJoin(member: GuildMember) {
    if (member.user.bot) return false;

    const guild = member.guild;
    const general = guild.channels.cache.find(c => c.name.toLowerCase().includes('general') && c.type !== 'voice') as TextChannel;
    const roleManager = guild.channels.cache.find(c => c.name.toLowerCase().includes('role-manager')) as TextChannel;

    const embed = new MessageEmbed();
    const guildIcon = guild.iconURL();
    embed.setAuthor(guild.name, guildIcon || undefined);
    embed.setTitle(`${member.user.tag} Joined the server`);
    embed.addField('Welcome', `Welcome on **${guild.name}**\nUse ${roleManager} to setup your roles!`);

    const avatar = member.user.avatarURL();
    if (avatar) embed.setThumbnail(avatar);

    const quietRole = guild.roles.cache.find(r => r.name.toLowerCase().includes('quiet'));
    if (quietRole) member.roles.add(quietRole).catch(err => console.error(err));

    const memberRole = guild.roles.cache.find(r => r.name.toLowerCase().includes('member'));
    if (memberRole) member.roles.add(memberRole).catch(err => console.error(err));

    if (!general) return;

    if (!guildIcon) return embedSend(general, embed);
    try {
        const jimp = await Jimp.default.read(guildIcon);
        embed.setColor(parseInt(ColorThief.getColorHex(jimp), 16));
        return embedSend(general, embed);
    } catch (error) {
        return embedSend(general, embed);
    }
}

export function embedSend(channel: TextChannel | DMChannel | NewsChannel, embed: MessageEmbed) {
    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, channel.client));
}

