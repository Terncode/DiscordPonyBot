

import { Message, RichEmbed, Channel, Guild } from 'discord.js';
import { prefix } from './guildPrefix';
import { embedSend, errorEmbed, infoEmbed } from './sendMessage';
import { DataBase } from './DataBase';


export function guildAdmin(message: Message) {

    const channel = message.channel;
    if (channel.type !== 'text' && !message.guild) return false;
    const p = prefix(message);

    if (!p) return false
    let lang = DataBase.getGuildLang(message.guild);

    let command = p.trim();
    if (p.indexOf(' ') !== -1)
        command = p.slice(0, p.indexOf(" ")).toLowerCase().trim();
    let language = DataBase.getLang()[lang].guildAdmin;



    let msgType;

    switch (command) {
        case 'setprefix':
            message.channel.send('WARN THIS FEATURE IS STILL IN DEVELOPMENT!')
            if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(language.notAdmin);
            msgType = DataBase.setPrefix(message.guild, p.slice(command.length, p.length).trim());

            if (msgType === 'prefixSuccessfully') message.channel.send(`${language[msgType]} \`${DataBase.getPrefix(message.guild)}\``);
            else message.channel.send(`${language[msgType]} `);

            break;
        case 'setlang':
            message.channel.send('WARN THIS FEATURE IS STILL IN DEVELOPMENT!')
            if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(language.notAdmin);
            msgType = DataBase.setGuildLang(message.guild, p.slice(command.length, p.length).trim(), message);
            if (msgType === "langNotExist") return message.channel.send(`This language does not exist or is not available!`);
            if (msgType === "translating") return message.channel.send(`Please wait I am translating your language`);
            else {
                lang = DataBase.getGuildLang(message.guild);
                language = DataBase.getLang()[lang].guildAdmin;
                let langName = DataBase.getLang()[lang].language.name;
                message.channel.send(`${language[msgType]}: ${langName}`)
                const notOffical = DataBase.getLang()[lang].language.notOffical
                if (notOffical)
                    message.channel.send(notOffical).catch(() => { })
            };
            break;
        case 'adminhelp':
            message.channel.send('WARN THIS FEATURE IS STILL IN DEVELOPMENT!')
            const pf = DataBase.getPrefix(message.guild)
            message.channel.send(`\`${pf}setprefix <prefix>\`\n\`${pf}setlang <langname>\``).catch(() => { });
            break;
        default:
            return;
    }

}





