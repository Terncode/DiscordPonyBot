import { Message, Channel, TextChannel, GuildChannel, Guild, GuildMember, RichEmbed } from 'discord.js';
import { embedSend } from '../other/sendMessage';
import { roleManager } from './roleManager';
import { client } from '..';
import { DataBase } from '../other/DataBase';
import { setMaxListeners } from 'cluster';
const Jimp = require('jimp');
const ColorThief = require('color-thief-jimp');
import * as path from 'path';
import * as fs from 'fs';
import { prefix } from '../other/guildPrefix';


const guildID = process.env.GUILD_ID;
const ownerID = process.env.OWNER_ID;


export function ourServer(message: Message) {
    if (!message.guild) return false;
    if (message.guild.id !== guildID) return false;

    if (help(message)) return true;
    removeQuietRole(message);
    autoDeleteChannel(message);
    reactArt(message);
    artBackup(message);
    reactSuggestion(message);
    if (roleManager(message)) return true;

    return false
}

export function ourServerJoin(member: GuildMember) {
    if (member.user.bot) return;
    const guild = member.guild;
    const general = guild.channels.find(c => c.name.toLowerCase().includes('general')) as TextChannel;
    const roleManager = guild.channels.find(c => c.name.toLowerCase().includes('role-manager')) as TextChannel;

    const embed = new RichEmbed();
    embed.setAuthor(guild.name, guild.iconURL)
    embed.setTitle(`${member.user.tag} Joined the server`)
    embed.addField('Welcome', `Welcome on Pony CodeLab\nUse ${roleManager} to setup your roles!`)

    embed.setThumbnail(member.user.avatarURL);

    const quietRole = guild.roles.find(r => r.name.toLowerCase().includes('quiet'));
    if (quietRole) member.addRole(quietRole).catch(err => console.error(err));

    const memberRole = guild.roles.find(r => r.name.toLowerCase().includes('member'));
    if (memberRole) member.addRole(memberRole).catch(err => console.error(err));

    if (!general || general.type === 'voice') return;
    Jimp.read(member.guild.iconURL, (err: Error, image: any) => {
        if (err) embedSend(general, embed)

        try {
            embed.setColor(parseInt(ColorThief.getColorHex(image), 16));
            embedSend(general, embed)
        } catch (err) {
            embedSend(general, embed);
        }
    });
}

export function shutDownMessage() {
    return new Promise(async (resolve, reject) => {
        const guild = client.guilds.find(g => g.id === guildID);
        const botLogs = guild.channels.find(c => c.name.toLowerCase().includes('bot-logs') && c.type === 'text') as TextChannel;
        if (botLogs) await botLogs.send('Bot successfully shut down').catch(err => console.error(err));
        console.info("Bot successfully shut down");
        resolve('ok');
    });
}

export function bootMessage(version: string) {
    const guild = client.guilds.find(g => g.id === guildID);
    const botLogs = guild.channels.find(c => c.name.toLowerCase().includes('bot-logs') && c.type === 'text') as TextChannel;
    if (botLogs) botLogs.send(`Bot booted version: \`${version}\``).catch(err => console.error(err));
    console.info(`Bot booted version: ${version}`);
}

