import { Message, GuildMember, version as discordVersion } from 'discord.js';
import { getLanguage, findGuildMembers } from '../../until/guild';
import { checkCommand, removePrefixAndCommand } from '../../until/commandsHandler';
import { MiscellaneousCommands, Language } from '../../language/langTypes';
import { removeMarkup } from '../../until/embeds';
import { hasPermissionInChannel } from '../../until/util';
import { reportErrorToOwner } from '../../until/errors';
import { version as nodeVersion } from 'process';
import { version, supportServer } from '../..';
//import { version } from '../..';

export const MISCELLANEOUS_COMMANDS: MiscellaneousCommands = {
    boop: ['boop', 'boops'],
    hug: ['hug', 'hugs'],
    kiss: ['kiss', 'kisses'],
    facts: ['fact', 'facts', 'truth'],
    jokes: ['joke', 'jokes'],
    ping: ['ping'],
};
export const versionCommand = ['version'];
export const support = ['support'];

export function miscellaneous(message: Message): boolean {
    const language = getLanguage(message.guild);
    if (checkCommand(message, [...language.miscellaneous.commands.boop, ...MISCELLANEOUS_COMMANDS.boop])) {
        message.channel.send(action(message, language, language.miscellaneous.boops));
        return true;
    } else if (checkCommand(message, [...language.miscellaneous.commands.hug, ...MISCELLANEOUS_COMMANDS.hug])) {
        message.channel.send(action(message, language, language.miscellaneous.hugs));
        return true;
    } else if (checkCommand(message, [...language.miscellaneous.commands.kiss, ...MISCELLANEOUS_COMMANDS.kiss])) {
        message.channel.send(action(message, language, language.miscellaneous.kisses));
        return true;
    } else if (checkCommand(message, [...language.miscellaneous.commands.jokes, ...MISCELLANEOUS_COMMANDS.jokes])) {
        const result = randomJokeOrFact(message, language, 'jokes');
        message.channel.send(result[0]).then(msg => { if (result[1]) react(msg, '😄'); });
        return true;
    } else if (checkCommand(message, [...language.miscellaneous.commands.facts, ...MISCELLANEOUS_COMMANDS.facts])) {
        const result = randomJokeOrFact(message, language, 'facts');
        message.channel.send(result[0]).then(msg => { if (result[1]) react(msg, '👓'); });
        return true;
    } else if (checkCommand(message, [...language.miscellaneous.commands.ping, ...MISCELLANEOUS_COMMANDS.ping])) {
        ping(message, language);
        return true;
    } else if (checkCommand(message, versionCommand)) {
        const versionContent = [
            `Node version: ${nodeVersion}`,
            `Discord.js version: ${discordVersion}`,
            `Bot version: ${version}`,
        ].join('\n');

        message.channel.send(versionContent);
        return true;
    } else if (checkCommand(message, support)) {
        message.channel.send(supportServer);
        return true;
    } else return false;
}

function action(message: Message, language: Language, text: string) {
    const msgContent = removePrefixAndCommand(message);

    if (msgContent && message.guild) {
        const mentionsCollections = message.mentions.members;
        let guildMembers: GuildMember[] | null = mentionsCollections ? mentionsCollections.map(m => m) : null;
        if (!guildMembers || !guildMembers.length)
            guildMembers = findGuildMembers(msgContent, message.guild);
        if (!guildMembers) return language.miscellaneous.userNotFound.replace(/&QUERY/g, msgContent);
        else if (guildMembers.length > 1) return language.miscellaneous.ambiguous.replace(/&QUERY/g, msgContent);
        else if (guildMembers[0] === message.member) return `*${message.member} ${text} ${message.client.user}*`;
        return `*${message.member} ${text} ${guildMembers[0]}*`;
    }
    return `*${text} ${message.member ? message.member : message.author}*`;
}

function randomJokeOrFact(message: Message, language: Language, factOrJoke: 'facts' | 'jokes'): [string, boolean] {
    const content = removeMarkup(removePrefixAndCommand(message).toLowerCase(), message.client);
    const foj = language.jokesFacts[factOrJoke];

    if (!Object.keys(foj).length) {
        if (factOrJoke === 'facts') return [language.jokesFacts.noFact, false];
        else return [language.jokesFacts.noJokes, false];
    }

    if (content) {
        if (language.jokesFacts.jokes[content])
            return [foj[content][ranIntAry(foj[content].length)], true];
        else return [`${language.miscellaneous.nothingFound.replace(/&QUERY/g, content).replace(/&AVAILABLE/g, `\`${Object.keys(foj).join('`, `')}\``)}`, false];
    }
    const factKeys = Object.keys(foj);
    const type = factKeys[ranIntAry(factKeys.length)];
    return [foj[type][ranIntAry(foj[type].length)], true];
}

async function react(messages: Message | Message[], emoji: string) {
    if (Array.isArray(messages)) {
        for (const message of messages) {
            react(message, emoji);
        }
    } else {
        if (hasPermissionInChannel(messages.channel, 'ADD_REACTIONS')) {
            try {
                messages.react(emoji);
            } catch (error) {
                const guildString = messages.guild ? `${messages.guild.name} | ${messages.guild.id}` : undefined;
                reportErrorToOwner(messages.client, error, guildString);
            }
        }
    }
}

function ping(message: Message, language: Language) {
    const now = Date.now();
    message.channel.send(`Pinging...`)
        .then(m => {
            const editedNow = Date.now();
            let msg: Message;
            if (Array.isArray(m)) msg = m[0];
            else msg = m;
            const ping1 = Math.floor(editedNow - now);
            const ping2 = Math.floor(msg.createdTimestamp - message.createdTimestamp);
            const ping3 = Math.floor(message.client.ws.ping);
            const { ping } = language.miscellaneous;
            msg.edit(`${ping.network}${ping1}ms\n${ping.server}${ping2}ms\n${ping.api}${ping3}ms\n`);
        });
}

function ranIntAry(max: number) {
    return Math.floor(Math.random() * max);
}