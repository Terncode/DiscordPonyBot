import { Message, TextChannel } from 'discord.js';
import { getLanguage, getPrefix } from '../../until/guild';
import { checkCommand } from '../../until/commandsHandler';
import { Language, HelpCommands, AliasesCommands, AdminHelpCommands } from '../../language/langTypes';
import { DERPIBOORU_COMMANDS } from '../derpibooru/derpiboo';
import { MISCELLANEOUS_COMMANDS } from './miscellaneous';
import { URBAN_DICTIONARY_COMMANDS } from '../dictionary/urbanDictionary';
import { GUILD_ADMIN_COMMANDS } from '../admin/guildAdmin';
import { hasPermissionInChannel } from '../../until/util';
import { signEmbed } from '../../until/embeds';
import { DICTIONARY_COMMANDS } from '../dictionary/dictionary';
import { PT_COMMANDS } from '../ptown/PCommands';
import { TRANSLATE_COMMANDS } from '../translate';

export const HELP_COMMANDS: HelpCommands = ['help', '?'];
export const ADMIN_HELP_COMMANDS: AdminHelpCommands = ['a.help', 'admin.help', 'admin.?'];
export const ALIASES_COMMANDS: AliasesCommands = ['aliases'];

export function help(message: Message): boolean {
    const language = getLanguage(message.guild);
    const guildChannel = message.guild ? message.channel as TextChannel : null;
    const sfw = guildChannel ? !guildChannel.nsfw : true;
    const prefix = getPrefix(message.guild);
    if (checkCommand(message, [...language.help.commands.helpCommands, ...HELP_COMMANDS])) {
        const permissions = message.member ? message.member.permissionsIn(message.channel) : null;
        const content: string[] = [];
        if (message.guild && (permissions && permissions.has('MANAGE_GUILD')) || (permissions && permissions.has('MANAGE_MESSAGES'))) {
            content.push(repPre(language.help.adminHelp, prefix).replace(/&COMMAND/g, [...language.help.commands.adminHelp, ...ADMIN_HELP_COMMANDS][0]));
        }
        helpEntries(language, prefix, sfw).forEach(e => content.push(e));
        sendHelpEmbed(message, content);
        return true;
    } else if (checkCommand(message, [...language.help.commands.adminHelp, ...ADMIN_HELP_COMMANDS])) {
        if (!message.guild) {
            message.channel.send(`⚠️ ${language.notWorkInDm}`);
            return true;
        }
        const content: string[] = [];
        const permissions = message.member ? message.member.permissionsIn(message.channel) : null;
        if (!(message.guild && (permissions && permissions.has('MANAGE_GUILD')) || (permissions && permissions.has('MANAGE_MESSAGES')))) {
            content.push(`**${language.help.notAdminHelp}**\n\n`);
        }
        adminHelp(language, prefix).forEach(e => content.push(e));
        sendHelpEmbed(message, content);
    } else if (checkCommand(message, [...language.help.commands.AliasesCommands, ...ALIASES_COMMANDS])) {
        aliases(message, language);
    }
    return false;
}

export function aliases(message: Message, language: Language) {
    const guildChannel = message.guild ? message.channel as TextChannel : null;
    const permissions = message.member ? message.member.permissionsIn(message.channel) : null;
    const sfw = guildChannel ? !guildChannel.nsfw : true;

    const lang: string[] = [
        `\`${[...language.help.commands.adminHelp, ...HELP_COMMANDS].join('`, `')}\``,
        `\`${[...language.derpibooru.commands, ...DERPIBOORU_COMMANDS].join('`, `')}\``,
        `\`${[...language.pt.commands.roll, ...PT_COMMANDS.roll].join('`, `')}\``,
        `\`${[...language.miscellaneous.commands.facts, ...MISCELLANEOUS_COMMANDS.facts].join('`, `')}\``,
        `\`${[...language.miscellaneous.commands.jokes, ...MISCELLANEOUS_COMMANDS.jokes].join('`, `')}\``,
        `\`${[...language.miscellaneous.commands.boop, ...MISCELLANEOUS_COMMANDS.boop].join('`, `')}\``,
        `\`${[...language.miscellaneous.commands.hug, ...MISCELLANEOUS_COMMANDS.hug].join('`, `')}\``,
        `\`${[...language.dictionary.commands, ...DICTIONARY_COMMANDS].join('`, `')}\``,
        `\`${[...language.translate.commands, ...TRANSLATE_COMMANDS].join('`, `')}\``,
    ];
    if (!sfw) {
        lang.push(`\`${[...language.urbanDictionary.command, ...URBAN_DICTIONARY_COMMANDS].join('`, `')}\``);
    }
    if (message.guild && (permissions && permissions.has('MANAGE_GUILD')) || (permissions && permissions.has('MANAGE_MESSAGES'))) {
        lang.push(`\`${[...language.urbanDictionary.command, ...GUILD_ADMIN_COMMANDS.changePrefix].join('`, `')}\``);
        lang.push(`\`${[...language.urbanDictionary.command, ...GUILD_ADMIN_COMMANDS.changeLanguage].join('`, `')}\``);
        lang.push(`\`${[...language.urbanDictionary.command, ...GUILD_ADMIN_COMMANDS.subscribeToPTUpdates].join('`, `')}\``);
        lang.push(`\`${[...language.urbanDictionary.command, ...GUILD_ADMIN_COMMANDS.subscribeToPonyImages].join('`, `')}\``);
    }
    sendHelpEmbed(message, lang);
}

