import { Message, GuildChannel, Guild, TextChannel, GuildMember, RichEmbed, DMChannel, GroupDMChannel } from 'discord.js';

import { CustomGuildScript } from '../CustomGuildScript';
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
const ColorThief = require('color-thief-jimp');

// https://discord.gg/HPvbWYp
export const ternsCodeLab = new CustomGuildScript('621726901420949504');

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

function removeQuietRole(message: Message) {
    const guild = message.guild;
    const user = message.author;
    const guildMember = guild.members.find(m => m.id === user.id);
    const quietRole = guildMember.roles.find(r => r.name.toLowerCase().includes('quiet'));
    if (quietRole) guildMember.removeRole(quietRole).catch(() => {/* ignored */ });
}

function reactArt(message: Message) {
    const channel = message.channel as GuildChannel;
    if (!channel.name.toLowerCase().includes('art') || message.attachments.size === 0) return;

    if (hasPermissionInChannel(message.channel, 'ADD_REACTIONS')) {
        message.react('👍')
            .then(() => {
                message.react('👌')
                    .then(() => {
                        const neat = message.guild.emojis.find(r => r.name.toLowerCase() === 'neat');
                        if (neat !== undefined)
                            message.react(neat).catch(() => { /* ignored */ });
                    });
            });
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

function deleteOnTime(message: Message, time: number) {
    if (hasPermissionInChannel(message.channel, 'MANAGE_MESSAGES') && hasPermissionInChannel(message.channel, 'ADD_REACTIONS')) {
        const timeEmoji = ['🕛', '🕘', '🕕', '🕒'];
        const endEmoji = '❌';
        time *= 1000;
        const timeSplit = time / timeEmoji.length;
        for (const i in timeEmoji) {
            setTimeout(() => {
                message.react(timeEmoji[i]).catch(() => { /* ignore */ });
            }, timeSplit * parseInt(i));
        }
        setTimeout(() => {
            message.react(endEmoji);
        }, time - 5000);
        setTimeout(() => {
            message.delete().catch(() => {/* ignored */ });
        }, time);
    }
}

function reactSuggestion(message: Message) {
    const channel = message.channel as GuildChannel;
    if (!channel.name.toLowerCase().includes('suggestions')) return false;

    if (message.content.length < 10) return false;
    if (hasPermissionInChannel(message.channel, 'ADD_REACTIONS')) {
        message.react('👍').then(() => {
            message.react('👎');
        });
    }
    return false;
}

export function enableServerFeature(guild: Guild): Promise<void> {
    return new Promise(async (resolve) => {

        const deleteChannels = guild.channels.filter(c => c.name.toLowerCase().includes('auto-delete') && c.type === 'text').map(c => c);

        const roleManager = guild.channels.find(c => c.name.toLowerCase().includes('role-manager') && c.type === 'text');
        const defaultRole = guild.defaultRole;

        if (deleteChannels.length !== 0)
            for (const deleteChannel of deleteChannels) {
                await deleteChannel.overwritePermissions(defaultRole, { 'SEND_MESSAGES': true }, 'Bot ShutDown')
                    .then(() => { guild.client.emit('debug', `${deleteChannel.name} enabled sending message`); })
                    .catch(err => console.error(err));
            }
        if (roleManager)
            await roleManager.overwritePermissions(defaultRole, { 'SEND_MESSAGES': true }, 'Bot ShutDown')
                .then(() => { guild.client.emit('debug', `${roleManager.name} enabled sending message`); })
                .catch(err => console.error(err));
        const prefix = getPrefix(guild);
        await roleManager.setTopic(`${prefix}role[add / remove / request / suggest][Role name]`)
            .then(() => { guild.client.emit('debug', `${roleManager.name} Topic Changed to '${prefix}role [add/remove/request/suggest] [Role name]'`); })
            .catch(err => console.error(err));
        resolve();
    });
}

export function bootMessage(guild: Guild) {
    const botLogs = guild.channels.find(c => c.name.toLowerCase().includes('bot-logs') && c.type === 'text') as TextChannel;
    if (botLogs) botLogs.send(`Bot booted version: \`${version}\``).catch((err: any) => console.error(err));
}

export function disableServerFeatures(guild: Guild) {
    return new Promise(async (resolve) => {

        const deleteChannels = guild.channels.filter(c => c.name.toLowerCase().includes('auto-delete') && c.type === 'text').map(c => c) as TextChannel[];
        const roleManager = guild.channels.find(c => c.name.toLowerCase().includes('role-manager') && c.type === 'text');
        const defaultRole = guild.defaultRole;

        for (const deleteChannel of deleteChannels) {
            await deleteChannel.overwritePermissions(defaultRole, { 'SEND_MESSAGES': false }, 'Bot ShutDown')
                .then(() => guild.client.emit('debug', `${deleteChannel.name} disabled sending message`))
                .catch(err => console.error(err));

            const messages = await deleteChannel.fetchMessages({ limit: 100 }).catch(err => console.error(err));
            if (!messages) continue;

            const messageMap = messages.map(m => m);

            if (messageMap.length !== 0) {
                messageMap.forEach(message => {
                    if (message.deletable) message.delete().catch(err => console.error(err));
                });
            }
        }

        if (roleManager)
            await roleManager.overwritePermissions(defaultRole, { 'SEND_MESSAGES': false }, 'Bot ShutDown')
                .catch(err => console.error(err));
        await roleManager.setTopic("Bot offline. Channel doesn't work")
            .catch(err => console.error(err));
        resolve();
    });
}

export function shutDownMessage(guild: Guild): Promise<void> {
    return new Promise(async (resolve) => {
        const botLogs = guild.channels.find(c => c.name.toLowerCase().includes('bot-logs') && c.type === 'text') as TextChannel;
        if (botLogs) await botLogs.send('Bot successfully shut down').catch(err => console.error(err));
        resolve();
    });
}

export function ternsCodeLabOnServerJoin(member: GuildMember) {
    if (member.user.bot) return false;

    const guild = member.guild;
    const general = guild.channels.find(c => c.name.toLowerCase().includes('general') && c.type !== 'voice') as TextChannel;
    const roleManager = guild.channels.find(c => c.name.toLowerCase().includes('role-manager')) as TextChannel;

    const embed = new RichEmbed();
    embed.setAuthor(guild.name, guild.iconURL);
    embed.setTitle(`${member.user.tag} Joined the server`);
    embed.addField('Welcome', `Welcome on **${guild.name}**\nUse ${roleManager} to setup your roles!`);

    embed.setThumbnail(member.user.avatarURL);

    const quietRole = guild.roles.find(r => r.name.toLowerCase().includes('quiet'));
    if (quietRole) member.addRole(quietRole).catch(err => console.error(err));

    const memberRole = guild.roles.find(r => r.name.toLowerCase().includes('member'));
    if (memberRole) member.addRole(memberRole).catch(err => console.error(err));

    if (!general || general.type === 'voice') return;

    // @ts-ignore
    Jimp.default.read(member.guild.iconURL, (err: Error, image: any) => {
        if (err) embedSend(general, embed);

        try {
            embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
            embedSend(general, embed);
        } catch (err) {
            embedSend(general, embed);
        }
    });
}

export function embedSend(channel: TextChannel | DMChannel | GroupDMChannel, embed: RichEmbed) {
    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, channel.client));
}
