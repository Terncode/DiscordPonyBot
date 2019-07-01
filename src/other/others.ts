import { Message } from 'discord.js';
import { prefix } from './guildPrefix';
import { DataBase } from './DataBase';

export function others(message: Message): boolean {
    const p = prefix(message).toLowerCase();
    if (!p) return false;
    if (!p.startsWith('boop') && !p.startsWith(')')
        && !p.startsWith('hug')) return false;
    let language = message.guild ? DataBase.getLang()[DataBase.getGuildLang(message.guild)].other : DataBase.getLang()['en'].other;

    if (p.startsWith('boop ') || p.startsWith(') ') ||
        p.startsWith('boops ') || p === 'boop' || p === 'boops' || p === ')') {
        const user = message.mentions.users.first()
        if (user) message.channel.send(`${language.boops} ${user}`).catch(() => { });
        else message.channel.send(`${language.boops} ${message.author}`).catch(() => { });
    } else if (p.startsWith('hug ') || p.startsWith('hug ') || p === 'hug' || p === 'hugs') {

        const user = message.mentions.users.first();
        if (user) message.channel.send(`${language.hugs} ${user}`).catch(() => { });
        else message.channel.send(`${language.hugs} ${message.author}`).catch(() => { });

    }



    return true;
}