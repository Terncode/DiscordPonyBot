import { Guild, Message } from 'discord.js';
export declare function setUp(): void;
export declare class DataBase {
    static setPrefix(guild: Guild, prefix: string): "prefixNotFound" | "prefixLimit" | "prefixSuccessfully";
    static setGuildLang(guild: Guild, lang: string, message?: Message): "translating" | "newGuildLang" | "langNotExist";
    static getPrefix(guild: any): string;
    static getGuildLang(guild: Guild): any;
    static getLang(): {
        "en": any;
    };
}
