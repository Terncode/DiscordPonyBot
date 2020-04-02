import { Message } from 'discord.js';
import { TranslateCommands, Language } from '../language/langTypes';
import { checkCommand, removePrefixAndCommand, getCommandArgs } from '../until/commandsHandler';
import { getLanguage } from '../until/guild';
import { removeFirstWord, hasPermissionInChannel } from '../until/util';
import { signEmbed, removeMarkup, stringifyEmbed } from '../until/embeds';
const tran = require('@k3rn31p4nic/google-translate-api');

const TRANSLATE_NAME = 'Google translate';
const ICON = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/1200px-Google_Translate_logo.svg.png';
const URL = 'https://translate.google.com/';

const langs = ['af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'ny', 'zh-cn', 'zh-tw', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'tl', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'iw', 'hi', 'hmn', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tg', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu', 'zh-cn'];
const langFullName = ['Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani', 'Basque', 'Belarusian', 'Bengali', 'Bosnian', 'Bulgarian', 'Catalan', 'Cebuano', 'Chichewa', 'Chinese Simplified', 'Chinese Traditional', 'Corsican', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Esperanto', 'Estonian', 'Filipino', 'Finnish', 'French', 'Frisian', 'Galician', 'Georgian', 'German', 'Greek', 'Gujarati', 'Haitian Creole', 'Hausa', 'Hawaiian', 'Hebrew', 'Hindi', 'Hmong', 'Hungarian', 'Icelandic', 'Igbo', 'Indonesian', 'Irish', 'Italian', 'Japanese', 'Javanese', 'Kannada', 'Kazakh', 'Khmer', 'Korean', 'Kurdish (Kurmanji)', 'Kyrgyz', 'Lao', 'Latin', 'Latvian', 'Lithuanian', 'Luxembourgish', 'Macedonian', 'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi', 'Mongolian', 'Myanmar (Burmese)', 'Nepali', 'Norwegian', 'Pashto', 'Persian', 'Polish', 'Portuguese', 'Punjabi', 'Romanian', 'Russian', 'Samoan', 'Scots Gaelic', 'Serbian', 'Sesotho', 'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Sundanese', 'Swahili', 'Swedish', 'Tajik', 'Tamil', 'Telugu', 'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Uzbek', 'Vietnamese', 'Welsh', 'Xhosa', 'Yiddish', 'Yoruba', 'Zulu', 'Chinese'];

export const TRANSLATE_COMMANDS: TranslateCommands = ['translate', 'tr'];
const coolDown = new Set<string>();

interface TranslateResult {

    text: string;
    from: {
        language: {
            didYouMean: boolean;
            iso: string;
        };
        text: {
            autoCorrected: boolean;
            value: string;
            didYouMean: boolean;
        };
    };
    raw: string;
}

export function translate(message: Message): boolean {
    const language = getLanguage(message.guild);
    if (checkCommand(message, [...language.translate.commands, ...TRANSLATE_COMMANDS])) {
        actuallyTranslate(message, language);
        return true;
    }
    return false;
}

async function actuallyTranslate(message: Message, language: Language) {
    const id = message.guild ? message.guild.id : message.author.id;
    if (coolDown.has(id)) return;
    coolDown.add(id);
    let content = removePrefixAndCommand(message);
    const args = getCommandArgs(message);

    let toLang = 'en';
    if (langs.includes(args[0].toLowerCase())) toLang = args[0];
    else if (langFullName.map(l => l.toLowerCase()).includes(args[0])) {
        toLang = fullNameToShortOne(args[0]);
        content = removeFirstWord(content);
    } else {
        const specialLanguage = langFullName.filter(l => l.indexOf(' ') !== -1);
        if (specialLanguage.map(m => m.slice(0, m.indexOf(' ')).includes(args[0]))) {
            const langISO = specialLanguage.find(e => e.toLowerCase().includes(`${args[0]} ${args[1]}`));
            if (langISO) {
                toLang = fullNameToShortOne(langISO);
                content = removeFirstWord(content);
                content = removeFirstWord(content);
            }
        }
    }

    if (!content.trim()) {
        await message.channel.send(`⛔ ${language.translate.nothingToTranslate}`);
        coolDown.delete(id);
        return;
    }

    message.channel.startTyping();
    try {
        const translation = await translateMessage(toLang, content);
        await message.channel.stopTyping();
        sendTranslation(message, shortNameToFullOne(toLang), translation, language);

    } catch (error) {
        await message.channel.stopTyping();
        message.channel.send(error);
        coolDown.delete(id);
        return;
    }
    coolDown.delete(id);
}

async function translateMessage(lang: string, text: string) {
    const response = await tran(text, { to: lang });
    return response as TranslateResult;
}

async function sendTranslation(message: Message, toLang: string, result: TranslateResult, language: Language) {
    const embed = signEmbed(message.client);
    try {
        embed.setColor('4b8df5');
        embed.setDescription(`**${shortNameToFullOne(result.from.language.iso)}** --> **${toLang}**\n${removeMarkup(result.text, message.client)}`);
        embed.setAuthor(TRANSLATE_NAME, ICON, URL);

        if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) {
            message.channel.send(embed);
        } else {
            message.channel.send(stringifyEmbed(embed, message.client));
        }
    } catch (error) {
        message.channel.send(`⚠️ ${language.translate.somethingWentWrong}`);
    }
}

function fullNameToShortOne(fullName: string) {
    for (const i in langFullName) {
        if (langFullName[i].toLowerCase() === fullName.toLowerCase()) {
            return langs[i];
        }
    }
    return fullName;
}

function shortNameToFullOne(shortName: string) {
    for (const i in langs) {
        if (langs[i].toLowerCase() === shortName.toLowerCase()) {
            return langFullName[i];
        }
    }
    return shortName;
}
