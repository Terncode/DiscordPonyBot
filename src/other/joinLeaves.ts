import { Guild, TextChannel, GuildMember, Collection, User } from 'discord.js';
import { createGuildDataBase, getLanguage } from '../until/guild';
import { reportErrorToOwner } from '../until/errors';
import { removeMarkup, signEmbed, stringifyEmbed } from '../until/embeds';
import { hasPermissionInChannel } from '../until/util';
import { momentFormat, getAge } from '../until/date';

export async function clientGuildJoin(guild: Guild) {
    if (!await createGuildDataBase(guild)) return; // should prevent false guilds joins

    const ponyLogs = guild.channels.find(c => c.name === 'pony-logs' && c.type === 'text');
    if (!ponyLogs && guild.me.hasPermission('MANAGE_CHANNELS')) {
        try {
            const ponyLogsFreshlyCreated = await guild.createChannel('pony-logs');
            const everyone = guild.defaultRole;
            if (everyone) {
                await ponyLogsFreshlyCreated.overwritePermissions(everyone, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    EMBED_LINKS: true,
                    READ_MESSAGE_HISTORY: true,
                });
            }
        } catch (error) {
            reportErrorToOwner(guild.client, error, `${removeMarkup(guild.name, guild.client)} | ${guild.id}`);
        }
    }

    const finders = [
        (c: TextChannel) => c.name.toLowerCase() === 'general',
        (c: TextChannel) => c.name.toLowerCase().includes('general'),
        (c: TextChannel) => !!c,
    ];
    const channels = guild.channels.filter(c => c.type === 'text' && hasPermissionInChannel(c, 'SEND_MESSAGES')) as Collection<string, TextChannel>;
    let channel: TextChannel | null = null;
    for (const finder of finders) {
        channel = channels.find(finder);
        if (channel) break;
    }

    if (channel && hasPermissionInChannel(channel, 'SEND_MESSAGES')) {
        channel.send(`Thank you for adding me 🌝`);
    }
}

export function onGuildMemberJoin(member: GuildMember) {
    // if (member.user.bot) return;
    const guild = member.guild;
    const channel = guild.channels.find(c => c.name.toLowerCase().includes('pony-log') && c.type === 'text') as TextChannel;
    if (!channel) return;
    const language = getLanguage(member.guild);

    const embed = signEmbed(member.client);
    embed.setAuthor(member.guild.name, member.guild.iconURL);

    if (member.user.bot) embed.setColor('7289da');
    else embed.setColor('00ff3c');

    embed.addField(language.logs.info, language.logs.joined.replace(/&USER/g, member.user.tag));
    embed.addField(language.logs.accountAge, momentFormat(member.user.createdAt, language, true));
    // embed.setThumbnail(member.user.avatarURL);
    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, member.client));
}
export function onGuildMemberLeave(member: GuildMember) {
    // if (member.user.bot) return;
    const guild = member.guild;
    const channel = guild.channels.find(c => c.name.toLowerCase().includes('pony-log') && c.type === 'text') as TextChannel;
    if (!channel) return;
    const language = getLanguage(member.guild);
    const embed = signEmbed(member.client);
    embed.setAuthor(member.guild.name, member.guild.iconURL);

    // embed.setThumbnail(member.user.avatarURL);
    embed.addField(language.logs.info, language.logs.left.replace(/&USER/g, member.user.tag));
    embed.addField(language.logs.hasBeenInGuild, getAge(member.joinedAt, language));

    if (member.user.bot) embed.setColor('ff006e');
    else embed.setColor('780000');

    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, member.client));
}

export async function onGuildMemberBan(guild: Guild, user: User) {
    // if (member.user.bot) return;
    const channel = guild.channels.find(c => c.name.toLowerCase().includes('pony-log') && c.type === 'text') as TextChannel;
    if (!channel) return;

    const banInfo = await guild.fetchBan(user);
    const language = getLanguage(guild);

    const embed = signEmbed(guild.client);
    embed.setAuthor(guild.name, guild.iconURL);

    if (user.bot) embed.setColor('ff002c');
    else embed.setColor('ff0000');

    embed.addField(language.logs.info, language.logs.hasBeenBanned.replace(/&USER/g, user.tag));
    if (banInfo.reason)
        embed.addField(language.logs.reason, banInfo.reason);

    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, guild.client));
}

export async function onGuildMemberBanRemove(guild: Guild, user: User) {
    // if (member.user.bot) return;
    const channel = guild.channels.find(c => c.name.toLowerCase().includes('pony-log') && c.type === 'text') as TextChannel;
    if (!channel) return;

    const banInfo = await guild.fetchBan(user);
    const language = getLanguage(guild);

    const embed = signEmbed(guild.client);
    embed.setAuthor(guild.name, guild.iconURL);

    embed.setColor('ffff53');

    embed.addField(language.logs.info, language.logs.hasBeenUnbanned.replace(/&USER/g, user.tag));
    if (banInfo.reason)
        embed.addField(language.logs.reason, banInfo.reason);

    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, guild.client));
}

export async function onGuildMemberKick(guild: Guild, user: User, reason: string) {
    // if (member.user.bot) return;
    const channel = guild.channels.find(c => c.name.toLowerCase().includes('pony-log') && c.type === 'text') as TextChannel;
    if (!channel) return;

    const language = getLanguage(guild);

    const embed = signEmbed(guild.client);
    embed.setAuthor(guild.name, guild.iconURL);

    if (user.bot) embed.setColor('ff002c');
    else embed.setColor('ff0000');

    embed.addField(language.logs.info, language.logs.hasBeenKicked.replace(/&USER/g, user.tag));
    if (reason)
        embed.addField(language.logs.reason, reason);

    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, guild.client));
}
