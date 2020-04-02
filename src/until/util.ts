import { PermissionResolvable, Channel, TextChannel, User, Client, Message } from 'discord.js';
import { config } from '..';

export function hasPermissionInChannel(channel: Channel, permissionResolvable: PermissionResolvable): boolean {
    if (channel.type === 'dm') {
        switch (permissionResolvable) {
            case 'EMBED_LINKS':
            case 'EXTERNAL_EMOJIS':
            case 'SEND_MESSAGES':
            case 'ADD_REACTIONS':
                return true;
            default:
                return false;
        }
    } else if (channel.type === 'text') {
        const guildChannel = channel as TextChannel;
        const me = guildChannel.guild.me;
        if (!me) return false;
        const permissions = guildChannel.permissionsFor(me);
        return permissions ? permissions.has(permissionResolvable) : false;
    } else return false;
}

export function isBotOwner(user: User): boolean {
    const owner = getBotOwner(user.client);
    if (!owner) return false;
    return user.equals(owner);
}

export function getBotOwner(client: Client) {
    return client.users.cache.find(u => u.id === config.OWNER_ID);
}

export function removeFirstWord(text: string): string {
    text = text.replace(/ +(?= )/g, '').trim();
    const spaceIndex = text.indexOf(' ');
    if (spaceIndex === -1) return '';
    return text.slice(spaceIndex).trim();
}

export function extractMessage(messages: Message | Message[], callback: (message: Message) => void) {
    if (Array.isArray(messages)) for (const msg of messages) callback(msg);
    else callback(messages);
}
