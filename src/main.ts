import { Message, Channel, MessageEmbedProvider, Guild, GuildMember, RichEmbed, TextChannel, DMChannel } from 'discord.js';
import { guildAdmin } from "./other/guildAdmin";
import { DataBase } from './other/DataBase';
import { embedSend, infoEmbed } from './other/sendMessage';
import { client } from './index';
import { roll } from './other/roll';
import { stats, formatDate } from './other/stats';
import { translate } from './other/translate';
import { urbanDictonary } from './other/urbanDictonary';
import { dictonary } from './other/dictonary';
import { help } from './other/help';
import { others } from './other/others';
import { ourServer, ourServerJoin, disableServerFeatures } from './ourServer/ourServer';
import { factAndJokes } from './other/factAndJokes';
import { chatMonitor } from './other/chatMonitor';
import { derpibooru } from './other/derpiboo';
const Jimp = require('jimp');
const ColorThief = require('color-thief-jimp');
import * as path from 'path';
import * as fs from 'fs';

const ownerID = process.env.OWNER_ID;

export async function onMessage(message: Message) {
    backup(message);
    if (ourServer(message)) return;
    if (message.author.bot) return;//If its bot we ignore
    if (guildAdmin(message)) return;
    if (help(message)) return;
    if (roll(message)) return;
    if (stats(message)) return;
    if (translate(message)) return;
    if (derpibooru(message)) return;

    if (urbanDictonary(message)) return;
    if (dictonary(message)) return;
    if (others(message)) return;
    if (factAndJokes(message)) return;

    chatMonitor(message)
    //if bot is mention we give user default prefix command
    if (message.isMentioned(client.user)) {
        const guildLang = DataBase.getGuildLang(message.guild);
        const msg = `${DataBase.getLang()[guildLang].info.prefixInfo}: \`${DataBase.getPrefix(message.guild)}\``;
        return message.channel.send(msg)
    }
}
export async function clientGuildJoin(guild: Guild) {
    const guildMemeber = guild.members.find(m => m.user === client.user)
    if (!guildMemeber) return;
    //const hasAdmin = guildMemeber.hasPermission("ADMINISTRATOR") ? true : false;
    const embed = guildMemeber.hasPermission("EMBED_LINKS") ? '' : "\nI don't have \`embed link\` Most of my features are not going to work please fix that....";

    let channel = guild.defaultChannel;
    if (!channel) channel = guild.channels.find(c => c.name.toLowerCase() === 'general' && c.type === 'text') as TextChannel;
    if (!channel) channel = guild.channels.find(c => c.name.toLowerCase().includes('general') && c.type === 'text') as TextChannel;
    if (!channel) channel = guild.channels.find(c => c.type === 'text') as TextChannel;

    guild.createChannel('pony-logs').catch(() => { });

    const prefix = DataBase.getPrefix(guild);
    const info = `Thank you for adding me :).`;

    let error = false;

    if (channel) {
        channel.send(`${info}${embed}`).catch(() => {
            error = true;
        })
    }


    if (!channel || error) {
        const owner = guild.owner;
        let DMChannel: DMChannel;
        if (owner) DMChannel = await owner.createDM();
        if (DMChannel) DMChannel.send(`${guild.name}: ${info}${embed}`);
    }
}

export function onGuildJoin(member: GuildMember) {
    ourServerJoin(member);
    // if (member.user.bot) return;
    const guild = member.guild;
    const channel = guild.channels.find(c => c.name.toLowerCase().includes('pony-log')) as TextChannel;
    if (!channel) return;
    let language = DataBase.getLang()[DataBase.getGuildLang(member.guild)].guild;
    const embed = new RichEmbed();

    embed.setAuthor(member.guild.name, member.guild.iconURL);
    embed.addField('Info', `${member.user.tag} ${language.join}`)
    embed.addField(language.accountAge, formatDate(member.user.createdAt))
    embed.setColor("RANDOM");
    embed.setThumbnail(member.user.avatarURL);

    if (!member.guild.iconURL) return embedSend(channel, embed);

    Jimp.read(member.guild.iconURL, (err: Error, image: any) => {
        if (err) embedSend(channel, embed);

        try {
            embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
            embedSend(channel, embed);
        } catch (err) {
            embedSend(channel, embed);
        }
    });


}
export function onGuildLeave(member: GuildMember) {
    //if (member.user.bot) return;

    const guild = member.guild;
    const channel = guild.channels.find(c => c.name.toLowerCase().includes('pony-log')) as TextChannel;
    if (!channel) return;
    let language = DataBase.getLang()[DataBase.getGuildLang(member.guild)].guild;

    const embed = new RichEmbed();
    embed.setAuthor(member.guild.name, member.guild.iconURL);
    embed.addField(language.info, `${member.user.tag} ${language.left}`)

    if (!member.guild.iconURL) return embedSend(channel, embed);

    embed.setThumbnail(member.user.avatarURL);

    Jimp.read(member.guild.iconURL, (err: Error, image: any) => {
        if (err) embedSend(channel, embed);

        try {
            embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
            embedSend(channel, embed);
        } catch (err) {
            embedSend(channel, embed);
        }
    });
}



async function backup(message: Message) {
    if (message.channel.type !== 'dm') return;
    if (message.author.id !== ownerID) return;
    if (message.content === 'backup') {
        fs.readdir(path.resolve('languages'), async (err, files) => {
            if (err) console.error('Unable to scan directory: ' + err);
            let languageNames = [];
            files.forEach(file => {
                languageNames.push(file)
            });
            const dm = await message.author.createDM().catch(err => console.error(err));
            if (dm) {
                await dm.send(`\`${languageNames.join(', ')}\``, {
                    files: [
                        path.resolve('GuildData', 'data.json')
                    ]
                }).catch(err => {
                    console.error(err)

                })
            }
        });
    } else if (message.content === 'shutdown') {
        await disableServerFeatures()
        process.exit(1);
    }
}