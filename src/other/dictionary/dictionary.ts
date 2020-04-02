import { getLanguage } from '../../until/guild';
import { Message, MessageEmbed } from 'discord.js';
import { DictionaryCommands } from '../../language/langTypes';
import { checkCommand, removePrefixAndCommand } from '../../until/commandsHandler';
import { cambridgeDictionary, CambridgeDictionaryResult } from './cambridgeDictionary';
import { signEmbed } from '../../until/embeds';
import { hasPermissionInChannel } from '../../until/util';
import { reportErrorToOwner } from '../../until/errors';
const getDef = require('word-definition');

const USE_CAMBRIDGE = true; // Disable if there is problem with cambridge
const CAMBRIDGE_DICTIONARY_ICON = 'https://banner2.cleanpng.com/20180614/xav/kisspng-cambridge-advanced-learner-s-dictionary-university-cambridge-english-first-5b23346b1f9af1.3991183215290338351295.jpg';
const DICTIONARY_ICON = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJuyaXUT9CDxfoxAhEOZXAs0JT1YinMGz5dOkzTwlfBmpnBre9Cw';

export const DICTIONARY_COMMANDS: DictionaryCommands = ['dictionary', 'explain', 'definition', 'define'];
const coolDown = new Set<string>();

export function dictionary(message: Message): boolean {
    const language = getLanguage(message.guild);

    if (checkCommand(message, [...language.dictionary.commands, ...DICTIONARY_COMMANDS])) {
        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) {
            if (USE_CAMBRIDGE) cambridgeWord(message);
            else normalWord(message);
        } else {
            message.channel.send(`⚠️ ${language.dictionary.missingPermissionEmbedLinks}`);
        }
        return true;
    }
    return false;
}

async function cambridgeWord(message: Message) {
    const id = message.guild ? message.guild.id : message.author.id;
    if (coolDown.has(id)) return;
    coolDown.add(id);
    const language = getLanguage(message.guild);
    message.channel.startTyping();

    const content = removePrefixAndCommand(message).toLowerCase();
    try {
        const result = await cambridgeDictionary(content);
        const embed = cambridgeEmbed(signEmbed(message.client), result);
        await message.channel.stopTyping();
        message.channel.send(embed);

    } catch (error) {
        await message.channel.stopTyping();
        message.channel.send(`⚠️ ${language.dictionary.noResult}`);
    }
    coolDown.delete(id);
}

async function normalWord(message: Message) {
    const id = message.guild ? message.guild.id : message.author.id;
    if (coolDown.has(id)) return;
    coolDown.add(id);
    const language = getLanguage(message.guild);
    message.channel.startTyping();

    const content = removePrefixAndCommand(message).toLowerCase();
    getDef(content, 'en', null, async (definition: any) => {
        if (definition.err !== undefined) {
            message.channel.send(`⚠️ ${language.dictionary.noResult}`);
            coolDown.delete(id);
            return;
        } else {
            try {
                const embed = signEmbed(message.client);
                embed.setAuthor('Dictionary', DICTIONARY_ICON);
                embed.setTitle(definition.word.length > 300 ? `${definition.word}...` : definition.word);
                embed.setDescription(definition.definition.length > 2000 ? `**Definition:**\n${definition.definition}...` : `**Definition:**\n${definition.definition}`);
                embed.setColor('WHITE');
                await message.channel.stopTyping();
                await message.channel.send(embed);
            } catch (error) {
                reportErrorToOwner(message.client, error, 'normal word dictionary');
            }
        }
    });
    coolDown.delete(id);
}

function cambridgeEmbed(embed: MessageEmbed, cb: CambridgeDictionaryResult): MessageEmbed {
    const entry = cb.results[0];

    embed.setAuthor('Cambridge Dictionary', CAMBRIDGE_DICTIONARY_ICON, 'https://dictionary.cambridge.org/');
    const description = [];
    if (entry.word) embed.setTitle(entry.word);
    if (entry.labelsCodes) description.push(entry.labelsCodes);
    if (entry.pronunciationUK || entry.pronunciationUS) {
        const uk = entry.pronunciationUK ? `**UK** *${entry.pronunciationUK}*` : '';
        const us = entry.pronunciationUS ? `**US** *${entry.pronunciationUS}*` : '';
        if (uk && us) description.push(`${uk} | ${us}`);
        else description.push(`${uk}${us}`);
        description.push('');
    }
    if (entry.guideWord) description.push(entry.guideWord);

    if (entry.descriptions && entry.descriptions.length !== 0) {
        for (const desc of entry.descriptions) {
            description.push(`**${desc.description}**\n${desc.examples.length === 0 ? '' : '- '}${desc.examples.join('\n- ')}`);
            description.push('');
        }

    }
    embed.setDescription(description.join('\n'));
    return embed;
}
