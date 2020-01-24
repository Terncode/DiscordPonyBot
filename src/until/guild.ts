import { Guild, GuildMember, Collection, TextChannel, Client } from 'discord.js';
import { Language } from '../language/langTypes';
import { ENGLISH } from '../language/English';
import { config } from '..';
import { MongoGuild } from './databaseSchemas';
import { guildFind, getGuildsInDataBase, removeGuildFromDataBase } from './database';
import * as path from 'path';
import * as fs from 'fs';
const languageFolder = path.join(__dirname, '../../languages');

interface Guilds {
    [key: string]: {
        prefix: string;
        language: string;
        swearPrevention: boolean;
        autoConversion: boolean;
    };
}
interface Languages {
    [key: string]: Language;
}

const languages: Languages = {};
languages[ENGLISH.iso] = ENGLISH;

const guilds: Guilds = {};

export function getPrefix(guild?: Guild) {
    if (!guild) return config.PREFIX;
    return guilds[guild.id].prefix || config.PREFIX;
}

export function getLanguage(guild?: Guild): Language {
    if (!guild) return ENGLISH;
    const iso = guilds[guild.id].language;
    return languages[iso] || ENGLISH;
}

export function createGuildDataBase(guild: Guild): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        const id = guild.id;
        if (!guild.id) {
            throw new Error('Guild does not have ID');
        }
        const mongoGuild = await guildFind(id).catch(err => reject(err));
        if (mongoGuild) resolve(false);

        const post = new MongoGuild(
            {
                id,
                language: ENGLISH.iso,
                prefix: config.PREFIX,
                swearPrevention: false,
                autoConversion: false,
                ptUpdateChannels: [],
                imageDeliveryUpdatesChannels: [],
            });

        post.save((err: any) => {
            if (err) {
                reject(err);
                return;
            } else guild.client.emit('debug', `Guild ${guild.name} | ${guild.id} has been stored in database`);
            resolve(true);
            return;
        });
    });
}

export function changeGuildPrefix(guild: Guild, prefix: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        prefix = prefix.toLowerCase().replace(/ /g, '');
        try {
            const guildDB = await guildFind(guild.id);
            if (!guildDB) return reject(new Error('Unable to find guild'));
            guildDB.prefix = prefix;
            await guildDB.save();
            guilds[guild.id].prefix = prefix;
            resolve(prefix);
        } catch (error) {
            reject(error);
        }
    });
}

export function changeGuildLanguage(guild: Guild, lang: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        lang = lang.toLowerCase();
        try {
            if (languages[lang]) {
                if (guilds[guild.id].language === languages[lang].iso) return resolve(false);
                const guildDB = await guildFind(guild.id);
                if (!guildDB) return reject(new Error('Unable to find guild'));
                guildDB.language = languages[lang].iso;
                guilds[guild.id].language = languages[lang].iso;
                await guildDB.save();
                resolve(true);
            } else {
                const keys = Object.keys(languages);
                for (const key of keys) {
                    if (languages[key].fullName.toLowerCase().replace(/ /g, '-') === lang) {
                        if (guilds[guild.id].language === languages[key].iso) return resolve(false);
                        const guildDB = await guildFind(guild.id);
                        if (!guildDB) return reject(new Error('Unable to find guild'));
                        guildDB.language = languages[key].iso;
                        guilds[guild.id].language = languages[key].iso;
                        await guildDB.save();
                        resolve(true);
                        break;
                    }
                }
                reject();
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function loadLanguages(): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.readdir(languageFolder, (err, data) => {
            if (err) return reject(err);
            for (const lang of data.filter(d => /\.json$/g.test(d))) {
                try {
                    const language: Language = require(`${path.join(__dirname, `../../languages/${lang}`)}`);
                    if (language.iso && language.fullName && verifyLanguage(language)) {
                        languages[language.iso] = language;
                    }
                } catch (_) {
                    console.error(`Language file not loaded ${lang}`);
                }
            }
            resolve();
        });
    });
}

function verifyLanguage(language: Language): boolean {
    const keys = Object.keys(ENGLISH);
    for (const key of keys) {
        // @ts-ignore
        if (!(language[key] && typeof ENGLISH[key] === typeof language[key])) {
            console.warn(`Corrupted Language ${language.fullName}`);
            return false;
        }
    }
    return true;

}

