import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { getLanguage } from '../../until/guild';
import { UrbanDictionaryCommands } from '../../language/langTypes';
import { checkCommand, removePrefixAndCommand } from '../../until/commandsHandler';
import { hasPermissionInChannel } from '../../until/util';
import { stringifyEmbed, signEmbed } from '../../until/embeds';
import { format } from 'url';
const { term } = require('urban-dictionary');

const URBAN_DICTIONARY_ICON = 'https://firebounty.com/image/635-urban-dictionary';
const URBAN_DICTIONARY_URL = 'https://www.urbandictionary.com';

export const URBAN_DICTIONARY_COMMANDS: UrbanDictionaryCommands = ['urbandictionary', 'urban'];
const coolDown = new Set<string>();

export function urbanDictionary(message: Message, allowInSFW = false): boolean {
    const language = getLanguage(message.guild);

    if (checkCommand(message, [...language.urbanDictionary.command, ...URBAN_DICTIONARY_COMMANDS])) {
        if (message.channel.type === 'dm') {
            message.channel.send(language.urbanDictionary.notAllowedInDM);
            return true;
        } else if (!message.guild) {
            message.channel.send(language.urbanDictionary.notAllowedInDM);
            return true;
        } else {
            const guildChannel = message.channel as TextChannel;
            if (guildChannel.nsfw || allowInSFW)
                getWord(message);
            else message.channel.send(language.urbanDictionary.notAllowedInSFW);
            return true;
        }
    }
    return false;
}

function getWord(message: Message) {
    const id = message.guild ? message.guild.id : message.author.id;
    if (coolDown.has(id)) return;
    coolDown.add(id);
    const content = removePrefixAndCommand(message).toLowerCase();
    const language = getLanguage(message.guild);

    term(content, (error: any, entries: any) => {
        if (error) {
            const errorEmb = errorEmbed(message, error);
            if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) {
                message.channel.send(errorEmb);
            } else message.channel.send(stringifyEmbed(errorEmb, message.client, message.guild));
            return;
        }
        const embed = signEmbed(message.client);
        embed.setAuthor('urbandictionary', URBAN_DICTIONARY_ICON, URBAN_DICTIONARY_URL);
        embed.setColor([240, 145, 21]);
        embed.setTitle(entries[0].word);
        const doman = 'www.urbandictionary.com';
        const url = format({
            protocol: 'https',
            hostname: 'www.urbandictionary.com',
            pathname: 'define.php',
            query: {
                term: entries[0].word,
            },
        });
        const defenition = [
            `${bold(language.urbanDictionary.definition)}:`,
            entries[0].definition,
            `${bold(language.urbanDictionary.example)}:`,
            entries[0].example,
            `${language.urbanDictionary.source}:`,
            `[${doman}](${url})`,
        ];
        embed.setDescription(defenition.toString());
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) {
            message.channel.send(embed);
        } else message.channel.send(stringifyEmbed(embed, message.client, message.guild));
    });
    coolDown.delete(id);
}

function errorEmbed(message: Message, details: string) {
    const language = getLanguage(message.guild);
    const embed = new MessageEmbed();

    embed.setColor('red');
    embed.setTitle(language.urbanDictionary.error);
    embed.setDescription(details);
    return embed;
}

function bold(text: string) {
    return text.replace(/\[\]/g, '**');
}
