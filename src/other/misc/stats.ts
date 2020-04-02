import { Message, MessageEmbed, User, Guild, Client, GuildMember, Collection, PresenceStatusData, ActivityType, PresenceStatus } from 'discord.js';
import { client, inviteLink, version } from '../../index';
import { StatsCommands, Language } from '../../language/langTypes';
import { getLanguage, findGuildMembers } from '../../until/guild';
import { checkCommand, removePrefixAndCommand, getCommandArgs } from '../../until/commandsHandler';
import { signEmbed, stringifyEmbed, removeMarkup } from '../../until/embeds';
import { hasPermissionInChannel, isBotOwner, getBotOwner } from '../../until/util';
import { parse } from 'url';
import { momentFormat } from '../../until/date';
const Jimp = require('jimp');
const ColorThief = require('color-thief-jimp');

const DEFAULT_COMMANDS: StatsCommands = ['stats', 'info'];
const LOOK_FOR_GUILD = ['guild', 'server', 'this'];

enum Status {
    ONLINE = '#43b581',
    IDLE = '#faa61a',
    DND = '#f04747',
    OFFLINE = '#727d8a',
}

export function stats(message: Message): boolean {

    const language = getLanguage(message.guild);

    if (checkCommand(message, [...language.stats.statsCommands, ...DEFAULT_COMMANDS])) {
        getInfo(message);
        return true;
    }
    return false;
}

async function getInfo(message: Message) {
    let embed = signEmbed(message.client);
    const msgContent = removePrefixAndCommand(message);
    const args = getCommandArgs(message);
    const language = getLanguage(message.guild);

    if (args[0] && message.guild && [...language.stats.guildArgs, ...LOOK_FOR_GUILD].includes(args[0])) {
        embed = await infoAboutGuild(embed, message.guild, language);
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
        else message.channel.send(stringifyEmbed(embed, message.client, message.guild));

    } else if (message.guild) {
        let guildMember = message.member!;
        if (msgContent && message.mentions.members) {
            let guildMembers: GuildMember[] | null = message.mentions.members.map(m => m);
            if (!guildMembers || !guildMembers.length)
                guildMembers = findGuildMembers(msgContent, message.guild);
            if (!guildMembers || !guildMembers.length) return message.channel.send(language.miscellaneous.userNotFound.replace(/&QUERY/g, msgContent));
            else if (guildMembers.length > 1) return message.channel.send(language.miscellaneous.ambiguous.replace(/&QUERY/g, msgContent));
            else guildMember = guildMembers[0];
        }

        embed = await infoAboutGuildMember(embed, guildMember, language);
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
        else message.channel.send(stringifyEmbed(embed, message.client, message.guild));
        return;
    } else {
        let user = message.author;
        if (msgContent && isBotOwner(message.author)) {
            const users = await findUsers(msgContent, message.client);
            if (!users || !users.length) return message.channel.send(language.miscellaneous.userNotFound.replace(/&QUERY/g, msgContent));
            else if (users.length > 1) return message.channel.send(language.miscellaneous.ambiguous.replace(/&QUERY/g, msgContent));
            else user = users[0];
        }
        const embed = await infoAboutUser(signEmbed(message.client), user, language, false, isBotOwner(message.author));
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) message.channel.send(embed);
        else message.channel.send(stringifyEmbed(embed, message.client, message.guild));
    }
}