export function sendHelpEmbed(message: Message, content: string[]) {
    if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) {
        const embed = signEmbed(message.client);
        const name = message.guild ? message.guild.name : message.author.tag;
        const icon = message.guild ? message.guild.iconURL() : message.author.avatarURL();
        embed.setAuthor(name, icon || undefined);
        embed.setDescription(content.join('\n'));
        message.channel.send(embed);
    } else {
        const code = '```';
        message.channel.send(`${code}\n${content.join('\n')}${code}`);
    }
}

export function helpEntries(language: Language, prefix: string, sfw = true) {
    const lang: string[] = [
        repPre(language.help.help, prefix).replace(/&COMMAND/g, [...language.help.commands.adminHelp, ...HELP_COMMANDS][0]),
        repPre(language.help.derpibooru, prefix).replace(/&COMMAND/g, [...language.derpibooru.commands, ...DERPIBOORU_COMMANDS][0]),
        repPre(language.help.fact, prefix).replace(/&COMMAND/g, [...language.pt.commands.roll, ...PT_COMMANDS.roll][0]),
        repPre(language.help.fact, prefix).replace(/&COMMAND/g, [...language.miscellaneous.commands.facts, ...MISCELLANEOUS_COMMANDS.facts][0]),
        repPre(language.help.joke, prefix).replace(/&COMMAND/g, [...language.miscellaneous.commands.jokes, ...MISCELLANEOUS_COMMANDS.jokes][0]),
        repPre(language.help.boop, prefix).replace(/&COMMAND/g, [...language.miscellaneous.commands.boop, ...MISCELLANEOUS_COMMANDS.boop][0]),
        repPre(language.help.hugs, prefix).replace(/&COMMAND/g, [...language.miscellaneous.commands.hug, ...MISCELLANEOUS_COMMANDS.hug][0]),
        repPre(language.help.dictionary, prefix).replace(/&COMMAND/g, [...language.dictionary.commands, ...DICTIONARY_COMMANDS][0]),
        repPre(language.help.translate, prefix).replace(/&COMMAND/g, [...language.translate.commands, ...TRANSLATE_COMMANDS][0]),
    ];
    if (!sfw) {
        lang.push(repPre(language.help.urbanDictionary, prefix).replace(/&COMMAND/g, [...language.urbanDictionary.command, ...URBAN_DICTIONARY_COMMANDS][0]));
    }
    return lang;
}

function adminHelp(language: Language, prefix: string) {

    const subscribe = language.guildAdmin.subscribe[0];
    const unSubscribe = language.guildAdmin.unsubscribe[0];
    const subscribeUnsubscribe = `${subscribe}/${unSubscribe}`;

    const trueInMsg = language.guildAdmin.true[0];
    const falseInMsg = language.guildAdmin.false[0];
    const trueFalse = `${trueInMsg}/${falseInMsg}`;

    const lang: string[] = [
        repPre(language.help.guildAdminHelp.prefix, prefix)
            .replace(/&COMMAND/g, [...language.guildAdmin.commands.changePrefix, ...GUILD_ADMIN_COMMANDS.changePrefix][0]),
        repPre(language.help.guildAdminHelp.language, prefix)
            .replace(/&COMMAND/g, [...language.guildAdmin.commands.changeLanguage, ...GUILD_ADMIN_COMMANDS.changeLanguage][0]),
        repPre(language.help.guildAdminHelp.ponyImages, prefix)
            .replace(/&COMMAND/g, [...language.guildAdmin.commands.subscribeToPonyImages, ...GUILD_ADMIN_COMMANDS.subscribeToPonyImages][0])
            .replace(/&ARGS/g, subscribeUnsubscribe),
        repPre(language.help.guildAdminHelp.ptUpdates, prefix)
            .replace(/&COMMAND/g, [...language.guildAdmin.commands.subscribeToPTUpdates, ...GUILD_ADMIN_COMMANDS.subscribeToPTUpdates][0])
            .replace(/&ARGS/g, subscribeUnsubscribe),
        repPre(language.help.guildAdminHelp.autoUnitConversion, prefix)
            .replace(/&COMMAND/g, [...language.guildAdmin.commands.autoConversion, ...GUILD_ADMIN_COMMANDS.autoConversion][0])
            .replace(/&ARGS/g, trueFalse),
        repPre(language.help.guildAdminHelp.swearProtection, prefix)
            .replace(/&COMMAND/g, [...language.guildAdmin.commands.swearPrevention, ...GUILD_ADMIN_COMMANDS.swearPrevention][0])
            .replace(/&ARGS/g, trueFalse),
        repPre(language.help.guildAdminHelp.kick, prefix)
            .replace(/&COMMAND/g, [...language.guildAdmin.commands.kick, ...GUILD_ADMIN_COMMANDS.kick][0]),
        repPre(language.help.guildAdminHelp.ban, prefix)
            .replace(/&COMMAND/g, [...language.guildAdmin.commands.ban, ...GUILD_ADMIN_COMMANDS.ban][0]),
        repPre(language.help.guildAdminHelp.purge, prefix)
            .replace(/&COMMAND/g, [...language.guildAdmin.commands.purge, ...GUILD_ADMIN_COMMANDS.purge][0]),
        repPre(language.help.guildAdminHelp.setFlag, prefix)
            .replace(/&COMMAND/g, [...language.guildAdmin.commands.setFlag, ...GUILD_ADMIN_COMMANDS.setFlag][0]),
    ];

    return lang;
}

// Replaces &PREFIX with actual prefix
function repPre(text: string, prefix: string) {
    return text.replace(/&PREFIX/g, prefix);
}
