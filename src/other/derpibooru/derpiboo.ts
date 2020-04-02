import { Message, MessageEmbed, TextChannel, Client } from 'discord.js';
import * as Jimp from 'jimp';
import { DerpibooruCommands, Language } from '../../language/langTypes';
import { getLanguage } from '../../until/guild';
import { checkCommand, removePrefixAndCommand } from '../../until/commandsHandler';
import { hasPermissionInChannel } from '../../until/util';
import { Fetch, SearchOptions, Image, ResultSortFormat } from 'node-derpi';
import { ponyApiRandom } from './ponyapi';
import { ResultRandom } from './ponyApiInterfaces';
import { reportErrorToOwner } from '../../until/errors';
import { signEmbed } from '../../until/embeds';
const ColorThief = require('color-thief-jimp');

const missingPermissions = new Set<string>();
const DERPIBOORU_DOMAIN = 'https://derpibooru.org/';
const DERPIBOORU_LOGO = 'https://derpicdn.net/img/view/2018/10/5/1848628.jpeg';
const blockedTags = ['foalcon', 'gore', 'necrophilia', 'self harm', 'rape', 'death', 'suicide'];

export const DERPIBOORU_COMMANDS: DerpibooruCommands = ['derpibooru', 'trixiebooru', 'derpi', 'db'];

const coolDown = new Set<string>();

interface SuperSFWSearchResult {
    ponyApi?: ResultRandom;
    derpibooru?: Image;
}

export function derpibooruCommand(message: Message, ignoreRestriction = false): boolean {
    const language = getLanguage(message.guild);

    if (checkCommand(message, [...language.derpibooru.commands, ...DERPIBOORU_COMMANDS])) {
        derpibooru(message, ignoreRestriction);
        return true;
    }
    return false;
}

async function derpibooru(message: Message, ignoreRestriction: boolean) {
    const id = message.guild ? message.guild.id : message.author.id;
    if (coolDown.has(id)) return;
    coolDown.add(id);
    message.channel.startTyping();
    const args = removePrefixAndCommand(message).split(',').map(t => t.trim())
        .filter(t => t);

    const language = getLanguage(message.guild);
    const guildChannel = message.channel as TextChannel;
    let result: SuperSFWSearchResult = {};
    try {
        if (message.guild && guildChannel.nsfw) {
            result.derpibooru = await NSFWSearch(args);
        } else if (ignoreRestriction) {
            const id = parseInt(args[0]);
            if (!isNaN(id)) result.derpibooru = await Fetch.fetchImage(id);
            else result.derpibooru = await SFWSearch(args);
        } else result = await SuperSFWSearch(args, message.client);
    } catch (error) {
        await message.channel.stopTyping();
        message.channel.send(`🔍 ${language.derpibooru.noResult}`);
        coolDown.delete(id);
        return;
    }
    if (hasPermissionInChannel(message.channel, 'EMBED_LINKS')) {
        let embed: MessageEmbed = signEmbed(message.client);
        try {
            if (result.derpibooru) embed = await derpibooruEmbed(embed, result.derpibooru, language);
            else if (result.ponyApi) embed = await ponyApiEmbed(embed, result.ponyApi, language);
        } catch (error) {
            await message.channel.stopTyping();
            message.channel.send(`🔍 ${language.derpibooru.noResult}`);
            coolDown.delete(id);
            return;
        }
        await message.channel.stopTyping();
        const contentArgs = args[0] ? `\`${args.join('`, `')}\`` : '';
        if (embed) message.channel.send(contentArgs, embed);
        else message.channel.send(language.derpibooru.somethingWentWrong);
    } else {
        if (!result.derpibooru && !result.ponyApi) {
            await message.channel.stopTyping();
            message.channel.send(language.derpibooru.somethingWentWrong);
            coolDown.delete(id);
            return;
        }
        let content = '';
        const url = result.derpibooru ? `${DERPIBOORU_DOMAIN}${result.derpibooru.id}` : result.ponyApi!.sourceURL;
        if (!missingPermissions.has(message.channel.id)) {
            missingPermissions.add(message.channel.id);
            content = language.derpibooru.missingPermissionEmbedLinks.replace(/&URL/g, url ? url : '');
        } else {
            content = url ? url : language.derpibooru.noResult;
        }
        await message.channel.stopTyping();
        message.channel.send(content);
    }
    coolDown.delete(id);
}

async function NSFWSearch(tags: string[]) {
    const options: SearchOptions = {
        sortFormat: ResultSortFormat.RANDOM,
        query: [...tags, ...blockedTags.map(t => `!${t}`)].join(', '),
    };
    const searchResults = await Fetch.search(options);
    if (searchResults.images.length === 0) throw new Error('Nothing found');
    const random = Math.floor(Math.random() * searchResults.images.length);
    return searchResults.images[random];
}

