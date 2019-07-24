import { TextChannel, RichEmbed, DMChannel, GroupDMChannel } from 'discord.js';
export declare function embedSend(channel: TextChannel | DMChannel | GroupDMChannel, embed: any): void;
export declare function addClient(embed: RichEmbed): RichEmbed;
export declare function errorEmbed(text: string): RichEmbed;
export declare function infoEmbed(text: string): RichEmbed;