export function enableDisableGuildAutoConversion(guild: Guild, bool: boolean): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            if (bool === guilds[guild.id].autoConversion) return resolve(false);
            const guildDB = await guildFind(guild.id);
            if (!guildDB) return reject(new Error('Unable to find guild'));

            guildDB.autoConversion = bool;
            guilds[guild.id].autoConversion = bool;
            await guildDB.save();
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

export function enableDisableGuildSwearPrevention(guild: Guild, bool: boolean): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            if (bool === guilds[guild.id].swearPrevention) return resolve(false);
            const guildDB = await guildFind(guild.id);
            if (!guildDB) return reject(new Error('Unable to find guild'));
            guildDB.swearPrevention = bool;
            guilds[guild.id].swearPrevention = bool;
            await guildDB.save();
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}
export function getAvailableLanguages(smallNames = false) {
    const keys = Object.keys(languages);
    const availableLanguages: string[] = [];

    for (const key of keys) {
        availableLanguages.push(languages[key].fullName.replace(/ /g, '-').toLowerCase());
        if (smallNames) availableLanguages.push(languages[key].iso.replace(/ /g, '-').toLowerCase());
    }
    return availableLanguages;
}

export function setup(client: Client): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            await checkForMissingGuildAndAddItToDataBase(client);
            await garbageCollectGuildsFromDataBase(client);
            await removeDeletedChannelsFromSubscriptions(client);
            const guildsDB = await getGuildsInDataBase();
            guildsDB.forEach(g => {
                guilds[g.id] = {
                    language: g.language,
                    prefix: g.prefix,
                    swearPrevention: g.swearPrevention,
                    autoConversion: g.autoConversion,
                };
            });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function checkForMissingGuildAndAddItToDataBase(client: Client): Promise<void> {
    return new Promise(async (resolve, reject) => {

        try {
            const guildsDB = await getGuildsInDataBase();
            const guildIDs = guildsDB.map(g => g.id);
            const guildsClient = client.guilds.map(g => g);
            for (const guildClient of guildsClient) {
                if (!guildIDs.includes(guildClient.id)) {
                    await createGuildDataBase(guildClient);
                }
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function garbageCollectGuildsFromDataBase(client: Client): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const guildsDB = await getGuildsInDataBase();
            const guildsClient = client.guilds.map(g => g.id);
            for (const guildDB of guildsDB) {
                if (!guildsClient.includes(guildDB.id)) {
                    await removeGuildFromDataBase(guildDB.id);
                }
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });

}

function removeDeletedChannelsFromSubscriptions(client: Client) {
    return new Promise(async (resolve, reject) => {
        try {
            const guildsDB = await getGuildsInDataBase();
            let shouldUpdate = false;
            for (const guildDB of guildsDB) {
                const guild = client.guilds.find(g => g.id === guildDB.id);
                const channelsIDs = guild.channels.filter(c => c.type === 'text').map(c => c.id);

                const ptUpdateChannels = [...guildDB.ptUpdateChannels];
                for (const id of guildDB.ptUpdateChannels) {
                    if (!channelsIDs.includes(id)) {
                        const index = ptUpdateChannels.indexOf(id);
                        if (index !== -1) {
                            ptUpdateChannels.splice(index, 1);
                            shouldUpdate = true;
                        }
                    }
                }

                const imageDeliveryChannels = [...guildDB.imageDeliveryChannels];
                for (const id of guildDB.imageDeliveryChannels) {
                    if (!channelsIDs.includes(id)) {
                        const index = imageDeliveryChannels.indexOf(id);
                        if (index !== -1) {
                            imageDeliveryChannels.splice(index, 1);
                            shouldUpdate = true;
                        }
                    }
                }
                if (shouldUpdate) {
                    guildDB.ptUpdateChannels = ptUpdateChannels;
                    guildDB.imageDeliveryChannels = imageDeliveryChannels;
                    await guildDB.save();
                }
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// returns false if it is already on list
export function addImageDeliveryChannel(guild: Guild, channel: TextChannel): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        if (channel.type !== 'text') {
            reject(new Error('Invalid Channel'));
            return;
        }
        try {
            const guildDB = await guildFind(guild.id);
            if (!guildDB) return reject(new Error('Unable to find guild'));
            if (guildDB.imageDeliveryChannels.includes(channel.id)) {
                return resolve(false);
            }
            guildDB.imageDeliveryChannels.push(channel.id);
            await guildDB.save();
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

// returns false if it is already on list
export function addPTUpdateChannel(guild: Guild, channel: TextChannel): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            const guildDB = await guildFind(guild.id);
            if (!guildDB) return reject(new Error('Unable to find guild'));
            if (guildDB.ptUpdateChannels.includes(channel.id)) {
                return resolve(false);
            }
            guildDB.ptUpdateChannels.push(channel.id);
            await guildDB.save();
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

export function removePTUpdateChannel(guild: Guild, id: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            const guildDB = await guildFind(guild.id);
            if (!guildDB) return reject(new Error('Unable to find guild'));
            const index = guildDB.ptUpdateChannels.indexOf(id);
            if (index === -1) {
                resolve(false);
                return;
            }
            guildDB.ptUpdateChannels.splice(index, 1);
            await guildDB.save();
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

export function removeImageDeliveryChannel(guild: Guild, id: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            const guildDB = await guildFind(guild.id);
            if (!guildDB) return reject(new Error('Unable to find guild'));
            const index = guildDB.imageDeliveryChannels.indexOf(id);
            if (index === -1) {
                resolve(false);
                return;
            }
            guildDB.imageDeliveryChannels.splice(index, 1);
            await guildDB.save();
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

export function getAllPTUpdateChannels(client: Client): Promise<TextChannel[]> {
    return new Promise(async (resolve, reject) => {
        const channels: TextChannel[] = [];
        try {
            const guildsDB = await getGuildsInDataBase();
            for (const guildDB of guildsDB) {
                const guild = client.guilds.find(g => g.id === guildDB.id);
                if (!guild) continue;
                for (const ptChannel of guildDB.ptUpdateChannels) {
                    const channel = guild.channels.find(c => c.id === ptChannel && c.type === 'text') as TextChannel;
                    if (channel) channels.push(channel);
                }
            }
            resolve(channels);
        } catch (error) {
            reject(error);
        }
    });
}

export function getALLImageDeliveryChannels(client: Client): Promise<TextChannel[]> {
    return new Promise(async (resolve, reject) => {
        const channels: TextChannel[] = [];
        try {
            const guildsDB = await getGuildsInDataBase();
            for (const guildDB of guildsDB) {
                const guild = client.guilds.find(g => g.id === guildDB.id);
                if (!guild) continue;
                for (const imageDeliveryChannel of guildDB.imageDeliveryChannels) {
                    const channel = guild.channels.find(c => c.id === imageDeliveryChannel && c.type === 'text') as TextChannel;
                    if (channel) channels.push(channel);
                }
            }
            resolve(channels);
        } catch (error) {
            reject(error);
        }
    });
}

export function isSwearPreventionEnabled(guild: Guild) {
    return guilds[guild.id].swearPrevention;
}

export function isAutoConversionEnabled(guild: Guild) {
    return guilds[guild.id].autoConversion;
}

export function findGuildMembers(query: string, guild: Guild) {
    const finders = [
        (g: GuildMember) => g.displayName === query,
        (g: GuildMember) => g.displayName.toLowerCase() === query.toLowerCase(),
        (g: GuildMember) => g.displayName.includes(query),
        (g: GuildMember) => g.displayName.toLowerCase().includes(query.toLowerCase()),
        (g: GuildMember) => g.user.username === query,
        (g: GuildMember) => g.user.username.toLowerCase() === query.toLowerCase(),
        (g: GuildMember) => g.user.tag === query,
        (g: GuildMember) => g.user.tag.toLowerCase() === query.toLowerCase(),
        (g: GuildMember) => g.user.username.includes(query),
        (g: GuildMember) => g.user.username.toLowerCase().includes(query.toLowerCase()),
        (g: GuildMember) => g.user.tag.includes(query),
        (g: GuildMember) => g.user.tag.toLowerCase().includes(query.toLowerCase()),
    ];
    let guildMember: Collection<string, GuildMember> | null = null;
    for (const finder of finders) {
        guildMember = guild.members.filter(finder);
        if (guildMember.size) break;
    }
    return guildMember ? guildMember.map(g => g) : null;
}
