import { prefix } from "./guildPrefix";
import { Message, RichEmbed, TextChannel, Collector } from 'discord.js';
import { DataBase } from "./DataBase";
import axios from 'axios';
import { embedSend, addClient } from './sendMessage';
import { client } from '../index';
import { stats } from './stats';
const Derpibooru = require('node-derpi');
const Jimp = require('jimp');
const ColorThief = require('color-thief-jimp');

const nsfwFilterID = 56027;
const theponyapiRandom = "https://www.theponyapi.com/api/v1/pony/random";
const derpibooruLogo = "https://derpicdn.net/img/view/2018/10/5/1848628.jpeg";
const blockedTags = ["foalcon", "gore", "necrophilia", "self harm", "rape", "death", "suicide", "webm"]

//template
const optionsTemplate = {
    sortFormat: "random",
    filterID: nsfwFilterID
};

export function derpibooru(message: Message) {
    const p = prefix(message).toLowerCase();
    if (!p) return false;
    if (!p.startsWith('derpibooru')) return false;
    let language = message.guild ? DataBase.getLang()[DataBase.getGuildLang(message.guild)].derpibooru : DataBase.getLang()['en'].derpibooru;
    let tags = p.replace(/  +/g, ' ').replace(/,,+/g, ',').toLowerCase().slice(10, p.length).trim().split(',');

    tags = tags.map(t => t = t.trim())

    for (const i of blockedTags) tags = tags.filter(t => t !== i)

    tags = tags.filter(t => t !== '')
    message.channel.startTyping();
    const embed = new RichEmbed();
    addClient(embed);
    embed.setAuthor('Derpibooru', derpibooruLogo);
    const guildChannel = message.channel as TextChannel
    if (message.type !== 'dm' && guildChannel.nsfw) return NSWFFilter(message, embed, tags, language);
    let queryString = '';
    if (tags.length !== 0) queryString = `?q=${tags.join(',').replace(/  +/g, '%20')}`;

    theponyapi(message, embed, tags, language, queryString);
    return true;
}

function theponyapi(message: Message, embed: RichEmbed, tags: string[], language: any, queryString: string) {
    axios.get(`${theponyapiRandom}${queryString}`)
        .then(res => {
            SFW(message, embed, tags, language, res.data.pony);
        })
        .catch(err => {
            embed.setColor("RED");
            message.channel.stopTyping();
            if (err.response.status === 404) {
                embed.addField(language.error, language.nothingFound)
            } else {
                embed.addField(language.error, language.unavailable)
            }
            message.channel.send(embed).catch(err => { console.error(err) });
        });
}


async function SFW(message: Message, embed: RichEmbed, tags: string[], language: any, pony: any) {
    let result: any;
    const derpibooruError = () => {
        embed.setAuthor('theponyapi')
        result = {
            id: null,
            tagNames: pony.tags,
            representations: pony.representations
        }
        result.representations.thumbnailSmall = pony.representations.thumbSmall;
    }


    if (!pony.derpiId) derpibooruError();
    else {
        try {
            result = await Derpibooru.Fetch.fetchImage(pony.derpiId)
        } catch (err) {
            console.error(err)
            derpibooruError();
        }
    }


    await compilemessage(embed, result, language)

    const msg = tags.length !== 0 ? `Tags: \`${tags.join("\` \`")}\`` : '';
    await message.channel.stopTyping();

    if (message.guild) {
        const guildChannel = message.channel as TextChannel;
        const guildMember = message.guild.members.find(m => m.id === client.user.id)
        if (!guildChannel.memberPermissions(guildMember).hasPermission("EMBED_LINKS")) {
            const link = pony.derpiId ? `https://derpibooru.org/${result.id}` : '';
            return message.channel.send(`:x: ${language.missingEmbedPermission} ${link}`)
        }
    }

    message.channel.send(msg, { embed }).catch(err => { console.log(err) });
}


async function NSWFFilter(message: Message, embed: RichEmbed, args: string[], language: any) {
    let options: any = { ...optionsTemplate };

    let forceIgnore = [...blockedTags]
    forceIgnore = forceIgnore.map(t => '!' + t);

    options.query = forceIgnore.join(",");
    if (args.length !== 0) options.query += ',' + args.join(",");

    let searchResults;
    try {
        searchResults = await Derpibooru.Fetch.search(options);
    }
    catch (err) {

        //do something here
        embed.addField('no result', 'No result found');
        sendError(message, embed, language)
    }

    let results = searchResults.images;
    let result;
    if (results.length > 0) result = results[options.sortFormat === 'random' ? Math.floor(Math.random() * results.length) : 0];

    if (!result) {
        embed.addField('no result', 'No result found');
        return sendError(message, embed, language);
    }

    await compilemessage(embed, result, language)

    message.channel.stopTyping();
    if (message.guild) {
        const guildChannel = message.channel as TextChannel;
        const guildMember = message.guild.members.find(m => m.id === client.user.id)
        if (!guildChannel.memberPermissions(guildMember).hasPermission("EMBED_LINKS")) {
            const link = `https://derpibooru.org/${result.id}`;
            return message.channel.send(`:x: ${language.missingEmbedPermission} ${link}`)
        }
    }
    const msg = args.length !== 0 ? `Tags: \`${args.join("\` \`")}\`` : '';
    message.channel.send(msg, { embed }).catch(err => { console.log(err) });
}