export function disableServerFeatures() {
    return new Promise(async (resolve, reject) => {

        const guild = client.guilds.find(g => g.id === guildID);

        const deleteChannels = guild.channels.filter(c => c.name.toLowerCase().includes('auto-delete') && c.type === 'text').map(c => c) as TextChannel[];
        const roleManager = guild.channels.find(c => c.name.toLowerCase().includes('role-manager') && c.type === 'text');
        const deffaultRole = guild.defaultRole;


        for (const deleteChannel of deleteChannels) {
            await deleteChannel.overwritePermissions(deffaultRole, { 'SEND_MESSAGES': false, }, 'Bot ShutDown')
                .then(() => console.log(deleteChannel.name + ' disabled sending message'))
                .catch(err => console.error(err));

            const messages = await deleteChannel.fetchMessages({ limit: 100 }).catch(err => console.log(err))
            if (!messages) continue;

            const messageMap = messages.map(m => m);

            if (messageMap.length !== 0) {
                messageMap.forEach(message => {
                    if (message.deletable) message.delete().catch(err => console.log(err));
                });
            }

        }

        if (roleManager)
            await roleManager.overwritePermissions(deffaultRole, { 'SEND_MESSAGES': false, }, 'Bot ShutDown')
                .then(() => console.log(roleManager.name + ' disabled sending message'))
                .catch(err => console.error(err));
        await roleManager.setTopic("Bot offline. Channel dosen't work")
            .then(() => { console.log(roleManager.name + " Topic Changed to 'Bot offline. Channel dosen't work'") })
            .catch(err => console.error(err))


        //sendbackup file
        //const owner = client.users.find(u => u.id === ownerID)
        const owner = null
        if (owner) {
            await fs.readdir(path.resolve('languages'), async (err, files) => {
                if (err) console.error('Unable to scan directory: ' + err);
                let languageNames = [];
                files.forEach(file => {
                    languageNames.push(file)
                });
                const dm = await owner.createDM().catch(err => console.error(err));
                if (dm) {
                    await dm.send(`\`${languageNames.join(', ')}\``, {
                        files: [
                            path.resolve('GuildData', 'data.json')
                        ]
                    }).then(() => { resolve('ok'); })
                        .catch(err => {
                            console.error(err)
                            resolve('cannot send but ok');
                        })
                }
            });

        } else {
            resolve('ok');
        }

    });
}


export function enableServerFeature() {
    return new Promise(async (resolve, reject) => {

        const guild = client.guilds.find(g => g.id === guildID);
        console.log('Configuring guild' + guild.name)

        const deleteChannels = guild.channels.filter(c => c.name.toLowerCase().includes('auto-delete') && c.type === 'text').map(c => c);
        const roleManager = guild.channels.find(c => c.name.toLowerCase().includes('role-manager') && c.type === 'text');
        const deffaultRole = guild.defaultRole;

        if (deleteChannels.length !== 0)
            for (const deleteChannel of deleteChannels) {
                await deleteChannel.overwritePermissions(deffaultRole, { 'SEND_MESSAGES': true, }, 'Bot ShutDown')
                    .then(() => console.log(deleteChannel.name + ' enabled sending message'))
                    .catch(err => console.error(err));
            }

        if (roleManager)
            await roleManager.overwritePermissions(deffaultRole, { 'SEND_MESSAGES': true, }, 'Bot ShutDown')
                .then(() => console.log(roleManager.name + ' enabled sending message'))
                .catch(err => console.error(err));
        const guildPrefix = DataBase.getPrefix(guild);
        await roleManager.setTopic(`${guildPrefix}role[add / remove / request / suggest][Role name]`)
            .then(() => { console.log(roleManager.name + ` Topic Changed to '${guildPrefix}role [add/remove/request/suggest] [Role name]'`) })
            .catch(err => console.error(err))
        resolve('ok');
    });
}



function reactArt(message: Message) {
    const channel = message.channel as GuildChannel;
    if (!channel.name.toLowerCase().includes('art') || message.attachments.size === 0) return;

    message.react("👍");
    setTimeout(() => {
        message.react("👌");
    }, 500);
    setTimeout(() => {
        let neat = message.guild.emojis.find(r => r.name.toLowerCase() === "neat");
        if (neat != undefined)
            message.react(neat).catch(() => { });
    }, 100);
    return;
}

function reactSuggestion(message: Message) {
    const channel = message.channel as GuildChannel;
    if (!channel.name.toLowerCase().includes('suggestions')) return false;

    if (message.content.length < 10) return false;

    message.react("👍");
    setTimeout(() => {
        message.react("👎");
    }, 500);

    return false;
}


