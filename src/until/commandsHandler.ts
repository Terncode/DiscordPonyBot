import { Message } from 'discord.js';
import { getPrefix } from './guild';

export function checkCommand(message: Message, aliases: string[] | string): boolean {
    const prefix = getPrefix(message.guild);
    const content = message.content.toLowerCase().replace(/ +(?= )/g, '').trim();
    if (!content.startsWith(prefix.toLowerCase())) return false;
    const contentPrefix = content.slice(prefix.length);
    if (contentPrefix.charAt(0) === ' ') return false;
    const args = contentPrefix.split(' ');
    if (Array.isArray(aliases)) return !!aliases.find(a => a.toLowerCase() === args[0].toLowerCase());
    return aliases.toLowerCase() === args[0].toLowerCase();
}

export function getCommandArgs(message: Message, caseSensitive = false): string[] {
    const content = message.content.replace(/ +(?= )/g, ' ').trim();
    const args = [...content.split(' ')].filter(a => a);
    args.shift();
    if (caseSensitive) return args;
    return args.map(p => p.toLowerCase());
}

export function startsWithPrefix(message: Message): boolean {
    const prefix = getPrefix(message.guild);
    return message.content.toLowerCase().startsWith(prefix.toLowerCase());
}

export function removePrefixAndCommand(message: Message): string {
    const content = message.content.replace(/ +(?= )/g, '').trim();
    const spaceIndex = content.indexOf(' ');
    if (spaceIndex === -1) return '';
    return content.slice(spaceIndex).trim();
}