function compilemessage(embed: RichEmbed, result, language) {
    return new Promise(async resolve => {

        embed.setColor("RANDOM");

        if (result.id) {
            embed.setTitle(language.derpibooruImage)
            embed.setURL(`https://derpibooru.org/${result.id}`)


            if (result.artistName) {
                const url = `https://derpibooru.org/tags/${encodeURIComponent(slugify(`artist:${result.artistName}`))}`
                const artist = `[${result.artistName}](${url})`
                embed.addField(language.artist, artist, true)
            } else embed.addField(language.artist, language.unknownArtist, true)

            let uploaderName = `${result.uploaderName}`;
            if (result.uploaderID && result.uploaderID > 0)
                uploaderName = `[${uploaderName}](https://derpibooru.org/profiles/${encodeURIComponent(result.uploaderName)})`;


            embed.addField(language.uploader, uploaderName, true)
        }

        if (result.id) {
            const comments = await result.comments();
            let score = `:star: ${result.favorites}`;
            score += ` | :arrow_up: ${result.upvotes}`;
            score += ` | :arrow_up_down: ${result.score}`
            score += ` | :arrow_down: ${result.downvotes}`;
            score += ` | :speech_left: ${comments.comments.length}`;
            embed.addField(language.score, score);

            if (result.description) embed.addField(language.description, limitSctring1024(result.description));
        }
        embed.addField(language.tags, limitSctring1024(result.tagNames.join(', ')));

        // console.log(await result.comments().comments)

        /*
        const tags = result.tagNames.splice(0, 10).join(', ') + (result.tagNames.length > 10 ? '...' : '')
        embed.addField('Tags', tags);

        const uploaded = `${result.created.toDateString()} by ${result.uploaderName}`
        embed.addField('Uploaded', uploaded);

        const score = `${result.score} (+${result.upvotes}/-${result.downvotes})`
        embed.addField('Score', score, true);

        const faves = `${result.favorites}`;
        embed.addField('Favorites', faves, true);
*/
        embed.setImage(result.representations.medium);

        Jimp.read(result.representations.thumbnailSmall, (err, image) => {
            if (err) {
                console.error(err);
                return resolve(embed);
            }

            try {
                embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
                return resolve(embed);
            } catch (err) {
                console.error(err);
                return resolve(embed);
            }
        });


    });
}


function limitSctring1024(string: string) {
    if (string.length < 1024) return string;
    string = string.slice(0, 1020);
    if (string.includes(' ')) string = string.slice(0, string.lastIndexOf(' '));
    return string + '...';
}






function slugify(param: string) {
    return param.replace('.', '-dot-').replace('-', '-dash-').replace('\\', '-bwslash-')
        .replace(':', '-colon-').replace('/', '-fwslash-').replace('+', '-plus-');
}












function sendDerpi(message: Message, embed: RichEmbed, language: any) {
    message.channel.stopTyping();
    message.channel.send(embed);
}
function sendError(message: Message, embed: RichEmbed, language: any) {
    message.channel.stopTyping();
    embed.setColor("RED");

    message.channel.send(embed);

}



/*
    //adds or removes recommended tagssads
    if (!areThereArgs) options.query = "!" + improvedNSFWFilter.join(",!");
    else {
        let webmR = true;
        let custom = improvedNSFWFilter;
        let filterCheck = [];
        for (let i in args) {
            for (let j in improvedNSFWFilter) {
                if (args[i] == "webm") {
                    args[i] = "!webm";
                    if (webmR) {
                        webmR = false;
                        message.reply(lang.derpibooruWebm).catch(() => { });
                    }
                }
                if (args[i] == improvedNSFWFilter[j]) custom[j] = "";
                else filterCheck.push(args[i]);
            }
        }
        options.query = `${args.filter(Boolean).join(",")},!${custom.filter(Boolean).join(",!")}`;
    }

    //do search
    try {
        searchResults = await Derpibooru.Fetch.search(options);
    } catch (err) {
        message.channel.stopTyping();
        message.channel.send(lang.derpibooruError).catch(() => { });
        return false;
    }
    console.log(options)

    //pick random resoult
    let results = searchResults.images;

    console.log(results.length)
    if (results.length > 0) {
        let result = results[Math.floor(Math.random() * results.length)];
        return await embedImage(result, true);
    } else {
        message.channel.stopTyping();
        message.channel.send(`${lang.derpibooruSearchFailed} \` ${args.join(",")}\``).catch(() => { });
        return false;
    }
}


*/