async function infoAboutUser(embed: MessageEmbed, user: User, language: Language, fullImage = false, showGuilds = false) {
    embed = colorEmbed(embed, user.presence.status);
    if (fullImage) embed.setImage(user.displayAvatarURL());
    embed.setThumbnail(user.displayAvatarURL());
    embed.setAuthor(`${removeMarkup(user.tag, user.client)} <${user.id}>`);
    if (showGuilds) {
        const guilds = user.client.guilds.cache.map(g => g).filter(g => g.members.cache.find(m => m.user === user));
        const guildString = guilds.join('\n');
        embed.setDescription(guildString.length > 2000 ? `${guildString.slice(0, 1800)}...` : guildString);
    }

    const status: string[] = [`${language.stats.presence.status.status}: ${getStatusFromLanguage(language, user.presence.status)}`];
    if (user.presence && user.presence.activities[0]) {
        const game = user.presence.activities[0];
        status.push('');
        status.push(getTypeFromLanguage(language, game.type));
        if (game.name) status.push(`${language.stats.presence.game.name}: ${game.name}`);
        if (game.applicationID) status.push(`${language.stats.presence.game.applicationID}: ${game.applicationID}`);
        if (game.details) status.push(`${language.stats.presence.game.details}: ${game.details}`);
        if (game.timestamps) {
            if (game.timestamps.start)
                status.push(`${language.stats.presence.game.timeStart}: ${momentFormat(game.timestamps.start, language)}`);
            if (game.timestamps.end)
                status.push(`${language.stats.presence.game.timeEnd}: ${momentFormat(game.timestamps.end, language)}`);
        }
        if (game.url) status.push(`${language.stats.presence.game.url}: [${parse(game.url).hostname}](${game.url})`);
    }
    embed.addField(language.stats.presence.presence, status.join('\n'), true);
    embed.addField(language.stats.createdUserAccount, momentFormat(user.createdAt, language, true), true);

    if (user === user.client.user) {
        const channels = `${language.stats.bot.channels}: ${client.channels.cache.filter(c => c.type === 'text').size}`;
        const guilds = `${language.stats.bot.guild}: ${client.guilds.cache.size}`;
        const users = `${language.stats.bot.users}: ${client.users.cache.filter(c => c.bot === false).size}`;
        embed.addField(language.stats.bot.inviteLink, ` [${language.stats.bot.inviteLinkClick}](${inviteLink})`);
        embed.addField(language.stats.bot.status, `${guilds}\n${channels}\n${users}`, true);

        const ownerUser = getBotOwner(user.client);
        if (ownerUser) embed.addField(language.stats.bot.botOwner, ownerUser.tag, true);
        embed.addField(language.stats.bot.version, version);
    }
    return embed;
}

async function infoAboutGuild(embed: MessageEmbed, guild: Guild, language: Language) {
    if (guild.members.cache.size) {
        const valueName = language.stats.guild.members.replace(/&COUNT/g, guild.members.cache.size.toString());
        const members: string[] = [];
        members.push(`${language.stats.guild.bots}: ${guild.members.cache.filter(m => m.user.bot).size}`);
        members.push(`${language.stats.guild.humans}: ${guild.members.cache.filter(m => m.user.bot).size}`);
        embed.addField(valueName, members.join('\n'), true);
    }
    if (guild.channels.cache.size) {
        const valueName = language.stats.guild.channels.replace(/&COUNT/g, guild.channels.cache.size.toString());
        const channels: string[] = [];
        channels.push(`${language.stats.guild.textChannel}: ${guild.channels.cache.filter(c => c.type !== 'voice').size}`);
        channels.push(`${language.stats.guild.voiceChannel}: ${guild.channels.cache.filter(c => c.type === 'voice').size}`);
        embed.addField(valueName, channels.join('\n'), true);
    }
    embed.addField(language.stats.guild.region, ` ${guild.region} ${getRegionFlag(guild.region)}`);

    embed.addField(language.stats.guild.guildCreated, momentFormat(guild.createdAt, language));

    if (guild.emojis.cache.size) {
        const valueName = language.stats.guild.emojis.replace(/&COUNT/g, guild.emojis.cache.size.toString());
        const emojis: string[] = [];
        emojis.push(`${language.stats.guild.emojisNotAnimated}: ${guild.emojis.cache.filter(c => !c.animated).size}`);
        emojis.push(`${language.stats.guild.emojisAnimated}: ${guild.emojis.cache.filter(c => c.animated).size}`);
        embed.addField(valueName, emojis.join('\n'), true);
    }

    if (guild.roles.cache.size) {
        const valueName = language.stats.guild.roles.replace(/&COUNT/g, guild.roles.cache.size.toString());
        const roles: string[] = [];
        roles.push(`${language.stats.guild.rolesHoisted}: ${guild.roles.cache.filter(c => c.hoist).size}`);
        roles.push(`${language.stats.guild.rolesNotHoisted}: ${guild.roles.cache.filter(c => !c.hoist).size}`);
        embed.addField(valueName, roles.join('\n'), true);
    }

    const image = guild.iconURL();
    if (!image) return embed;
    try {
        const jimp = await Jimp.read(image);
        embed.setColor(parseInt(ColorThief.getColorHex(jimp), 16));
        return embed;
    } catch (error) {
        return embed;
    }
}

