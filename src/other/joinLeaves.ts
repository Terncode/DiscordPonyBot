import { Guild, TextChannel, GuildMember, Collection, User, OverwriteResolvable, PartialGuildMember, PartialUser } from 'discord.js';
import { createGuildDataBase, getLanguage } from '../until/guild';
import { reportErrorToOwner } from '../until/errors';
import { removeMarkup, signEmbed, stringifyEmbed } from '../until/embeds';
import { hasPermissionInChannel } from '../until/util';
import { momentFormat, getAge } from '../until/date';

export async function clientGuildJoin(guild: Guild) {
    if (!await createGuildDataBase(guild)) return; // should prevent false guilds joins

    const ponyLogs = guild.channels.cache.find(c => c.name === 'pony-logs' && c.type === 'text');
    if (!ponyLogs && guild.me && guild.me.hasPermission('MANAGE_CHANNELS')) {
        try {
            const ponyLogsFreshlyCreated = await guild.channels.create('pony-logs');
            const everyone = guild.roles.everyone;
            if (everyone) {
                const overwrite: OverwriteResolvable = {
                    id: everyone.id,
                    deny: ['ADD_REACTIONS', 'SEND_MESSAGES'],
                    allow: ['EMBED_LINKS', 'READ_MESSAGE_HISTORY'],
                }
                await ponyLogsFreshlyCreated.overwritePermissions([overwrite]);
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
    const channels = guild.channels.cache.filter(c => c.type === 'text' && hasPermissionInChannel(c, 'SEND_MESSAGES')) as Collection<string, TextChannel>;
    let channel: TextChannel | undefined;
    for (const finder of finders) {
        channel = channels.find(finder);
        if (channel) break;
    }

    if (channel && hasPermissionInChannel(channel, 'SEND_MESSAGES')) {
        channel.send(`Thank you for adding me 🌝`);
    }
}

export function onGuildMemberJoin(member: GuildMember | PartialGuildMember) {
    if (!member.user) return; // PartialGuildMember ¯\_(ツ)_/¯
    // if (member.user.bot) return;
    const guild = member.guild;
    const channel = guild.channels.cache.find(c => c.name.toLowerCase().includes('pony-log') && c.type === 'text') as TextChannel;
    if (!channel) return;
    const language = getLanguage(member.guild);

    const embed = signEmbed(member.client);
    embed.setAuthor(member.guild.name, member.guild.iconURL() || undefined);

    if (member.user.bot) embed.setColor('7289da');
    else embed.setColor('00ff3c');

    embed.addField(language.logs.info, language.logs.joined.replace(/&USER/g, member.user.tag));
    embed.addField(language.logs.accountAge, momentFormat(member.user.createdAt, language, true));
    // embed.setThumbnail(member.user.avatarURL);
    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, member.client));
}
export function onGuildMemberLeave(member: GuildMember | PartialGuildMember) {
    if (!member.user) return;
    // if (member.user.bot) return;
    const guild = member.guild;
    const channel = guild.channels.cache.find(c => c.name.toLowerCase().includes('pony-log') && c.type === 'text') as TextChannel;
    if (!channel) return;
    const language = getLanguage(member.guild);
    const embed = signEmbed(member.client);
    embed.setAuthor(member.guild.name, member.guild.iconURL() || undefined);

    // embed.setThumbnail(member.user.avatarURL);
    embed.addField(language.logs.info, language.logs.left.replace(/&USER/g, member.user.tag));
    const joinedAt = member.joinedAt;
    if (joinedAt) embed.addField(language.logs.hasBeenInGuild, getAge(joinedAt, language));

    if (member.user.bot) embed.setColor('ff006e');
    else embed.setColor('780000');

    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, member.client));
}

export async function onGuildMemberBan(guild: Guild, userOrPartial: User | PartialUser) {
    if (!userOrPartial) return;
    const user = userOrPartial as User;
    // if (member.user.bot) return;
    const channel = guild.channels.cache.find(c => c.name.toLowerCase().includes('pony-log') && c.type === 'text') as TextChannel;
    if (!channel) return;

    const banInfo = await guild.fetchBan(user);
    const language = getLanguage(guild);

    const embed = signEmbed(guild.client);
    embed.setAuthor(guild.name, guild.iconURL() || undefined);

    if (user.bot) embed.setColor('ff002c');
    else embed.setColor('ff0000');

    embed.addField(language.logs.info, language.logs.hasBeenBanned.replace(/&USER/g, user.tag));
    if (banInfo.reason)
        embed.addField(language.logs.reason, banInfo.reason);

    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, guild.client));
}

export async function onGuildMemberBanRemove(guild: Guild, userOrPartial: User | PartialUser) {
    if (!userOrPartial) return;
    const user = userOrPartial as User;
    // if (member.user.bot) return;
    const channel = guild.channels.cache.find(c => c.name.toLowerCase().includes('pony-log') && c.type === 'text') as TextChannel;
    if (!channel) return;

    const banInfo = await guild.fetchBan(user);
    const language = getLanguage(guild);

    const embed = signEmbed(guild.client);
    embed.setAuthor(guild.name, guild.iconURL() || undefined);

    embed.setColor('ffff53');

    embed.addField(language.logs.info, language.logs.hasBeenUnbanned.replace(/&USER/g, user.tag));
    if (banInfo.reason)
        embed.addField(language.logs.reason, banInfo.reason);

    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, guild.client));
}

export async function onGuildMemberKick(guild: Guild, user: User, reason: string) {
    // if (member.user.bot) return;
    const channel = guild.channels.cache.find(c => c.name.toLowerCase().includes('pony-log') && c.type === 'text') as TextChannel;
    if (!channel) return;

    const language = getLanguage(guild);

    const embed = signEmbed(guild.client);
    embed.setAuthor(guild.name, guild.iconURL() || undefined);

    if (user.bot) embed.setColor('ff002c');
    else embed.setColor('ff0000');

    embed.addField(language.logs.info, language.logs.hasBeenKicked.replace(/&USER/g, user.tag));
    if (reason)
        embed.addField(language.logs.reason, reason);

    if (hasPermissionInChannel(channel, 'EMBED_LINKS')) channel.send(embed);
    else channel.send(stringifyEmbed(embed, guild.client));
}
