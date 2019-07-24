"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guildPrefix_1 = require("./guildPrefix");
const discord_js_1 = require("discord.js");
const DataBase_1 = require("./DataBase");
const axios_1 = require("axios");
const sendMessage_1 = require("./sendMessage");
const index_1 = require("../index");
const Derpibooru = require('node-derpi');
const Jimp = require('jimp');
const ColorThief = require('color-thief-jimp');
const nsfwFilterID = 56027;
const theponyapiRandom = "https://www.theponyapi.com/api/v1/pony/random";
const derpibooruLogo = "https://derpicdn.net/img/view/2018/10/5/1848628.jpeg";
const blockedTags = ["foalcon", "gore", "necrophilia", "self harm", "rape", "death", "suicide", "webm"];
const optionsTemplate = {
    sortFormat: "random",
    filterID: nsfwFilterID
};
function derpibooru(message) {
    const p = guildPrefix_1.prefix(message).toLowerCase();
    if (!p)
        return false;
    if (!p.startsWith('derpibooru'))
        return false;
    let language = message.guild ? DataBase_1.DataBase.getLang()[DataBase_1.DataBase.getGuildLang(message.guild)].derpibooru : DataBase_1.DataBase.getLang()['en'].derpibooru;
    let tags = p.replace(/  +/g, ' ').replace(/,,+/g, ',').toLowerCase().slice(10, p.length).trim().split(',');
    tags = tags.map(t => t = t.trim());
    for (const i of blockedTags)
        tags = tags.filter(t => t !== i);
    tags = tags.filter(t => t !== '');
    message.channel.startTyping();
    const embed = new discord_js_1.RichEmbed();
    sendMessage_1.addClient(embed);
    embed.setAuthor('Derpibooru', derpibooruLogo);
    const guildChannel = message.channel;
    if (message.type !== 'dm' && guildChannel.nsfw)
        return NSWFFilter(message, embed, tags, language);
    let queryString = '';
    if (tags.length !== 0)
        queryString = `?q=${tags.join(',').replace(/  +/g, '%20')}`;
    theponyapi(message, embed, tags, language, queryString);
    return true;
}
exports.derpibooru = derpibooru;
function theponyapi(message, embed, tags, language, queryString) {
    axios_1.default.get(`${theponyapiRandom}${queryString}`)
        .then(res => {
        SFW(message, embed, tags, language, res.data.pony);
    })
        .catch(err => {
        embed.setColor("RED");
        message.channel.stopTyping();
        if (err.response.status === 404) {
            embed.addField(language.error, language.nothingFound);
        }
        else {
            embed.addField(language.error, language.unavailable);
        }
        message.channel.send(embed).catch(err => { console.error(err); });
    });
}
async function SFW(message, embed, tags, language, pony) {
    let result;
    const derpibooruError = () => {
        embed.setAuthor('theponyapi');
        result = {
            id: null,
            tagNames: pony.tags,
            representations: pony.representations
        };
        result.representations.thumbnailSmall = pony.representations.thumbSmall;
    };
    if (!pony.derpiId)
        derpibooruError();
    else {
        try {
            result = await Derpibooru.Fetch.fetchImage(pony.derpiId);
        }
        catch (err) {
            console.error(err);
            derpibooruError();
        }
    }
    await compilemessage(embed, result, language);
    const msg = tags.length !== 0 ? `Tags: \`${tags.join("\` \`")}\`` : '';
    await message.channel.stopTyping();
    if (message.guild) {
        const guildChannel = message.channel;
        const guildMember = message.guild.members.find(m => m.id === index_1.client.user.id);
        if (!guildChannel.memberPermissions(guildMember).hasPermission("EMBED_LINKS")) {
            const link = pony.derpiId ? `https://derpibooru.org/${result.id}` : '';
            return message.channel.send(`:x: ${language.missingEmbedPermission} ${link}`);
        }
    }
    message.channel.send(msg, { embed }).catch(err => { console.log(err); });
}
async function NSWFFilter(message, embed, args, language) {
    let options = { ...optionsTemplate };
    let forceIgnore = [...blockedTags];
    forceIgnore = forceIgnore.map(t => '!' + t);
    options.query = forceIgnore.join(",");
    if (args.length !== 0)
        options.query += ',' + args.join(",");
    let searchResults;
    try {
        searchResults = await Derpibooru.Fetch.search(options);
    }
    catch (err) {
        embed.addField('no result', 'No result found');
        sendError(message, embed, language);
    }
    let results = searchResults.images;
    let result;
    if (results.length > 0)
        result = results[options.sortFormat === 'random' ? Math.floor(Math.random() * results.length) : 0];
    if (!result) {
        embed.addField('no result', 'No result found');
        return sendError(message, embed, language);
    }
    await compilemessage(embed, result, language);
    message.channel.stopTyping();
    if (message.guild) {
        const guildChannel = message.channel;
        const guildMember = message.guild.members.find(m => m.id === index_1.client.user.id);
        if (!guildChannel.memberPermissions(guildMember).hasPermission("EMBED_LINKS")) {
            const link = `https://derpibooru.org/${result.id}`;
            return message.channel.send(`:x: ${language.missingEmbedPermission} ${link}`);
        }
    }
    const msg = args.length !== 0 ? `Tags: \`${args.join("\` \`")}\`` : '';
    message.channel.send(msg, { embed }).catch(err => { console.log(err); });
}
function compilemessage(embed, result, language) {
    return new Promise(async (resolve) => {
        embed.setColor("RANDOM");
        if (result.id) {
            embed.setTitle(language.derpibooruImage);
            embed.setURL(`https://derpibooru.org/${result.id}`);
            if (result.artistName) {
                const url = `https://derpibooru.org/tags/${encodeURIComponent(slugify(`artist:${result.artistName}`))}`;
                const artist = `[${result.artistName}](${url})`;
                embed.addField(language.artist, artist, true);
            }
            else
                embed.addField(language.artist, language.unknownArtist, true);
            let uploaderName = `${result.uploaderName}`;
            if (result.uploaderID && result.uploaderID > 0)
                uploaderName = `[${uploaderName}](https://derpibooru.org/profiles/${encodeURIComponent(result.uploaderName)})`;
            embed.addField(language.uploader, uploaderName, true);
        }
        if (result.id) {
            const comments = await result.comments();
            let score = `:star: ${result.favorites}`;
            score += ` | :arrow_up: ${result.upvotes}`;
            score += ` | :arrow_up_down: ${result.score}`;
            score += ` | :arrow_down: ${result.downvotes}`;
            score += ` | :speech_left: ${comments.comments.length}`;
            embed.addField(language.score, score);
            if (result.description)
                embed.addField(language.description, limitSctring1024(result.description));
        }
        embed.addField(language.tags, limitSctring1024(result.tagNames.join(', ')));
        embed.setImage(result.representations.full);
        Jimp.read(result.representations.thumbnailSmall, (err, image) => {
            if (err) {
                console.error(err);
                return resolve(embed);
            }
            try {
                embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
                return resolve(embed);
            }
            catch (err) {
                console.error(err);
                return resolve(embed);
            }
        });
    });
}
function limitSctring1024(string) {
    if (string.length < 1024)
        return string;
    string = string.slice(0, 1020);
    if (string.includes(' '))
        string = string.slice(0, string.lastIndexOf(' '));
    return string + '...';
}
function slugify(param) {
    return param.replace('.', '-dot-').replace('-', '-dash-').replace('\\', '-bwslash-')
        .replace(':', '-colon-').replace('/', '-fwslash-').replace('+', '-plus-');
}
function sendError(message, embed, language) {
    message.channel.stopTyping();
    embed.setColor("RED");
    message.channel.send(embed);
}
//# sourceMappingURL=derpiboo.js.map