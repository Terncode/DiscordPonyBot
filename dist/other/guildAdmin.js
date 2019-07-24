"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guildPrefix_1 = require("./guildPrefix");
const DataBase_1 = require("./DataBase");
function guildAdmin(message) {
    const channel = message.channel;
    if (channel.type !== 'text' && !message.guild)
        return false;
    const p = guildPrefix_1.prefix(message);
    if (!p)
        return false;
    let lang = DataBase_1.DataBase.getGuildLang(message.guild);
    let command = p.trim();
    if (p.indexOf(' ') !== -1)
        command = p.slice(0, p.indexOf(" ")).toLowerCase().trim();
    let language = DataBase_1.DataBase.getLang()[lang].guildAdmin;
    let msgType;
    switch (command) {
        case 'setprefix':
            message.channel.send('WARN THIS FEATURE IS STILL IN DEVELOPMENT!');
            if (!message.member.hasPermission("ADMINISTRATOR"))
                return message.channel.send(language.notAdmin);
            msgType = DataBase_1.DataBase.setPrefix(message.guild, p.slice(command.length, p.length).trim());
            if (msgType === 'prefixSuccessfully')
                message.channel.send(`${language[msgType]} \`${DataBase_1.DataBase.getPrefix(message.guild)}\``);
            else
                message.channel.send(`${language[msgType]} `);
            break;
        case 'setlang':
            message.channel.send('WARN THIS FEATURE IS STILL IN DEVELOPMENT!');
            if (!message.member.hasPermission("ADMINISTRATOR"))
                return message.channel.send(language.notAdmin);
            msgType = DataBase_1.DataBase.setGuildLang(message.guild, p.slice(command.length, p.length).trim(), message);
            if (msgType === "langNotExist")
                return message.channel.send(`This language does not exist or is not available!`);
            if (msgType === "translating")
                return message.channel.send(`Please wait I am translating your language`);
            else {
                lang = DataBase_1.DataBase.getGuildLang(message.guild);
                language = DataBase_1.DataBase.getLang()[lang].guildAdmin;
                let langName = DataBase_1.DataBase.getLang()[lang].language.name;
                message.channel.send(`${language[msgType]}: ${langName}`);
                const notOffical = DataBase_1.DataBase.getLang()[lang].language.notOffical;
                if (notOffical)
                    message.channel.send(notOffical).catch(() => { });
            }
            ;
            break;
        case 'adminhelp':
            message.channel.send('WARN THIS FEATURE IS STILL IN DEVELOPMENT!');
            const pf = DataBase_1.DataBase.getPrefix(message.guild);
            message.channel.send(`\`${pf}setprefix <prefix>\`\n\`${pf}setlang <langname>\``).catch(() => { });
            break;
        default:
            return;
    }
}
exports.guildAdmin = guildAdmin;
//# sourceMappingURL=guildAdmin.js.map