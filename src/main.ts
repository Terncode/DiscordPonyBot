import { Message, GuildMember, Guild, User, PartialGuildMember, PartialUser } from 'discord.js';

import { stats } from './other/misc/stats';
import { translate } from './other/translate';

import { help } from './other/misc/help';
import { chatMonitor } from './other/chatMonitor';

import { startsWithPrefix } from './until/commandsHandler';
import { urbanDictionary } from './other/dictionary/urbanDictionary';
import { dictionary } from './other/dictionary/dictionary';
import { derpibooruCommand } from './other/derpibooru/derpiboo';
import { miscellaneous } from './other/misc/miscellaneous';
import { ownerCommands } from './other/admin/admin';
import { hasPermissionInChannel } from './until/util';
import { guildAdmin } from './other/admin/guildAdmin';
import { getPrefix, getLanguage, ignoredChannels } from './until/guild';
import { ternsCodeLab } from './Plugins/TernsCodelab/TernsCodeLabIndex';
import { onGuildMemberJoin, onGuildMemberLeave, onGuildMemberBan, onGuildMemberBanRemove } from './other/joinLeaves';
import { vote } from './other/vote/Vote';

export async function onMessage(message: Message) {
    if (!hasPermissionInChannel(message.channel, 'SEND_MESSAGES')) return;
    if (ignoredChannels.includes(message.channel.id)) {
        if (guildAdmin(message)) return;
        return;
    }

    // Defaults
    if (message.author.bot) return; // If its bot we ignore
    if (startsWithPrefix(message)) {
        // idle(message);
        if (help(message)) return;
        if (stats(message)) return;
        if (translate(message)) return;
        if (derpibooruCommand(message)) return;
        if (urbanDictionary(message)) return;
        if (dictionary(message)) return;
        if (miscellaneous(message)) return;
        if (ownerCommands(message)) return;
        //if (vote(message)) return;
        if (guildAdmin(message)) return;
    }
    chatMonitor(message);
    const mentions = message.mentions.users.map((u) => u);
    // if bot is mention we give user default prefix command
    if (
        message.guild &&
        mentions.includes(message.client.user!) &&
        message.content.length <= `<@!${message.client.user!.id}>`.length
    ) {
        const guildLang = getPrefix(message.guild);
        const language = getLanguage(message.guild);
        return message.channel.send(language.help.prefix.replace(/&PREFIX/g, guildLang));
    }
}

export function guildMemberAdd(guildMember: GuildMember | PartialGuildMember) {
    if (ternsCodeLab.onGuildMemberAdd(guildMember)) return;

    onGuildMemberJoin(guildMember);
}

export function guildMemberRemove(guildMember: GuildMember | PartialGuildMember) {
    onGuildMemberLeave(guildMember);
}

export function guildBanAdd(guild: Guild, user: User | PartialUser) {
    onGuildMemberBan(guild, user);
}

export function guildBanRemove(guild: Guild, user: User | PartialUser) {
    onGuildMemberBanRemove(guild, user);
}
