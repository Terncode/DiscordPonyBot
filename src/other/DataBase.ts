import { Guild, Message } from 'discord.js';
import { prefix } from './guildPrefix';
import { languages } from '@k3rn31p4nic/google-translate-api';
import { languageTranslation, isSupported, getISOCode } from './languageTranslation';
import * as fs from 'fs';
import * as path from 'path';

let language = {
    "en": require('./../../languages/en.json')
};

let data = require(path.resolve('GuildData', 'data.json'))
console.log(data)

export function setUp() {

    const lang = Object.keys(data);
    let lg = [];
    for (const id of lang) {
        lg.push(data[id].lang)
    }
    lg = lg.filter((v, i) => lg.indexOf(v) === i)

    for (const ISO of lg) {
        if (ISO === 'en') continue;

        language[ISO] = require(`./../../languages/${ISO}.json`)

    }
}


export class DataBase {

    static setPrefix(guild: Guild, prefix: string) {
        guildSetup(guild);
        const id = guild.id;
        if (!prefix) return 'prefixNotFound';
        if (prefix.length > 5) return 'prefixLimit';
        data[id].prefix = prefix.toLowerCase();
        fs.writeFile(path.resolve('GuildData', 'data.json'), JSON.stringify(data), 'utf8', e => {
            if (e) console.error(e)
            else console.log('fileWriten')
        });

        return 'prefixSuccessfully';
    }

    static setGuildLang(guild: Guild, lang: string, message?: Message) {
        guildSetup(guild);
        const id = guild.id;
        const languages = Object.keys(language);

        if (data[id].lang === true) {
            return 'translating'
        }
        else if (languages.includes(getISOCode(lang))) {
            data[id].lang = getISOCode(lang);
            fs.writeFile(path.resolve('GuildData', 'data.json'), JSON.stringify(data), 'utf8', e => {
                if (e) console.error(e)
            });


            return 'newGuildLang'
        } else if (isSupported(lang)) {
            data[id].lang = true
            langTranslationFunction(message, lang)
            return 'translating'
        }
        else return 'langNotExist'
    }

    static getPrefix(guild) {
        guildSetup(guild);
        const id = guild.id;
        const prefix = data[id].prefix;
        return `${prefix}`;
    }

    static getGuildLang(guild: Guild) {
        guildSetup(guild);
        const id = guild.id;
        return data[id].lang;
    }

    static getLang() {
        return language;
    }

}

async function langTranslationFunction(message: Message, lang: string) {
    const id = message.guild.id;
    const guildData = data;
    await languageTranslation(lang)
        .then((newLang: any) => {

            fs.writeFile(path.resolve('languages', `${getISOCode(lang)}.json`), JSON.stringify(newLang), 'utf8', e => {
                if (e) {
                    console.error(e)

                    guildData[id].lang = 'en';
                    message.channel.send('Translation Failed! language set to English')
                }
                else {
                    language[getISOCode(lang)] = newLang;
                    const id = message.guild.id;
                    guildData[id].lang = getISOCode(lang);
                    fs.writeFile(path.resolve('GuildData', 'data.json'), JSON.stringify(data), 'utf8', e => {
                        if (e) { console.error(e) }
                    });
                    message.channel.send(`Your language is now ${languages[getISOCode(lang)]}`)
                    if (newLang.language.notOffical)
                        message.channel.send(newLang.language.notOffical).catch(() => { });
                }
            });

        })
        .catch(() => {
            message.channel.send('Translation Failed! language set to English')
        })
}

function guildSetup(guild: Guild) {
    const id = guild.id;
    if (data[id] === undefined)
        data[id] = {
            prefix: '-',
            lang: 'en',
        };
}