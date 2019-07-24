import { Message, GuildMember } from 'discord.js';
export declare function ourServer(message: Message): boolean;
export declare function ourServerJoin(member: GuildMember): void;
export declare function shutDownMessage(): Promise<unknown>;
export declare function bootMessage(version: string): void;
export declare function disableServerFeatures(): Promise<unknown>;
export declare function enableServerFeature(): Promise<unknown>;