async function infoAboutGuildMember(embed: MessageEmbed, guildMember: GuildMember, language: Language) {
    embed = await infoAboutUser(embed, guildMember.user, language);
    embed.addField(language.stats.memberJoinedGuild, momentFormat(guildMember.joinedAt, language, true));
    if (guildMember.nickname)
        embed.setAuthor(`${removeMarkup(guildMember.displayName, guildMember.client)} (${removeMarkup(guildMember.user.tag, guildMember.client)}) <${guildMember.user.id}>`);

    const roles = guildMember.roles.cache
        .filter(r => r !== guildMember.guild.roles.everyone)
        .sort((a, b) => a.position + b.position)
        .map(r => removeMarkup(r.name, guildMember.client));
    if (roles.length) {
        embed.setDescription(`${language.stats.roles}:\n${roles.join('\n')}`);
    }
    if (guildMember.displayHexColor !== '#000000') embed.setColor(guildMember.displayHexColor);
    else embed.setColor('feffff');

    return embed;
}

function getRegionFlag(region: string) {

    switch (region) {
        case 'brazil':
            return '🇧🇷';
        case 'europe':
        case 'eu-central':
            return '🇪🇺';
        case 'us-central':
        case 'us-east':
        case 'us-south':
        case 'us-west':
            return '🇺🇸';
        case 'frankfurt':
            return '🇩🇪';
        case 'dubai':
            return '🇦🇪';
        case 'london':
            return '🇬🇧';
        case 'south-korea':
            return '🇰🇷';
        case 'russia':
            return '🇷🇺';
        case 'southafrica':
            return '🇿🇦';
        case 'india':
            return '🇮🇳';
        case 'amsterdam':
            return '🇳🇱';
        case 'hongkong':
            return '🇭🇰';
        case 'sydney':
            return '🇦🇺';
        case 'singapore':
            return '🇸🇬';
        case 'japa':
            return '🇯🇵';
        default:
            return '';
    }
}

function getTypeFromLanguage(language: Language, type: ActivityType) {
    switch (type) {
        case 'LISTENING':
            return language.stats.presence.game.type.listenings;
        case 'STREAMING':
            return language.stats.presence.game.type.steaming;
        case 'WATCHING':
            return language.stats.presence.game.type.watching;
        case 'CUSTOM_STATUS':
            return language.stats.presence.game.type.customStatus;
        default:
            return '?';
    }
}

function getStatusFromLanguage(language: Language, status: PresenceStatusData | PresenceStatus) {
    switch (status) {
        case 'online':
            return language.stats.presence.status.online;
        case 'dnd':
            return language.stats.presence.status.dnd;
        case 'idle':
            return language.stats.presence.status.idle;
        default:
            return language.stats.presence.status.offline;
    }
}

function colorEmbed(embed: MessageEmbed, status: PresenceStatus) {
    switch (status) {
        case 'online':
            embed.setColor(Status.ONLINE);
            break;
        case 'dnd':
            embed.setColor(Status.DND);
            break;
        case 'idle':
            embed.setColor(Status.IDLE);
            break;
        default:
            embed.setColor(Status.OFFLINE);
            break;
    }
    return embed;
}

async function findUsers(query: string, client: Client) {
    const finders = [
        (u: User) => u.username === query,
        (u: User) => u.username.toLowerCase() === query.toLowerCase(),
        (u: User) => u.tag === query,
        (u: User) => u.tag.toLowerCase() === query.toLowerCase(),
        (u: User) => u.username.includes(query),
        (u: User) => u.username.toLowerCase().includes(query.toLowerCase()),
        (u: User) => u.tag.includes(query),
        (u: User) => u.tag.toLowerCase().includes(query.toLowerCase()),
    ];
    let users: Collection<string, User> | null = null;
    for (const finder of finders) {
        users = client.users.cache.filter(finder);
        await lagKiller();
        if (users.size) break;
    }
    if (!users && !isNaN(parseInt(query))) {
        try {
            const user = await client.users.fetch(query);
            return [user];
        } catch (error) { /* ignored */ }
    }
    return users ? users.map(g => g) : null;
}

function lagKiller(): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        });
    });
}