"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transalte = require("@k3rn31p4nic/google-translate-api");
const google_translate_api_1 = require("@k3rn31p4nic/google-translate-api");
const template = JSON.stringify(require('./../../languages/template.json'));
google_translate_api_1.languages["zh-cn"];
function languageTranslation(lang) {
    return new Promise(async (resolve, reject) => {
        if (!isSupported(lang))
            return false;
        const iso = getISOCode(lang);
        let language = JSON.parse(template);
        await translateObject(language, iso).catch(() => {
            reject('translation failed!');
        });
        setTimeout(() => {
            language.language.name = google_translate_api_1.languages[iso];
            language.language.name = iso;
            resolve(language);
        }, 1000 * 10);
    });
}
exports.languageTranslation = languageTranslation;
function isSupported(language) {
    return Boolean(getISOCode(language));
}
exports.isSupported = isSupported;
function getISOCode(language) {
    if (!language)
        return false;
    language = language.toLowerCase();
    if (language in google_translate_api_1.languages)
        return language;
    let keys = Object.keys(google_translate_api_1.languages).filter((key) => {
        if (typeof google_translate_api_1.languages[key] !== 'string')
            return false;
        return google_translate_api_1.languages[key].toLowerCase() === language;
    });
    return keys[0] || null;
}
exports.getISOCode = getISOCode;
async function translateObject(object, language) {
    const keys = Object.keys(object);
    for (const key of keys) {
        if (typeof object[key] === 'string') {
            transalte(object[key], { to: language })
                .then(res => {
                object[key] = res.text;
            }).catch(err => {
                throw err;
            });
            object[key] = await translate(object[key], language).catch((err) => { throw err; });
        }
        else
            translateObject(object[key], language).catch(err => { throw err; });
    }
}
function translate(text, language) {
    return new Promise((resolve, rejects) => {
        console.info(`Translating |${text}| to ${google_translate_api_1.languages[language]}`);
        transalte(text, { to: language })
            .then(res => {
            resolve(res.text);
        }).catch(err => {
            rejects(err);
        });
    });
}
//# sourceMappingURL=languageTranslation.js.map