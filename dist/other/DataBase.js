"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_translate_api_1 = require("@k3rn31p4nic/google-translate-api");
const languageTranslation_1 = require("./languageTranslation");
const fs = require("fs");
const path = require("path");
let language = {
    "en": require('./../../languages/en.json')
};
let data = require(path.resolve('GuildData', 'data.json'));
console.log(data);
function setUp() {
    const lang = Object.keys(data);
    let lg = [];
    for (const id of lang) {
        lg.push(data[id].lang);
    }
    lg = lg.filter((v, i) => lg.indexOf(v) === i);
    for (const ISO of lg) {
        if (ISO === 'en')
            continue;
        language[ISO] = require(`./../../languages/${ISO}.json`);
    }
}
exports.setUp = setUp;
class DataBase {
    static setPrefix(guild, prefix) {
        guildSetup(guild);
        const id = guild.id;
        if (!prefix)
            return 'prefixNotFound';
        if (prefix.length > 5)
            return 'prefixLimit';
        data[id].prefix = prefix.toLowerCase();
        fs.writeFile(path.resolve('GuildData', 'data.json'), JSON.stringify(data), 'utf8', e => {
            if (e)
                console.error(e);
            else
                console.log('fileWriten');
        });
        return 'prefixSuccessfully';
    }
    static setGuildLang(guild, lang, message) {
        guildSetup(guild);
        const id = guild.id;
        const languages = Object.keys(language);
        if (data[id].lang === true) {
            return 'translating';
        }
        else if (languages.includes(languageTranslation_1.getISOCode(lang))) {
            data[id].lang = languageTranslation_1.getISOCode(lang);
            fs.writeFile(path.resolve('GuildData', 'data.json'), JSON.stringify(data), 'utf8', e => {
                if (e)
                    console.error(e);
            });
            return 'newGuildLang';
        }
        else if (languageTranslation_1.isSupported(lang)) {
            data[id].lang = true;
            langTranslationFunction(message, lang);
            return 'translating';
        }
        else
            return 'langNotExist';
    }
    static getPrefix(guild) {
        guildSetup(guild);
        const id = guild.id;
        const prefix = data[id].prefix;
        return `${prefix}`;
    }
    static getGuildLang(guild) {
        guildSetup(guild);
        const id = guild.id;
        return data[id].lang;
    }
    static getLang() {
        return language;
    }
}
exports.DataBase = DataBase;
async function langTranslationFunction(message, lang) {
    const id = message.guild.id;
    const guildData = data;
    await languageTranslation_1.languageTranslation(lang)
        .then((newLang) => {
        fs.writeFile(path.resolve('languages', `${languageTranslation_1.getISOCode(lang)}.json`), JSON.stringify(newLang), 'utf8', e => {
            if (e) {
                console.error(e);
                guildData[id].lang = 'en';
                message.channel.send('Translation Failed! language set to English');
            }
            else {
                language[languageTranslation_1.getISOCode(lang)] = newLang;
                const id = message.guild.id;
                guildData[id].lang = languageTranslation_1.getISOCode(lang);
                fs.writeFile(path.resolve('GuildData', 'data.json'), JSON.stringify(data), 'utf8', e => {
                    if (e) {
                        console.error(e);
                    }
                });
                message.channel.send(`Your language is now ${google_translate_api_1.languages[languageTranslation_1.getISOCode(lang)]}`);
                if (newLang.language.notOffical)
                    message.channel.send(newLang.language.notOffical).catch(() => { });
            }
        });
    })
        .catch(() => {
        message.channel.send('Translation Failed! language set to English');
    });
}
function guildSetup(guild) {
    const id = guild.id;
    if (data[id] === undefined)
        data[id] = {
            prefix: '-',
            lang: 'en',
        };
}
//# sourceMappingURL=DataBase.js.map