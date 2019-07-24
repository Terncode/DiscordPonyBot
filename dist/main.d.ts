import { Message, Guild, GuildMember } from 'discord.js';
export declare function onMessage(message: Message): Promise<Message | Message[]>;
export declare function clientGuildJoin(guild: Guild): Promise<void>;
export declare function onGuildJoin(member: GuildMember): void;
export declare function onGuildLeave(member: GuildMember): void;
