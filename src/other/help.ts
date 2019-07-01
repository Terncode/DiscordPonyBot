import { Message, RichEmbed } from 'discord.js';
import { prefix } from './guildPrefix';
import { DataBase } from './DataBase';
import { embedSend } from './sendMessage';


export function help(message: Message): boolean {
    const p = prefix(message).toLowerCase();
    if (!p) return false;
    if (p !== 'help') return false;

    const language = message.guild ? DataBase.getLang()[DataBase.getGuildLang(message.guild)].help : DataBase.getLang()['en'].help;
    let guildPrefix = '';
    if (message.guild) guildPrefix = DataBase.getPrefix(message.guild)
    const embed = new RichEmbed();
    embed.setColor("WHITE");
    if (message.guild) embed.setAuthor(message.guild.name, message.guild.iconURL);
    embed.setTitle(language.help)

    let commands = '';
    commands += `${guildPrefix}help ${language.commands}.\n`;

    if (language.derpibooru) commands += `${guildPrefix}depibooru ${language.derpibooru}.\n`;
    if (language.randomFace) commands += `${guildPrefix}rd ${language.randomFace}.\n`;
    if (language.wordDeinition) commands += `${guildPrefix}define ${language.wordDeinition}.\n`;
       //@ts-ignore
    if (message.channel.nsfw &&language.urbanDictonary) commands += `${guildPrefix}ud ${language.urbanDictonary}.\n`;
    if (language.translate) commands += `${guildPrefix}translate ${language.translate}.\n`;
    if (language.fact) commands += `${guildPrefix}fact ${language.fact}.\n`;
    if (language.joke) commands += `${guildPrefix}joke ${language.joke}.\n`;
    if (language.hugsYou) commands += `${guildPrefix}hugs ${language.hugsYou}.\n`;
    if (language.boopsYou) commands += `${guildPrefix}boops ${language.boopsYou}.\n`;

    //pt changelog 
    embed.addField(language.commands, commands)

    embedSend(message.channel, embed);
    return true;
}