function autoDeleteChannel(message: Message) {
    const channel = message.channel as GuildChannel;
    if (!channel.name.toLowerCase().includes('auto-delete')) return

    const channelName = channel.name.toLowerCase().replace(/auto-delete|[-]/g, '')
    const time = parseInt(channelName);
    if (isNaN(time)) return false;

    if (channelName.includes('sec') && time > 5) deleteOnTime(message, time);
    else if (channelName.includes('min')) deleteOnTime(message, time * 60);
}

function deleteOnTime(message, time) {
    const timeEmoji = ["🕛", "🕘", "🕕", "🕒"];
    const endEmoji = "❌";

    time *= 1000;

    let timeSplit = time / timeEmoji.length;

    for (let i in timeEmoji) {
        setTimeout(() => {
            message.react(timeEmoji[i]).catch(() => { });
        }, timeSplit * parseInt(i));
    }

    setTimeout(() => {
        message.react(endEmoji);
    }, time - 5000);

    setTimeout(() => {
        message.delete().catch(() => {
            message.channel.send('No permission to delete message :cry:').catch(() => { });
        });
    }, time);

    return true;
}

function artBackup(message: Message) {
    const channel = message.channel as GuildChannel;
    const guild = message.guild as Guild;

    if (!channel.name.toLowerCase().includes('art'))
        return false;

    if (message.attachments.size === 0) return false;

    const backupChannel = guild.channels.find(c => c.name.toLowerCase().includes('backup')) as TextChannel;
    if (!backupChannel || backupChannel.type === 'voice') return;


    const attachments = message.attachments

    let url: string[] = [];
    attachments.forEach(e => {
        url.push(e.url);
    });
    backupChannel.send(`${message.author.tag}\n ${url.join('\n')}`).catch(err => console.error(err));
}

function removeQuietRole(message: Message) {

    const guild = message.guild;
    const user = message.author;
    const guildMember = guild.members.find(m => m.id === user.id)
    const quietRole = guildMember.roles.find(r => r.name.toLowerCase().includes('quiet'))

    if (quietRole) guildMember.removeRole(quietRole).catch(() => { });

}

function help(message: Message) {
    const p = prefix(message).toLowerCase();
    if (!p) return false;
    if (p !== 'help') return false;

    const language = message.guild ? DataBase.getLang()[DataBase.getGuildLang(message.guild)].help : DataBase.getLang()['en'].help;
    let guildPrefix = '';
    if (message.guild) guildPrefix = DataBase.getPrefix(message.guild)
    const embed = new RichEmbed();
    embed.setColor("WHITE");
    if (message.guild) embed.setAuthor(message.guild.name, message.guild.iconURL);
    const roleManager = message.guild.channels.find(c => c.name.toLowerCase().includes('role-manager')) as TextChannel;

    const helpInfo = [
        `${guildPrefix}help - Shows this`,
        `${guildPrefix}hugs [user] - hugs user or you`,
        `${guildPrefix}boops [user] - boobs user or you`,
        `${guildPrefix}roll [min-[max]] - randomize a number`,
        `${guildPrefix}joke [category] - Tells you random joke`,
        `${guildPrefix}fact [category] - Tells you random fact`,
        `${guildPrefix}translate - [language] [message] - translate message to given lanugage`,
        `${guildPrefix}derpibooru - [tags,tags] - gives you random image from derpibooru`,
        `${guildPrefix}stats - [server/bot/user] - shows stats`,
        `${guildPrefix}ud [word] - get explanation from urbandictionary.com`,
        `${guildPrefix}define [word] - gives definition of word`,
        `${guildPrefix}role [add/remove] - add or remove roles work only in ${roleManager}`,
    ]



    embed.addField(language.help, helpInfo.join('\n'))

    embedSend(message.channel, embed);
    return true;
}