async function SFWSearch(tags: string[]) {
    const options: SearchOptions = {
        sortFormat: ResultSortFormat.RANDOM,
        query: [...tags, ...blockedTags.map(t => `!${t}`)].join(', '),
    };
    const searchResults = await Fetch.search(options);
    if (searchResults.images.length === 0) throw new Error('Nothing found');
    const random = Math.floor(Math.random() * searchResults.images.length);
    return searchResults.images[random];
}

async function SuperSFWSearch(tags: string[], client: Client): Promise<SuperSFWSearchResult> {
    const ponyApiResult = await ponyApiRandom(tags);

    if (!ponyApiResult.derpiId) return ({ ponyApi: ponyApiResult });
    try {
        const image = await Fetch.fetchImage(ponyApiResult.derpiId);
        const result: SuperSFWSearchResult = {
            ponyApi: ponyApiResult,
            derpibooru: image,
        };
        return result;
    } catch (error) {
        reportErrorToOwner(client, error);
        const result: SuperSFWSearchResult = {
            ponyApi: ponyApiResult,
        };
        return result;
    }
}

async function derpibooruEmbed(embed: MessageEmbed, image: Image, language: Language) {
    embed.setColor('RANDOM');
    embed.setAuthor('Derpibooru', DERPIBOORU_LOGO, '');
    if (image.id) {
        embed.setTitle(language.derpibooru.derpibooruImage);
        embed.setURL(`${DERPIBOORU_DOMAIN}${image.id}`);
    }
    embed.setImage(image.representations.full);

    if (image.artistNames && image.artistNames.length) {
        const url = `${DERPIBOORU_DOMAIN}tags/${encodeURIComponent(slugify(`artist:${image.artistNames.join(', ')}`))}`;
        const artist = `[${image.artistNames[0]}](${url})`;
        embed.addField(language.derpibooru.artist, artist, true);
    } else embed.addField(language.derpibooru, language.derpibooru.unknownArtist, true);

    let uploaderName = image.uploaderName;
    if (image.uploaderID && image.uploaderID > 0) uploaderName = `[${image.uploaderName}](https://derpibooru.org/profiles/${encodeURIComponent(image.uploaderName)})`;
    embed.addField(language.derpibooru.uploader, uploaderName, true);

    if (image.id) {
        const commentsResult = await image.comments(undefined);

        const score = `${image.favorites} ⭐ | ${image.upvotes} ⬆️ | ${image.downvotes} ⬇️ | ${commentsResult.total} 🗨️`;
        embed.addField(language.derpibooru.score, score);

        if (image.description) embed.addField(language.derpibooru.description, limitString1024(image.description));
    }

    const tags = image.tagNames.length > 10 ? `${image.tagNames.join(', ')}, ${language.derpibooru.moreTabs.replace(/&NUMBER/g, (image.tagNames.length - 10).toString())}` : image.tagNames.join(', ');
    embed.addField(language.derpibooru.tags, tags);

    try {
        const jimp = Jimp.default.read(image.representations.thumbnailSmall);
        embed.setColor(parseInt(ColorThief.getColorHex(jimp), 16));
        return embed;
    } catch (error) {
        return embed;
    }
}

async function ponyApiEmbed(embed: MessageEmbed, image: ResultRandom, language: Language) {
    embed.setAuthor('theponyapi', undefined, 'www.theponyapi.com');
    embed.setDescription(`[${language.derpibooru.source}](${image.sourceURL})`);
    embed.setImage(image.representations.full);
    const tags = image.tags.length > 10 ? `${image.tags.join(', ')}${language.derpibooru.moreTabs.replace(/&NUMBER/g, (image.tags.length - 10).toString())}` : image.tags.join(', ');
    embed.addField(language.derpibooru.tags, tags);
    try {
        const jimp = await Jimp.default.read(image.representations.thumbSmall);
        embed.setColor(parseInt(ColorThief.getColorHex(jimp), 16));
        return embed;
    } catch (error) {
        return embed;
    }
}

function limitString1024(text: string) {
    if (text.length < 1024) return text;
    text = text.slice(0, 1020);
    if (text.includes(' ')) text = text.slice(0, text.lastIndexOf(' '));
    return text + '...';
}

function slugify(param: string) {
    return param.replace('.', '-dot-').replace('-', '-dash-').replace('\\', '-bwslash-')
        .replace(':', '-colon-').replace('/', '-fwslash-').replace('+', '-plus-');
}
