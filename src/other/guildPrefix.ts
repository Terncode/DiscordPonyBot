import { Message } from 'discord.js';
import { DataBase } from './DataBase';

export function prefix(message: Message) {
    let content = message.content;
    if (!message.guild) return content;
    const prefix = DataBase.getPrefix(message.guild);
    if (!content.toLowerCase().startsWith(prefix)) return '';
    return content.slice(prefix.length, content.length);
}